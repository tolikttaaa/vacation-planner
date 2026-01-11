"use client"

import { useCallback, useEffect, useState } from "react"
import type { CustomCalendar } from "@/lib/types"
import { loadCustomCalendars } from "@/lib/custom-calendar-service"
import { DEFAULT_SELECTED_LOCATIONS, LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/constants"
import { readJsonStorage, writeJsonStorage } from "@/lib/storage"

interface StoredState {
  year: number
  selectedLocationIds: string[]
  enabledCustomCalendarIds: string[]
}

interface UseCalendarStateOptions {
  initialYear?: number
}

// Persisted selection state for year, official locations, and enabled custom calendars.
export function useCalendarState(options: UseCalendarStateOptions = {}) {
  const { initialYear = 2026 } = options
  const [year, setYear] = useState(initialYear)
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([])
  const [enabledCustomCalendarIds, setEnabledCustomCalendarIds] = useState<string[]>([])
  const [customCalendars, setCustomCalendars] = useState<CustomCalendar[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Hydrate from localStorage once on mount.
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = readJsonStorage<StoredState>(STORAGE_KEYS.state, LEGACY_STORAGE_KEYS.state)
    if (stored) {
      setYear(stored.year)
      setSelectedLocationIds(stored.selectedLocationIds)
      setEnabledCustomCalendarIds(stored.enabledCustomCalendarIds || [])
    } else {
      setSelectedLocationIds(DEFAULT_SELECTED_LOCATIONS)
    }

    setCustomCalendars(loadCustomCalendars())
    setIsInitialized(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  // Persist selection changes.
  useEffect(() => {
    if (!isInitialized) return

    writeJsonStorage<StoredState>(STORAGE_KEYS.state, {
      year,
      selectedLocationIds,
      enabledCustomCalendarIds,
    })
  }, [year, selectedLocationIds, enabledCustomCalendarIds, isInitialized])

  const refreshCustomCalendars = useCallback(() => {
    setCustomCalendars(loadCustomCalendars())
  }, [])

  return {
    year,
    setYear,
    selectedLocationIds,
    setSelectedLocationIds,
    enabledCustomCalendarIds,
    setEnabledCustomCalendarIds,
    customCalendars,
    setCustomCalendars,
    refreshCustomCalendars,
    isInitialized,
  }
}
