"use client"

import { Palmtree, MousePointer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VacationModeToggleProps {
  isVacationMode: boolean
  onToggle: () => void
  vacationCount: number
}

export function VacationModeToggle({ isVacationMode, onToggle, vacationCount }: VacationModeToggleProps) {
  return (
    <Button
      variant={isVacationMode ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className="gap-2"
      title={isVacationMode ? "Exit vacation selection mode" : "Enter vacation selection mode"}
    >
      {isVacationMode ? (
        <>
          <MousePointer className="w-4 h-4" />
          <span>Exit Selection</span>
        </>
      ) : (
        <>
          <Palmtree className="w-4 h-4" />
          <span>Plan Vacation</span>
        </>
      )}
      {vacationCount > 0 && (
        <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary-foreground/20">{vacationCount}</span>
      )}
    </Button>
  )
}
