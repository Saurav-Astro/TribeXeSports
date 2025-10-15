
'use client';

import { useUser } from "@/firebase";
import { ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOverviewStats } from "./admin/overview-stats";
import { RecentSignups } from "./admin/recent-signups";
import { UserManagement } from "./admin/user-management";
import { CreateTournamentForm } from "./admin/create-tournament-form";
import { LeaderboardManagement } from "./admin/leaderboard-management";
import { TournamentManagement } from "./admin/tournament-management";
import { RegistrationManagement } from "./admin/registration-management";
import { FormBuilder } from "./admin/form-builder";
import { UserProfileForm } from "./user-profile-form";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react";
import { motion } from "framer-motion";
import { CreatePostForm } from "./admin/create-post-form";
import { PostManagement } from "./admin/post-management";


const MotionTabsContent = motion(TabsContent);

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function AdminDashboard() {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "users", label: "Users" },
    { value: "tournaments", label: "Tournaments" },
    { value: "posts", label: "Posts" },
    { value: "registrations", label: "Registrations" },
    { value: "leaderboard", label: "Leaderboard" },
    { value: "profile", label: "Profile" },
  ];
  
  const content = (
    <>
      <MotionTabsContent value="overview" variants={tabContentVariants}>
          <div className="grid grid-cols-1 gap-6">
              <AdminOverviewStats />
              <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-3">
                      <RecentSignups />
                  </div>
              </div>
          </div>
      </MotionTabsContent>
      <MotionTabsContent value="users" variants={tabContentVariants}>
          <UserManagement />
      </MotionTabsContent>
      <MotionTabsContent value="tournaments" variants={tabContentVariants}>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto h-auto sm:h-12 mb-8 glassmorphism border-primary/20">
              <TabsTrigger value="create" className="h-10 text-base">Create Tournament</TabsTrigger>
              <TabsTrigger value="manage" className="h-10 text-base">Manage Tournaments</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <CreateTournamentForm />
            </TabsContent>
            <TabsContent value="manage">
              <TournamentManagement />
            </TabsContent>
          </Tabs>
      </MotionTabsContent>
        <MotionTabsContent value="posts" variants={tabContentVariants}>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto h-auto sm:h-12 mb-8 glassmorphism border-primary/20">
              <TabsTrigger value="create" className="h-10 text-base">Create Post</TabsTrigger>
              <TabsTrigger value="manage" className="h-10 text-base">Manage Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <CreatePostForm />
            </TabsContent>
            <TabsContent value="manage">
              <PostManagement />
            </TabsContent>
          </Tabs>
      </MotionTabsContent>
      <MotionTabsContent value="registrations" variants={tabContentVariants}>
            <Tabs defaultValue="manage" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto h-auto sm:h-12 mb-8 glassmorphism border-primary/20">
              <TabsTrigger value="form-builder" className="h-10 text-base md:text-lg">Form Builder</TabsTrigger>
              <TabsTrigger value="manage" className="h-10 text-base md:text-lg">Manage Registrations</TabsTrigger>
            </TabsList>
            <TabsContent value="form-builder">
              <FormBuilder />
            </TabsContent>
            <TabsContent value="manage">
              <RegistrationManagement />
            </TabsContent>
          </Tabs>
      </MotionTabsContent>
      <MotionTabsContent value="leaderboard" variants={tabContentVariants}>
          <LeaderboardManagement />
      </MotionTabsContent>
        <MotionTabsContent value="profile" variants={tabContentVariants}>
          <UserProfileForm />
      </MotionTabsContent>
    </>
  )

  if (isMobile) {
    return (
       <main className="container mx-auto p-4 md:p-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
               <ShieldCheck className="h-7 w-7 text-primary" />
               <h1 className="text-2xl font-bold">Admin</h1>
            </div>
            <p className="text-dashboard-muted-foreground text-sm">Welcome, {user?.displayName || 'Admin'}.</p>
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
          {activeTab === 'overview' && (
             <motion.div variants={tabContentVariants}>
                <div className="grid grid-cols-1 gap-6">
                    <AdminOverviewStats />
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-3">
                          <RecentSignups />
                        </div>
                    </div>
                </div>
              </motion.div>
          )}
          {activeTab === 'users' && <motion.div variants={tabContentVariants}><UserManagement /></motion.div>}
          {activeTab === 'tournaments' && (
            <motion.div variants={tabContentVariants}>
              <Tabs defaultValue="create" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto h-auto sm:h-12 mb-8 glassmorphism border-primary/20">
                    <TabsTrigger value="create" className="h-10 text-base">Create Tournament</TabsTrigger>
                    <TabsTrigger value="manage" className="h-10 text-base">Manage Tournaments</TabsTrigger>
                  </TabsList>
                  <TabsContent value="create">
                    <CreateTournamentForm />
                  </TabsContent>
                  <TabsContent value="manage">
                    <TournamentManagement />
                  </TabsContent>
              </Tabs>
            </motion.div>
          )}
           {activeTab === 'posts' && (
            <motion.div variants={tabContentVariants}>
              <Tabs defaultValue="create" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto h-auto sm:h-12 mb-8 glassmorphism border-primary/20">
                    <TabsTrigger value="create" className="h-10 text-base">Create Post</TabsTrigger>
                    <TabsTrigger value="manage" className="h-10 text-base">Manage Posts</TabsTrigger>
                  </TabsList>
                  <TabsContent value="create">
                    <CreatePostForm />
                  </TabsContent>
                  <TabsContent value="manage">
                    <PostManagement />
                  </TabsContent>
              </Tabs>
            </motion.div>
          )}
          {activeTab === 'registrations' && (
              <motion.div variants={tabContentVariants}>
                <Tabs defaultValue="manage" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto h-auto sm:h-12 mb-8 glassmorphism border-primary/20">
                    <TabsTrigger value="form-builder" className="h-10 text-base">Form Builder</TabsTrigger>
                    <TabsTrigger value="manage" className="h-10 text-base">Manage</TabsTrigger>
                  </TabsList>
                  <TabsContent value="form-builder">
                    <FormBuilder />
                  </TabsContent>
                  <TabsContent value="manage">
                    <RegistrationManagement />
                  </TabsContent>
              </Tabs>
            </motion.div>
          )}
          {activeTab === 'leaderboard' && <motion.div variants={tabContentVariants}><LeaderboardManagement /></motion.div>}
          {activeTab === 'profile' && <motion.div variants={tabContentVariants}><UserProfileForm /></motion.div>}
        </motion.div>
       </main>
    )
  }

  return (
    <main className="container mx-auto p-6 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
             <ShieldCheck className="h-8 w-8 text-primary" />
             <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-dashboard-muted-foreground">Welcome, {user?.displayName || 'Admin'}.</p>
        </div>
      </header>
      
      <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7 max-w-6xl mx-auto h-auto sm:h-12 mb-8 glassmorphism border-primary/20">
            {tabs.map(tab => (
                 <TabsTrigger key={tab.value} value={tab.value} className="h-10 text-sm md:text-base">{tab.label}</TabsTrigger>
            ))}
        </TabsList>
        <motion.div initial="hidden" animate="visible">
          {content}
        </motion.div>
      </Tabs>
    </main>
  );
}
