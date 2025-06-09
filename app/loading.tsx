import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { Dumbbell } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="container mx-auto px-4">
        <LoadingSkeleton 
          variant="tab-content"
          title="Loading GymBuddies..."
          description="Getting your fitness experience ready"
          icon={<Dumbbell className="h-12 w-12 text-primary" />}
          className="py-24"
        />
      </div>
    </div>
  )
} 