import { Suspense, use } from "react"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, TrendingDown, TrendingUp, Scale, BarChart3, LineChart } from "lucide-react"
import Link from "next/link"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import WeightEntry from "@/models/WeightEntry"
import WeightGraph from "@/components/profile/weight-graph"
import AddWeightForm from "@/components/profile/add-weight-form"
import WeightEntriesTable from "@/components/profile/weight-entries-table"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import WeeklyAverageChart from "@/components/profile/weekly-average-chart"

interface WeightEntry {
  _id: string
  weight: number
  date: string
  notes?: string
}

interface WeightStats {
  currentWeight: number
  lowestWeight: number
  highestWeight: number
  averageWeight: number
  totalChange: number
  changePerWeek: number
  change30Days: number | null
  totalDays: number
  unit: string
}

// Helper function to calculate statistics
function calculateStats(entries: WeightEntry[], unit = "kg"): WeightStats | null {
  if (!entries || entries.length === 0) return null

  // Sort entries by date (newest first for stats)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Calculate statistics
  const weights = sortedEntries.map((entry) => entry.weight)
  const currentWeight = weights[0]
  const lowestWeight = Math.min(...weights)
  const highestWeight = Math.max(...weights)
  const averageWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length

  // Calculate change over time
  const firstEntry = sortedEntries[sortedEntries.length - 1]
  const lastEntry = sortedEntries[0]
  const totalChange = lastEntry.weight - firstEntry.weight
  const totalDays = Math.max(
    1,
    Math.round((new Date(lastEntry.date).getTime() - new Date(firstEntry.date).getTime()) / (1000 * 60 * 60 * 24)),
  )
  const changePerWeek = (totalChange / totalDays) * 7

  // Calculate 30-day change if possible
  let change30Days = null
  if (sortedEntries.length > 1) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Find the entry closest to 30 days ago
    const entryThirtyDaysAgo =
      sortedEntries.find((entry) => new Date(entry.date) <= thirtyDaysAgo) || sortedEntries[sortedEntries.length - 1]
    change30Days = currentWeight - entryThirtyDaysAgo.weight
  }

  return {
    currentWeight,
    lowestWeight,
    highestWeight,
    averageWeight,
    totalChange,
    changePerWeek,
    change30Days,
    totalDays,
    unit,
  }
}

// Helper function to group entries by week
function groupEntriesByWeek(entries: WeightEntry[]) {
  if (!entries || entries.length === 0) return []

  interface WeeklyData {
    [key: string]: {
      week: string
      weights: number[]
      count: number
    }
  }

  const weeklyData: WeeklyData = {}

  entries.forEach((entry) => {
    const date = new Date(entry.date)
    // Get the week start date (Sunday)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split("T")[0]

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        week: weekKey,
        weights: [],
        count: 0,
      }
    }

    weeklyData[weekKey].weights.push(entry.weight)
    weeklyData[weekKey].count++
  })

  // Calculate averages and format for chart
  return Object.values(weeklyData)
    .map((week) => ({
      week: week.week,
      average: week.weights.reduce((sum: number, weight: number) => sum + weight, 0) / week.weights.length,
      count: week.count,
    }))
    .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
}

async function getWeightData() {
  const user = await currentUser()
  if (!user) {
    redirect("/sign-in")
  }

  await dbConnect()
  const dbUser = await User.findOne({ clerkId: user.id })

  if (!dbUser) {
    redirect("/onboarding")
  }

  // Get all weight entries for the user, sorted by date
  const weightEntries = await WeightEntry.find({ user: dbUser._id }).sort({ date: 1 })

  // Convert Mongoose documents to plain objects
  const weightEntriesPlain = weightEntries.map((entry) => {
    const plainEntry = entry.toObject ? entry.toObject() : entry
    return {
      _id: plainEntry._id.toString(),
      weight: plainEntry.weight,
      date: plainEntry.date.toISOString(),
      notes: plainEntry.notes,
    }
  })

  // Get weight preferences
  const weightPreferences = dbUser.weightPreferences || { unit: "kg" }

  return { user: dbUser, weightEntries: weightEntriesPlain, weightPreferences }
}

function WeightContent() {
  const { user, weightEntries, weightPreferences } = use(getWeightData())

  // Calculate statistics
  const stats = calculateStats(weightEntries, weightPreferences.unit)

  // Group entries by week for the weekly chart
  const weeklyData = groupEntriesByWeek(weightEntries)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Profile</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Weight Tracking</h1>
        </div>
      </div>

      {weightEntries.length > 0 && stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary" />
                  Current Weight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stats.currentWeight} {stats.unit}
                </p>
                <p className="text-xs text-muted-foreground">Last recorded weight</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  30-Day Change
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold ${stats.change30Days && stats.change30Days > 0 ? "text-[#20B2AA]" : stats.change30Days && stats.change30Days < 0 ? "text-[#40E0D0]" : ""}`}
                >
                  {stats.change30Days !== null
                    ? `${stats.change30Days > 0 ? "+" : ""}${stats.change30Days.toFixed(1)} ${stats.unit}`
                    : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">Change in last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {stats.changePerWeek > 0 ? (
                    <TrendingUp className="h-4 w-4 text-[#20B2AA]" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-[#40E0D0]" />
                  )}
                  Weekly Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold ${stats.changePerWeek > 0 ? "text-[#20B2AA]" : stats.changePerWeek < 0 ? "text-[#40E0D0]" : ""}`}
                >
                  {`${stats.changePerWeek > 0 ? "+" : ""}${stats.changePerWeek.toFixed(1)} ${stats.unit}`}
                </p>
                <p className="text-xs text-muted-foreground">Average change per week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Weight Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stats.lowestWeight} - {stats.highestWeight} {stats.unit}
                </p>
                <p className="text-xs text-muted-foreground">Min-max recorded weight</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different visualizations */}
          <Tabs defaultValue="history">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="history">
                <LineChart className="h-4 w-4 mr-2" />
                Weight History
              </TabsTrigger>
              <TabsTrigger value="weekly">
                <BarChart3 className="h-4 w-4 mr-2" />
                Weekly Averages
              </TabsTrigger>
              <TabsTrigger value="table">
                <Calendar className="h-4 w-4 mr-2" />
                All Entries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Weight History</CardTitle>
                  <CardDescription>Your weight over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <WeightGraph
                    entries={weightEntries}
                    unit={weightPreferences.unit || "kg"}
                    goalWeight={weightPreferences.goalWeight}
                    showTrendline={true}
                    height={350}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weekly" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Averages</CardTitle>
                  <CardDescription>Your average weight by week</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {/* Weekly Average Chart Component */}
                  <div className="h-[350px] flex items-center justify-center">
                    {weeklyData.length > 0 ? (
                      <WeeklyAverageChart data={weeklyData} unit={weightPreferences.unit || "kg"} />
                    ) : (
                      <p className="text-muted-foreground">Not enough data to show weekly averages</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="table">
              <Card>
                <CardHeader>
                  <CardTitle>All Weight Entries</CardTitle>
                  <CardDescription>Complete history of your weight entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <WeightEntriesTable entries={weightEntries} unit={weightPreferences.unit || "kg"} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add Weight Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Weight Entry</CardTitle>
              <CardDescription>Record your current weight</CardDescription>
            </CardHeader>
            <CardContent>
              <AddWeightForm unit={weightPreferences.unit || "kg"} />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Weight Entries Yet</CardTitle>
            <CardDescription>Start tracking your weight to see visualizations and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <AddWeightForm unit={weightPreferences.unit || "kg"} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function WeightPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />

      <div className="container mx-auto py-8">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
              </div>
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          }
        >
          <WeightContent />
        </Suspense>
      </div>
    </div>
  )
}
