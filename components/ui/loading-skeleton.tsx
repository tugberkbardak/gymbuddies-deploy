import { cn } from "@/lib/utils"
import { LoadingDots } from "./loading-dots"
import { CalendarCheck, Users, UserSearch, Globe, UsersRound, User, Scale } from "lucide-react"

interface LoadingSkeletonProps {
  className?: string
  variant?: "default" | "card" | "list" | "dashboard" | "profile" | "tab-content"
  title?: string
  description?: string
  icon?: React.ReactNode
}

export function LoadingSkeleton({ 
  className, 
  variant = "default", 
  title = "Loading...",
  description,
  icon
}: LoadingSkeletonProps) {
  
  if (variant === "dashboard") {
    return (
      <div className={cn("space-y-6 animate-pulse", className)}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-800 rounded w-48"></div>
          <div className="h-10 bg-gray-800 rounded w-32"></div>
        </div>
        
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === "card") {
    return (
      <div className={cn("bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4 animate-pulse", className)}>
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-gray-900 border border-gray-800 rounded-lg animate-pulse">
            <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "profile") {
    return (
      <div className={cn("space-y-6 animate-pulse", className)}>
        {/* Profile header skeleton */}
        <div className="flex items-center space-x-6">
          <div className="h-24 w-24 bg-gray-800 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-gray-800 rounded w-48"></div>
            <div className="h-4 bg-gray-800 rounded w-32"></div>
            <div className="h-4 bg-gray-800 rounded w-64"></div>
          </div>
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
              <div className="h-8 bg-gray-700 rounded w-16"></div>
              <div className="h-3 bg-gray-700 rounded w-20"></div>
            </div>
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
              <div className="h-5 bg-gray-700 rounded w-40"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === "tab-content") {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 space-y-6 bg-black text-white", className)}>
        <div className="relative">
          {icon ? (
            <div className="h-16 w-16 bg-[#40E0D0]/10 border border-[#40E0D0]/20 rounded-full flex items-center justify-center mb-2">
              {icon}
            </div>
          ) : (
            <div className="h-16 w-16 bg-gray-800 rounded-full animate-pulse"></div>
          )}
        </div>
        
        <div className="text-center space-y-3">
          <LoadingDots size="lg" colorClassName="bg-[#40E0D0]" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">{title}</h3>
            {description && (
              <p className="text-sm text-gray-400 max-w-md">{description}</p>
            )}
          </div>
        </div>
        
        {/* Subtle background animation */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#40E0D0] rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-[#40E0D0] rounded-full animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-[#40E0D0] rounded-full animate-pulse delay-1000"></div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 space-y-4 bg-black text-white", className)}>
      <LoadingDots size="lg" colorClassName="bg-[#40E0D0]" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        {description && (
          <p className="text-sm text-gray-400">{description}</p>
        )}
      </div>
    </div>
  )
}

// Specific loading components for different tabs
export function AttendanceTabLoading() {
  return (
    <LoadingSkeleton 
      variant="tab-content"
      title="Loading Attendance"
      description="Preparing your workout tracking dashboard..."
      icon={<CalendarCheck className="h-8 w-8 text-[#40E0D0]" />}
    />
  )
}

export function FriendsTabLoading() {
  return (
    <LoadingSkeleton 
      variant="tab-content"
      title="Loading Friends"
      description="Connecting with your gym buddies..."
      icon={<Users className="h-8 w-8 text-[#40E0D0]" />}
    />
  )
}

export function FindBuddyTabLoading() {
  return (
    <LoadingSkeleton 
      variant="tab-content"
      title="Loading Find Buddy"
      description="Searching for potential workout partners..."
      icon={<UserSearch className="h-8 w-8 text-[#40E0D0]" />}
    />
  )
}

export function GlobalTabLoading() {
  return (
    <LoadingSkeleton 
      variant="tab-content"
      title="Loading Global Feed"
      description="Fetching worldwide gym activity..."
      icon={<Globe className="h-8 w-8 text-[#40E0D0]" />}
    />
  )
}

export function GroupsTabLoading() {
  return (
    <LoadingSkeleton 
      variant="tab-content"
      title="Loading Groups"
      description="Preparing your group challenges..."
      icon={<UsersRound className="h-8 w-8 text-[#40E0D0]" />}
    />
  )
}

export function ProfilePageLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <LoadingSkeleton 
        variant="profile"
        className="p-6"
      />
    </div>
  )
}

export function WeightPageLoading() {
  return (
    <LoadingSkeleton 
      variant="tab-content"
      title="Loading Weight Tracking"
      description="Preparing your weight progress data..."
      icon={<Scale className="h-8 w-8 text-[#40E0D0]" />}
    />
  )
} 