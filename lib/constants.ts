// Centralized app constants to keep storage keys and labels consistent.
export const APP_NAME = "Vacation Planner"
export const APP_TAGLINE = "View and compare holidays across European locations"
export const APP_LOG_PREFIX = "vacation-planner"

// Seed selection used on first load when no saved state exists.
export const DEFAULT_SELECTED_LOCATIONS = ["cy", "de-by", "ru"]

export const STORAGE_KEYS = {
  theme: "vacation-planner-theme",
  customCalendars: "vacation-planner-custom-calendars",
  vacation: "vacation-planner-vacation",
  state: "vacation-planner-state",
} as const

// Legacy keys kept for migration from older storage namespaces.
export const LEGACY_STORAGE_KEYS = {
  theme: "holiday-planner-theme",
  customCalendars: "holiday-planner-custom-calendars",
  vacation: "holiday-planner-vacation",
  state: "holiday-planner-state",
} as const
