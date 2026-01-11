"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { CustomCalendar, LocationConfig, PersonProfile } from "@/lib/types"
import { getLocationById } from "@/lib/european-locations"
import { assignColors } from "@/lib/color-manager"
import { useTheme } from "@/lib/theme-context"
import { getYearData } from "@/lib/holiday-service"
import { computeVacationSummary, loadVacationDates, type VacationSummary } from "@/lib/vacation-manager"
import { logger } from "@/lib/logger"
import { PANEL_STYLES } from "./constants"
import { VacationBackground } from "./vacation-background"
import { ControlsPanel } from "./controls-panel"
import { CalendarPanel } from "./calendar-panel"
import { FooterNote } from "./footer-note"
import { ThemePanel } from "./theme-panel"
import { PersonPanel } from "./person-panel"
import { useCalendarState } from "./hooks/use-calendar-state"
import { useHolidayData } from "./hooks/use-holiday-data"
import { useVacationState } from "./hooks/use-vacation-state"

export function HolidayCalendar() {
  const { resolvedTheme } = useTheme()
  const {
    year,
    setYear,
    people,
    activePersonId,
    setActivePersonId,
    addPerson,
    updatePerson,
    removePerson,
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

  const activePerson = useMemo(
    () => (activePersonId ? people.find((person) => person.id === activePersonId) || null : null),
    [people, activePersonId],
  )

  const activeCalendarId = activePerson?.calendarId || null
  const isPersonView = Boolean(activePerson && activeCalendarId)

  const overviewIds = useMemo(
    () => [...selectedLocationIds, ...enabledCustomCalendarIds],
    [selectedLocationIds, enabledCustomCalendarIds],
  )
  const viewIds = useMemo(() => {
    if (isPersonView && activeCalendarId) {
      return [activeCalendarId]
    }
    return overviewIds
  }, [activeCalendarId, isPersonView, overviewIds])

  const overviewColorMap = useMemo(() => assignColors(overviewIds, resolvedTheme), [overviewIds, resolvedTheme])
  const viewColorMap = useMemo(() => assignColors(viewIds, resolvedTheme), [viewIds, resolvedTheme])

  // Materialize selected locations with assigned colors.
  const selectedLocations = useMemo(() => {
    if (isPersonView) {
      if (!activeCalendarId || activeCalendarId.startsWith("custom-")) {
        return []
      }
      const loc = getLocationById(activeCalendarId)
      if (!loc) return []
      return [{ ...loc, color: viewColorMap.get(activeCalendarId) || "#888888" }]
    }

    return selectedLocationIds
      .map((id) => {
        const loc = getLocationById(id)
        if (!loc) return undefined
        return { ...loc, color: overviewColorMap.get(id) || "#888888" }
      })
      .filter((loc): loc is LocationConfig => loc !== undefined)
  }, [activeCalendarId, isPersonView, overviewColorMap, selectedLocationIds, viewColorMap])

  // Materialize enabled custom calendars with assigned colors.
  const enabledCalendars = useMemo(() => {
    if (isPersonView) {
      if (!activeCalendarId || !activeCalendarId.startsWith("custom-")) {
        return []
      }
      const customId = activeCalendarId.replace("custom-", "")
      return customCalendars
        .filter((c) => c.meta.id === customId)
        .map((c) => ({
          ...c,
          meta: {
            ...c.meta,
            defaultColor: viewColorMap.get(activeCalendarId) || "#888888",
          },
        }))
    }

    return customCalendars
      .filter((c) => enabledCustomCalendarIds.includes(`custom-${c.meta.id}`))
      .map((c) => ({
        ...c,
        meta: {
          ...c.meta,
          defaultColor: overviewColorMap.get(`custom-${c.meta.id}`) || "#888888",
        },
      }))
  }, [
    activeCalendarId,
    customCalendars,
    enabledCustomCalendarIds,
    isPersonView,
    overviewColorMap,
    viewColorMap,
  ])

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
    setIsVacationMode,
    handleVacationToggle,
    handleVacationRangeSelect,
    handleClearAllVacation,
    handleVacationDragSelect,
  } = useVacationState({
    year,
    personId: activePerson?.id || "overview",
    yearData,
    selectedLocations,
    enabledCalendars,
    isInitialized,
  })

  const emptySet = useMemo(() => new Set<string>(), [])
  const canPlanVacation = isPersonView
  const vacationDatesSafe = canPlanVacation ? vacationDates : emptySet
  const vacationSummarySafe = canPlanVacation ? vacationSummary : null
  const [personSummaries, setPersonSummaries] = useState<Record<string, VacationSummary | null>>({})
  const vacationPeopleByDate = useMemo(() => {
    const map = new Map<string, PersonProfile[]>()
    for (const person of people) {
      if (!person.calendarId) continue
      const dates =
        person.id === activePersonId && canPlanVacation ? vacationDates : loadVacationDates(person.id, year)
      for (const dateISO of dates) {
        const existing = map.get(dateISO)
        if (existing) {
          existing.push(person)
        } else {
          map.set(dateISO, [person])
        }
      }
    }
    return map
  }, [people, activePersonId, canPlanVacation, vacationDates, year])

  const handlePlanToggle = useCallback(
    (personId: string) => {
      if (activePersonId === personId) {
        setActivePersonId(null)
        setIsVacationMode(false)
        setRangeStart(null)
        return
      }
      setActivePersonId(personId)
      setIsVacationMode(true)
      setRangeStart(null)
    },
    [activePersonId, setActivePersonId, setIsVacationMode, setRangeStart],
  )

  useEffect(() => {
    if (!isInitialized) return

    let isCancelled = false

    const buildSummaries = async () => {
      try {
        const entries = await Promise.all(
          people.map(async (person) => {
            if (!person.calendarId) {
              return [person.id, null] as const
            }

            const vacationDatesForPerson = loadVacationDates(person.id, year)
            if (vacationDatesForPerson.size === 0) {
              return [person.id, null] as const
            }

            const colorMap = assignColors([person.calendarId], resolvedTheme)
            const color = colorMap.get(person.calendarId) || "#888888"

            let selectedLocations: LocationConfig[] = []
            let enabledCalendars: CustomCalendar[] = []

            if (person.calendarId.startsWith("custom-")) {
              const customId = person.calendarId.replace("custom-", "")
              const calendar = customCalendars.find((c) => c.meta.id === customId)
              if (!calendar) {
                return [person.id, null] as const
              }
              enabledCalendars = [
                {
                  ...calendar,
                  meta: {
                    ...calendar.meta,
                    defaultColor: color,
                  },
                },
              ]
            } else {
              const location = getLocationById(person.calendarId)
              if (!location) {
                return [person.id, null] as const
              }
              selectedLocations = [{ ...location, color }]
            }

            const yearDataForPerson = await getYearData(year, selectedLocations, enabledCalendars)
            const summary = computeVacationSummary(
              vacationDatesForPerson,
              yearDataForPerson,
              selectedLocations,
              enabledCalendars,
            )
            return [person.id, summary] as const
          }),
        )

        if (!isCancelled) {
          setPersonSummaries(Object.fromEntries(entries))
        }
      } catch (error) {
        logger.error("Failed to build person vacation summaries:", error)
      }
    }

    buildSummaries()

    return () => {
      isCancelled = true
    }
  }, [people, year, customCalendars, resolvedTheme, isInitialized, vacationDates])

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
          colorMap={overviewColorMap}
          customCalendars={customCalendars}
          onCalendarsChange={refreshCustomCalendars}
        />

        <CalendarPanel
          year={year}
          yearData={yearData}
          isLoading={isLoading}
          hasCalendar={selectedLocations.length > 0 || enabledCalendars.length > 0}
          customCalendars={enabledCalendars}
          selectedLocations={selectedLocations}
          vacationSummary={vacationSummarySafe}
          isVacationMode={canPlanVacation ? isVacationMode : false}
          canPlanVacation={canPlanVacation}
          vacationCount={vacationDatesSafe.size}
          vacationDates={vacationDatesSafe}
          rangeStart={rangeStart}
          onRangeStartChange={setRangeStart}
          onVacationToggle={canPlanVacation ? handleVacationToggle : () => undefined}
          onVacationRangeSelect={canPlanVacation ? handleVacationRangeSelect : () => ({ mode: "add", affectedDates: [] })}
          onVacationDragSelect={canPlanVacation ? handleVacationDragSelect : () => undefined}
          onClearAllVacation={canPlanVacation ? handleClearAllVacation : () => undefined}
          exportRef={exportRef}
          getGridElement={getCalendarGridElement}
          vacationPeopleByDate={vacationPeopleByDate}
        />

        <PersonPanel
          people={people}
          activePersonId={activePerson?.id || null}
          onAddPerson={addPerson}
          onRemovePerson={removePerson}
          onUpdatePerson={updatePerson}
          onPlanToggle={handlePlanToggle}
          customCalendars={customCalendars}
          vacationSummary={vacationSummarySafe}
          isPlanning={canPlanVacation && isVacationMode}
          personSummaries={personSummaries}
        />

        <FooterNote />
      </div>
    </div>
  )
}
