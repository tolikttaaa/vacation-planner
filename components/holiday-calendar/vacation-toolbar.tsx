"use client"

import { Trash2, Calendar, MousePointer2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VacationToolbarProps {
  vacationCount: number
  onClearAll: () => void
  isRangeSelecting: boolean
  rangeStart: string | null
}

export function VacationToolbar({ vacationCount, onClearAll, isRangeSelecting, rangeStart }: VacationToolbarProps) {
  // Provide inline guidance while vacation mode is active.
  return (
    <div
      className="flex flex-wrap items-center gap-3 p-3 rounded-lg mb-4"
      style={{
        backgroundColor: "var(--calendar-header-bg)",
        border: "1px solid var(--calendar-grid-line)",
      }}
    >
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium" style={{ color: "var(--calendar-header-text)" }}>
          Vacation Mode
        </span>
      </div>

      <div className="flex-1 text-sm" style={{ color: "var(--calendar-header-text)" }}>
        {isRangeSelecting && rangeStart ? (
          <span className="text-primary font-medium">Shift+click to complete range from {rangeStart}</span>
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1">
              <MousePointer2 className="w-3.5 h-3.5" />
              Drag to select multiple days
            </span>
            <span className="text-muted-foreground">|</span>
            <span>Click to toggle, Shift+click for range</span>
            <span className="text-muted-foreground">|</span>
            <span className="font-medium">
              {vacationCount} day{vacationCount !== 1 ? "s" : ""} selected
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          disabled={vacationCount === 0}
          className="gap-1.5 text-destructive hover:text-destructive bg-transparent"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </Button>
      </div>
    </div>
  )
}
