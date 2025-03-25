import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // In a real app, you'd check if the user is an admin

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />

      <main className="flex-1 container py-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fix User Streaks</CardTitle>
              <CardDescription>
                Reset invalid streaks for users who don't meet the criteria of 3+ gym visits per week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This will scan all users with streaks greater than 0 and reset them if they don't have enough attendance
                records to justify their streak count.
              </p>
            </CardContent>
            <CardFooter>
              <FixStreaksButton />
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
;("use client")

import React from "react"

function FixStreaksButton() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [result, setResult] = React.useState<string | null>(null)

  const handleFixStreaks = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/fix-streaks", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`Success: ${data.message}`)
      } else {
        setResult(`Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleFixStreaks} disabled={isLoading}>
        {isLoading ? "Fixing Streaks..." : "Fix Invalid Streaks"}
      </Button>

      {result && (
        <p className={`text-sm ${result.startsWith("Success") ? "text-green-500" : "text-red-500"}`}>{result}</p>
      )}
    </div>
  )
}

