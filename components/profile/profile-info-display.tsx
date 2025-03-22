"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ProfileInfoDisplayProps {
  bio: string | null | undefined
  defaultGym: string | null | undefined
  userId: string
}

export function ProfileInfoDisplay({ bio, defaultGym, userId }: ProfileInfoDisplayProps) {
  return (
    <div className="mt-4 space-y-4">
      <div className="p-4 border rounded-md bg-card">
        <h3 className="text-lg font-semibold mb-2">Profile Information</h3>

        {/* Bio Section */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-primary">Bio</h4>
          {bio ? (
            <p className="text-sm mt-1">{bio}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic mt-1">No bio added yet</p>
          )}
        </div>

        {/* Gym Section */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-primary">Gym</h4>
          {defaultGym ? (
            <p className="text-sm mt-1">{defaultGym}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic mt-1">No gym added yet</p>
          )}
        </div>

        {/* Edit Button */}
        <Button variant="outline" size="sm" asChild className="mt-2">
          <Link href="/profile/edit">Edit Profile</Link>
        </Button>
      </div>
    </div>
  )
}

