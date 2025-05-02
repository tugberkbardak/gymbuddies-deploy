"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowRight, Scale, LineChart, BarChart3, Settings } from "lucide-react"
import Link from "next/link"
import { WeightProgressCard } from "./weight-progress-card"
import { WeightInsightsCard } from "./weight-insights-card"
import { WeightTrendVisualization } from "./weight-trend-visualization"
import { WeightGoalForm } from "./weight-goal-form"
import AddWeightForm from "./add-weight-form"
import WeightGraph from "./weight-graph"

interface WeightEntry {
  _id: string
  weight: number
  date: string
  notes?: string
}

interface WeightDashboardProps {
  entries: WeightEntry[]
  unit: string
  goalWeight?: number
  onSetGoal?: (goal: number) => Promise<void>
  showViewAllButton?: boolean
}

export function WeightDashboard({
  entries,
  unit,
  goalWeight,
  onSetGoal,
  showViewAllButton = false,
}: WeightDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [startWeight, setStartWeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (entries.length > 0) {
      // Find the oldest entry for start weight
      const oldestEntry = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

      setStartWeight(oldestEntry.weight)
    }
  }, [entries])

  const currentWeight =
    entries.length > 0
      ? [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].weight
      : undefined

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Weight Tracking</CardTitle>
          <CardDescription>Monitor and update your weight progress</CardDescription>
        </div>
        {showViewAllButton && (
          <Button asChild variant="outline" size="sm">
            <Link href="/profile/weight">
              View Full History
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 md:w-[400px]">
            <TabsTrigger value="overview" className="flex items-center">
              <Scale className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center">
              <LineChart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Trends</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weight Graph */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Weight History</h3>
                {entries.length > 0 ? (
                  <WeightGraph entries={entries} unit={unit} goalWeight={goalWeight} />
                ) : (
                  <div className="flex items-center justify-center h-[200px] bg-muted/30 rounded-md">
                    <p className="text-muted-foreground">No weight entries yet. Add your first entry!</p>
                  </div>
                )}

                {entries.length > 0 && currentWeight && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-4 rounded-md">
                      <p className="text-sm text-muted-foreground">Current Weight</p>
                      <p className="text-xl font-bold">
                        {currentWeight} {unit}
                      </p>
                    </div>

                    {entries.length > 1 && (
                      <div className="bg-muted/30 p-4 rounded-md">
                        <p className="text-sm text-muted-foreground">Change</p>
                        <p
                          className={`text-xl font-bold ${
                            entries[0].weight > entries[1].weight
                              ? "text-red-500"
                              : entries[0].weight < entries[1].weight
                                ? "text-green-500"
                                : ""
                          }`}
                        >
                          {(entries[0].weight - entries[1].weight).toFixed(1)} {unit}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Add Weight Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Add New Entry</h3>
                <AddWeightForm unit={unit} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WeightTrendVisualization entries={entries} unit={unit} />
              {currentWeight && startWeight && goalWeight && (
                <WeightProgressCard
                  currentWeight={currentWeight}
                  startWeight={startWeight}
                  goalWeight={goalWeight}
                  unit={unit}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <WeightInsightsCard entries={entries} unit={unit} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {onSetGoal && <WeightGoalForm currentGoal={goalWeight} unit={unit} onSetGoal={onSetGoal} />}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
