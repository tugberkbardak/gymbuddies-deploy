"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, List } from "lucide-react"
import { deleteWeightEntry } from "@/app/actions/weight"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface WeightEntry {
  _id: string
  weight: number
  date: string
  notes?: string
}

interface WeightEntriesTableProps {
  entries: WeightEntry[]
  unit: "kg" | "lbs"
}

export default function WeightEntriesTable({ entries, unit }: WeightEntriesTableProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Convert kg to lbs if needed
  const convertWeight = (weight: number): number => {
    return unit === "lbs" ? weight * 2.20462 : weight
  }

  const handleDelete = async () => {
    if (!selectedEntryId) return

    setIsDeleting(true)
    try {
      const result = await deleteWeightEntry(selectedEntryId)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Weight entry deleted successfully",
        })
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting weight entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete weight entry",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setSelectedEntryId(null)
    }
  }

  if (entries.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5 text-primary" />
          Weight History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Weight ({unit})</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry._id}>
                  <TableCell>{format(new Date(entry.date), "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium">{convertWeight(entry.weight).toFixed(1)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{entry.notes || "-"}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedEntryId(entry._id)}
                          className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this weight entry.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
