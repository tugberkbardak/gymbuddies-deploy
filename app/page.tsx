import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"

export default function LandingPage() {
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

      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-8">
        <div className="flex-1 max-w-xl space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Track Your Gym Progress With Friends</h2>
          <p className="text-xl text-muted-foreground">
            Record your gym attendance, share your progress with friends, and compete in groups to stay motivated!
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
              <Link href="/dashboard">
                <Button size="lg">Go to your Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative aspect-square">
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
    </div>
  )
}

