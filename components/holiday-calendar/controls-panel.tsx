"use client"

import { EUROPEAN_LOCATIONS } from "@/lib/european-locations"
import { CalendarDays } from "lucide-react"
import { LocationSelector } from "./location-selector"
import type { CustomCalendar } from "@/lib/types"
import { PANEL_STYLES } from "./constants"
import { CustomCalendarManager } from "./custom-calendar-manager"
import { YearSelector } from "./year-selector"

interface ControlsPanelProps {
  year: number
  onYearChange: (year: number) => void
  selectedLocationIds: string[]
  onSelectionChange: (ids: string[]) => void
  enabledCustomCalendarIds: string[]
  onEnabledCustomCalendarsChange: (ids: string[]) => void
  colorMap: Map<string, string>
  customCalendars: CustomCalendar[]
  onCalendarsChange: () => void
}

// Controls panel for app-level filters and settings.
export function ControlsPanel({
  year,
  onYearChange,
  selectedLocationIds,
  onSelectionChange,
  enabledCustomCalendarIds,
  onEnabledCustomCalendarsChange,
  colorMap,
  customCalendars,
  onCalendarsChange,
}: ControlsPanelProps) {
  return (
    <div className={`${PANEL_STYLES.container} p-4 md:p-6 relative`}>
      <div className="absolute top-4 right-4">
        <YearSelector year={year} onYearChange={onYearChange} />
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-5 h-5 text-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Holiday calendars</h3>
          </div>
          <h4 className="text-sm font-medium text-foreground mb-2">Official Calendars</h4>
          <LocationSelector
            locations={EUROPEAN_LOCATIONS}
            selectedIds={selectedLocationIds}
            onSelectionChange={onSelectionChange}
            colorMap={colorMap}
          />
        </div>

        <CustomCalendarManager
          enabledCalendarIds={enabledCustomCalendarIds}
          onEnabledChange={onEnabledCustomCalendarsChange}
          onCalendarsChange={onCalendarsChange}
          colorMap={colorMap}
          year={year}
        />
      </div>
    </div>
  )
}
