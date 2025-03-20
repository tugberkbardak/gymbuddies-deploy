"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { FriendsDialog } from "@/components/profile/friends-dialog"

interface BuddiesCardProps {
  userId: string
  username: string
  friendCount: number
}

export function BuddiesCard({ userId, username, friendCount }: BuddiesCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setDialogOpen(true)}>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <Users className="h-4 w-4" />
            Buddies
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="text-2xl font-bold">{friendCount}</div>
          <p className="text-xs text-muted-foreground">{friendCount === 1 ? "Friend" : "Friends"}</p>
        </CardContent>
      </Card>

      <FriendsDialog open={dialogOpen} onOpenChange={setDialogOpen} userId={userId} username={username} />
    </>
  )
}

