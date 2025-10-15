
'use client';

import { useUser } from "@/firebase";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <main className="container mx-auto p-6 md:p-8">
         <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-10 w-64" />
         </div>
         <div className="grid grid-cols-1 gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Skeleton className="h-80" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-80" />
                </div>
            </div>
        </div>
      </main>
    );
  }

  if (user?.email === 'tribexesports@gmail.com') {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}
