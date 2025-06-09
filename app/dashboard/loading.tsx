import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BottomNavigationSkeleton } from "@/components/dashboard/bottom-navigation-skeleton"

export default function DashboardLoading() {
  return (
    <>
      <div className="dashboard-background" />
      <div className="dashboard-content flex flex-col min-h-screen">
        <DashboardHeader />
        
        <main className="flex-1 container py-6">
          <LoadingSkeleton 
            variant="dashboard" 
            className="pb-20" // Add padding for bottom navigation
          />
        </main>

        <BottomNavigationSkeleton />
      </div>
    </>
  )
}

