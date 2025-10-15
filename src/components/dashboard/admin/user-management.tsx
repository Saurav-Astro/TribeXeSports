
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  photoURL?: string;
  createdAt?: { _seconds: number, _nanoseconds: number };
};

async function fetchUsers(): Promise<UserProfile[]> {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            console.error("Failed to fetch users:", response.statusText);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

async function deleteUser(userId: string): Promise<{success: boolean, error?: string}> {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const data = await response.json();
            return { success: false, error: data.error || "Failed to delete user." };
        }
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "An unknown error occurred." };
    }
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadUsers = async () => {
      setIsLoading(true);
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch user data."
        })
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUser(userId);
    if (result.success) {
        toast({
            title: "User Deleted",
            description: "The user has been successfully removed from the system.",
        });
        // Refresh user list after deletion
        await loadUsers();
    } else {
        toast({
            variant: "destructive",
            title: "Error Deleting User",
            description: result.error,
        });
    }
  };

  const filteredUsers = users?.filter(user => 
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="glassmorphism border-border/50 bg-dashboard-card">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View, manage, and take action on user accounts.</CardDescription>
        <div className="pt-4">
          <Input 
            placeholder="Search for users by username or email..." 
            className="max-w-sm bg-black text-white border-border/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border/50">
                    <TableCell><div className="flex items-center gap-4"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
            ))}
            {!isLoading && filteredUsers?.map((user) => (
              <TableRow key={user.id} className="border-border/50">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-border">
                      {user.photoURL && <AvatarImage src={user.photoURL} alt={user.username} />}
                      <AvatarFallback>{user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.username || user.email}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                <TableCell className="hidden lg:table-cell font-mono text-sm text-muted-foreground">
                  {user.createdAt ? format(new Date(user.createdAt._seconds * 1000), "MMM d, yyyy") : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glassmorphism">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem disabled>View Profile</DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:bg-destructive/20 focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                </DropdownMenuItem>
                             </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                         <AlertDialogContent className="glassmorphism">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user account
                                    and all associated data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                    Yes, delete user
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
             {!isLoading && (!filteredUsers || filteredUsers.length === 0) && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No users found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
