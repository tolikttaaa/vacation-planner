"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, TrendingDown, TrendingUp, Calendar } from "lucide-react"
import type { VacationSummary, VacationLocationSummary, VacationInterval } from "@/lib/vacation-manager"
import { getContrastTextColor } from "@/lib/color-manager"

interface VacationResultsPanelProps {
  summary: VacationSummary
  compact?: boolean
  forceExpanded?: boolean
}

export function VacationResultsPanel({ summary, compact = false, forceExpanded = false }: VacationResultsPanelProps) {
  // Track which location row is expanded to show interval details.
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null)

  if (summary.totalPlannedDates === 0) {
    return null
  }

  const toggleExpanded = (locationId: string) => {
    setExpandedLocation((prev) => (prev === locationId ? null : locationId))
  }

  // Format the interval header text for display.
  const formatIntervalRange = (interval: VacationInterval): string => {
    if (interval.startISO === interval.endISO) {
      const weekday = new Date(interval.startISO).toLocaleDateString("en-US", { weekday: "short" })
      return `${interval.startISO} (${weekday})`
    }
    return `${interval.startISO} → ${interval.endISO}`
  }

  const listContent = (
    <div className="divide-y" style={{ borderColor: "var(--panel-divider)" }}>
      {summary.intervalsByLocation.map((locSummary) => (
        <LocationIntervalRow
          key={locSummary.locationId}
          locSummary={locSummary}
          isExpanded={forceExpanded ? true : expandedLocation === locSummary.locationId}
          onToggleExpand={forceExpanded ? undefined : () => toggleExpanded(locSummary.locationId)}
          formatIntervalRange={formatIntervalRange}
          compact={compact}
          forceExpanded={forceExpanded}
          hideRowStats={forceExpanded}
          hideHeader={forceExpanded}
        />
      ))}
    </div>
  )

  if (compact) {
    return listContent
  }

  return (
    <div
      className="rounded-lg shadow-lg overflow-hidden"
      style={{
        backgroundColor: "var(--panel-bg)",
        border: "1px solid var(--panel-border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          backgroundColor: "var(--panel-header-bg)",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "var(--panel-divider)",
        }}
      >
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--panel-accent-dot)" }} />
        <h3 className="font-semibold" style={{ color: "var(--panel-text)" }}>
          Vacation Requirements
        </h3>
      </div>

      {/* Summary cards */}
      <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--panel-item-bg)" }}>
          <div className="text-xs mb-1" style={{ color: "var(--panel-text-muted)" }}>
            Total Planned Days
          </div>
          <div className="text-2xl font-bold" style={{ color: "var(--panel-text)" }}>
            {summary.totalPlannedDates}
          </div>
        </div>

        <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--panel-item-bg)" }}>
          <div className="text-xs mb-1 flex items-center gap-1" style={{ color: "var(--panel-text-muted)" }}>
            <TrendingDown className="w-3 h-3" />
            Minimum Required
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.minRequired.count}</div>
          <div className="text-xs truncate" style={{ color: "var(--panel-text-muted)" }}>
            {summary.minRequired.locations.slice(0, 2).join(", ")}
            {summary.minRequired.locations.length > 2 && ` +${summary.minRequired.locations.length - 2}`}
          </div>
        </div>

        <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--panel-item-bg)" }}>
          <div className="text-xs mb-1 flex items-center gap-1" style={{ color: "var(--panel-text-muted)" }}>
            <TrendingUp className="w-3 h-3" />
            Maximum Required
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.maxRequired.count}</div>
          <div className="text-xs truncate" style={{ color: "var(--panel-text-muted)" }}>
            {summary.maxRequired.locations.slice(0, 2).join(", ")}
            {summary.maxRequired.locations.length > 2 && ` +${summary.maxRequired.locations.length - 2}`}
          </div>
        </div>
      </div>

      {listContent}
    </div>
  )
}

interface LocationIntervalRowProps {
  locSummary: VacationLocationSummary
  isExpanded: boolean
  onToggleExpand?: () => void
  formatIntervalRange: (interval: VacationInterval) => string
  compact?: boolean
  forceExpanded?: boolean
  hideRowStats?: boolean
  hideHeader?: boolean
}

function LocationIntervalRow({
  locSummary,
  isExpanded,
  onToggleExpand,
  formatIntervalRange,
  compact = false,
  forceExpanded = false,
  hideRowStats = false,
  hideHeader = false,
}: LocationIntervalRowProps) {
  // Use high-contrast label color for the location pill.
  const textColor = getContrastTextColor(locSummary.color)
  const hasIntervals = locSummary.intervals.length > 0

  if (hideHeader) {
    if (!isExpanded || !hasIntervals) return null
    return (
      <div className="px-4 pb-4 pt-8" style={{ backgroundColor: "var(--panel-item-bg)" }}>
        <div className="space-y-3">
          {locSummary.intervals.map((interval, idx) => (
            <IntervalCard key={idx} interval={interval} formatIntervalRange={formatIntervalRange} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Location header row */}
      <div
        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
          hasIntervals ? "hover:bg-muted/30" : ""
        }`}
        onClick={hasIntervals ? onToggleExpand : undefined}
        style={{ backgroundColor: compact ? "var(--panel-item-bg)" : isExpanded ? "var(--panel-item-bg)" : undefined }}
      >
        <div className="flex items-center gap-3">
          {hasIntervals && (
            <span className="text-muted-foreground">
              {isExpanded || forceExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          )}
          <span
            className="px-2.5 py-1 rounded text-sm font-medium"
            style={{ backgroundColor: locSummary.color, color: textColor }}
          >
            {locSummary.locationName}
          </span>
        </div>

        {!hideRowStats && (
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-xs" style={{ color: "var(--panel-text-muted)" }}>
                Planned
              </div>
              <div className="font-medium" style={{ color: "var(--panel-text)" }}>
                {locSummary.totalPlanned}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs" style={{ color: "var(--panel-text-muted)" }}>
                Excluded
              </div>
              <div className="font-medium" style={{ color: "var(--panel-text-muted)" }}>
                -{locSummary.totalExcluded}
              </div>
            </div>
            <div className="text-center min-w-16">
              <div className="text-xs" style={{ color: "var(--panel-text-muted)" }}>
                Required
              </div>
              <div className="font-bold text-lg" style={{ color: "var(--panel-text)" }}>
                {locSummary.totalRequired}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded interval details */}
      {isExpanded && hasIntervals && (
        <div className="px-4 pb-4" style={{ backgroundColor: "var(--panel-item-bg)" }}>
          <div className="space-y-3">
            {locSummary.intervals.map((interval, idx) => (
              <IntervalCard key={idx} interval={interval} formatIntervalRange={formatIntervalRange} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface IntervalCardProps {
  interval: VacationInterval
  formatIntervalRange: (interval: VacationInterval) => string
}

function IntervalCard({ interval, formatIntervalRange }: IntervalCardProps) {
  // Render a single vacation interval and its excluded days.
  return (
    <div
      className="rounded-lg p-3"
      style={{ backgroundColor: "var(--panel-bg)", border: "1px solid var(--panel-divider)" }}
    >
      {/* Interval header with date range */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: "var(--panel-text-muted)" }} />
          <span className="font-medium text-sm" style={{ color: "var(--panel-text)" }}>
            {formatIntervalRange(interval)}
          </span>
          <span
            className="px-1.5 py-0.5 rounded text-xs"
            style={{ backgroundColor: "var(--panel-badge-bg)", color: "var(--panel-badge-text)" }}
          >
            {interval.totalDays} day{interval.totalDays !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-green-600 dark:text-green-400">{interval.requiredDays}</span>
          <span style={{ color: "var(--panel-text-muted)" }}>vacation days required</span>
        </div>

        {(interval.excludedWeekends > 0 || interval.excludedHolidays > 0) && (
          <>
            <span style={{ color: "var(--panel-text-muted)" }}>•</span>
            <div className="flex items-center gap-2">
              <span style={{ color: "var(--panel-text-muted)" }}>Excluded:</span>
              {interval.excludedWeekends > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {interval.excludedWeekends} weekend{interval.excludedWeekends !== 1 ? "s" : ""}
                </span>
              )}
              {interval.excludedHolidays > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  {interval.excludedHolidays} holiday{interval.excludedHolidays !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Excluded details (if any holidays) */}
      {interval.excludedDetails.filter((d) => d.status === "holiday").length > 0 && (
        <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--panel-divider)" }}>
          <div className="text-xs" style={{ color: "var(--panel-text-muted)" }}>
            Holidays in this period:
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {interval.excludedDetails
              .filter((d) => d.status === "holiday")
              .map((detail, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded text-xs bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                >
                  {detail.dateISO.split("-").slice(1).join("/")} - {detail.reason}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
