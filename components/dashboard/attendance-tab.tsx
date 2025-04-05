"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Camera, MapPin, Loader2, Building2, CheckCircle2, AlertCircle, XCircle, Globe } from "lucide-react"
import { AttendanceList } from "@/components/dashboard/attendance-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAttendanceRefresh } from "@/hooks/use-attendance-refresh"
import { WeeklyStreakProgress } from "@/components/dashboard/weekly-streak-progress"
import { Plus } from "lucide-react"


export function AttendanceTab() {
  const { user } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationName, setLocationName] = useState("")
  const [gymName, setGymName] = useState("")
  const [notes, setNotes] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // Camera states
  const [showCamera, setShowCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const { attendanceListRef, refreshAttendanceList } = useAttendanceRefresh()

  // Pre-fill gym name when form is shown
  useEffect(() => {
    if (showForm && user) {
      const defaultGym = (user.unsafeMetadata as any)?.defaultGym
      if (defaultGym) {
        setGymName(defaultGym)
      }
    }
  }, [showForm, user])

  // Start camera when showCamera is true
  useEffect(() => {
    if (showCamera) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [showCamera])

  const startCamera = async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera if available
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setCameraError("Could not access camera. Please ensure you've granted camera permissions.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the video frame to the canvas
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to data URL
        const imageData = canvas.toDataURL("image/jpeg")
        setSelectedImage(imageData)

        // Hide camera after capturing
        setShowCamera(false)
      }
    }
  }

  const getLocation = () => {
    setIsLoadingLocation(true)
    setLocationError(null)
    // Reset location name when getting a new location
    setLocationName("")

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })

        // Try to get location name using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } },
          )
          const data = await response.json()
          if (data && data.display_name) {
            setLocationName(data.display_name)
          }
        } catch (error) {
          console.error("Error fetching location name:", error)
        }

        setIsLoadingLocation(false)
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`)
        setIsLoadingLocation(false)
      },
      { enableHighAccuracy: true },
    )
  }

  useEffect(() => {
    if (showForm) {
      getLocation()
    }
  }, [showForm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    setIsSubmitting(true)

    try {
      // Validate form
      if (!gymName.trim()) {
        throw new Error("Gym name is required")
      }

      if (!locationName.trim()) {
        throw new Error("Location is required")
      }

      if (!location) {
        throw new Error("Please share your location")
      }

      if (!selectedImage) {
        throw new Error("Please take a gym photo")
      }

      // Submit form using fetch API instead of direct server action
      const formData = new FormData()
      formData.append("gymName", gymName)
      formData.append("locationName", locationName)
      formData.append("coordinates", JSON.stringify(location))
      formData.append("notes", notes)
      formData.append("imageData", selectedImage)
      formData.append("isPublic", isPublic.toString())

      const response = await fetch("/api/attendance", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to record attendance")
      }

      const result = await response.json()

      setFormSuccess("Attendance recorded successfully!")
      toast({
        title: "Success!",
        description: "Your gym attendance has been recorded.",
        variant: "default",
      })

      // Instead of router.refresh() which causes a full page refresh
      // We'll update the attendance list directly
      refreshAttendanceList()

      // Stay on the attendance tab
      const urlParams = new URLSearchParams(window.location.search)
      if (!urlParams.has("tab") || urlParams.get("tab") !== "attendance") {
        router.push("/dashboard?tab=attendance")
      }

      // Reset form after successful submission
      setTimeout(() => {
        setShowForm(false)
        setSelectedImage(null)
        setLocation(null)
        setLocationName("")
        setGymName("")
        setNotes("")
        setIsPublic(false)
        setFormSuccess(null)
      }, 2000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setFormError(error.message || "An error occurred while recording attendance")
      toast({
        title: "Error",
        description: error.message || "Failed to record attendance",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMapLink = () => {
    if (location) {
      return `https://www.google.com/maps?q=${location.lat},${location.lng}`
    }
    return "#"
  }

  return (
    <div className="space-y-6">
      <div className="relative flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Gym Attendance</h2>
        <Button
          onClick={() => setShowForm(true)}
          size="icon"
          className="w-10 h-10 bg-[#83FFE6] text-black hover:bg-[#6be5d0]"
        >
          <Plus className="w-6 h-6" strokeWidth={4} />
        </Button>
      </div>

      {/* Add Weekly Streak Progress component */}
      <WeeklyStreakProgress />

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Record Gym Attendance</CardTitle>
              <CardDescription>
                Take a photo at the gym and share your location to record your attendance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              {formSuccess && (
                <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{formSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  {/* Gym Name Field */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <label htmlFor="gymName" className="text-sm font-medium">
                        Gym Name
                      </label>
                    </div>
                    <Input
                      id="gymName"
                      placeholder="Enter the name of your gym"
                      required
                      value={gymName}
                      onChange={(e) => setGymName(e.target.value)}
                    />
                    {user &&
                      (user.unsafeMetadata as any)?.defaultGym &&
                      gymName !== (user.unsafeMetadata as any)?.defaultGym && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-auto py-1 px-2 text-xs"
                          onClick={() => setGymName((user.unsafeMetadata as any)?.defaultGym)}
                        >
                          Use my default gym
                        </Button>
                      )}
                  </div>

                  {/* Location Field */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <label htmlFor="location" className="text-sm font-medium">
                        Location
                      </label>
                    </div>

                    {locationError && (
                      <Alert variant="destructive" className="mb-2">
                        <AlertDescription>{locationError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Input
                          id="location"
                          placeholder="Your current location (auto-detected)"
                          required
                          value={locationName}
                          onChange={(e) => setLocationName(e.target.value)}
                          className="flex-1"
                          readOnly={location !== null}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getLocation}
                          disabled={isLoadingLocation}
                          title={location ? "Refresh location" : "Get current location"}
                        >
                          {isLoadingLocation ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {location && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="flex items-center">
                            <span className="text-amber-500 mr-1">•</span>
                            Location is locked for accuracy. If incorrect, click the location button again.
                          </span>
                          <span>
                            Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                          </span>
                          <a
                            href={getMapLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-primary underline"
                          >
                            View on map
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <label className="text-sm font-medium">Gym Photo</label>
                  </div>

                  {!selectedImage && !showCamera && (
                    <Button type="button" variant="outline" onClick={() => setShowCamera(true)} className="w-full">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  )}

                  {cameraError && (
                    <Alert variant="destructive" className="mb-2">
                      <AlertDescription>{cameraError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Camera View */}
              {showCamera && (
                <div className="relative">
                  <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  </div>
                  <div className="flex justify-between mt-2">
                    <Button type="button" variant="outline" onClick={() => setShowCamera(false)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="button" onClick={capturePhoto}>
                      <Camera className="h-4 w-4 mr-2" />
                      Capture
                    </Button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {/* Display captured image */}
              {selectedImage && (
                <div className="relative">
                  <div className="aspect-video w-full overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedImage || "/placeholder.svg"}
                      alt="Captured gym photo"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedImage(null)
                      setShowCamera(true)
                    }}
                    className="mt-2"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Retake Photo
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Workout Notes (Optional)
                </label>
                <Textarea
                  id="notes"
                  placeholder="Share how your workout went today..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Public/Private Toggle */}
              <div className="flex items-center space-x-2">
                <Switch id="public-mode" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="public-mode" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Show in Global Feed
                </Label>
                <span className="text-xs text-muted-foreground ml-2">
                  {isPublic ? "Your attendance will be visible to everyone" : "Only visible to you and your friends"}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setSelectedImage(null)
                  setLocation(null)
                  setLocationName("")
                  setGymName("")
                  setNotes("")
                  setIsPublic(false)
                  setShowCamera(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !location || !selectedImage || !gymName.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <AttendanceList ref={attendanceListRef} />
    </div>
  )
}

