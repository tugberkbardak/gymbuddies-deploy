"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LandingPage() {
  const { isSignedIn } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDashboardClick = () => {
    setIsLoading(true)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-4 px-6 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="GymBuddies Logo" width={40} height={40} />
          <h1 className="text-2xl font-bold">GymBuddies</h1>
        </div>
        <SignedOut>
          <div className="flex gap-2">
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Sign Up</Button>
            </SignUpButton>
          </div>
        </SignedOut>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="flex-1 max-w-xl space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Track Your Gym Progress With Friends</h2>
          <p className="text-xl text-muted-foreground">
            Record your gym attendance, share your progress with friends, and compete in groups to stay motivated.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button size="lg" onClick={handleDashboardClick} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Go to Dashboard"
                )}
              </Button>
            </SignedIn>
          </div>
        </div>

        {/* Modified image container to display properly on all devices */}
        <div className="w-full max-w-md mx-auto mt-8">
          <div className="relative aspect-square w-full">
            <Image
              src="gymimage.png"
              alt="People working out at the gym"
              fill
              className="object-cover rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      </main>

      <footer className="py-6 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <Image src="/logo.svg" alt="GymBuddies Logo" width={24} height={24} />
            <p className="text-sm text-muted-foreground">GymBuddies</p>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GymBuddies. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

