"use client"

import Link from "next/link"
import Image from "next/image"
import { UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  const { user } = useUser()

  return (
    <header className="w-full py-4 px-6 flex justify-between items-center border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="GymBuddies Logo" width={32} height={32} />
          <h1 className="text-xl font-bold">GymBuddies</h1>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm hidden md:inline-block">Welcome, {user.firstName || user.username || "User"}</span>
        )}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile">Profile</Link>
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}

