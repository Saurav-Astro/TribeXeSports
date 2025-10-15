
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  photoURL?: string;
  createdAt?: { _seconds: number, _nanoseconds: number };
};

async function fetchUsers(): Promise<UserProfile[]> {
  const response = await fetch('/api/users');
  if (!response.ok) {
    console.error("Failed to fetch users");
    return [];
  }
  const users = await response.json();
  // Sort by creation time, newest first
  return users.sort((a: UserProfile, b: UserProfile) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0));
}

export function RecentSignups() {
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        const allUsers = await fetchUsers();
        setRecentUsers(allUsers.slice(0, 5)); // Get the 5 most recent users
      } catch (error) {
        console.error("Error fetching recent users:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <Card className="glassmorphism border-border/50 h-full bg-dashboard-card">
      <CardHeader>
        <CardTitle>Recent Signups</CardTitle>
        <CardDescription>The latest members to join the Tribe.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead>User</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="text-right">Signed Up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
               <TableRow key={i} className="border-border/50">
                    <TableCell><div className="flex items-center gap-4"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-24" /></TableCell>
                </TableRow>
            ))}
            {!isLoading && recentUsers.map((user) => (
              <TableRow key={user.id} className="border-border/50">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-border">
                        <AvatarImage src={user.photoURL} alt={user.username} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.username}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-right font-mono text-sm text-muted-foreground">
                  {user.createdAt ? `${formatDistanceToNow(new Date(user.createdAt._seconds * 1000))} ago` : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
             {!isLoading && recentUsers.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        No recent signups found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
