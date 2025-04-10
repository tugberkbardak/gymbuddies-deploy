import type React from "react"
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { Analytics } from "@vercel/analytics/react" // <-- Import Vercel Analytics

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GymBuddies - Track Your Gym Progress With Friends",
  description: "Record your gym attendance, share your progress with friends, and compete in groups to stay motivated.",
  icons: {
    icon: [
      { url: "/logo2.svg", sizes: "any" },
      { url: "/logo2.svg", type: "image/svg" },
    ],
    shortcut: ["/logo1.svg"],
    apple: [{ url: "/logo1.png" }],
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
      <head>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>GymBuddies - Track Your Gym Progress With Friends</title>
  <meta name="description" content="Record your gym attendance, share your progress with friends, and compete globally to stay motivated." />

  {/* Favicon + Icons */}
  <link rel="shortcut icon" href="logo2" />
  <link rel="icon" href="/logo1" sizes="any" />
  <link rel="icon" href="/logo1" type="image/png" />
  <link rel="apple-touch-icon" href="/logo1.png" />

  {/* Open Graph for LinkedIn/Facebook */}
  <meta property="og:title" content="GymBuddies" />
  <meta property="og:description" content="Track your gym progress, connect with friends, and compete globally." />
  <meta property="og:image" content="https://gymbuddies.net/logo1.png" />
  <meta property="og:url" content="https://gymbuddies.net" />
  <meta property="og:type" content="website" />

  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="GymBuddies" />
  <meta name="twitter:description" content="Track your gym progress and compete globally with friends." />
  <meta name="twitter:image" content="https://gymbuddies.net/logo1.png" />
</head>

        <body className={`${inter.className} bg-black text-white`}>
          {children}
          <Analytics /> {/* Proper Analytics Integration */}
        </body>
      </html>
    </ClerkProvider>
  )
}
