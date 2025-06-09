import { ProfilePageLoading } from "@/components/ui/loading-skeleton"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function ProfileLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <div className="flex-1 container mx-auto">
        <ProfilePageLoading />
      </div>
    </div>
  )
}

