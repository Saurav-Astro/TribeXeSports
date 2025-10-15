
'use client';

import * as React from 'react';
import { useUser } from "@/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { CalendarClock, CheckCircle, ChevronRight, Users, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

type Tournament = {
  id: string;
  name: string;
  game: string;
  imageUrl: string;
  prize: number;
  participants: number;
  startDate: string; // Dates will be serialized as strings
  endDate: string;
  status?: 'upcoming' | 'ongoing' | 'past';
};

const getTournamentStatus = (tournament: Tournament): 'upcoming' | 'ongoing' | 'past' => {
    if (tournament.status) {
        return tournament.status;
    }
    const now = new Date();
    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);
    if (endDate < now) return 'past';
    if (startDate > now) return 'upcoming';
    return 'ongoing';
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
    const status = getTournamentStatus(tournament);
    
    return (
        <Card className="bg-dashboard-card/80 backdrop-blur-sm border border-border/20 overflow-hidden group transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 flex flex-col md:flex-row">
            <div className="md:w-1/3 relative h-48 md:h-auto">
                <Image src={tournament.imageUrl} alt={tournament.name} fill className="object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent md:bg-gradient-to-r"></div>
            </div>
            <div className="md:w-2/3 flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-headline">{tournament.name}</CardTitle>
                            <CardDescription className="text-primary font-semibold">{tournament.game}</CardDescription>
                        </div>
                        {status === 'ongoing' && <Badge variant="default" className="bg-primary/80 backdrop-blur-sm text-primary-foreground box-glow animate-pulse">● LIVE</Badge>}
                        {status === 'upcoming' && <Badge variant="secondary" className="bg-accent/80 backdrop-blur-sm text-accent-foreground box-glow-accent"><CalendarClock className="h-3 w-3 mr-1.5" /> Upcoming</Badge>}
                        {status === 'past' && <Badge variant="outline" className="bg-background/60 backdrop-blur-sm"><CheckCircle className="h-3 w-3 mr-1.5" /> Finished</Badge>}
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm flex-grow">
                    <div className="flex items-center gap-2 text-foreground/80">
                        <Trophy className="h-5 w-5 text-accent" />
                        <div>
                            <p className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(tournament.prize)}</p>
                            <p className="text-xs text-muted-foreground">Prize Pool</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 text-foreground/80">
                        <Users className="h-5 w-5 text-accent" />
                         <div>
                            <p className="font-semibold">{tournament.participants}</p>
                            <p className="text-xs text-muted-foreground">Participants</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 text-foreground/80">
                        <CalendarClock className="h-5 w-5 text-accent" />
                         <div>
                            <p className="font-semibold">{format(new Date(tournament.startDate), 'PP')}</p>
                            <p className="text-xs text-muted-foreground">Start Date</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full md:w-auto ml-auto">
                        <Link href={`/tournaments/${tournament.id}`}>
                            View Tournament <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </div>
        </Card>
    )
}

export function MyTournaments() {
    const { user, idToken, isUserLoading } = useUser();
    const [tournaments, setTournaments] = React.useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (isUserLoading) {
            return;
        }
        if (!user || !idToken) {
            setIsLoading(false);
            setTournaments([]);
            return;
        }

        const fetchTournaments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/my-tournaments', {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch tournaments');
                }
                const data = await response.json();
                setTournaments(data);
            } catch (err: any) {
                setError(err.message);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTournaments();

    }, [user, idToken, isUserLoading]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            );
        }

        if (error) {
            return <div className="text-center py-12 text-destructive">{error}</div>;
        }
        
        if (tournaments.length > 0) {
            return (
                <div className="space-y-4">
                    {tournaments.map(tournament => (
                        <TournamentCard key={tournament.id} tournament={tournament} />
                    ))}
                </div>
            );
        }

        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't registered for any tournaments yet.</p>
                <Button asChild>
                    <Link href="/tournaments">Explore Tournaments</Link>
                </Button>
            </div>
        );
    }

    return (
        <Card className="glassmorphism border-border/50 bg-dashboard-card">
            <CardHeader>
                <CardTitle>My Registered Tournaments</CardTitle>
                <CardDescription>All the tournaments you've signed up for.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
