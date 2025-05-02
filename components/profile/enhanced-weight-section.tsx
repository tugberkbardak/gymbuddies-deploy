import { WeightDashboard } from "./weight-dashboard"
import { updateWeightGoal } from "@/app/actions/update-weight-goal"

interface WeightEntry {
  _id: string
  weight: number
  date: string
  notes?: string
}

interface EnhancedWeightSectionProps {
  entries: WeightEntry[]
  unit: string
  goalWeight?: number
}

export function EnhancedWeightSection({ entries, unit, goalWeight }: EnhancedWeightSectionProps) {
  return (
    <WeightDashboard
      entries={entries}
      unit={unit}
      goalWeight={goalWeight}
      onSetGoal={updateWeightGoal}
      showViewAllButton={true}
    />
  )
}
