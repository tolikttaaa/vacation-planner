"use client"

import type { LocationConfig, CustomCalendar } from "@/lib/types"
import { HolidayPieMarker } from "./holiday-pie-marker"
import { getContrastTextColor } from "@/lib/color-manager"

interface LegendProps {
  selectedLocations: LocationConfig[]
  customCalendars: CustomCalendar[]
}

export function Legend({ selectedLocations, customCalendars }: LegendProps) {
  // Create sample markers for the legend using dynamic colors.
  const sampleMarkers = selectedLocations.slice(0, 3).map((loc) => ({
    locationId: loc.id,
    locationName: loc.name,
    color: loc.color,
    isWeekend: false,
    isHoliday: true,
    source: "official" as const,
  }))
  const primaryColor = selectedLocations[0]?.color || customCalendars[0]?.meta.defaultColor || "#16a34a"
  const secondaryColor = selectedLocations[1]?.color || customCalendars[1]?.meta.defaultColor || "#0ea5e9"
  const multiHolidayDifferentCalendars = [
    {
      locationId: "legend-multi-diff-1",
      locationName: "Holiday calendar A",
      color: primaryColor,
      isWeekend: false,
      isHoliday: true,
      source: "official" as const,
    },
    {
      locationId: "legend-multi-diff-2",
      locationName: "Holiday calendar B",
      color: secondaryColor,
      isWeekend: false,
      isHoliday: true,
      source: "official" as const,
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium text-muted-foreground">Legend:</span>

      <div className="flex items-center gap-2 pr-4 border-r border-border">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: "var(--calendar-weekend-bg)" }}
          title="Weekend (Sat/Sun)"
        />
        <span className="text-xs text-muted-foreground">Weekend</span>
      </div>

      <div className="flex items-center gap-2 pr-4 border-r border-border">
        <div
          className="w-4 h-4 rounded-sm relative"
          style={{
            background: `repeating-linear-gradient(
              45deg,
              var(--invalid-bg-1),
              var(--invalid-bg-1) 1px,
              var(--invalid-bg-2) 1px,
              var(--invalid-bg-2) 3px
            )`,
          }}
          title="Invalid date (e.g., Feb 30)"
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 16 16">
            <line x1="2" y1="2" x2="14" y2="14" stroke="var(--invalid-cross)" strokeWidth="1" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="var(--invalid-cross)" strokeWidth="1" />
          </svg>
        </div>
        <span className="text-xs text-muted-foreground">Invalid date</span>
      </div>

      {selectedLocations.map((location) => {
        const textColor = getContrastTextColor(location.color)
        return (
          <div key={location.id} className="flex items-center gap-2">
            <div
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                backgroundColor: location.color,
                color: textColor,
              }}
              title={`${location.name} Holiday`}
            >
              {location.name.split(" — ").pop()?.slice(0, 3)}
            </div>
            <span className="text-xs text-muted-foreground">{location.name.split(" — ").pop()}</span>
          </div>
        )
      })}

      {customCalendars.map((calendar) => {
        const textColor = getContrastTextColor(calendar.meta.defaultColor)
        return (
          <div key={calendar.meta.id} className="flex items-center gap-2">
            <div
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                backgroundColor: calendar.meta.defaultColor,
                color: textColor,
              }}
              title={`${calendar.meta.name} Holiday`}
            >
              {calendar.meta.name.slice(0, 3)}
            </div>
            <span className="text-xs text-muted-foreground">{calendar.meta.name}</span>
          </div>
        )
      })}

      <div className="flex items-center gap-2">
        <HolidayPieMarker holidays={multiHolidayDifferentCalendars} isWeekend={false} />
        <span className="text-xs text-muted-foreground">Multiple holidays</span>
      </div>

      <div className="flex items-center gap-2 pl-4 border-l border-border">
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 rounded-sm" style={{ backgroundColor: "var(--calendar-weekend-bg)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Single holiday circle at weekend size */}
            <div
              className="rounded-full ring-1 ring-white/50"
              style={{
                width: "var(--marker-size-weekend)",
                height: "var(--marker-size-weekend)",
                backgroundColor: selectedLocations[0]?.color || "#16a34a",
              }}
            />
          </div>
        </div>
        <span className="text-xs text-muted-foreground">Weekend + Holiday</span>
      </div>

      <div className="flex items-center gap-2 pl-4 border-l border-border">
        <div
          className="relative w-4 h-4 rounded-sm"
          style={{ border: "2px solid var(--primary)" }}
          title="Vacation planned"
        >
          <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full text-primary" fill="currentColor">
            <path d="M9.2 16.2 4.9 11.9l1.4-1.4 2.9 2.9 7-7 1.4 1.4z" />
          </svg>
        </div>
        <span className="text-xs text-muted-foreground">Vacation planned</span>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ border: "2px dotted var(--calendar-vacation-stroke)" }}
          title="At least one person on vacation"
        />
        <span className="text-xs text-muted-foreground">People on vacation</span>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ border: "2px solid var(--calendar-selected-stroke)" }}
          title="Selected day"
        />
        <span className="text-xs text-muted-foreground">Selected day (details below)</span>
      </div>
    </div>
  )
}
