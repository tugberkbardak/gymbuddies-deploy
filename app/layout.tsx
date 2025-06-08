import type React from "react"
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://gymbuddies.net'),
  title: {
    default: "GymBuddies - Track Your Gym Progress With Friends | Fitness Motivation App",
    template: "%s | GymBuddies - Fitness Tracking & Motivation"
  },
  description: "Track your gym attendance, connect with workout buddies, and stay motivated through friendly competition. Join 1000+ fitness enthusiasts building consistent gym habits together.",
  keywords: [
    "gym buddy",
    "gym buddies", 
    "track with your gym buddy",
    "fitness tracking app",
    "workout accountability",
    "gym attendance tracker",
    "fitness motivation",
    "workout buddy app",
    "gym progress tracking",
    "fitness social network",
    "exercise accountability partner",
    "gym habit tracker",
    "workout streak tracker",
    "fitness goals app",
    "gym community app",
    "workout motivation app",
    "fitness companion",
    "gym check-in app",
    "exercise partner finder",
    "fitness accountability"
  ],
  authors: [{ name: "GymBuddies Team" }],
  creator: "GymBuddies",
  publisher: "GymBuddies",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gymbuddies.net',
    siteName: 'GymBuddies',
    title: 'GymBuddies - Track Your Gym Progress With Friends',
    description: 'Track your gym attendance, connect with workout buddies, and stay motivated through friendly competition. Join 1000+ fitness enthusiasts building consistent gym habits.',
    images: [
      {
        url: '/banner.png',
        width: 1200,
        height: 630,
        alt: 'GymBuddies - Fitness Tracking and Motivation App',
      },
      {
        url: '/logo1.png',
        width: 400,
        height: 400,
        alt: 'GymBuddies Logo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GymBuddies - Track Your Gym Progress With Friends',
    description: 'Track your gym attendance, connect with workout buddies, and stay motivated through friendly competition.',
    creator: '@gymbuddies',
    images: ['/banner.png'],
  },
  icons: {
    icon: [
      { url: "/logo2.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/logo1.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: ["/logo1.png"],
    apple: [
      { url: "/logo1.png", sizes: "180x180", type: "image/png" }
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: 'https://gymbuddies.net',
  },
  category: 'fitness',
  verification: {
    google: 'your-google-verification-code', // Replace with actual verification code
  },
}

// Structured Data Schema
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://gymbuddies.net/#webapp",
      "name": "GymBuddies",
      "description": "Track your gym attendance, connect with workout buddies, and stay motivated through friendly competition",
      "url": "https://gymbuddies.net",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1000",
        "bestRating": "5"
      },
      "featureList": [
        "Gym attendance tracking",
        "Friend connections and social features",
        "Workout streak tracking",
        "Progress visualization",
        "Goal setting and achievements",
        "AI fitness coaching"
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://gymbuddies.net/#organization",
      "name": "GymBuddies",
      "url": "https://gymbuddies.net",
      "logo": {
        "@type": "ImageObject",
        "url": "https://gymbuddies.net/logo1.png",
        "width": 400,
        "height": 400
      },
      "sameAs": [
        "https://twitter.com/gymbuddies",
        "https://facebook.com/gymbuddies"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://gymbuddies.net/#website",
      "url": "https://gymbuddies.net",
      "name": "GymBuddies",
      "description": "Fitness tracking and motivation app for gym enthusiasts",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://gymbuddies.net/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        </head>
        <body className={`${inter.className} bg-black text-white`}>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
