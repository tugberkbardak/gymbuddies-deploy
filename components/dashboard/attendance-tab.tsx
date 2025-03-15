"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Camera, MapPin, Upload, Loader2 } from "lucide-react"
import { AttendanceList } from "@/components/dashboard/attendance-list"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AttendanceTab() {
  const [showForm, setShowForm] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationName, setLocationName] = useState("")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const getLocation = () => {
    setIsLoadingLocation(true)
    setLocationError(null)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // This would be handled with a server action in the real implementation
    setShowForm(false)
    setSelectedImage(null)
    setLocation(null)
    setLocationName("")
  }

  const getMapLink = () => {
    if (location) {
      return `https://www.google.com/maps?q=${location.lat},${location.lng}`
    }
    return "#"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Gym Attendance</h2>
        <Button onClick={() => setShowForm(true)}>Record Attendance</Button>
      </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <label htmlFor="location" className="text-sm font-medium">
                      Gym Location
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
                        placeholder="Enter gym name or address"
                        required
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={getLocation} disabled={isLoadingLocation}>
                        {isLoadingLocation ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {location && (
                      <div className="text-xs text-muted-foreground">
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

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <label htmlFor="photo" className="text-sm font-medium">
                      Gym Photo
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("photo")?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </div>

              {selectedImage && (
                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Selected gym photo"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Workout Notes (Optional)
                </label>
                <Textarea id="notes" placeholder="Share how your workout went today..." rows={3} />
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
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!location || !selectedImage}>
                Submit
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <AttendanceList />
    </div>
  )
}

