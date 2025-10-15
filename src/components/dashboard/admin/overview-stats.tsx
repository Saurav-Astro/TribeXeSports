
'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, DollarSign, BarChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

type Tournament = {
  id: string;
  startDate: Timestamp;
  endDate: Timestamp;
  prize: number;
  status?: 'upcoming' | 'ongoing' | 'past';
};

const getStatus = (tournament: Tournament): 'upcoming' | 'ongoing' | 'past' => {
    if (tournament.status) {
        return tournament.status;
    }
    const now = new Date();
    if (tournament.endDate.toDate() < now) return 'past';
    if (tournament.startDate.toDate() > now) return 'upcoming';
    return 'ongoing';
}

async function fetchUserCount(): Promise<number> {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            console.error("Failed to fetch users");
            return 0;
        }
        const users = await response.json();
        return users.length;
    } catch (error) {
        console.error("Error fetching user count:", error);
        return 0;
    }
}

export function AdminOverviewStats() {
  const firestore = useFirestore();
  const [userCount, setUserCount] = React.useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(true);

  React.useEffect(() => {
    async function loadUserCount() {
        setIsLoadingUsers(true);
        const count = await fetchUserCount();
        setUserCount(count);
        setIsLoadingUsers(false);
    }
    loadUserCount();
  }, []);

  const tournamentsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'tournaments')) : null,
    [firestore]
  );
  const { data: tournaments, isLoading: isLoadingTournaments } = useCollection<Tournament>(tournamentsQuery);

  const stats = [
    {
      title: "Total Users",
      value: userCount,
      icon: Users,
      description: "Total registered users",
      isLoading: isLoadingUsers,
    },
    {
      title: "Active Tournaments",
      value: tournaments?.filter(t => getStatus(t) === 'ongoing' || getStatus(t) === 'upcoming').length ?? 0,
      icon: Trophy,
      description: `${tournaments?.filter(t => getStatus(t) === 'ongoing').length} ongoing, ${tournaments?.filter(t => getStatus(t) === 'upcoming').length} upcoming`,
      isLoading: isLoadingTournaments,
    },
    {
      title: "Total Prize Money",
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(
        tournaments?.reduce((acc, t) => acc + t.prize, 0) ?? 0
      ),
      icon: DollarSign,
      description: "Across all tournaments",
      isLoading: isLoadingTournaments,
    },
    {
      title: "Signups (24h)",
      value: "N/A",
      icon: BarChart,
      description: "Feature coming soon",
      isLoading: isLoadingUsers, // Reuse user loading state
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="glassmorphism border-border/50 bg-dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/80">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {stat.isLoading ? (
              <>
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
