"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface AuthButtonsProps {
  variant?: "default" | "hero" | "cta"
  size?: "default" | "sm" | "lg"
}

export default function AuthButtons({ variant = "default", size = "default" }: AuthButtonsProps) {
  const router = useRouter()

  const handleSignIn = () => {
    router.push("/sign-in")
  }

  const handleSignUp = () => {
    router.push("/sign-up")
  }

  if (variant === "hero") {
    return (
      <div className="flex flex-col gap-2 min-[400px]:flex-row">
        <Button size="lg" className="font-medium bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-black" onClick={handleSignUp}>
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="border-white text-white hover:bg-white/10"
          onClick={handleSignIn}
        >
          Sign In
        </Button>
      </div>
    )
  }

  if (variant === "cta") {
    return (
      <div className="flex flex-col gap-2 min-[400px]:flex-row">
        <Button size="lg" className="font-medium bg-black hover:bg-black/90 text-white" onClick={handleSignUp}>
          Get Started for Free
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Default header buttons
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:text-white hover:bg-white/10"
        onClick={handleSignIn}
      >
        Sign In
      </Button>
      <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/10" onClick={handleSignUp}>
        Sign Up
      </Button>
    </div>
  )
}

