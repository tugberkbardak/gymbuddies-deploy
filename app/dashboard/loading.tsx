import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Skeleton } from "@/components/ui/skeleton"
import { BottomNavigationSkeleton } from "@/components/dashboard/bottom-navigation-skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="dashboard-background" />
      <div className="dashboard-content flex flex-col">
        <div className="flex items-center justify-between p-4">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
        </div>

        <main className="flex-1 container py-6">
          <div className="space-y-6">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-200 animate-pulse" />
      </div>
    </div>
  )
}

