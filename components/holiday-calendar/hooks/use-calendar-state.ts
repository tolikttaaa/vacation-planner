"use client"

import { useCallback, useEffect, useState } from "react"
import type { CustomCalendar, PersonProfile } from "@/lib/types"
import { loadCustomCalendars } from "@/lib/custom-calendar-service"
import { DEFAULT_SELECTED_LOCATIONS, LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/constants"
import { readJsonStorage, writeJsonStorage } from "@/lib/storage"

interface StoredState {
  year: number
  people: PersonProfile[]
  activePersonId: string | null
  selectedLocationIds: string[]
  enabledCustomCalendarIds: string[]
}

interface LegacyStoredState {
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
  const [people, setPeople] = useState<PersonProfile[]>([])
  const [activePersonId, setActivePersonId] = useState<string | null>(null)
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([])
  const [enabledCustomCalendarIds, setEnabledCustomCalendarIds] = useState<string[]>([])
  const [customCalendars, setCustomCalendars] = useState<CustomCalendar[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  const createPerson = useCallback((name: string, calendarId: string | null): PersonProfile => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `person-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    return { id, name, calendarId }
  }, [])

  useEffect(() => {
    // Hydrate from localStorage once on mount.
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = readJsonStorage<StoredState | LegacyStoredState>(STORAGE_KEYS.state, LEGACY_STORAGE_KEYS.state)
    if (stored && "people" in stored) {
      setYear(stored.year)
      setPeople(stored.people)
      setActivePersonId(stored.activePersonId ?? null)
      setSelectedLocationIds(stored.selectedLocationIds || DEFAULT_SELECTED_LOCATIONS)
      setEnabledCustomCalendarIds(stored.enabledCustomCalendarIds || [])
    } else if (stored) {
      setYear(stored.year)
      setSelectedLocationIds(stored.selectedLocationIds || DEFAULT_SELECTED_LOCATIONS)
      setEnabledCustomCalendarIds(stored.enabledCustomCalendarIds || [])
      setPeople([createPerson("Person 1", null)])
      setActivePersonId(null)
    } else {
      setPeople([createPerson("Person 1", null)])
      setActivePersonId(null)
      setSelectedLocationIds(DEFAULT_SELECTED_LOCATIONS)
      setEnabledCustomCalendarIds([])
    }

    setCustomCalendars(loadCustomCalendars())
    setIsInitialized(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [createPerson])

  // Persist selection changes.
  useEffect(() => {
    if (!isInitialized) return

    writeJsonStorage<StoredState>(STORAGE_KEYS.state, {
      year,
      people,
      activePersonId,
      selectedLocationIds,
      enabledCustomCalendarIds,
    })
  }, [year, people, activePersonId, selectedLocationIds, enabledCustomCalendarIds, isInitialized])

  const refreshCustomCalendars = useCallback(() => {
    setCustomCalendars(loadCustomCalendars())
  }, [])

  const addPerson = useCallback(
    (name?: string) => {
      const nextName =
        typeof name === "string" && name.trim().length > 0 ? name.trim() : `Person ${people.length + 1}`
      const newPerson = createPerson(nextName, null)
      setPeople((prev) => [...prev, newPerson])
    },
    [createPerson, people.length],
  )

  const updatePerson = useCallback((personId: string, updates: Partial<PersonProfile>) => {
    setPeople((prev) => prev.map((person) => (person.id === personId ? { ...person, ...updates } : person)))
  }, [])

  const removePerson = useCallback(
    (personId: string) => {
      setPeople((prev) => {
        const next = prev.filter((person) => person.id !== personId)
        if (next.length === 0) {
          const fallback = createPerson("Person 1", DEFAULT_SELECTED_LOCATIONS[0] || null)
          setActivePersonId(null)
          return [fallback]
        }
        if (activePersonId === personId) {
          setActivePersonId(null)
        }
        return next
      })
    },
    [activePersonId, createPerson],
  )

  return {
    year,
    setYear,
    people,
    setPeople,
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
    setCustomCalendars,
    refreshCustomCalendars,
    isInitialized,
  }
}
