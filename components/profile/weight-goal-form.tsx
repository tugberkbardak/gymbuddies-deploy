"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface WeightGoalFormProps {
  currentGoal?: number
  unit: string
  onSetGoal: (goal: number) => Promise<void>
}

export function WeightGoalForm({ currentGoal, unit, onSetGoal }: WeightGoalFormProps) {
  const [goal, setGoal] = useState<string>(currentGoal?.toString() || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!goal || isNaN(Number(goal))) {
      toast({
        title: "Invalid goal weight",
        description: "Please enter a valid number",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSetGoal(Number(goal))
      toast({
        title: "Goal weight updated",
        description: `Your goal weight has been set to ${goal} ${unit}`,
      })
    } catch (error) {
      toast({
        title: "Failed to update goal weight",
        description: "An error occurred while updating your goal weight",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center">
          <Target className="h-4 w-4 mr-2 text-primary" />
          Set Weight Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-weight">Goal Weight ({unit})</Label>
            <div className="flex space-x-2">
              <Input
                id="goal-weight"
                type="number"
                step="0.1"
                placeholder={`Enter your goal weight in ${unit}`}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Goal"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Setting a goal helps you track your progress and stay motivated
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
