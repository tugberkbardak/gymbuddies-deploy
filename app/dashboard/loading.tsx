import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Skeleton } from "@/components/ui/skeleton"
import { BottomNavigationSkeleton } from "@/components/dashboard/bottom-navigation-skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />

      <main className="flex-1 container py-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>

          <div className="space-y-4 mt-6">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        </div>
      </main>

      {/* Use the skeleton version of the bottom navigation */}
      <BottomNavigationSkeleton />
    </div>
  )
}

