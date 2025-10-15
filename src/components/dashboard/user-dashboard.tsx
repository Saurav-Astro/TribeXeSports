
'use client';

import { StatsOverview } from "@/components/dashboard/stats-overview";
import { useUser } from "@/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfileForm } from "./user-profile-form";
import { MyTournaments } from "./my-tournaments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from "framer-motion";

const MotionTabsContent = motion(TabsContent);

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};


export function UserDashboard() {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("my-tournaments");

  const tabs = [
      { value: "my-tournaments", label: "My Tournaments" },
      { value: "performance", label: "Performance" },
      { value: "profile", label: "Profile" },
  ]
  
  const ComingSoonCard = () => (
    <Card className="glassmorphism border-border/50 bg-dashboard-card">
        <CardHeader>
            <CardTitle>Performance Tracking</CardTitle>
            <CardDescription>Match history and detailed performance analytics are coming soon!</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Check back later to see your gameplay stats.</p>
                <Button asChild>
                    <Link href="/tournaments">Explore Tournaments</Link>
                </Button>
            </div>
        </CardContent>
    </Card>
  )

  const content = (
      <>
          <MotionTabsContent value="my-tournaments" variants={tabContentVariants}>
            <MyTournaments />
          </MotionTabsContent>
          <MotionTabsContent value="performance" variants={tabContentVariants}>
             <ComingSoonCard />
          </MotionTabsContent>
          <MotionTabsContent value="profile" variants={tabContentVariants}>
              <UserProfileForm />
          </MotionTabsContent>
      </>
  )

  if(isMobile) {
      return (
         <main className="container mx-auto p-4 md:p-8">
             <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Welcome, {user?.displayName || 'Player'}</h1>
                    <p className="text-dashboard-muted-foreground text-sm">Here's your gaming dashboard.</p>
                </div>
            </header>
             <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full h-12 text-lg glassmorphism border-primary/20 mb-6">
                <SelectValue placeholder="Select a view" />
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value} className="text-lg">
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <motion.div initial="hidden" animate="visible">
                {activeTab === 'my-tournaments' && <motion.div variants={tabContentVariants}><MyTournaments /></motion.div>}
                {activeTab === 'performance' && <motion.div variants={tabContentVariants}><ComingSoonCard /></motion.div>}
                {activeTab === 'profile' && <motion.div variants={tabContentVariants}><UserProfileForm /></motion.div>}
            </motion.div>
         </main>
      )
  }

  return (
      <main className="container mx-auto p-6 md:p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.displayName || 'Player'}</h1>
            <p className="text-dashboard-muted-foreground">Here's your gaming dashboard.</p>
          </div>
        </header>

         <Tabs defaultValue="my-tournaments" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto h-auto sm:h-12 mb-8 glassmorphism border-primary/20">
                {tabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value} className="h-10 text-base md:text-lg">{tab.label}</TabsTrigger>
                ))}
            </TabsList>
            <motion.div initial="hidden" animate="visible">
              {content}
            </motion.div>
        </Tabs>
      </main>
  );
}
