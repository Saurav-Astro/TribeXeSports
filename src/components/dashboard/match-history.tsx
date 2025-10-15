
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const matches = [
  { game: "Valorant", result: "Win", score: "13-8", kda: "22/10/5" },
  { game: "Valorant", result: "Loss", score: "9-13", kda: "15/16/3" },
  { game: "Apex Legends", result: "Win", score: "#1/20", kda: "8/2/4" },
  { game: "Valorant", result: "Win", score: "13-5", kda: "28/9/2" },
  { game: "CS:GO", result: "Loss", score: "12-16", kda: "18/20/1" },
  { game: "Valorant", result: "Win", score: "13-11", kda: "19/14/10" },
];

export function MatchHistory() {
  return (
    <Card className="glassmorphism border-border/50 h-full bg-dashboard-card">
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
        <CardDescription>Your last 6 games.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead>Game</TableHead>
              <TableHead className="text-center">Result</TableHead>
              <TableHead className="text-right">KDA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match, index) => (
              <TableRow key={index} className="border-border/50">
                <TableCell className="font-medium">{match.game}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={match.result === "Win" ? "default" : "destructive"}>
                    {match.result}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">{match.kda}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
