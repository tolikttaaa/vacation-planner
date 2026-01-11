"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { DayInfo, LocationConfig, CustomCalendar } from "@/lib/types"
import {
  clearVacationDates,
  computeVacationSummary,
  loadVacationDates,
  saveVacationDates,
  toggleVacationDate,
  toggleVacationRange,
} from "@/lib/vacation-manager"

interface UseVacationStateParams {
  year: number
  personId: string
  yearData: Map<string, DayInfo>
  selectedLocations: LocationConfig[]
  enabledCalendars: CustomCalendar[]
  isInitialized: boolean
}

// Manage vacation selection state, interactions, and summary data.
export function useVacationState({
  year,
  personId,
  yearData,
  selectedLocations,
  enabledCalendars,
  isInitialized,
}: UseVacationStateParams) {
  const [isVacationMode, setIsVacationMode] = useState(false)
  const [vacationDates, setVacationDates] = useState<Set<string>>(new Set())
  const [rangeStart, setRangeStart] = useState<string | null>(null)

  // Reload vacation dates whenever the active year changes.
  useEffect(() => {
    if (!isInitialized) return
    /* eslint-disable react-hooks/set-state-in-effect */
    setVacationDates(loadVacationDates(personId, year))
    setRangeStart(null)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [personId, year, isInitialized])

  const handleVacationModeToggle = useCallback(() => {
    setIsVacationMode((prev) => !prev)
    setRangeStart(null)
  }, [])

  const handleVacationToggle = useCallback(
    (dateISO: string) => {
      setVacationDates((prev) => toggleVacationDate(personId, year, dateISO, prev))
    },
    [personId, year],
  )

  const handleVacationRangeSelect = useCallback(
    (startISO: string, endISO: string): { mode: "add" | "remove"; affectedDates: string[] } => {
      let result: { mode: "add" | "remove"; affectedDates: string[] } = { mode: "add", affectedDates: [] }
      setVacationDates((prev) => {
        const rangeResult = toggleVacationRange(personId, year, startISO, endISO, prev, yearData)
        result = { mode: rangeResult.mode, affectedDates: rangeResult.affectedDates }
        return rangeResult.newDates
      })
      return result
    },
    [personId, year, yearData],
  )

  const handleClearAllVacation = useCallback(() => {
    setVacationDates(clearVacationDates(personId, year))
  }, [personId, year])

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
        saveVacationDates(personId, year, newDates)
        return newDates
      })
    },
    [personId, year, yearData],
  )

  const vacationSummary = useMemo(() => {
    if (vacationDates.size === 0) return null
    return computeVacationSummary(vacationDates, yearData, selectedLocations, enabledCalendars)
  }, [vacationDates, yearData, selectedLocations, enabledCalendars])

  return {
    isVacationMode,
    setIsVacationMode,
    vacationDates,
    rangeStart,
    setRangeStart,
    vacationSummary,
    handleVacationModeToggle,
    handleVacationToggle,
    handleVacationRangeSelect,
    handleClearAllVacation,
    handleVacationDragSelect,
  }
}
