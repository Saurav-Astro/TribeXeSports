
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Ratio, Target, BarChart } from "lucide-react";

const stats = [
  {
    title: "Win Rate",
    value: "62.5%",
    icon: TrendingUp,
    description: "Last 20 matches",
  },
  {
    title: "K/D Ratio",
    value: "1.48",
    icon: Ratio,
    description: "All time",
  },
  {
    title: "Headshot %",
    value: "28.3%",
    icon: Target,
    description: "Last 20 matches",
  },
  {
    title: "Avg. Score",
    value: "4,820",
    icon: BarChart,
    description: "Competitive",
  },
];

export function StatsOverview() {
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
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
