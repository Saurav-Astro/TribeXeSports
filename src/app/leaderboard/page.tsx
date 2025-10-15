
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, ArrowUp, ArrowDown, Minus, ChevronDown, Users, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";


type Player = {
  rank: number;
  name: string;
  points: number;
  winRate: string;
  trend: 'up' | 'down' | 'stable';
  avatar?: { imageUrl: string; imageHint: string; };
};

type TeamMember = {
  name: string;
  avatar: { imageUrl: string; imageHint: string; };
}

type Team = {
  rank: number;
  teamName: string;
  points: number;
  trend: 'up' | 'down' | 'stable';
  members: TeamMember[];
};

type GameLeaderboard =
  | { type: 'individual', players: Player[] }
  | { type: 'team', teams: Team[] };

type EventLeaderboard = {
    id: string;
    eventName: string;
    game: string;
    winner?: string;
    status: 'Ongoing' | 'Upcoming' | 'Past';
    leaderboard: GameLeaderboard;
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <ArrowUp className="h-4 w-4 text-green-400" />;
  if (trend === 'down') return <ArrowDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-500" />;
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const IndividualLeaderboardTable = ({ players }: { players: Player[] }) => (
  <Table>
    <TableHeader>
      <TableRow className="hover:bg-transparent border-b-border/50">
        <TableHead className="w-[80px] p-2 sm:p-4">Rank</TableHead>
        <TableHead className="p-2 sm:p-4">Player</TableHead>
        <TableHead className="text-right p-2 sm:p-4">Points</TableHead>
        <TableHead className="text-right hidden sm:table-cell p-2 sm:p-4">Win Rate</TableHead>
        <TableHead className="text-right hidden md:table-cell p-2 sm:p-4">Trend</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {players.map((player) => (
        <motion.tr
            key={player.rank}
            variants={itemVariants}
            className="group border-b-border/30 hover:bg-primary/5 transition-colors duration-300"
        >
          <TableCell className="font-bold text-xl sm:text-2xl text-primary/80 group-hover:text-primary p-2 sm:p-4">
            <div className="flex items-center gap-2">
               {player.rank === 1 ? <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" /> : `#${player.rank}`}
            </div>
          </TableCell>
          <TableCell className="p-2 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-border group-hover:border-primary transition-colors duration-300">
                {player.avatar && <AvatarImage src={player.avatar.imageUrl} alt={player.name} data-ai-hint={player.avatar.imageHint} />}
                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-base sm:text-lg group-hover:text-glow transition-all">{player.name}</span>
            </div>
          </TableCell>
          <TableCell className="text-right font-mono text-base sm:text-lg text-accent p-2 sm:p-4">{player.points.toLocaleString()}</TableCell>
          <TableCell className="text-right hidden sm:table-cell font-mono p-2 sm:p-4">{player.winRate}</TableCell>
          <TableCell className="text-right hidden md:table-cell p-2 sm:p-4">
            <div className="flex justify-end">
              <TrendIcon trend={player.trend} />
            </div>
          </TableCell>
        </motion.tr>
      ))}
    </TableBody>
  </Table>
);

const TeamLeaderboardTable = ({ teams }: { teams: Team[] }) => (
  <div className="w-full">
    <div className="grid grid-cols-[80px_1fr_auto] md:grid-cols-[80px_1fr_auto_auto_50px] items-center px-2 sm:px-4 py-3 border-b border-b-border/50 text-muted-foreground text-left text-sm font-medium">
      <div className="w-[80px] p-2 sm:p-0">Rank</div>
      <div className="p-2 sm:p-0">Team</div>
      <div className="text-right p-2 sm:p-0">Points</div>
      <div className="text-right hidden md:grid p-2 sm:p-0">Trend</div>
      <div className="w-[50px] hidden md:block p-2 sm:p-0"></div>
    </div>
    <Accordion type="single" collapsible className="w-full">
      {teams.map((team, index) => (
         <motion.div key={team.rank} variants={itemVariants}>
            <AccordionItem value={`item-${team.rank}`} className="border-b-border/30 hover:bg-primary/5 transition-colors duration-300 group">
            <AccordionTrigger className="w-full hover:no-underline p-0">
                <div className="grid grid-cols-[80px_1fr_auto_50px] md:grid-cols-[80px_1fr_auto_auto_50px] items-center w-full px-2 sm:px-4 py-3">
                <div className="font-bold text-xl sm:text-2xl text-primary/80 group-hover:text-primary w-[80px]">
                    <div className="flex items-center gap-2">
                    {team.rank === 1 ? <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" /> : `#${team.rank}`}
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 sm:gap-4">
                    <Users className="h-10 w-10 sm:h-12 sm:w-12 text-foreground/50"/>
                    <span className="font-medium text-base sm:text-lg group-hover:text-glow transition-all">{team.teamName}</span>
                    </div>
                </div>
                <div className="text-right font-mono text-base sm:text-lg text-accent">{team.points.toLocaleString()}</div>
                <div className="text-right hidden md:flex justify-end">
                    <TrendIcon trend={team.trend} />
                </div>
                <div className="w-[50px] flex justify-center">
                    <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="p-4 sm:p-6 sm:pl-16 bg-black/20">
                    <h4 className="font-headline text-lg mb-4 text-foreground/80">Team Roster</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {team.members.map(member => (
                        <div key={member.name} className="flex flex-col items-center gap-2 text-center">
                            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-border/50">
                                <AvatarImage src={member.avatar.imageUrl} alt={member.name} data-ai-hint={member.avatar.imageHint} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{member.name}</span>
                        </div>
                    ))}
                    </div>
                </div>
            </AccordionContent>
            </AccordionItem>
        </motion.div>
      ))}
    </Accordion>
  </div>
);


const LeaderboardDisplay = ({ leaderboard }: { leaderboard: GameLeaderboard }) => {
  const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  
  return (
     <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {leaderboard.type === 'individual' ? (
        <IndividualLeaderboardTable players={leaderboard.players} />
      ) : (
        <TeamLeaderboardTable teams={leaderboard.teams} />
      )}
    </motion.div>
  )
}

const ResponsiveGameSelector = ({
  games,
  selectedGame,
  onGameChange,
  isLoading,
}: {
  games: string[];
  selectedGame: string;
  onGameChange: (game: string) => void;
  isLoading: boolean;
}) => {
  const isMobile = useIsMobile();

  if (isMobile === undefined) return null;

  if (isLoading) {
    return <Skeleton className="h-12 w-full max-w-2xl mx-auto mb-8" />
  }

  if (games.length === 0) return null;

  if (isMobile) {
    return (
      <div className="mb-8">
        <Select value={selectedGame} onValueChange={onGameChange}>
          <SelectTrigger className="w-full h-12 text-lg glassmorphism border-primary/20">
            <SelectValue placeholder="Select a game" />
          </SelectTrigger>
          <SelectContent>
            {games.map((game) => (
              <SelectItem key={game} value={game} className="text-lg">
                {game}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Tabs value={selectedGame} onValueChange={onGameChange} className="w-full">
      <TabsList className={`grid w-full grid-cols-${games.length > 5 ? '5' : games.length} max-w-4xl mx-auto h-auto sm:h-12 mb-8 glassmorphism border-primary/20`}>
        {games.map((game) => (
          <TabsTrigger key={game} value={game} className="h-10 text-base md:text-lg">
            {game}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};


export default function LeaderboardPage() {
  const firestore = useFirestore();
  const leaderboardsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'leaderboards')) : null),
    [firestore]
  );
  const { data: allEvents, isLoading } = useCollection<EventLeaderboard>(leaderboardsQuery);
  
  const [games, setGames] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [eventsByGame, setEventsByGame] = useState<Record<string, EventLeaderboard[]>>({});

  useEffect(() => {
    if (allEvents) {
        const uniqueGames = [...new Set(allEvents.map(event => event.game))];
        setGames(uniqueGames);

        if(uniqueGames.length > 0 && !selectedGame) {
            setSelectedGame(uniqueGames[0]);
        }

        const groupedEvents = uniqueGames.reduce((acc, game) => {
            acc[game] = allEvents.filter(event => event.game === game);
            return acc;
        }, {} as Record<string, EventLeaderboard[]>);
        setEventsByGame(groupedEvents);
    }
  }, [allEvents, selectedGame]);


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline text-glow">
          Game Leaderboards
        </h1>
        <p className="mt-4 text-md sm:text-lg text-foreground/70 max-w-2xl mx-auto">
          See who's dominating the scene across your favorite games and events.
        </p>
      </motion.div>

      <ResponsiveGameSelector 
        games={games}
        selectedGame={selectedGame}
        onGameChange={setSelectedGame}
        isLoading={isLoading}
      />
      
      <div className="space-y-12">
        {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
                <div key={i}>
                    <div className="mb-4">
                        <Skeleton className="h-8 w-72 mb-2" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-96 w-full" />
                </div>
            ))
        ) : (eventsByGame[selectedGame] || []).length > 0 ? (
            (eventsByGame[selectedGame] || []).map((event) => (
                <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-4 md:flex md:items-center md:justify-between">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold font-headline">{event.eventName}</h2>
                            <div className="flex items-center gap-4 mt-1">
                                {event.status === 'Ongoing' && <Badge variant="default" className="bg-primary/80 text-primary-foreground animate-pulse">● LIVE</Badge>}
                                {event.status === 'Upcoming' && <Badge variant="outline">Upcoming</Badge>}
                                {event.status === 'Past' && <Badge variant="outline">Finished</Badge>}
                            </div>
                        </div>
                        {event.winner && (
                            <div className="mt-4 md:mt-0 text-center md:text-right">
                            <p className="text-sm text-foreground/70 mb-1">Event Winner</p>
                            <div className="flex items-center justify-center md:justify-end gap-2 font-bold text-lg text-yellow-400">
                                <Trophy className="h-5 w-5"/>
                                <span>{event.winner}</span>
                            </div>
                        </div>
                        )}
                    </div>
                    <Card className="glassmorphism border-border/50">
                        <CardContent className="p-0">
                            <LeaderboardDisplay leaderboard={event.leaderboard} />
                        </CardContent>
                    </Card>
                </motion.div>
            ))
        ) : (
             <div className="text-center py-20">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="text-2xl font-headline">No Leaderboards Found</h2>
                <p className="text-muted-foreground mt-2">Leaderboards for {selectedGame} will appear here once available.</p>
            </div>
        )}
      </div>
    </div>
  );
}
