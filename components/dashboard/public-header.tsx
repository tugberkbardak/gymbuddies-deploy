"use client"

import Link from "next/link"
import Image from "next/image"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function PublicHeader() {
  return (
    <header className="w-full py-4 px-6 flex justify-between items-center border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="GymBuddies Logo" width={32} height={32} />
          <h1 className="text-xl font-bold">GymBuddies</h1>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <SignInButton mode="modal">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button size="sm">Sign Up</Button>
        </SignUpButton>
      </div>
    </header>
  )
}

