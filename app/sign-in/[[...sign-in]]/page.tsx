import { SignIn } from "@clerk/nextjs"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In to GymBuddies - Access Your Fitness Tracking Dashboard",
  description: "Sign in to your GymBuddies account to track gym progress, connect with workout buddies, and maintain your fitness streaks. Access your personalized fitness dashboard.",
  keywords: [
    "gym buddy login",
    "fitness tracking login",
    "workout accountability login",
    "gym progress tracker signin",
    "fitness app login",
    "gymbuddies signin",
    "fitness dashboard access"
  ],
  openGraph: {
    title: "Sign In to GymBuddies - Access Your Fitness Tracking Dashboard",
    description: "Sign in to your GymBuddies account to track gym progress and connect with workout buddies.",
    url: "https://gymbuddies.net/sign-in",
    siteName: "GymBuddies",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sign In to GymBuddies - Access Your Fitness Dashboard",
    description: "Sign in to track gym progress and connect with workout buddies.",
  },
  alternates: {
    canonical: "https://gymbuddies.net/sign-in",
  },
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In to GymBuddies</h1>
          <p className="mt-2 text-gray-600">Track your gym progress with friends</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
              footerActionLink: "text-primary hover:text-primary/90",
            },
          }}
        />
      </div>
    </div>
  )
}

