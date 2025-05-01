"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, Settings } from "lucide-react"
import { updateWeightPreferences } from "@/app/actions/weight-preferences"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface WeightPreferencesProps {
  preferences: {
    unit: "kg" | "lbs"
    goalWeight?: number
    goalDate?: string
  }
}

export default function WeightPreferences({ preferences }: WeightPreferencesProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [unit, setUnit] = useState<"kg" | "lbs">(preferences.unit || "kg")
  const [goalWeight, setGoalWeight] = useState<string>(preferences.goalWeight?.toString() || "")
  const [goalDate, setGoalDate] = useState<string>(
    preferences.goalDate ? format(new Date(preferences.goalDate), "yyyy-MM-dd") : "",
  )
  const { toast } = useToast()
  const today = format(new Date(), "yyyy-MM-dd")

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await updateWeightPreferences(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Weight preferences updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating weight preferences:", error)
      toast({
        title: "Error",
        description: "Failed to update weight preferences",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Weight Preferences
        </CardTitle>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Weight Unit</Label>
            <RadioGroup
              defaultValue={unit}
              onValueChange={(value) => setUnit(value as "kg" | "lbs")}
              name="unit"
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kg" id="kg" />
                <Label htmlFor="kg">Kilograms (kg)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lbs" id="lbs" />
                <Label htmlFor="lbs">Pounds (lbs)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalWeight">Weight Goal (optional)</Label>
            <Input
              id="goalWeight"
              name="goalWeight"
              type="number"
              step="0.1"
              min="0"
              placeholder={`Target weight in ${unit}`}
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalDate">Target Date (optional)</Label>
            <Input
              id="goalDate"
              name="goalDate"
              type="date"
              min={today}
              value={goalDate}
              onChange={(e) => setGoalDate(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
