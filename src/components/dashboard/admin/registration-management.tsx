
'use client';

import { useState, useMemo, useEffect } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Link from "next/link";

type FormFieldConfig = {
  name: string;
  type: 'text' | 'number' | 'file' | 'email' | 'screenshot';
  required: boolean;
};

type Tournament = {
  id: string;
  name: string;
  registrationFields?: FormFieldConfig[];
};

type Registration = {
  id: string;
  userId?: string;
  registeredAt: Timestamp;
  customData?: Record<string, any>;
};

type UserProfile = {
  id: string;
  username: string;
  email: string;
};

async function fetchAllUsers(): Promise<UserProfile[]> {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ details: response.statusText }));
            console.error('Failed to fetch users:', errorData.details || response.statusText);
            return [];
        }
        return await response.json();
    } catch (error: any) {
        console.error('Error fetching users:', error.message);
        return [];
    }
}

export function RegistrationManagement() {
  const firestore = useFirestore();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setIsLoadingUsers(true);
      const usersData = await fetchAllUsers();
      setAllUsers(usersData);
      setIsLoadingUsers(false);
    }
    loadUsers();
  }, []);

  const tournamentsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'tournaments')) : null,
    [firestore]
  );
  const { data: tournaments, isLoading: isLoadingTournaments } = useCollection<Tournament>(tournamentsQuery);

  const registrationsQuery = useMemoFirebase(
    () => firestore && selectedTournamentId ? query(collection(firestore, 'tournaments', selectedTournamentId, 'registrations')) : null,
    [firestore, selectedTournamentId]
  );
  const { data: registrations, isLoading: isLoadingRegistrations } = useCollection<Registration>(registrationsQuery);

  const usersMap = useMemo(() => {
    return new Map(allUsers.map(user => [user.id, user]));
  }, [allUsers]);

  const selectedTournament = useMemo(() => {
    return tournaments?.find(t => t.id === selectedTournamentId);
  }, [tournaments, selectedTournamentId]);

  const tableHeaders = useMemo(() => {
    const baseHeaders = ["Username", "Registered At"];
    if (!selectedTournament || !selectedTournament.registrationFields) {
      return baseHeaders;
    }
    const customHeaders = selectedTournament.registrationFields.map(field => field.name);
    return [...baseHeaders, ...customHeaders];
  }, [selectedTournament]);

  const handleExport = () => {
    if (!registrations || !selectedTournament) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += tableHeaders.map(header => `"${header}"`).join(",") + "\n";

    registrations.forEach(reg => {
      const user = reg.userId ? usersMap.get(reg.userId) : null;
      const rowData: (string | number)[] = [];
      
      rowData.push(user?.username || 'Guest');
      rowData.push(format(reg.registeredAt.toDate(), "yyyy-MM-dd HH:mm:ss"));

      if (selectedTournament.registrationFields) {
          for (const field of selectedTournament.registrationFields) {
              const value = reg.customData?.[field.name] || '';
              rowData.push(value);
          }
      }
      
      const row = rowData.map(d => `"${String(d).replace(/"/g, '""')}"`).join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedTournament.name}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const isLoading = isLoadingRegistrations || isLoadingUsers;

  return (
    <Card className="glassmorphism border-border/50 bg-dashboard-card">
      <CardHeader>
        <CardTitle>Registration Management</CardTitle>
        <CardDescription>View registrations for a tournament and export data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Select onValueChange={setSelectedTournamentId} disabled={isLoadingTournaments}>
            <SelectTrigger className="w-full md:w-[300px] bg-black text-white border-border/60">
              <SelectValue placeholder="Select a tournament" />
            </SelectTrigger>
            <SelectContent className="glassmorphism">
              {tournaments?.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={!registrations || registrations.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>
        
        <div className="border border-border/50 rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                {tableHeaders.map(header => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="border-border/50">
                    {tableHeaders.map(header => (
                         <TableCell key={header}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                </TableRow>
              ))}
              {!isLoading && registrations?.map(reg => {
                const user = reg.userId ? usersMap.get(reg.userId) : null;
                const registrationFields = selectedTournament?.registrationFields || [];

                return (
                  <TableRow key={reg.id} className="border-border/50">
                    <TableCell>{user?.username || 'Guest'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(reg.registeredAt.toDate(), "MMM d, yyyy 'at' p")}
                    </TableCell>
                    {registrationFields.map(field => {
                      const value = reg.customData?.[field.name];
                      const isFileLink = typeof value === 'string' && (value.startsWith('/uploads/'));
                      
                      return (
                        <TableCell key={field.name}>
                          {isFileLink ? (
                            <Link href={value} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">View File</Link>
                          ) : (
                            value || <span className="text-muted-foreground text-xs">N/A</span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
              {!selectedTournamentId && (
                 <TableRow>
                    <TableCell colSpan={tableHeaders.length} className="h-24 text-center text-muted-foreground">
                        Please select a tournament to view registrations.
                    </TableCell>
                </TableRow>
              )}
               {selectedTournamentId && !isLoading && (!registrations || registrations.length === 0) && (
                 <TableRow>
                    <TableCell colSpan={tableHeaders.length} className="h-24 text-center text-muted-foreground">
                        <Users className="mx-auto h-8 w-8 mb-2 text-muted-foreground/50"/>
                        No registrations found for this tournament yet.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

      </CardContent>
    </Card>
  );
}
