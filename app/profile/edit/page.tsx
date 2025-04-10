"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ChevronLeft, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Import the server action
import { updateUserProfile } from "@/actions/profile-actions"

export default function EditProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    defaultGym: "",
  })

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (isLoaded && user) {
      // Get data from user metadata
      const metadata = (user.unsafeMetadata as any) || {}

      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: metadata.bio || "",
        defaultGym: metadata.defaultGym || "",
      })

      console.log("Loaded user data:", {
        firstName: user.firstName,
        lastName: user.lastName,
        bio: metadata.bio,
        defaultGym: metadata.defaultGym,
      })
    } else if (isLoaded && !user) {
      // Redirect to sign-in if not authenticated
      router.push("/sign-in")
    }
  }, [isLoaded, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Update the handleSubmit function to also update the MongoDB database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      setError("You must be signed in to update your profile")
      return
    }

    setIsUpdating(true)

    try {
      console.log("Updating profile with:", formData)

      // Create a FormData object to pass to the server action
      const formDataObj = new FormData()
      formDataObj.append("firstName", formData.firstName)
      formDataObj.append("lastName", formData.lastName)
      formDataObj.append("bio", formData.bio)
      formDataObj.append("defaultGym", formData.defaultGym)

      // Update user in Clerk
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
        unsafeMetadata: {
          ...user.unsafeMetadata,
          bio: formData.bio,
          defaultGym: formData.defaultGym,
        },
      })

      // Also update user in MongoDB directly
      const result = await updateUserProfile(formDataObj)

      if (!result.success) {
        throw new Error(result.error || "Failed to update profile in database")
      }

      // Force a refresh to ensure the data is updated
      router.push("/profile")
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      setError(error.message || "Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">You need to be signed in to edit your profile.</p>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />

      <main className="flex-1 container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Profile
            </Button>
          </Link>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultGym">Gym</Label>
                <Input
                  id="defaultGym"
                  name="defaultGym"
                  placeholder="Enter your regular gym name"
                  value={formData.defaultGym}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">
                  This will be automatically filled when recording attendance
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/profile")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}

