"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserSearch, Users, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function FindBuddyTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Find Your Buddy</h2>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserSearch className="h-5 w-5" />
            Find Gym Buddies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-secondary/50 p-4 rounded-full mb-6">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">No More Lonely Gym Sessions!</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Find your perfect gym buddy based on workout preferences, schedule, and fitness goals. Train together,
              stay motivated, and achieve more!
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Launching soon</p>
            </div>
  
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

