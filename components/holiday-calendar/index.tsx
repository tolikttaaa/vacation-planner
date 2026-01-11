"use client"

import { useCallback, useMemo, useRef } from "react"
import type { LocationConfig } from "@/lib/types"
import { getLocationById } from "@/lib/european-locations"
import { assignColors } from "@/lib/color-manager"
import { useTheme } from "@/lib/theme-context"
import { PANEL_STYLES } from "./constants"
import { VacationBackground } from "./vacation-background"
import { ControlsPanel } from "./controls-panel"
import { CalendarPanel } from "./calendar-panel"
import { FooterNote } from "./footer-note"
import { ThemePanel } from "./theme-panel"
import { useCalendarState } from "./hooks/use-calendar-state"
import { useHolidayData } from "./hooks/use-holiday-data"
import { useVacationState } from "./hooks/use-vacation-state"

export function HolidayCalendar() {
  const { resolvedTheme } = useTheme()
  const {
    year,
    setYear,
    selectedLocationIds,
    setSelectedLocationIds,
    enabledCustomCalendarIds,
    setEnabledCustomCalendarIds,
    customCalendars,
    refreshCustomCalendars,
    isInitialized,
  } = useCalendarState()

  // Export container includes legend + grid so PNG captures both.
  const exportRef = useRef<HTMLDivElement>(null)

  // Expose the grid DOM node for export actions.
  const getCalendarGridElement = useCallback(() => {
    return exportRef.current
  }, [])

  // Compute distinct colors per active calendar ID.
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

  // Materialize selected locations with assigned colors.
  const selectedLocations = useMemo(() => {
    return selectedLocationIds
      .map((id) => {
        const loc = getLocationById(id)
        if (!loc) return undefined
        return { ...loc, color: getColor(id) }
      })
      .filter((loc): loc is LocationConfig => loc !== undefined)
  }, [selectedLocationIds, getColor])

  // Materialize enabled custom calendars with assigned colors.
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

  const { yearData, isLoading } = useHolidayData({
    year,
    selectedLocations,
    enabledCalendars,
    isInitialized,
  })

  const {
    isVacationMode,
    vacationDates,
    rangeStart,
    setRangeStart,
    vacationSummary,
    handleVacationModeToggle,
    handleVacationToggle,
    handleVacationRangeSelect,
    handleClearAllVacation,
    handleVacationDragSelect,
  } = useVacationState({
    year,
    yearData,
    selectedLocations,
    enabledCalendars,
    isInitialized,
  })

  return (
    <div className="bg-background p-4 md:p-6 relative min-w-0">
      <VacationBackground />
      <ThemePanel />

      <div className={`${PANEL_STYLES.maxWidth} ${PANEL_STYLES.minWidth} mx-auto relative z-10 space-y-4`}>
        <div className="flex justify-center">
          <img
            src="/img/VacationPlanner_LogoWithName.svg"
            alt="Vacation Planner logo"
            className="w-full max-w-[calc(100%-6rem)] md:max-w-[1200px] lg:max-w-[1400px] h-auto object-contain"
          />
        </div>

        <ControlsPanel
          year={year}
          onYearChange={setYear}
          selectedLocationIds={selectedLocationIds}
          onSelectionChange={setSelectedLocationIds}
          enabledCustomCalendarIds={enabledCustomCalendarIds}
          onEnabledCustomCalendarsChange={setEnabledCustomCalendarIds}
          onCalendarsChange={refreshCustomCalendars}
          colorMap={colorMap}
        />

        <CalendarPanel
          year={year}
          yearData={yearData}
          isLoading={isLoading}
          selectedLocationIds={selectedLocationIds}
          customCalendars={enabledCalendars}
          selectedLocations={selectedLocations}
          vacationSummary={vacationSummary}
          isVacationMode={isVacationMode}
          onVacationModeToggle={handleVacationModeToggle}
          vacationCount={vacationDates.size}
          vacationDates={vacationDates}
          rangeStart={rangeStart}
          onRangeStartChange={setRangeStart}
          onVacationToggle={handleVacationToggle}
          onVacationRangeSelect={handleVacationRangeSelect}
          onVacationDragSelect={handleVacationDragSelect}
          onClearAllVacation={handleClearAllVacation}
          exportRef={exportRef}
          getGridElement={getCalendarGridElement}
        />

        <FooterNote />
      </div>
    </div>
  )
}
