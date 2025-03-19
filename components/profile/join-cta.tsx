"use client"

import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function JoinCTA() {
  return (
    <div className="bg-black rounded-lg p-8 text-white">
      <h2 className="text-2xl font-bold mb-1">Join GymBuddies</h2>
      <p className="text-gray-400 mb-8">Track your gym progress with friends</p>

      <p className="text-center mb-6">
        Sign up to track your gym attendance, connect with friends, and stay motivated!
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <SignInButton mode="modal">
          <Button variant="outline" className="w-full sm:w-auto">
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="w-full sm:w-auto">Sign Up</Button>
        </SignUpButton>
      </div>
    </div>
  )
}

