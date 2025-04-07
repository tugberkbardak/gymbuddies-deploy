"use client"

import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const handleProfileClick = (e) => {
    e.preventDefault()
    router.push("/profile")
  }

  return (
    <header className="w-full py-4 px-6 flex justify-between items-center border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo2.svg" alt="GymBuddies Logo" width={32} height={32} />
          <h1 className="text-xl font-bold">GymBuddies</h1>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {!isLoaded ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : user ? (
          <>
            <span className="text-sm hidden md:inline-block">Welcome, {user.firstName || user.username || "User"}</span>
            <Button variant="ghost" size="sm" onClick={handleProfileClick}>
              Profile
            </Button>
            <UserButton afterSignOutUrl="/" />
          </>
        ) : (
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  )
}

