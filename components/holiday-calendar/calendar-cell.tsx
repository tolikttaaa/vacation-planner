"use client"

import type React from "react"

import type { DayInfo } from "@/lib/types"
import { computeCellRenderModel } from "@/lib/types"
import { useState, useCallback, useRef } from "react"
import { HolidayPieMarker } from "./holiday-pie-marker"
import { SmartTooltip } from "./smart-tooltip"

interface CalendarCellProps {
  dayInfo: DayInfo | undefined
  day: number
  isSelected?: boolean
  onSelect?: (dayInfo: DayInfo) => void
}

export function CalendarCell({ dayInfo, day, isSelected, onSelect }: CalendarCellProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const cellRef = useRef<HTMLTableCellElement>(null)

  const renderModel = computeCellRenderModel(dayInfo)

  const handleFocus = useCallback(() => setShowTooltip(true), [])
  const handleBlur = useCallback(() => setShowTooltip(false), [])
  const handleClick = useCallback(() => {
    if (dayInfo?.isValid && onSelect) {
      onSelect(dayInfo)
    }
  }, [dayInfo, onSelect])
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && dayInfo?.isValid && onSelect) {
        e.preventDefault()
        onSelect(dayInfo)
      }
    },
    [dayInfo, onSelect],
  )

  const squareCellStyle: React.CSSProperties = {
    padding: 0,
    position: "relative",
  }

  const squareInnerStyle: React.CSSProperties = {
    aspectRatio: "1 / 1",
    width: "100%",
    position: "relative",
  }

  if (renderModel.dayType === "INVALID") {
    return (
      <td className="text-center text-xs" style={squareCellStyle} aria-label={`Day ${day} - Invalid date`}>
        <div
          style={{
            ...squareInnerStyle,
            background: `repeating-linear-gradient(
              45deg,
              var(--invalid-bg-1),
              var(--invalid-bg-1) 2px,
              var(--invalid-bg-2) 2px,
              var(--invalid-bg-2) 6px
            )`,
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "var(--calendar-grid-line)",
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 32 32"
            preserveAspectRatio="none"
          >
            <line x1="4" y1="4" x2="28" y2="28" stroke="var(--invalid-cross)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="28" y1="4" x2="4" y2="28" stroke="var(--invalid-cross)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </td>
    )
  }

  const holidayLocations = dayInfo!.locations.filter((loc) => loc.isHoliday)

  const ariaLabel = (() => {
    let label = `${dayInfo!.dateISO}`
    if (renderModel.dayType === "WEEKEND") label += " - Weekend"
    if (renderModel.holidayCount > 0) {
      label += ` - ${renderModel.holidayCount} holiday${renderModel.holidayCount > 1 ? "s" : ""}`
    }
    return label
  })()

  // Working days always get cell-bg, weekends always get weekend-bg
  // Holiday indication is ONLY via the centered marker
  const cellBackground = renderModel.dayType === "WEEKEND" ? "var(--calendar-weekend-bg)" : "var(--calendar-cell-bg)"

  return (
    <td
      ref={cellRef}
      className="text-center text-xs cursor-pointer"
      style={squareCellStyle}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="gridcell"
      aria-label={ariaLabel}
      aria-selected={isSelected}
    >
      <div
        className={`transition-all ${isSelected ? "ring-2 ring-primary ring-inset" : ""}`}
        style={{
          ...squareInnerStyle,
          backgroundColor: cellBackground,
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "var(--calendar-grid-line)",
        }}
      >
        {renderModel.markerType !== "NONE" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <HolidayPieMarker holidays={holidayLocations} isWeekend={renderModel.markerSize === "WEEKEND"} />
          </div>
        )}
      </div>
      {showTooltip && <SmartTooltip dayInfo={dayInfo!} anchorRef={cellRef} />}
    </td>
  )
}
