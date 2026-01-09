"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { EUROPEAN_LOCATIONS, getLocationById } from "@/lib/european-locations"
import { getYearData } from "@/lib/holiday-service"
import { loadCustomCalendars } from "@/lib/custom-calendar-service"
import { assignColors } from "@/lib/color-manager"
import { useTheme } from "@/lib/theme-context"
import type { DayInfo, LocationConfig, CustomCalendar } from "@/lib/types"
import {
  loadVacationDates,
  toggleVacationDate,
  toggleVacationRange,
  clearVacationDates,
  computeVacationSummary,
  saveVacationDates,
} from "@/lib/vacation-manager"
import { LocationSelector } from "./location-selector"
import { YearSelector } from "./year-selector"
import { Legend } from "./legend"
import { CalendarGrid } from "./calendar-grid"
import { CustomCalendarManager } from "./custom-calendar-manager"
import { ThemeToggle } from "./theme-toggle"
import { VacationModeToggle } from "./vacation-mode-toggle"
import { VacationToolbar } from "./vacation-toolbar"
import { VacationResultsPanel } from "./vacation-results-panel"
import { VacationBackground } from "./vacation-background"
import { PngExportButton } from "./png-export-button"
import { Calendar } from "lucide-react"

const STORAGE_KEY = "holiday-planner-state"

const PANEL_STYLES = {
  container: "bg-card border border-border rounded-xl shadow-sm",
  maxWidth: "max-w-[1600px]",
  minWidth: "min-w-[1100px]",
}

interface StoredState {
  year: number
  selectedLocationIds: string[]
  enabledCustomCalendarIds: string[]
}

export function HolidayCalendar() {
  const { resolvedTheme } = useTheme()
  const [year, setYear] = useState(2026)
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([])
  const [enabledCustomCalendarIds, setEnabledCustomCalendarIds] = useState<string[]>([])
  const [customCalendars, setCustomCalendars] = useState<CustomCalendar[]>([])
  const [yearData, setYearData] = useState<Map<string, DayInfo>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const [isVacationMode, setIsVacationMode] = useState(false)
  const [vacationDates, setVacationDates] = useState<Set<string>>(new Set())
  const [rangeStart, setRangeStart] = useState<string | null>(null)

  const calendarGridRef = useRef<{ getGridElement: () => HTMLDivElement | null }>(null)

  const getCalendarGridElement = useCallback(() => {
    return calendarGridRef.current?.getGridElement() ?? null
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: StoredState = JSON.parse(stored)
        setYear(parsed.year)
        setSelectedLocationIds(parsed.selectedLocationIds)
        setEnabledCustomCalendarIds(parsed.enabledCustomCalendarIds || [])
      } else {
        setSelectedLocationIds(["cy", "de-by", "ru"])
      }
      setCustomCalendars(loadCustomCalendars())
    } catch {
      setSelectedLocationIds(["cy", "de-by", "ru"])
    }
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (isInitialized) {
      setVacationDates(loadVacationDates(year))
      setRangeStart(null)
    }
  }, [year, isInitialized])

  const handleCustomCalendarsChange = useCallback(() => {
    setCustomCalendars(loadCustomCalendars())
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    const state: StoredState = {
      year,
      selectedLocationIds,
      enabledCustomCalendarIds,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [year, selectedLocationIds, enabledCustomCalendarIds, isInitialized])

  const colorMap = useMemo(() => {
    const allIds = [...selectedLocationIds, ...enabledCustomCalendarIds]
    return assignColors(allIds, resolvedTheme)
  }, [selectedLocationIds, enabledCustomCalendarIds, resolvedTheme])

  const getColor = useCallback(
    (id: string) => {
      return colorMap.get(id) || "#888888"
    },
    [colorMap],
  )

  const selectedLocations = useMemo(() => {
    return selectedLocationIds
      .map((id) => {
        const loc = getLocationById(id)
        if (!loc) return undefined
        return { ...loc, color: getColor(id) }
      })
      .filter((loc): loc is LocationConfig => loc !== undefined)
  }, [selectedLocationIds, getColor])

  const enabledCalendars = useMemo(() => {
    return customCalendars
      .filter((c) => enabledCustomCalendarIds.includes(`custom-${c.meta.id}`))
      .map((c) => ({
        ...c,
        meta: {
          ...c.meta,
          defaultColor: getColor(`custom-${c.meta.id}`),
        },
      }))
  }, [customCalendars, enabledCustomCalendarIds, getColor])

  const fetchData = useCallback(async () => {
    if (!isInitialized) return

    if (selectedLocations.length === 0 && enabledCalendars.length === 0) {
      setYearData(new Map())
      return
    }

    setIsLoading(true)
    try {
      const data = await getYearData(year, selectedLocations, enabledCalendars)
      setYearData(data)
    } catch (error) {
      console.error("Failed to fetch holiday data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [year, selectedLocations, enabledCalendars, isInitialized])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleVacationModeToggle = useCallback(() => {
    setIsVacationMode((prev) => !prev)
    setRangeStart(null)
  }, [])

  const handleVacationToggle = useCallback(
    (dateISO: string) => {
      setVacationDates((prev) => toggleVacationDate(year, dateISO, prev))
    },
    [year],
  )

  const handleVacationRangeSelect = useCallback(
    (startISO: string, endISO: string): { mode: "add" | "remove"; affectedDates: string[] } => {
      let result: { mode: "add" | "remove"; affectedDates: string[] } = { mode: "add", affectedDates: [] }
      setVacationDates((prev) => {
        const rangeResult = toggleVacationRange(year, startISO, endISO, prev, yearData)
        result = { mode: rangeResult.mode, affectedDates: rangeResult.affectedDates }
        return rangeResult.newDates
      })
      return result
    },
    [year, yearData],
  )

  const handleClearAllVacation = useCallback(() => {
    setVacationDates(clearVacationDates(year))
  }, [year])

  const vacationSummary = useMemo(() => {
    if (vacationDates.size === 0) return null
    return computeVacationSummary(vacationDates, yearData, selectedLocations, enabledCalendars)
  }, [vacationDates, yearData, selectedLocations, enabledCalendars])

  const handleVacationDragSelect = useCallback(
    (dateISOs: string[], mode: "add" | "remove") => {
      setVacationDates((prev) => {
        const newDates = new Set(prev)
        for (const iso of dateISOs) {
          const [, monthStr, dayStr] = iso.split("-")
          const month = Number.parseInt(monthStr, 10) - 1
          const day = Number.parseInt(dayStr, 10)
          const dayInfo = yearData.get(`${month}-${day}`)
          if (!dayInfo?.isValid) continue

          if (mode === "add") {
            newDates.add(iso)
          } else {
            newDates.delete(iso)
          }
        }
        saveVacationDates(year, newDates)
        return newDates
      })
    },
    [year, yearData],
  )

  return (
    <div className="bg-background p-4 md:p-6 relative min-w-fit">
      <VacationBackground />

      <div className={`${PANEL_STYLES.maxWidth} ${PANEL_STYLES.minWidth} mx-auto relative z-10 space-y-4`}>
        {/* Header Panel */}
        <div className={`${PANEL_STYLES.container} p-4 md:p-6`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Holiday Planner</h1>
                <p className="text-sm text-muted-foreground">View and compare holidays across European locations</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <ThemeToggle />
              <VacationModeToggle
                isVacationMode={isVacationMode}
                onToggle={handleVacationModeToggle}
                vacationCount={vacationDates.size}
              />
              <YearSelector year={year} onYearChange={setYear} />
              <PngExportButton
                getGridElement={getCalendarGridElement}
                year={year}
                disabled={selectedLocationIds.length === 0 && enabledCalendars.length === 0}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Official Calendars</h3>
              <LocationSelector
                locations={EUROPEAN_LOCATIONS}
                selectedIds={selectedLocationIds}
                onSelectionChange={setSelectedLocationIds}
                colorMap={colorMap}
              />
            </div>

            <CustomCalendarManager
              enabledCalendarIds={enabledCustomCalendarIds}
              onEnabledChange={setEnabledCustomCalendarIds}
              onCalendarsChange={handleCustomCalendarsChange}
              colorMap={colorMap}
              year={year}
            />
          </div>

          <div className="mt-4">
            <Legend selectedLocations={selectedLocations} customCalendars={enabledCalendars} />
          </div>
        </div>

        {/* Calendar Panel */}
        <div className={`${PANEL_STYLES.container} p-4 md:p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Calendar {year}</h2>
          </div>

          {isVacationMode && (
            <VacationToolbar
              vacationCount={vacationDates.size}
              onClearAll={handleClearAllVacation}
              isRangeSelecting={!!rangeStart}
              rangeStart={rangeStart}
            />
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">Loading holiday data...</span>
              </div>
            </div>
          ) : selectedLocationIds.length === 0 && enabledCalendars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Calendar className="w-12 h-12 mb-3 text-muted" />
              <p>Select at least one location or enable a custom calendar to view</p>
            </div>
          ) : (
            <CalendarGrid
              ref={calendarGridRef}
              year={year}
              yearData={yearData}
              selectedLocations={selectedLocations}
              customCalendars={enabledCalendars}
              isVacationMode={isVacationMode}
              vacationDates={vacationDates}
              onVacationToggle={handleVacationToggle}
              onVacationRangeSelect={handleVacationRangeSelect}
              rangeStart={rangeStart}
              onRangeStartChange={setRangeStart}
              onVacationDragSelect={handleVacationDragSelect}
            />
          )}
        </div>

        {vacationSummary && (
          <div className={`${PANEL_STYLES.container} p-4 md:p-6`}>
            <VacationResultsPanel summary={vacationSummary} />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pb-2">
          Holiday data provided by{" "}
          <a
            href="https://date.nager.at"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Nager.Date API
          </a>
          . Covers all European countries with regional subdivisions where available.
        </div>
      </div>
    </div>
  )
}
