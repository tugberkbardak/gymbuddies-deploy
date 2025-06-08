import { SignUp } from "@clerk/nextjs"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Join GymBuddies - Create Your Free Fitness Tracking Account",
  description: "Sign up for GymBuddies and start tracking your gym progress with friends. Join 1000+ fitness enthusiasts staying motivated through workout accountability partners.",
  keywords: [
    "gym buddy signup",
    "fitness tracking registration",
    "workout accountability partner",
    "gym progress tracker account",
    "fitness motivation app signup",
    "join gym buddies",
    "create fitness account",
    "workout buddy registration"
  ],
  openGraph: {
    title: "Join GymBuddies - Create Your Free Fitness Tracking Account",
    description: "Sign up for GymBuddies and start tracking your gym progress with friends. Join 1000+ fitness enthusiasts staying motivated.",
    url: "https://gymbuddies.net/sign-up",
    siteName: "GymBuddies",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Join GymBuddies - Create Your Free Fitness Tracking Account",
    description: "Sign up for GymBuddies and start tracking your gym progress with friends.",
  },
  alternates: {
    canonical: "https://gymbuddies.net/sign-up",
  },
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create a GymBuddies Account</h1>
          <p className="mt-2 text-gray-600">Join the community and start tracking your gym progress</p>
        </div>
        <SignUp
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

