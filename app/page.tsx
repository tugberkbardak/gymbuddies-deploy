"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Trophy, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import FeatureCard from "@/components/marketing/feature-card"
import TestimonialCard from "@/components/marketing/testimonial-card"
import StatCard from "@/components/marketing/stat-card"
import { cn } from "@/lib/utils"
import { SignInButton, SignUpButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Check if user is already signed in when component mounts
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // If user is already signed in, redirect to dashboard
      console.log("User is already signed in, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [isLoaded, isSignedIn, router])

  const handleDashboardClick = () => {
    setIsLoading(true)
    router.push("/dashboard")
  }

  useEffect(() => {
    document.body.classList.add("dashboard-bg");
    return () => document.body.classList.remove("dashboard-bg");
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">GymBuddies</span>
            </Link>
            <nav className="hidden md:flex gap-6 ml-6">
              <Link href="#features" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
                Features
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
              >
                Testimonials
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
                Pricing
              </Link>
              <Link href="#faq" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
                FAQ
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-black">
                  Get Started
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button
                size="sm"
                className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-black"
                onClick={handleDashboardClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Dashboard"
                )}
              </Button>
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-black text-white">
          {/* Background dots */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-10 pointer-events-none" />

          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Find Your <span className="text-[#40E0D0]">Gym Buddy</span> & <br />
                  <span className="text-[#40E0D0]">Track Progress Together</span>
                </h1>
                <p className="max-w-[600px] text-gray-300 md:text-xl">
                  Connect with workout buddies, track your gym attendance together, and stay motivated through
                  friendly competition. Build consistent fitness habits with accountability partners.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <SignedOut>
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <SignUpButton mode="modal">
                        <button className="bg-[#40E0D0] text-black font-medium py-3 px-6 rounded-md flex items-center justify-center hover:bg-[#40E0D0]/90 transition-colors">
                          Find Gym Buddies <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      </SignUpButton>
                      <SignInButton mode="modal">
                        <button className="bg-transparent text-white font-medium py-3 px-6 rounded-md border border-white hover:bg-white/10 transition-colors">
                          Sign In
                        </button>
                      </SignInButton>
                    </div>
                  </SignedOut>
                  <SignedIn>
                    <button
                      className="bg-[#40E0D0] text-black font-medium py-3 px-6 rounded-md flex items-center justify-center hover:bg-[#40E0D0]/90 transition-colors"
                      onClick={() => router.push("/dashboard")}
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </SignedIn>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border-2 border-black",
                          i === 1 && "bg-blue-500",
                          i === 2 && "bg-green-500",
                          i === 3 && "bg-yellow-500",
                          i === 4 && "bg-red-500",
                        )}
                      >
                        <span className="sr-only">User {i}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-gray-300">
                    Joined by <span className="font-medium text-white">1,000+</span> fitness enthusiasts and gym buddies
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-md mx-auto">
                  <Image
                    src="/gymimage.png"
                    alt="Gym buddies working out together - track your fitness progress with workout partners"
                    width={600}
                    height={600}
                    className="rounded-lg shadow-xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-black border-t border-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <p className="text-[#40E0D0] text-sm md:text-base">Features</p>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Track With Your Gym Buddy - Everything You Need
                </h2>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  GymBuddies provides all the tools you need to track your progress with workout partners, connect with gym buddies, and stay
                  motivated together.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <FeatureCard
                icon={<Calendar className="h-10 w-10 text-[#40E0D0]" />}
                title="Gym Attendance Tracking"
                description="Track your gym sessions with your workout buddy and build consistent habits together with our intuitive tracking system."
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 text-[#40E0D0]" />}
                title="Connect with Gym Buddies"
                description="Find and add gym buddies, see their progress, and motivate each other to reach your fitness goals together."
              />
              <FeatureCard
                icon={<Trophy className="h-10 w-10 text-[#40E0D0]" />}
                title="Workout Streaks & Achievements"
                description="Build and maintain workout streaks with your gym buddy to visualize your consistency and earn achievements together."
              />
              <FeatureCard
                icon={<Zap className="h-10 w-10 text-[#40E0D0]" />}
                title="AI Fitness Coach"
                description="Get personalized workout advice and nutrition tips from our AI-powered fitness coach for you and your gym buddy."
              />
              <FeatureCard
                icon={<Clock className="h-10 w-10 text-[#40E0D0]" />}
                title="Progress Timeline"
                description="View your fitness journey over time with detailed statistics and visualizations alongside your workout partners."
              />
              <FeatureCard
                icon={<CheckCircle className="h-10 w-10 text-[#40E0D0]" />}
                title="Goal Setting & Accountability"
                description="Set and track personal fitness goals with your gym buddy to stay focused and accountable together."
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 border-t border-b border-gray-800 bg-black">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard value="1K+" label="Active Users" />
              <StatCard value="50K+" label="Workouts Tracked" />
              <StatCard value="9" label="Weeks Avg. Streak" />
              <StatCard value="91%" label="User Satisfaction" />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-black">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <p className="text-[#40E0D0] text-sm md:text-base">Testimonials</p>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Don't just take our word for it. Here's what our community has to say about GymBuddies.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <TestimonialCard
                quote="GymBuddies has completely transformed my fitness routine. The streak feature keeps me motivated to never miss a workout!"
                author="Atasoy A."
                role="Fitness Enthusiast"
                avatarSrc="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ydVgyWThkbllCa1RkbE9YUmhmbjBzS012c0cifQ"
              />
              <TestimonialCard
                quote="Competing with my friends on the leaderboard makes going to the gym fun. I've never been this consistent before."
                author="Bardak T."
                role="Bodybuilder"
                avatarSrc="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzJ2NkVXNjVmckhwa3VwMHl4Wk9YcnQ0d05qSCJ9"
              />
              <TestimonialCard
                quote="Tracking seeing my progress week by week helps me stay focused. We even met with my current gym mate thanks to GymBuddies!"
                author="Guldemir O."
                role="Powerlifter & Former Kickboxer"
                avatarSrc="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ydVVzZm0wUTNXZE43T2tRQlhNUWszMjNoUXgifQ"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="pricing" className="py-20 bg-[#40E0D0] text-black">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Fitness Journey?
                </h2>
                <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of users who are already tracking their progress and achieving their fitness goals.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="bg-black text-white font-medium py-3 px-6 rounded-md flex items-center justify-center hover:bg-black/90 transition-colors">
                      Get Started for Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <button
                    className="bg-black text-white font-medium py-3 px-6 rounded-md flex items-center justify-center hover:bg-black/90 transition-colors"
                    onClick={handleDashboardClick}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </SignedIn>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-black">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <div className="space-y-2">
                <p className="text-[#40E0D0] text-sm md:text-base">FAQ</p>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to know about GymBuddies
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-3xl space-y-6">
              {[
                {
                  question: "Is GymBuddies free to use?",
                  answer:
                    "Yes! GymBuddies offers a free plan with all the essential features. We also offer a premium plan with advanced features like AI coaching and detailed analytics.",
                },
                {
                  question: "How does the streak system work?",
                  answer:
                    "Your streak increases by 1 each week if you check at least 3 times. If you miss a week, your streak resets to 0.",
                },
                {
                  question: "Can I connect with friends who don't use GymBuddies?",
                  answer:
                    "You can invite friends via email or by sharing your profile link. Once they sign up, you can connect and start tracking your progress together.",
                },
                {
                  question: "How accurate is the AI fitness coach?",
                  answer:
                    "Our AI coach is trained on a vast database of fitness knowledge and is designed to provide personalized advice based on your goals and fitness level. While it's a powerful tool, it's not a replacement for a certified personal trainer.",
                },
                {
                  question: "Is the AI coach available for everyone?",
                  answer:
                    "Our AI coach is currently in development and will be available to use soon. It is the part of our Premium subscription, so it will be available only for the Premium members.",
                },
              ].map((faq, index) => (
                <div key={index} className="rounded-lg border border-gray-800 p-6">
                  <h3 className="text-xl font-medium mb-2">{faq.question}</h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-800">
        <div className="container px-4 md:px-6">
          <p className="text-sm text-gray-400 text-center">2025 GymBuddies all rights reserved</p>
        </div>
      </footer>
    </div>
  )
}
