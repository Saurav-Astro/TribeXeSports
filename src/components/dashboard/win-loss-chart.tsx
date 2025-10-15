
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartData = [
  { date: "May 20", wins: 5, losses: 2 },
  { date: "May 21", wins: 7, losses: 3 },
  { date: "May 22", wins: 4, losses: 4 },
  { date: "May 23", wins: 8, losses: 1 },
  { date: "May 24", wins: 6, losses: 5 },
  { date: "May 25", wins: 9, losses: 2 },
  { date: "May 26", wins: 3, losses: 3 },
]

const chartConfig = {
  wins: {
    label: "Wins",
    color: "hsl(var(--chart-2))",
  },
  losses: {
    label: "Losses",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function WinLossChart() {
  return (
    <Card className="glassmorphism border-border/50 h-full bg-dashboard-card">
      <CardHeader>
        <CardTitle>Match Performance</CardTitle>
        <CardDescription>Daily Wins vs Losses - Last 7 Days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="date" stroke="hsl(var(--foreground) / 0.7)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--foreground) / 0.7)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                  content={<ChartTooltipContent indicator="dot" />}
               />
              <Legend />
              <Bar dataKey="wins" fill="var(--color-wins)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="losses" fill="var(--color-losses)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
