
'use client';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "./countdown-timer";
import { Users, ChevronRight, CalendarClock, Trophy, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, Timestamp } from "firebase/firestore";
import { Skeleton } from "./ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

type TournamentStatus = 'upcoming' | 'ongoing' | 'past';

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
  status?: TournamentStatus;
};

const getTournamentStatus = (tournament: Pick<Tournament, 'startDate' | 'endDate' | 'status'>): TournamentStatus => {
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

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
  const status = getTournamentStatus(tournament);
  const startDate = tournament.startDate.toDate();
  const endDate = tournament.endDate.toDate();

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-card/50 backdrop-blur-sm border border-border/20 overflow-hidden group transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 flex flex-col h-full">
        <CardHeader className="p-0 relative h-48 sm:h-60">
          <Image
            src={tournament.imageUrl}
            alt={tournament.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute top-4 right-4">
            {status === 'ongoing' && <Badge variant="default" className="bg-primary/80 backdrop-blur-sm text-primary-foreground box-glow animate-pulse">● LIVE</Badge>}
            {status === 'upcoming' && <Badge variant="secondary" className="bg-accent/80 backdrop-blur-sm text-accent-foreground box-glow-accent"><CalendarClock className="h-3 w-3 mr-1.5" /> Upcoming</Badge>}
            {status === 'past' && <Badge variant="outline" className="bg-background/60 backdrop-blur-sm"><CheckCircle className="h-3 w-3 mr-1.5" /> Finished</Badge>}
          </div>
          <div className="absolute bottom-0 left-0 p-4 sm:p-6">
            <h3 className="text-2xl sm:text-3xl font-bold font-headline">{tournament.name}</h3>
            <p className="text-primary font-semibold">{tournament.game}</p>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 grid gap-4 flex-grow">
          <div className="flex justify-between items-center text-center">
            <div>
              <p className="text-xs sm:text-sm text-foreground/70">Prize Pool</p>
              <p className="text-xl sm:text-2xl font-bold text-accent">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(tournament.prize)}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-foreground/70">Participants</p>
              <p className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2"><Users className="h-5 w-5"/>{tournament.participants}</p>
            </div>
          </div>
          
          {status === 'ongoing' && (
            <div>
              <p className="text-center text-sm text-foreground/70 mb-2">Ends In</p>
              <CountdownTimer targetDate={endDate} />
            </div>
          )}
          {status === 'upcoming' && (
            <div>
              <p className="text-center text-sm text-foreground/70 mb-2">Starts In</p>
              <CountdownTimer targetDate={startDate} />
            </div>
          )}
          {status === 'past' && tournament.winner && (
            <div className="text-center pt-4 border-t border-border/30">
              <p className="text-xs sm:text-sm text-foreground/70 mb-2">Winner</p>
                <div className="flex items-center justify-center gap-2 font-bold text-lg text-yellow-400">
                  <Trophy className="h-5 w-5"/>
                  <span>{tournament.winner.name}</span>
                </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="p-4 sm:p-6 bg-black/20 mt-auto">
          <Button asChild className="w-full box-glow">
            <Link href={`/tournaments/${tournament.id}`}>
              View Tournament <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
};

const TournamentList = ({ tournaments, isLoading }: { tournaments: Tournament[] | null, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return <p className="text-center text-foreground/70 py-12 col-span-1 md:col-span-2">No tournaments in this category right now. Check back soon!</p>
  }

  return (
    <>
      {tournaments.map((t) => (
        <TournamentCard key={t.id} tournament={t} />
      ))}
    </>
  )
}

export function TournamentGrid() {
  const firestore = useFirestore();
  const isMobile = useIsMobile();
  const tournamentsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'tournaments'), orderBy('startDate', 'asc')) : null, 
    [firestore]
  );
  const { data: tournaments, isLoading } = useCollection<Tournament>(tournamentsQuery);

  const filterByStatus = (status: TournamentStatus) => {
    if (!tournaments) return [];
    return tournaments.filter(t => getTournamentStatus(t) === status);
  };

  const ongoingTournaments = filterByStatus('ongoing');
  const upcomingTournaments = filterByStatus('upcoming');
  const pastTournaments = filterByStatus('past');

  const tabsGridClass = isMobile
    ? 'grid-cols-1'
    : 'grid-cols-1 md:grid-cols-2';
    
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section id="tournaments" className="container mx-auto px-4 py-8 md:py-16">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline text-glow">
          Tournaments
        </h2>
        <p className="mt-4 text-md sm:text-lg text-foreground/70 max-w-2xl mx-auto">
          Witness the clash of titans. Find your favorite games and follow the action.
        </p>
      </motion.div>

       <Tabs defaultValue="ongoing" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto h-12 mb-8 glassmorphism border-primary/20">
          <TabsTrigger value="ongoing" className="h-10 text-sm md:text-lg">Ongoing</TabsTrigger>
          <TabsTrigger value="upcoming" className="h-10 text-sm md:text-lg">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="h-10 text-sm md:text-lg">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="ongoing">
           <motion.div 
             key="ongoing"
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             className={`grid ${tabsGridClass} gap-6 md:gap-8`}
           >
            <TournamentList tournaments={ongoingTournaments} isLoading={isLoading} />
          </motion.div>
        </TabsContent>
        <TabsContent value="upcoming">
           <motion.div 
            key="upcoming"
            variants={containerVariants}
             initial="hidden"
             animate="visible"
             className={`grid ${tabsGridClass} gap-6 md:gap-8`}
           >
            <TournamentList tournaments={upcomingTournaments} isLoading={isLoading} />
          </motion.div>
        </TabsContent>
        <TabsContent value="past">
           <motion.div 
             key="past"
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             className={`grid ${tabsGridClass} gap-6 md:gap-8`}
           >
            <TournamentList tournaments={pastTournaments} isLoading={isLoading} />
          </motion.div>
        </TabsContent>
      </Tabs>

    </section>
  );
}
