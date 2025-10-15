'use client';

import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, DocumentData, query, where, Timestamp } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, CheckCircle, Users, Trophy, UserPlus, CircleCheck, LogIn } from 'lucide-react';
import { CountdownTimer } from '@/components/countdown-timer';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TournamentRegistrationForm } from '@/components/tournament-registration-form';
import { useCollection } from '@/firebase/firestore/use-collection';
import React from 'react';

type Tournament = {
  id: string;
  name: string;
  game: string;
  imageUrl: string;
  prize: number;
  participants: number;
  startDate: Timestamp;
  endDate: Timestamp;
  description: string;
  organizerId: string;
  createdAt: Timestamp;
  winner?: { name: string; avatar: string };
  status?: 'upcoming' | 'ongoing' | 'past';
  registrationFields?: any[]; // Added for form generation
};

const getTournamentStatus = (tournament: Tournament): 'upcoming' | 'ongoing' | 'past' => {
    if (tournament.status) {
        return tournament.status;
    }
    const now = new Date();
    const startDate = tournament.startDate.toDate();
    const endDate = tournament.endDate.toDate();
    if (endDate < now) return 'past';
    if (startDate > now) return 'upcoming';
    return 'ongoing';
}

function RegisterButton({ tournament, status }: { tournament: Tournament, status: 'upcoming' | 'ongoing' | 'past' }) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [isRegistered, setIsRegistered] = React.useState(false);
    const [isCheckingRegistration, setIsCheckingRegistration] = React.useState(true);

    const registrationQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, `tournaments/${tournament.id}/registrations`),
            where('userId', '==', user.uid)
        );
    }, [firestore, user, tournament.id]);

    const { data: registrationData, isLoading: isLoadingRegistration } = useCollection(registrationQuery);

    React.useEffect(() => {
        if (isUserLoading || isLoadingRegistration) {
            setIsCheckingRegistration(true);
            return;
        }

        if (!user) {
            setIsRegistered(false);
            setIsCheckingRegistration(false);
            return;
        }

        setIsRegistered(registrationData ? registrationData.length > 0 : false);
        setIsCheckingRegistration(false);

    }, [registrationData, isLoadingRegistration, user, isUserLoading]);
    
    if (isCheckingRegistration) {
        return <Skeleton className="h-12 w-full mt-4" />;
    }

    if (status === 'past') {
        return null; 
    }
    
    if (!user) {
        return (
            <Button size="lg" className="w-full mt-4" onClick={() => router.push('/login')}>
                <LogIn className="mr-2 h-5 w-5" />
                Login to Register
            </Button>
        );
    }
    
    if (isRegistered) {
         return (
            <Button size="lg" className="w-full mt-4 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 cursor-default shadow-lg shadow-green-500/10" disabled variant="secondary">
                <CircleCheck className="mr-2 h-5 w-5" />
                You are registered!
            </Button>
        );
    }
    
    // If there are no registration fields, a form is not needed.
    // For now, we assume registration is always through the form.
    // A direct registration could be implemented here if needed.
    const hasCustomFields = tournament.registrationFields && tournament.registrationFields.length > 0;

    if (!hasCustomFields) {
        // Handle direct registration if no form is needed
        return null; // Or a direct registration button
    }


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full mt-4 box-glow">
                    <UserPlus className="mr-2 h-5 w-5"/>
                    Register for Tournament
                </Button>
            </DialogTrigger>
            <DialogContent className="glassmorphism">
                <DialogHeader>
                    <DialogTitle>Register for {tournament.name}</DialogTitle>
                </DialogHeader>
                <TournamentRegistrationForm tournamentId={tournament.id} />
            </DialogContent>
        </Dialog>
    );
}


function TournamentDetails({ tournament }: { tournament: Tournament }) {
  const startDate = tournament.startDate.toDate();
  const endDate = tournament.endDate.toDate();
  const status = getTournamentStatus(tournament);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-8">
        <Image src={tournament.imageUrl} alt={tournament.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-glow">{tournament.name}</h1>
          <p className="text-2xl font-semibold text-primary">{tournament.game}</p>
        </div>
        <div className="absolute top-4 right-4">
          {status === 'ongoing' && <Badge variant="default" className="bg-primary/80 backdrop-blur-sm text-primary-foreground box-glow animate-pulse text-lg py-2 px-4">● LIVE</Badge>}
          {status === 'upcoming' && <Badge variant="secondary" className="bg-accent/80 backdrop-blur-sm text-accent-foreground box-glow-accent text-lg py-2 px-4"><CalendarClock className="h-4 w-4 mr-2" /> Upcoming</Badge>}
          {status === 'past' && <Badge variant="outline" className="bg-background/60 backdrop-blur-sm text-lg py-2 px-4"><CheckCircle className="h-4 w-4 mr-2" /> Finished</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="glassmorphism">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold font-headline mb-4">About the Tournament</h2>
              <div className="prose max-w-none text-foreground/80 leading-relaxed">
                <p>{tournament.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          {status === 'upcoming' && (
             <Card className="glassmorphism">
                <CardContent className="p-6">
                     <p className="text-center text-md text-foreground/70 mb-2">Starts In</p>
                     <CountdownTimer targetDate={startDate} />
                     <RegisterButton tournament={tournament} status={status} />
                </CardContent>
            </Card>
          )}
           {status === 'ongoing' && (
             <Card className="glassmorphism">
                <CardContent className="p-6">
                     <p className="text-center text-md text-foreground/70 mb-2">Ends In</p>
                     <CountdownTimer targetDate={endDate} />
                     <RegisterButton tournament={tournament} status={status} />
                </CardContent>
            </Card>
          )}
           <Card className="glassmorphism">
                <CardContent className="p-6 space-y-4">
                     <h3 className="text-xl font-bold font-headline text-center mb-4">Tournament Info</h3>
                     <div className="flex justify-between items-center text-lg">
                        <span className="text-foreground/70 flex items-center gap-2"><Trophy className="h-5 w-5 text-accent"/> Prize Pool</span>
                        <span className="font-bold text-accent">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(tournament.prize)}</span>
                     </div>
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-foreground/70 flex items-center gap-2"><Users className="h-5 w-5 text-accent"/> Participants</span>
                        <span className="font-bold">{tournament.participants}</span>
                     </div>
                     <div className="flex justify-between items-center text-lg">
                        <span className="text-foreground/70 flex items-center gap-2"><CalendarClock className="h-5 w-5 text-accent"/> Starts</span>
                        <span className="font-bold">{format(startDate, 'PP')}</span>
                     </div>
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-foreground/70 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent"/> Ends</span>
                        <span className="font-bold">{format(endDate, 'PP')}</span>
                     </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12 animate-pulse">
            <Skeleton className="h-64 md:h-96 rounded-3xl w-full mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                     <Skeleton className="h-64 w-full rounded-xl" />
                </div>
                <div className="space-y-8">
                     <Skeleton className="h-32 w-full rounded-xl" />
                     <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}

export default function TournamentPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  
  const tournamentDocRef = useMemoFirebase(
    () => (firestore && id ? doc(firestore, 'tournaments', id) : null),
    [firestore, id]
  );
  
  const { data: tournament, isLoading, error } = useDoc<Tournament>(tournamentDocRef);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <div className="text-center py-20 text-destructive">Error: {error.message}</div>;
  }

  if (!tournament) {
    return <div className="text-center py-20">Tournament not found.</div>;
  }

  return <TournamentDetails tournament={tournament} />;
}
