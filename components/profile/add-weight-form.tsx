"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Scale } from "lucide-react"
import { addWeightEntry } from "@/app/actions/weight"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface AddWeightFormProps {
  unit: "kg" | "lbs"
}

export default function AddWeightForm({ unit }: AddWeightFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const today = format(new Date(), "yyyy-MM-dd")

  // Convert lbs to kg if needed
  const convertWeight = (weight: number): number => {
    return unit === "lbs" ? weight / 2.20462 : weight
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      // Get the weight value and convert if necessary
      const weightValue = Number(formData.get("weight"))

      // Create a new FormData object with the converted weight
      const convertedFormData = new FormData()
      convertedFormData.append("weight", convertWeight(weightValue).toString())
      convertedFormData.append("date", formData.get("date") as string)
      convertedFormData.append("notes", formData.get("notes") as string)

      const result = await addWeightEntry(convertedFormData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Weight entry added successfully",
        })
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding weight entry:", error)
      toast({
        title: "Error",
        description: "Failed to add weight entry",
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
          <Scale className="h-5 w-5 text-primary" />
          Add Weight Entry
        </CardTitle>
        <CardDescription>Track your weight progress by adding weekly entries</CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="weight" className="text-sm font-medium">
                Weight ({unit})
              </label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                min="0"
                placeholder={`Enter your weight in ${unit}`}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Date
              </label>
              <Input id="date" name="date" type="date" max={today} defaultValue={today} />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </label>
            <Textarea id="notes" name="notes" placeholder="Any notes about this weight entry" rows={3} />
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
              "Add Entry"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
