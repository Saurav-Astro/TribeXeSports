
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function LeaderboardManagement() {
    return (
        <div className="grid gap-6">
            <Card className="glassmorphism border-border/50 bg-dashboard-card">
                <CardHeader>
                    <CardTitle>Update Scores</CardTitle>
                    <CardDescription>Manually update scores for a player or a team in a specific leaderboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <Select>
                             <SelectTrigger className="bg-black text-white border-border/60">
                                <SelectValue placeholder="Select a leaderboard" />
                            </SelectTrigger>
                            <SelectContent className="glassmorphism">
                                <SelectItem value="vct-2024">Valorant Champions Tour 2024</SelectItem>
                                <SelectItem value="algs-2024">Apex Legends Global Series 2024</SelectItem>
                                <SelectItem value="lol-worlds-2024">League of Legends Worlds 2024</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select>
                             <SelectTrigger className="bg-black text-white border-border/60">
                                <SelectValue placeholder="Select a player/team" />
                            </SelectTrigger>
                            <SelectContent className="glassmorphism">
                                <SelectItem value="sentinels">Sentinels</SelectItem>
                                <SelectItem value="geng">Gen.G</SelectItem>
                                <SelectItem value="darkzero">DarkZero</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex items-center gap-4">
                        <Button>Update Scores</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="glassmorphism border-border/50 bg-dashboard-card">
                <CardHeader>
                    <CardTitle>Reset Leaderboard</CardTitle>
                    <CardDescription>This action will permanently reset all scores for a selected leaderboard. This cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 text-destructive-foreground">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                            Resetting a leaderboard is irreversible. All current standings and points will be lost.
                        </AlertDescription>
                    </Alert>
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 border border-border/50 rounded-lg">
                        <div className="flex-grow">
                             <Select>
                                <SelectTrigger className="w-full md:w-[300px] bg-black text-white border-border/60">
                                    <SelectValue placeholder="Select leaderboard to reset" />
                                </SelectTrigger>
                                <SelectContent className="glassmorphism">
                                    <SelectItem value="vct-2024">Valorant Champions Tour 2024</SelectItem>
                                    <SelectItem value="algs-2024">Apex Legends Global Series 2024</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="destructive">
                            <RefreshCw className="mr-2 h-4 w-4"/>
                            Reset Leaderboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
