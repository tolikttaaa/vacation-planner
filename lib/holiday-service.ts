import type { Holiday, LocationConfig, DayInfo, DayLocationInfo, CustomCalendar, HolidayType } from "./types"
import { getWeekendDaysFromRules } from "./custom-calendar-service"

// Cache for holiday data
const holidayCache = new Map<string, Holiday[]>()

// Official holiday provider (Nager.Date API)
export async function fetchOfficialHolidays(countryCode: string, year: number): Promise<Holiday[]> {
  const cacheKey = `official-${countryCode}-${year}`

  if (holidayCache.has(cacheKey)) {
    return holidayCache.get(cacheKey)!
  }

  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`)

    if (!response.ok) {
      console.warn(`Failed to fetch holidays for ${countryCode}: ${response.status}`)
      return []
    }

    const data = await response.json()
    const holidays: Holiday[] = data.map(
      (h: { date: string; name: string; localName: string; countryCode: string; counties?: string[] }) => ({
        date: h.date,
        name: h.name,
        localName: h.localName,
        countryCode: h.countryCode,
        counties: h.counties,
        type: "PUBLIC_HOLIDAY" as HolidayType,
        source: "official" as const,
      }),
    )

    holidayCache.set(cacheKey, holidays)
    return holidays
  } catch (error) {
    console.error(`Error fetching holidays for ${countryCode}:`, error)
    return []
  }
}

// Custom calendar provider
export function getCustomCalendarHolidays(calendar: CustomCalendar, year: number): Holiday[] {
  return calendar.holidays
    .filter((h) => h.date.startsWith(`${year}-`))
    .map((h) => ({
      date: h.date,
      name: h.name,
      localName: h.name,
      countryCode: "CUSTOM",
      type: h.type,
      source: "custom" as const,
      calendarId: calendar.meta.id,
      halfDay: h.halfDay,
      notes: h.notes,
    }))
}

export function isHolidayForLocation(holiday: Holiday, location: LocationConfig): boolean {
  // If no region specified, all holidays for the country apply
  if (!location.regionCode) {
    return true
  }

  // If holiday has no county restriction, it applies to all regions
  if (!holiday.counties || holiday.counties.length === 0) {
    return true
  }

  // Check if the region is in the holiday's counties
  return holiday.counties.includes(location.regionCode)
}

export function isWeekend(date: Date, weekendDays: number[]): boolean {
  return weekendDays.includes(date.getDay())
}

// Standard global weekend (Saturday/Sunday)
export function isGlobalWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function formatDateISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

// Get all day info for a specific date across all selected locations
export async function getYearData(
  year: number,
  selectedLocations: LocationConfig[],
  customCalendars: CustomCalendar[] = [],
): Promise<Map<string, DayInfo>> {
  // Fetch all holidays for selected locations
  const holidayPromises = selectedLocations.map(async (location) => {
    const holidays = await fetchOfficialHolidays(location.countryCode, year)
    return { location, holidays }
  })

  const locationHolidays = await Promise.all(holidayPromises)

  // Create a map for quick official holiday lookup
  const holidayMap = new Map<string, Map<string, Holiday>>()

  for (const { location, holidays } of locationHolidays) {
    const locationHolidayMap = new Map<string, Holiday>()

    for (const holiday of holidays) {
      if (isHolidayForLocation(holiday, location)) {
        locationHolidayMap.set(holiday.date, holiday)
      }
    }

    holidayMap.set(location.id, locationHolidayMap)
  }

  // Create custom calendar holiday maps
  const customHolidayMap = new Map<string, Map<string, Holiday>>()
  for (const calendar of customCalendars) {
    const calendarHolidays = getCustomCalendarHolidays(calendar, year)
    const calendarMap = new Map<string, Holiday>()
    for (const holiday of calendarHolidays) {
      calendarMap.set(holiday.date, holiday)
    }
    customHolidayMap.set(calendar.meta.id, calendarMap)
  }

  // Build day info for every possible date
  const yearData = new Map<string, DayInfo>()

  for (let month = 0; month < 12; month++) {
    const daysInMonth = getDaysInMonth(year, month)

    for (let day = 1; day <= 31; day++) {
      const isValid = day <= daysInMonth
      const dateISO = formatDateISO(year, month, day)
      const date = isValid ? new Date(year, month, day) : new Date(Number.NaN)
      const isGlobalWknd = isValid && isGlobalWeekend(date)

      // Location-specific info
      const locations: DayLocationInfo[] = selectedLocations.map((location) => {
        const locationHolidayMap = holidayMap.get(location.id)
        const holiday = locationHolidayMap?.get(dateISO)

        return {
          locationId: location.id,
          locationName: location.name,
          color: location.color,
          isWeekend: isValid && isWeekend(date, location.weekendDays),
          isHoliday: !!holiday,
          holidayName: holiday?.localName || holiday?.name,
          holidayType: holiday?.type,
          source: "official" as const,
        }
      })

      // Custom calendar info
      for (const calendar of customCalendars) {
        const calendarMap = customHolidayMap.get(calendar.meta.id)
        const holiday = calendarMap?.get(dateISO)
        const weekendDays = getWeekendDaysFromRules(calendar.rules)

        locations.push({
          locationId: `custom-${calendar.meta.id}`,
          locationName: calendar.meta.name,
          color: calendar.meta.defaultColor,
          isWeekend: isValid && isWeekend(date, weekendDays),
          isHoliday: !!holiday,
          holidayName: holiday?.name,
          holidayType: holiday?.type,
          halfDay: holiday?.halfDay,
          notes: holiday?.notes,
          source: "custom" as const,
        })
      }

      yearData.set(`${month}-${day}`, {
        date,
        dateISO,
        isValid,
        isGlobalWeekend: isGlobalWknd,
        locations,
      })
    }
  }

  return yearData
}
