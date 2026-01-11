"use client"

import { X } from "lucide-react"
import type { DayInfo, DayLocationInfo, PersonProfile } from "@/lib/types"
import { getContrastTextColor } from "@/lib/color-manager"

interface DayDetailPanelProps {
  dayInfo: DayInfo | null
  restingPeople: PersonProfile[]
  onClose: () => void
}

export function DayDetailPanel({ dayInfo, restingPeople, onClose }: DayDetailPanelProps) {
  if (!dayInfo) return null

  // Split holidays from ordinary location info for the detail view.
  const holidayLocations = dayInfo.locations.filter((loc) => loc.isHoliday)
  const hasRestingPeople = restingPeople.length > 0
  const weekdayName = dayInfo.date.toLocaleDateString("en-US", { weekday: "long" })
  const dateHeader = `${dayInfo.dateISO} (${weekdayName})`

  return (
    <div
      className="rounded-lg shadow-lg mt-4 overflow-hidden"
      style={{
        backgroundColor: "var(--panel-bg)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "var(--panel-border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          backgroundColor: "var(--panel-header-bg)",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "var(--panel-divider)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--panel-accent-dot)" }} />
          <h3 className="font-semibold" style={{ color: "var(--panel-text)" }}>
            {dateHeader}
          </h3>
          {dayInfo.isGlobalWeekend && (
            <span
              className="px-2 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: "var(--panel-weekend-badge-bg)",
                color: "var(--panel-weekend-badge-text)",
              }}
            >
              Weekend
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full transition-colors"
          style={{ color: "var(--panel-text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--panel-close-hover)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
          }}
          aria-label="Close detail panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-64 overflow-y-auto space-y-4">
        {hasRestingPeople && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--panel-text-muted)" }}>
              People on vacation
            </p>
            <div className="flex flex-wrap gap-2">
              {restingPeople.map((person) => (
                <span
                  key={person.id}
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: "var(--panel-item-bg)", color: "var(--panel-text)" }}
                >
                  {person.name || "Unnamed"}
                </span>
              ))}
            </div>
          </div>
        )}
        {holidayLocations.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--panel-text-muted)" }}>
            {dayInfo.isGlobalWeekend ? "Weekend day with no special holidays." : "Regular working day."}
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--panel-text-muted)" }}>
              {holidayLocations.length} Holiday{holidayLocations.length !== 1 ? "s" : ""}
            </p>
            {holidayLocations.map((loc, idx) => (
              <HolidayDetailRow key={loc.locationId + idx} loc={loc} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function HolidayDetailRow({ loc }: { loc: DayLocationInfo }) {
  // Pick a readable text color against the location badge.
  const textColor = getContrastTextColor(loc.color)

  // Friendly label for the holiday type.
  const typeLabel = (() => {
    switch (loc.holidayType) {
      case "PUBLIC_HOLIDAY":
        return "Public Holiday"
      case "OBSERVANCE":
        return "Observance"
      case "COMPANY_HOLIDAY":
        return "Company Holiday"
      default:
        return "Holiday"
    }
  })()

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: "var(--panel-item-bg)" }}>
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
        style={{
          backgroundColor: loc.color,
          color: textColor,
        }}
      >
        {loc.locationName.split(" — ").pop()?.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium" style={{ color: "var(--panel-text)" }}>
            {loc.holidayName}
          </span>
          {loc.halfDay && (
            <span
              className="px-1.5 py-0.5 text-[10px] rounded"
              style={{
                backgroundColor: "var(--panel-halfday-bg)",
                color: "var(--panel-halfday-text)",
              }}
            >
              Half Day
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: "var(--panel-text-muted)" }}>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{
              backgroundColor: loc.color,
              color: textColor,
            }}
          >
            {loc.locationName.split(" — ").pop()}
          </span>
          <span style={{ color: "var(--panel-divider)" }}>|</span>
          <span>{typeLabel}</span>
          <span style={{ color: "var(--panel-divider)" }}>|</span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] capitalize"
            style={{
              backgroundColor: "var(--panel-badge-bg)",
              color: "var(--panel-badge-text)",
            }}
          >
            {loc.source}
          </span>
        </div>
        {loc.notes && (
          <p className="text-xs mt-1 italic" style={{ color: "var(--panel-text-muted)" }}>
            {loc.notes}
          </p>
        )}
      </div>
    </div>
  )
}
