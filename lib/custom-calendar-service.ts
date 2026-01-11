import type { CustomCalendar, HolidayType } from "./types"
import { EUROPEAN_LOCATIONS } from "./european-locations"
import { fetchOfficialHolidays, isHolidayForLocation } from "./holiday-service"
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "./constants"
import { readJsonStorage, writeJsonStorage } from "./storage"

export interface CustomCalendarValidationError {
  field: string
  message: string
}

// Day name to day number mapping
const DAY_MAP: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
}

// Convert custom calendar weekend rules into numeric weekday indexes.
export function getWeekendDaysFromRules(rules?: { weekend?: string[] }): number[] {
  if (!rules?.weekend || rules.weekend.length === 0) {
    return [0, 6] // Default Sat/Sun
  }
  return rules.weekend.map((day) => DAY_MAP[day]).filter((d) => d !== undefined)
}

// Validate custom calendar JSON payloads before import.
export function validateCustomCalendar(json: unknown): {
  valid: boolean
  errors: CustomCalendarValidationError[]
  calendar?: CustomCalendar
} {
  const errors: CustomCalendarValidationError[] = []

  if (!json || typeof json !== "object") {
    errors.push({ field: "root", message: "Invalid JSON object" })
    return { valid: false, errors }
  }

  const obj = json as Record<string, unknown>

  // Validate meta
  if (!obj.meta || typeof obj.meta !== "object") {
    errors.push({ field: "meta", message: "meta object is required" })
  } else {
    const meta = obj.meta as Record<string, unknown>

    if (!meta.id || typeof meta.id !== "string" || meta.id.trim() === "") {
      errors.push({ field: "meta.id", message: "meta.id is required and must be a non-empty string" })
    }

    if (!meta.name || typeof meta.name !== "string" || meta.name.trim() === "") {
      errors.push({ field: "meta.name", message: "meta.name is required and must be a non-empty string" })
    }

    if (!meta.defaultColor || typeof meta.defaultColor !== "string") {
      errors.push({ field: "meta.defaultColor", message: "meta.defaultColor is required" })
    }
  }

  // Validate rules (optional)
  if (obj.rules && typeof obj.rules === "object") {
    const rules = obj.rules as Record<string, unknown>
    if (rules.weekend) {
      if (!Array.isArray(rules.weekend)) {
        errors.push({ field: "rules.weekend", message: "rules.weekend must be an array of day names" })
      } else {
        const validDays = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
        for (const day of rules.weekend) {
          if (typeof day !== "string" || !validDays.includes(day)) {
            errors.push({
              field: "rules.weekend",
              message: `Invalid day name: ${day}. Must be one of: ${validDays.join(", ")}`,
            })
          }
        }
      }
    }
  }

  // Validate holidays
  if (!obj.holidays || !Array.isArray(obj.holidays)) {
    errors.push({ field: "holidays", message: "holidays array is required" })
  } else {
    const validTypes: HolidayType[] = ["PUBLIC_HOLIDAY", "OBSERVANCE", "COMPANY_HOLIDAY", "OTHER"]
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/

    obj.holidays.forEach((holiday, index) => {
      if (!holiday || typeof holiday !== "object") {
        errors.push({ field: `holidays[${index}]`, message: "Invalid holiday object" })
        return
      }

      const h = holiday as Record<string, unknown>

      if (!h.date || typeof h.date !== "string" || !dateRegex.test(h.date)) {
        errors.push({ field: `holidays[${index}].date`, message: "date must be in YYYY-MM-DD format" })
      } else {
        // Validate the date is actually valid
        const [year, month, day] = h.date.split("-").map(Number)
        const testDate = new Date(year, month - 1, day)
        if (testDate.getFullYear() !== year || testDate.getMonth() !== month - 1 || testDate.getDate() !== day) {
          errors.push({ field: `holidays[${index}].date`, message: `Invalid date: ${h.date}` })
        }
      }

      if (!h.name || typeof h.name !== "string" || h.name.trim() === "") {
        errors.push({ field: `holidays[${index}].name`, message: "name is required" })
      }

      if (!h.type || typeof h.type !== "string" || !validTypes.includes(h.type as HolidayType)) {
        errors.push({ field: `holidays[${index}].type`, message: `type must be one of: ${validTypes.join(", ")}` })
      }

      if (h.halfDay !== undefined && typeof h.halfDay !== "boolean") {
        errors.push({ field: `holidays[${index}].halfDay`, message: "halfDay must be a boolean" })
      }
    })
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    errors: [],
    calendar: obj as unknown as CustomCalendar,
  }
}

// Load custom calendars from localStorage (with legacy key fallback).
export function loadCustomCalendars(): CustomCalendar[] {
  if (typeof window === "undefined") return []

  return (
    readJsonStorage<CustomCalendar[]>(STORAGE_KEYS.customCalendars, LEGACY_STORAGE_KEYS.customCalendars) ?? []
  )
}

// Persist custom calendars to localStorage.
export function saveCustomCalendars(calendars: CustomCalendar[]): void {
  if (typeof window === "undefined") return
  writeJsonStorage(STORAGE_KEYS.customCalendars, calendars)
}

// Add a new custom calendar with duplicate ID protection.
export function addCustomCalendar(calendar: CustomCalendar): { success: boolean; error?: string } {
  const calendars = loadCustomCalendars()

  // Check for duplicate ID
  if (calendars.some((c) => c.meta.id === calendar.meta.id)) {
    return { success: false, error: `A calendar with ID "${calendar.meta.id}" already exists` }
  }

  calendars.push(calendar)
  saveCustomCalendars(calendars)
  return { success: true }
}

// Replace an existing custom calendar by ID.
export function updateCustomCalendar(calendar: CustomCalendar): { success: boolean; error?: string } {
  const calendars = loadCustomCalendars()
  const index = calendars.findIndex((c) => c.meta.id === calendar.meta.id)

  if (index === -1) {
    return { success: false, error: `Calendar with ID "${calendar.meta.id}" not found` }
  }

  calendars[index] = calendar
  saveCustomCalendars(calendars)
  return { success: true }
}

// Remove a custom calendar by ID.
export function deleteCustomCalendar(id: string): void {
  const calendars = loadCustomCalendars()
  saveCustomCalendars(calendars.filter((c) => c.meta.id !== id))
}

// Fetch a single custom calendar by ID.
export function getCustomCalendarById(id: string): CustomCalendar | undefined {
  return loadCustomCalendars().find((c) => c.meta.id === id)
}

// Build a custom calendar template by cloning official holidays for a location.
export async function createCalendarFromLocation(
  locationId: string,
  year: number,
): Promise<{ success: boolean; calendar?: CustomCalendar; error?: string }> {
  const location = EUROPEAN_LOCATIONS.find((loc) => loc.id === locationId)
  if (!location) {
    return { success: false, error: `Location "${locationId}" not found` }
  }

  try {
    const holidays = await fetchOfficialHolidays(location.countryCode, year)
    const filteredHolidays = holidays.filter((h) => isHolidayForLocation(h, location))

    const calendar: CustomCalendar = {
      meta: {
        id: `${locationId}-${year}-copy`,
        name: `${location.name} (${year})`,
        description: `Holidays from ${location.name} for ${year}`,
        timezone: "UTC",
        defaultColor: "#7B61FF",
      },
      rules: {
        weekend:
          location.weekendDays.includes(0) && location.weekendDays.includes(6)
            ? ["SATURDAY", "SUNDAY"]
            : location.weekendDays.map((d) => {
                const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
                return days[d]
              }),
      },
      holidays: filteredHolidays.map((h) => ({
        date: h.date,
        name: h.localName || h.name,
        type: "PUBLIC_HOLIDAY" as HolidayType,
        halfDay: false,
        notes: h.name !== h.localName ? h.name : undefined,
      })),
    }

    return { success: true, calendar }
  } catch (error) {
    return { success: false, error: `Failed to fetch holidays: ${error}` }
  }
}

// Curated subset for quick selection.
export function getPopularLocations(): Array<{ id: string; name: string }> {
  const popularIds = [
    "cy",
    "de-by",
    "de-be",
    "de-nw",
    "ru",
    "gb-eng",
    "gb-sct",
    "fr",
    "es-md",
    "es-ct",
    "it",
    "nl",
    "at-9",
    "ch-zh",
    "pl",
  ]

  return EUROPEAN_LOCATIONS.filter((loc) => popularIds.includes(loc.id)).map((loc) => ({ id: loc.id, name: loc.name }))
}

// Flat list for location dropdowns.
export function getAllLocationsForDropdown(): Array<{ id: string; name: string; type: string }> {
  return EUROPEAN_LOCATIONS.map((loc) => ({
    id: loc.id,
    name: loc.name,
    type: loc.type,
  }))
}

// Example JSON template for documentation
export const EXAMPLE_CUSTOM_CALENDAR: CustomCalendar = {
  meta: {
    id: "my-company-calendar",
    name: "My Company Calendar",
    description: "Company-specific holidays and events",
    timezone: "Europe/Berlin",
    defaultColor: "#7B61FF",
  },
  rules: {
    weekend: ["SATURDAY", "SUNDAY"],
  },
  holidays: [
    {
      date: "2026-01-01",
      name: "New Year's Day",
      type: "PUBLIC_HOLIDAY",
      halfDay: false,
      notes: "Office closed",
    },
    {
      date: "2026-12-24",
      name: "Christmas Eve",
      type: "COMPANY_HOLIDAY",
      halfDay: true,
    },
    {
      date: "2026-07-15",
      name: "Company Foundation Day",
      type: "COMPANY_HOLIDAY",
      halfDay: false,
      notes: "Annual celebration",
    },
  ],
}
