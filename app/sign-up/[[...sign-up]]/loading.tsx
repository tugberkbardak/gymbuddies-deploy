import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { UserPlus } from "lucide-react"

export default function SignUpLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 border border-gray-800 rounded-lg shadow-xl">
        <div className="text-center space-y-4">
          <LoadingSkeleton 
            variant="tab-content"
            title="Setting up your account..."
            description="Please wait while we prepare your GymBuddies experience"
            icon={<UserPlus className="h-8 w-8 text-[#40E0D0]" />}
          />
        </div>
      </div>
    </div>
  )
} 