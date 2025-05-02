"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, TrendingDown, TrendingUp, Target } from "lucide-react"
import { useState, useEffect } from "react"

interface WeightProgressCardProps {
  currentWeight: number
  startWeight?: number
  goalWeight?: number
  unit: string
}

export function WeightProgressCard({ currentWeight, startWeight, goalWeight, unit }: WeightProgressCardProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (startWeight && goalWeight) {
      // Calculate progress percentage
      const totalChange = Math.abs(goalWeight - startWeight)
      const currentChange = Math.abs(currentWeight - startWeight)
      const calculatedProgress = Math.min(Math.round((currentChange / totalChange) * 100), 100)

      // Animate progress
      let animationProgress = 0
      const interval = setInterval(() => {
        animationProgress += 2
        setProgress(Math.min(animationProgress, calculatedProgress))
        if (animationProgress >= calculatedProgress) {
          clearInterval(interval)
        }
      }, 20)

      return () => clearInterval(interval)
    }
  }, [currentWeight, startWeight, goalWeight])

  // Determine if losing or gaining weight is the goal
  const isLosingGoal = startWeight && goalWeight ? startWeight > goalWeight : false
  const isOnTrack =
    startWeight && goalWeight ? (isLosingGoal ? currentWeight <= startWeight : currentWeight >= startWeight) : true

  // Calculate remaining
  const remaining = goalWeight ? Math.abs(currentWeight - goalWeight).toFixed(1) : null

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium">Weight Goal Progress</h3>
          </div>
          {isOnTrack ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <TrendingDown className={`h-3 w-3 mr-1 ${isLosingGoal ? "" : "rotate-180"}`} />
              On Track
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <TrendingUp className={`h-3 w-3 mr-1 ${isLosingGoal ? "" : "rotate-180"}`} />
              Off Track
            </span>
          )}
        </div>

        {goalWeight ? (
          <>
            <div className="mb-2 flex justify-between text-sm">
              <span>
                Current: {currentWeight} {unit}
              </span>
              <span>
                Goal: {goalWeight} {unit}
              </span>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
            <div className="flex items-center justify-center mt-4 text-center">
              <div className="bg-primary/10 p-3 rounded-full mr-3">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-xl font-bold">
                  {remaining} {unit}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-24 text-center">
            <p className="text-muted-foreground">Set a weight goal to track your progress</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
