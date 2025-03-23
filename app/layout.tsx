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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png" }],
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
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-icon.png" />
        </head>
        <body className={`${inter.className} bg-black text-white`}>
          {children}
          <Analytics /> {/* Proper Analytics Integration */}
        </body>
      </html>
    </ClerkProvider>
  )
}
