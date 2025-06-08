import { LoadingDots } from "@/components/ui/loading-dots"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingDots size="lg" />
    </div>
  )
}

