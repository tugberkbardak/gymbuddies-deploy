"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareProfileButtonProps {
  username: string
}

export function ShareProfileButton({ username }: ShareProfileButtonProps) {
  const { toast } = useToast()
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    setIsSharing(true)

    try {
      // Create the profile URL
      const profileUrl = `${window.location.origin}/profile/username/${username}`

      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: "Check out my GymBuddies profile",
          text: "Follow my gym progress on GymBuddies!",
          url: profileUrl,
        })

        toast({
          title: "Shared successfully",
          description: "Your profile has been shared",
        })
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(profileUrl)

        toast({
          title: "URL copied to clipboard",
          description: "Your profile URL has been copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Error sharing profile:", error)

      toast({
        title: "Sharing failed",
        description: "Could not share your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare} disabled={isSharing} className="ml-2">
      <Share2 className="h-4 w-4 mr-2" />
      Share Profile
    </Button>
  )
}

