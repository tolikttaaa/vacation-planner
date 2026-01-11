"use client"

import { useCallback, useEffect, useState } from "react"
import type { DayInfo, LocationConfig, CustomCalendar } from "@/lib/types"
import { getYearData } from "@/lib/holiday-service"
import { logger } from "@/lib/logger"

interface UseHolidayDataParams {
  year: number
  selectedLocations: LocationConfig[]
  enabledCalendars: CustomCalendar[]
  isInitialized: boolean
}

// Fetch and cache the yearly grid data for the selected locations/calendars.
export function useHolidayData({ year, selectedLocations, enabledCalendars, isInitialized }: UseHolidayDataParams) {
  const [yearData, setYearData] = useState<Map<string, DayInfo>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!isInitialized) return

    if (selectedLocations.length === 0 && enabledCalendars.length === 0) {
      setYearData((prev) => (prev.size === 0 ? prev : new Map()))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const data = await getYearData(year, selectedLocations, enabledCalendars)
      setYearData(data)
    } catch (error) {
      logger.error("Failed to fetch holiday data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [year, selectedLocations, enabledCalendars, isInitialized])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { yearData, isLoading, refresh: fetchData }
}
