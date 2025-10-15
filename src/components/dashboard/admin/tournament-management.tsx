
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { MoreHorizontal, CalendarClock, CheckCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import Link from "next/link";

type TournamentStatus = 'upcoming' | 'ongoing' | 'past';

type Tournament = {
  id: string;
  name: string;
  game: string;
  startDate: Timestamp;
  endDate: Timestamp;
  participants: number;
  status?: TournamentStatus;
};

const getStatus = (tournament: Pick<Tournament, 'startDate' | 'endDate' | 'status'>): TournamentStatus => {
    if (tournament.status) {
        return tournament.status;
    }
    const now = new Date();
    if (tournament.endDate.toDate() < now) return 'past';
    if (tournament.startDate.toDate() > now) return 'upcoming';
    return 'ongoing';
}

const StatusBadge = ({ status }: { status: TournamentStatus }) => {
    switch (status) {
        case 'ongoing':
            return <Badge variant="default" className="bg-primary/80 text-primary-foreground box-glow animate-pulse">● LIVE</Badge>;
        case 'upcoming':
            return <Badge variant="secondary" className="bg-accent/80 text-accent-foreground box-glow-accent"><CalendarClock className="h-3 w-3 mr-1.5" /> Upcoming</Badge>;
        case 'past':
            return <Badge variant="outline" className="bg-background/60"><CheckCircle className="h-3 w-3 mr-1.5" /> Finished</Badge>;
    }
}

export function TournamentManagement() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const tournamentsQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'tournaments'), orderBy('startDate', 'desc')) : null, 
        [firestore]
    );
    const { data: tournaments, isLoading } = useCollection<Tournament>(tournamentsQuery);

    const updateTournamentStatus = async (tournamentId: string, status: TournamentStatus) => {
        if (!firestore) return;
        const tournamentRef = doc(firestore, 'tournaments', tournamentId);
        try {
            await updateDoc(tournamentRef, { status });
            toast({
                title: "Status Updated",
                description: `Tournament status has been set to ${status}.`
            });
        } catch (error) {
            console.error("Error updating status: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not update tournament status."
            });
        }
    };

    const handleDeleteTournament = async (tournamentId: string) => {
        if (!firestore) return;
        const tournamentRef = doc(firestore, 'tournaments', tournamentId);
        try {
            await deleteDoc(tournamentRef);
            toast({
                title: "Tournament Deleted",
                description: "The tournament has been successfully deleted."
            });
        } catch (error) {
             console.error("Error deleting tournament: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete tournament."
            });
        }
    };

    return (
        <Card className="glassmorphism border-border/50 bg-dashboard-card">
            <CardHeader>
                <CardTitle>Manage Tournaments</CardTitle>
                <CardDescription>View, edit, and manage all scheduled tournaments.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead>Tournament Name</TableHead>
                            <TableHead className="hidden md:table-cell">Game</TableHead>
                            <TableHead className="hidden lg:table-cell">Start Date</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i} className="border-border/50">
                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                        {tournaments?.map((tournament) => {
                             const status = getStatus(tournament);
                             return (
                                <TableRow key={tournament.id} className="border-border/50">
                                    <TableCell className="font-medium">{tournament.name}</TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground">{tournament.game}</TableCell>
                                    <TableCell className="hidden lg:table-cell font-mono text-sm text-muted-foreground">
                                        {format(tournament.startDate.toDate(), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-center">
                                       <StatusBadge status={status} />
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
                                                     <DropdownMenuItem asChild>
                                                        <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => updateTournamentStatus(tournament.id, 'upcoming')}>Set to Upcoming</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateTournamentStatus(tournament.id, 'ongoing')}>Set to Live</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateTournamentStatus(tournament.id, 'past')}>Set to Finished</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                     <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive focus:bg-destructive/20 focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Tournament
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent className="glassmorphism">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the
                                                        tournament "{tournament.name}" and all of its associated data.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteTournament(tournament.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                                        Yes, delete tournament
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                             );
                        })}
                         {!isLoading && tournaments?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No tournaments found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
