"use client"

import { EUROPEAN_LOCATIONS } from "@/lib/european-locations"
import { PANEL_STYLES } from "./constants"
import { CustomCalendarManager } from "./custom-calendar-manager"
import { LocationSelector } from "./location-selector"
import { YearSelector } from "./year-selector"

interface ControlsPanelProps {
  year: number
  onYearChange: (year: number) => void
  selectedLocationIds: string[]
  onSelectionChange: (ids: string[]) => void
  enabledCustomCalendarIds: string[]
  onEnabledCustomCalendarsChange: (ids: string[]) => void
  onCalendarsChange: () => void
  colorMap: Map<string, string>
}

// Controls panel for app-level filters and settings.
export function ControlsPanel({
  year,
  onYearChange,
  selectedLocationIds,
  onSelectionChange,
  enabledCustomCalendarIds,
  onEnabledCustomCalendarsChange,
  onCalendarsChange,
  colorMap,
}: ControlsPanelProps) {
  return (
    <div className={`${PANEL_STYLES.container} p-4 md:p-6 relative`}>
      <div className="absolute top-4 right-4">
        <YearSelector year={year} onYearChange={onYearChange} />
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Official Calendars</h3>
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
