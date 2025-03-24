"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

interface ProfileInfoDisplayProps {
  bio: string | null | undefined
  defaultGym: string | null | undefined
  userId: string
  isOwnProfile?: boolean
}

export function ProfileInfoDisplay({ bio, defaultGym, userId, isOwnProfile = false }: ProfileInfoDisplayProps) {
  // Enhanced debugging
  useEffect(() => {
    console.log("ProfileInfoDisplay mounted with values:", {
      bio: bio,
      bioType: typeof bio,
      bioLength: bio?.length,
      defaultGym: defaultGym,
      defaultGymType: typeof defaultGym,
      defaultGymLength: defaultGym?.length,
      userId,
      isOwnProfile,
    })
  }, [bio, defaultGym, userId, isOwnProfile])

  // Check if bio and defaultGym are empty strings, null, or undefined
  const hasBio = bio && bio.trim().length > 0
  const hasGym = defaultGym && defaultGym.trim().length > 0

  return (
    <div className="mt-4 space-y-4">
      <div className="p-4 border rounded-md bg-card">
        <h3 className="text-lg font-semibold mb-2">Profile Information</h3>

        {/* Bio Section */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-primary">Bio</h4>
          {hasBio ? (
            <p className="text-sm mt-1">{bio}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic mt-1">No bio added yet</p>
          )}
        </div>

        {/* Gym Section */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-primary">Gym</h4>
          {hasGym ? (
            <p className="text-sm mt-1">{defaultGym}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic mt-1">No gym added yet</p>
          )}
        </div>

        {/* Edit Button - only shown for own profile */}
        {isOwnProfile && (
          <Button variant="outline" size="sm" asChild className="mt-2">
            <Link href="/profile/edit">Edit Profile</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

