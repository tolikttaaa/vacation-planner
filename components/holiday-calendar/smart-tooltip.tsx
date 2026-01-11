"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { DayInfo, DayLocationInfo } from "@/lib/types"
import { getContrastTextColor } from "@/lib/color-manager"

interface SmartTooltipProps {
  dayInfo: DayInfo
  anchorRef: React.RefObject<HTMLElement | null>
  maxHolidaysToShow?: number
  isVacationSelected?: boolean
}

export function SmartTooltip({
  dayInfo,
  anchorRef,
  maxHolidaysToShow = 4,
  isVacationSelected = false,
}: SmartTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [placement, setPlacement] = useState<"top" | "bottom">("top")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Delay tooltip rendering until after mount to avoid hydration mismatch.
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  // Measure anchor/tooltip to position within the viewport.
  useEffect(() => {
    if (!anchorRef.current || !tooltipRef.current || !mounted) return

    const anchor = anchorRef.current.getBoundingClientRect()
    const tooltip = tooltipRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // Determine vertical placement.
    const spaceAbove = anchor.top
    const spaceBelow = viewportHeight - anchor.bottom

    let top: number
    let newPlacement: "top" | "bottom"

    if (spaceAbove >= tooltip.height + 8) {
      top = anchor.top - tooltip.height - 8 + window.scrollY
      newPlacement = "top"
    } else if (spaceBelow >= tooltip.height + 8) {
      top = anchor.bottom + 8 + window.scrollY
      newPlacement = "bottom"
    } else {
      top = Math.max(8, anchor.top - tooltip.height - 8) + window.scrollY
      newPlacement = "top"
    }

    // Horizontal centering with viewport constraints.
    let left = anchor.left + anchor.width / 2 - tooltip.width / 2 + window.scrollX
    left = Math.max(8, Math.min(left, viewportWidth - tooltip.width - 8 + window.scrollX))

    setPosition({ top, left })
    setPlacement(newPlacement)
  }, [anchorRef, mounted])

  if (!mounted) return null

  const holidayLocations = dayInfo.locations.filter((loc) => loc.isHoliday)
  const weekdayName = dayInfo.date.toLocaleDateString("en-US", { weekday: "long" })
  const dateHeader = `${dayInfo.dateISO} (${weekdayName})`

  const visibleHolidays = holidayLocations.slice(0, maxHolidaysToShow)
  const hiddenCount = holidayLocations.length - visibleHolidays.length

  return createPortal(
    <div
      ref={tooltipRef}
      className="fixed z-[9999] w-64 p-3 text-xs rounded-lg pointer-events-none"
      style={{
        top: position.top,
        left: position.left,
        backgroundColor: "var(--tooltip-bg)",
        color: "var(--tooltip-text)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "var(--tooltip-border)",
        boxShadow: "var(--tooltip-shadow)",
      }}
    >
      <div className="font-semibold mb-2">{dateHeader}</div>

      {isVacationSelected && (
        <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: "1px solid var(--tooltip-border)" }}>
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-primary font-medium">Vacation Planned</span>
        </div>
      )}

      {dayInfo.isGlobalWeekend && (
        <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: "1px solid var(--tooltip-border)" }}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--calendar-weekend-bg)" }} />
          <span className="text-muted-foreground">Weekend</span>
        </div>
      )}

      {holidayLocations.length === 0 && !dayInfo.isGlobalWeekend && !isVacationSelected ? (
        <p className="text-muted-foreground">Regular working day</p>
      ) : (
        <>
          {visibleHolidays.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Holidays:</p>
              {visibleHolidays.map((loc, idx) => (
                <HolidayItem key={loc.locationId + idx} loc={loc} />
              ))}
              {hiddenCount > 0 && (
                <p className="text-muted-foreground text-[10px] italic mt-1">
                  and {hiddenCount} other{hiddenCount > 1 ? "s" : ""}... (click to see all)
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Arrow indicator */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 ${
          placement === "top" ? "bottom-0 translate-y-full" : "top-0 -translate-y-full"
        }`}
      >
        <div
          className="border-8 border-transparent"
          style={{
            borderTopColor: placement === "top" ? "var(--tooltip-bg)" : "transparent",
            borderBottomColor: placement === "bottom" ? "var(--tooltip-bg)" : "transparent",
          }}
        />
      </div>
    </div>,
    document.body,
  )
}

function HolidayItem({ loc }: { loc: DayLocationInfo }) {
  // Pick a readable text color for the location pill.
  const textColor = getContrastTextColor(loc.color)

  return (
    <div className="flex items-start gap-2">
      <span
        className="px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
        style={{
          backgroundColor: loc.color,
          color: textColor,
        }}
      >
        {loc.locationName.split(" — ").pop()}
      </span>
      <div className="flex-1">
        <span>{loc.holidayName}</span>
        {loc.halfDay && <span className="text-yellow-600 dark:text-yellow-400 ml-1">(Half day)</span>}
      </div>
    </div>
  )
}
