// Vacation Planning Manager
// Handles selection, persistence, and calculation of vacation days per region

import type { DayInfo, LocationConfig, CustomCalendar } from "./types"

export interface VacationDateDetail {
  dateISO: string
  weekday: string
  status: "required" | "weekend" | "holiday"
  reason: string
}

export interface DateInterval {
  startISO: string
  endISO: string
  startWeekday: string
  endWeekday: string
  count: number
}

export interface VacationStats {
  locationId: string
  locationName: string
  color: string
  plannedCount: number
  weekendExcludedCount: number
  holidayExcludedCount: number
  requiredVacationDays: number
  requiredDates: VacationDateDetail[]
  excludedDates: VacationDateDetail[]
  requiredIntervals: DateInterval[]
  excludedIntervals: DateInterval[]
}

export interface VacationInterval {
  startISO: string
  endISO: string
  totalDays: number
  requiredDays: number
  excludedWeekends: number
  excludedHolidays: number
  excludedDetails: VacationDateDetail[]
}

export interface VacationLocationSummary {
  locationId: string
  locationName: string
  color: string
  totalPlanned: number
  totalRequired: number
  totalExcluded: number
  intervals: VacationInterval[]
}

export interface VacationSummary {
  totalPlannedDates: number
  minRequired: { count: number; locations: string[] }
  maxRequired: { count: number; locations: string[] }
  statsByLocation: VacationStats[]
  intervalsByLocation: VacationLocationSummary[]
}

const VACATION_STORAGE_KEY = "holiday-planner-vacation"

interface StoredVacationData {
  [year: number]: string[] // ISO date strings
}

// Load vacation dates from localStorage
export function loadVacationDates(year: number): Set<string> {
  try {
    const stored = localStorage.getItem(VACATION_STORAGE_KEY)
    if (stored) {
      const data: StoredVacationData = JSON.parse(stored)
      return new Set(data[year] || [])
    }
  } catch {
    // Ignore parse errors
  }
  return new Set()
}

// Save vacation dates to localStorage
export function saveVacationDates(year: number, dates: Set<string>): void {
  try {
    const stored = localStorage.getItem(VACATION_STORAGE_KEY)
    const data: StoredVacationData = stored ? JSON.parse(stored) : {}
    data[year] = Array.from(dates).sort()
    localStorage.setItem(VACATION_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore write errors
  }
}

// Toggle a single date in the vacation set
export function toggleVacationDate(year: number, dateISO: string, currentDates: Set<string>): Set<string> {
  const newDates = new Set(currentDates)
  if (newDates.has(dateISO)) {
    newDates.delete(dateISO)
  } else {
    newDates.add(dateISO)
  }
  saveVacationDates(year, newDates)
  return newDates
}

// Add a range of dates to the vacation set
export function addVacationRange(
  year: number,
  startISO: string,
  endISO: string,
  currentDates: Set<string>,
  yearData: Map<string, DayInfo>,
): Set<string> {
  const newDates = new Set(currentDates)
  const start = new Date(startISO)
  const end = new Date(endISO)

  // Ensure start <= end
  const [from, to] = start <= end ? [start, end] : [end, start]

  const current = new Date(from)
  while (current <= to) {
    const iso = current.toISOString().split("T")[0]
    // Only add valid dates for the current year
    if (iso.startsWith(`${year}-`)) {
      const month = current.getMonth()
      const day = current.getDate()
      const dayInfo = yearData.get(`${month}-${day}`)
      if (dayInfo?.isValid) {
        newDates.add(iso)
      }
    }
    current.setDate(current.getDate() + 1)
  }

  saveVacationDates(year, newDates)
  return newDates
}

// Clear all vacation dates for a year
export function clearVacationDates(year: number): Set<string> {
  const emptySet = new Set<string>()
  saveVacationDates(year, emptySet)
  return emptySet
}

// Get weekday name from ISO date
function getWeekdayName(dateISO: string): string {
  const [year, month, day] = dateISO.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString("en-US", { weekday: "long" })
}

function getNextDayISO(dateISO: string): string {
  const [year, month, day] = dateISO.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + 1)
  const nextYear = date.getFullYear()
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0")
  const nextDay = String(date.getDate()).padStart(2, "0")
  return `${nextYear}-${nextMonth}-${nextDay}`
}

export function groupDatesIntoIntervals(dates: VacationDateDetail[]): DateInterval[] {
  if (dates.length === 0) return []

  // Sort by date
  const sorted = [...dates].sort((a, b) => a.dateISO.localeCompare(b.dateISO))
  const intervals: DateInterval[] = []

  let currentStart = sorted[0]
  let currentEnd = sorted[0]
  let count = 1

  for (let i = 1; i < sorted.length; i++) {
    const expectedNextDay = getNextDayISO(currentEnd.dateISO)

    if (expectedNextDay === sorted[i].dateISO) {
      // Consecutive - extend current interval
      currentEnd = sorted[i]
      count++
    } else {
      // Not consecutive - save current interval and start new one
      intervals.push({
        startISO: currentStart.dateISO,
        endISO: currentEnd.dateISO,
        startWeekday: currentStart.weekday,
        endWeekday: currentEnd.weekday,
        count,
      })
      currentStart = sorted[i]
      currentEnd = sorted[i]
      count = 1
    }
  }

  // Save last interval
  intervals.push({
    startISO: currentStart.dateISO,
    endISO: currentEnd.dateISO,
    startWeekday: currentStart.weekday,
    endWeekday: currentEnd.weekday,
    count,
  })

  return intervals
}

// Compute vacation statistics for a single location
function computeLocationStats(
  locationId: string,
  locationName: string,
  color: string,
  vacationDates: Set<string>,
  yearData: Map<string, DayInfo>,
): VacationStats {
  const plannedCount = vacationDates.size
  let weekendExcludedCount = 0
  let holidayExcludedCount = 0
  const requiredDates: VacationDateDetail[] = []
  const excludedDates: VacationDateDetail[] = []

  for (const dateISO of vacationDates) {
    // Parse date to get month/day for yearData lookup
    const [, monthStr, dayStr] = dateISO.split("-")
    const month = Number.parseInt(monthStr, 10) - 1
    const day = Number.parseInt(dayStr, 10)
    const dayInfo = yearData.get(`${month}-${day}`)

    if (!dayInfo || !dayInfo.isValid) continue

    // Find this location's info for the day
    const locInfo = dayInfo.locations.find((l) => l.locationId === locationId)
    if (!locInfo) continue

    const weekday = getWeekdayName(dateISO)

    if (locInfo.isWeekend) {
      weekendExcludedCount++
      excludedDates.push({
        dateISO,
        weekday,
        status: "weekend",
        reason: "Weekend",
      })
    } else if (locInfo.isHoliday) {
      holidayExcludedCount++
      excludedDates.push({
        dateISO,
        weekday,
        status: "holiday",
        reason: `Holiday: ${locInfo.holidayName || "Public Holiday"}`,
      })
    } else {
      requiredDates.push({
        dateISO,
        weekday,
        status: "required",
        reason: "Working day",
      })
    }
  }

  // Sort dates chronologically
  requiredDates.sort((a, b) => a.dateISO.localeCompare(b.dateISO))
  excludedDates.sort((a, b) => a.dateISO.localeCompare(b.dateISO))

  const requiredIntervals = groupDatesIntoIntervals(requiredDates)
  const excludedIntervals = groupDatesIntoIntervals(excludedDates)

  return {
    locationId,
    locationName,
    color,
    plannedCount,
    weekendExcludedCount,
    holidayExcludedCount,
    requiredVacationDays: requiredDates.length,
    requiredDates,
    excludedDates,
    requiredIntervals,
    excludedIntervals,
  }
}

function computeLocationIntervals(
  locationId: string,
  locationName: string,
  color: string,
  vacationDates: Set<string>,
  yearData: Map<string, DayInfo>,
): VacationLocationSummary {
  // First, group consecutive vacation dates into intervals
  const sortedDates = Array.from(vacationDates).sort()
  const intervals: VacationInterval[] = []

  if (sortedDates.length === 0) {
    return {
      locationId,
      locationName,
      color,
      totalPlanned: 0,
      totalRequired: 0,
      totalExcluded: 0,
      intervals: [],
    }
  }

  // Group consecutive dates into intervals first
  let intervalStart = sortedDates[0]
  let intervalEnd = sortedDates[0]
  let currentIntervalDates: string[] = [sortedDates[0]]

  for (let i = 1; i < sortedDates.length; i++) {
    const expectedNextDay = getNextDayISO(sortedDates[i - 1])

    if (expectedNextDay === sortedDates[i]) {
      // Consecutive - extend interval
      intervalEnd = sortedDates[i]
      currentIntervalDates.push(sortedDates[i])
    } else {
      // Gap - save current interval and start new one
      intervals.push(buildIntervalStats(intervalStart, intervalEnd, currentIntervalDates, locationId, yearData))
      intervalStart = sortedDates[i]
      intervalEnd = sortedDates[i]
      currentIntervalDates = [sortedDates[i]]
    }
  }

  // Save last interval
  intervals.push(buildIntervalStats(intervalStart, intervalEnd, currentIntervalDates, locationId, yearData))

  // Compute totals
  let totalRequired = 0
  let totalExcluded = 0
  for (const interval of intervals) {
    totalRequired += interval.requiredDays
    totalExcluded += interval.excludedWeekends + interval.excludedHolidays
  }

  return {
    locationId,
    locationName,
    color,
    totalPlanned: vacationDates.size,
    totalRequired,
    totalExcluded,
    intervals,
  }
}

function buildIntervalStats(
  startISO: string,
  endISO: string,
  dates: string[],
  locationId: string,
  yearData: Map<string, DayInfo>,
): VacationInterval {
  let requiredDays = 0
  let excludedWeekends = 0
  let excludedHolidays = 0
  const excludedDetails: VacationDateDetail[] = []

  for (const dateISO of dates) {
    const [, monthStr, dayStr] = dateISO.split("-")
    const month = Number.parseInt(monthStr, 10) - 1
    const day = Number.parseInt(dayStr, 10)
    const dayInfo = yearData.get(`${month}-${day}`)

    if (!dayInfo || !dayInfo.isValid) continue

    const locInfo = dayInfo.locations.find((l) => l.locationId === locationId)
    if (!locInfo) continue

    const [year, mon, d] = dateISO.split("-").map(Number)
    const weekday = new Date(year, mon - 1, d).toLocaleDateString("en-US", { weekday: "long" })

    if (locInfo.isWeekend) {
      excludedWeekends++
      excludedDetails.push({
        dateISO,
        weekday,
        status: "weekend",
        reason: "Weekend",
      })
    } else if (locInfo.isHoliday) {
      excludedHolidays++
      excludedDetails.push({
        dateISO,
        weekday,
        status: "holiday",
        reason: `${locInfo.holidayName || "Holiday"}`,
      })
    } else {
      requiredDays++
    }
  }

  return {
    startISO,
    endISO,
    totalDays: dates.length,
    requiredDays,
    excludedWeekends,
    excludedHolidays,
    excludedDetails,
  }
}

// Compute vacation statistics for all selected locations
export function computeVacationSummary(
  vacationDates: Set<string>,
  yearData: Map<string, DayInfo>,
  selectedLocations: LocationConfig[],
  customCalendars: CustomCalendar[],
): VacationSummary {
  const statsByLocation: VacationStats[] = []
  const intervalsByLocation: VacationLocationSummary[] = []

  // Process official locations
  for (const location of selectedLocations) {
    const stats = computeLocationStats(location.id, location.name, location.color, vacationDates, yearData)
    statsByLocation.push(stats)
    const intervals = computeLocationIntervals(location.id, location.name, location.color, vacationDates, yearData)
    intervalsByLocation.push(intervals)
  }

  // Process custom calendars
  for (const calendar of customCalendars) {
    const stats = computeLocationStats(
      `custom-${calendar.meta.id}`,
      calendar.meta.name,
      calendar.meta.defaultColor,
      vacationDates,
      yearData,
    )
    statsByLocation.push(stats)
    const intervals = computeLocationIntervals(
      `custom-${calendar.meta.id}`,
      calendar.meta.name,
      calendar.meta.defaultColor,
      vacationDates,
      yearData,
    )
    intervalsByLocation.push(intervals)
  }

  // Compute min/max
  let minRequired = { count: Number.POSITIVE_INFINITY, locations: [] as string[] }
  let maxRequired = { count: Number.NEGATIVE_INFINITY, locations: [] as string[] }

  for (const stats of statsByLocation) {
    if (stats.requiredVacationDays < minRequired.count) {
      minRequired = { count: stats.requiredVacationDays, locations: [stats.locationName] }
    } else if (stats.requiredVacationDays === minRequired.count) {
      minRequired.locations.push(stats.locationName)
    }

    if (stats.requiredVacationDays > maxRequired.count) {
      maxRequired = { count: stats.requiredVacationDays, locations: [stats.locationName] }
    } else if (stats.requiredVacationDays === maxRequired.count) {
      maxRequired.locations.push(stats.locationName)
    }
  }

  if (statsByLocation.length === 0) {
    minRequired = { count: 0, locations: [] }
    maxRequired = { count: 0, locations: [] }
  }

  return {
    totalPlannedDates: vacationDates.size,
    minRequired,
    maxRequired,
    statsByLocation,
    intervalsByLocation,
  }
}

// Export vacation dates to CSV
export function exportVacationDatesCSV(year: number, vacationDates: Set<string>): string {
  const sortedDates = Array.from(vacationDates).sort()
  const lines = ["Date,Weekday"]

  for (const dateISO of sortedDates) {
    const weekday = getWeekdayName(dateISO)
    lines.push(`${dateISO},${weekday}`)
  }

  return lines.join("\n")
}

// Export vacation results table to CSV
export function exportVacationResultsCSV(summary: VacationSummary): string {
  const lines = ["Region/Calendar,Planned Dates,Excluded (Weekends),Excluded (Holidays),Vacation Days Required"]

  for (const stats of summary.statsByLocation) {
    lines.push(
      `"${stats.locationName}",${stats.plannedCount},${stats.weekendExcludedCount},${stats.holidayExcludedCount},${stats.requiredVacationDays}`,
    )
  }

  // Add summary
  lines.push("")
  lines.push(`Total Planned Dates,${summary.totalPlannedDates}`)
  lines.push(`Minimum Required,"${summary.minRequired.count} (${summary.minRequired.locations.join(", ")})"`)
  lines.push(`Maximum Required,"${summary.maxRequired.count} (${summary.maxRequired.locations.join(", ")})"`)

  return lines.join("\n")
}

// Toggle a range of dates in the vacation set
export function toggleVacationRange(
  year: number,
  startISO: string,
  endISO: string,
  currentDates: Set<string>,
  yearData: Map<string, DayInfo>,
): { newDates: Set<string>; mode: "add" | "remove"; affectedDates: string[] } {
  const start = new Date(startISO)
  const end = new Date(endISO)

  // Ensure start <= end
  const [from, to] = start <= end ? [start, end] : [end, start]

  // Collect all valid dates in range
  const rangeDates: string[] = []
  const current = new Date(from)
  while (current <= to) {
    const iso = current.toISOString().split("T")[0]
    if (iso.startsWith(`${year}-`)) {
      const month = current.getMonth()
      const day = current.getDate()
      const dayInfo = yearData.get(`${month}-${day}`)
      if (dayInfo?.isValid) {
        rangeDates.push(iso)
      }
    }
    current.setDate(current.getDate() + 1)
  }

  // Determine mode: if majority of range is selected, we deselect; otherwise select
  const selectedCount = rangeDates.filter((d) => currentDates.has(d)).length
  const mode: "add" | "remove" = selectedCount > rangeDates.length / 2 ? "remove" : "add"

  const newDates = new Set(currentDates)
  for (const iso of rangeDates) {
    if (mode === "add") {
      newDates.add(iso)
    } else {
      newDates.delete(iso)
    }
  }

  saveVacationDates(year, newDates)
  return { newDates, mode, affectedDates: rangeDates }
}
