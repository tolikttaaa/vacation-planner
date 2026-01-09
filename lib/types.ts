export interface Holiday {
  date: string // ISO date string YYYY-MM-DD
  name: string
  localName: string
  countryCode: string
  counties?: string[] // For regional holidays
  type?: HolidayType
  source: "official" | "custom"
  calendarId?: string // For custom calendars
  halfDay?: boolean
  notes?: string
}

export type HolidayType = "PUBLIC_HOLIDAY" | "OBSERVANCE" | "COMPANY_HOLIDAY" | "OTHER"

export interface LocationConfig {
  id: string
  name: string
  countryCode: string
  regionCode?: string // For subdivisions like Bavaria (BY)
  weekendDays: number[] // 0 = Sunday, 6 = Saturday
  color: string
  type: "country" | "region"
}

// Custom calendar JSON schema
export interface CustomCalendarMeta {
  id: string
  name: string
  description?: string
  timezone?: string
  defaultColor: string
}

export interface CustomCalendarRules {
  weekend?: ("SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY")[]
}

export interface CustomCalendarHoliday {
  date: string // YYYY-MM-DD
  name: string
  type: HolidayType
  halfDay?: boolean
  notes?: string
}

export interface CustomCalendar {
  meta: CustomCalendarMeta
  rules?: CustomCalendarRules
  holidays: CustomCalendarHoliday[]
}

export interface DayLocationInfo {
  locationId: string
  locationName: string
  color: string
  isWeekend: boolean
  isHoliday: boolean
  holidayName?: string
  holidayType?: HolidayType
  halfDay?: boolean
  notes?: string
  source: "official" | "custom"
}

export interface ColorContext {
  getColor: (id: string) => string
  colorMap: Map<string, string>
}

export interface DayInfo {
  date: Date
  dateISO: string
  isValid: boolean // false for dates like Feb 30
  isGlobalWeekend: boolean // True if Sat/Sun (standard weekend)
  locations: DayLocationInfo[]
}

export type DayType = "WORKDAY" | "WEEKEND" | "INVALID"
export type MarkerType = "NONE" | "SOLID" | "PIE" | "WHEEL"
export type MarkerSize = "WORKDAY" | "WEEKEND"

export interface CellRenderModel {
  dayType: DayType
  holidayCount: number
  markerType: MarkerType
  markerSize: MarkerSize
}

// Helper function to compute cell render model from DayInfo
export function computeCellRenderModel(dayInfo: DayInfo | undefined): CellRenderModel {
  if (!dayInfo || !dayInfo.isValid) {
    return {
      dayType: "INVALID",
      holidayCount: 0,
      markerType: "NONE",
      markerSize: "WORKDAY",
    }
  }

  const holidayLocations = dayInfo.locations.filter((loc) => loc.isHoliday)
  const holidayCount = holidayLocations.length
  const dayType: DayType = dayInfo.isGlobalWeekend ? "WEEKEND" : "WORKDAY"
  const markerSize: MarkerSize = dayInfo.isGlobalWeekend ? "WEEKEND" : "WORKDAY"

  let markerType: MarkerType = "NONE"
  if (holidayCount === 1) {
    markerType = "SOLID"
  } else if (holidayCount >= 2 && holidayCount <= 8) {
    markerType = "PIE"
  } else if (holidayCount > 8) {
    markerType = "WHEEL"
  }

  return {
    dayType,
    holidayCount,
    markerType,
    markerSize,
  }
}
