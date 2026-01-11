"use client"

import type React from "react"

import { EUROPEAN_LOCATIONS } from "@/lib/european-locations"
import type { CustomCalendar, PersonProfile } from "@/lib/types"
import type { VacationSummary } from "@/lib/vacation-manager"
import { Button } from "@/components/ui/button"
import { Plus, Palmtree } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PANEL_STYLES } from "./constants"
import { VacationResultsPanel } from "./vacation-results-panel"

interface PersonPanelProps {
  people: PersonProfile[]
  activePersonId: string | null
  onAddPerson: () => void
  onRemovePerson: (personId: string) => void
  onUpdatePerson: (personId: string, updates: Partial<PersonProfile>) => void
  onPlanToggle: (personId: string) => void
  customCalendars: CustomCalendar[]
  vacationSummary: VacationSummary | null
  isPlanning: boolean
  personSummaries: Record<string, VacationSummary | null>
}

export function PersonPanel({
  people,
  activePersonId,
  onAddPerson,
  onRemovePerson,
  onUpdatePerson,
  onPlanToggle,
  customCalendars,
  vacationSummary,
  isPlanning,
  personSummaries,
}: PersonPanelProps) {
  return (
    <div className={`${PANEL_STYLES.container} p-4 md:p-6`}>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Palmtree className="w-5 h-5 text-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Vacation Planning</h2>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {people.map((person) => {
            const isPlanning = person.id === activePersonId
            const isCalendarAssigned = Boolean(person.calendarId)
            const personSummary = personSummaries[person.id]
            const summaryByLocation = personSummary?.statsByLocation.find((stat) => stat.locationId === person.calendarId)
            const plannedCount = summaryByLocation?.plannedCount ?? 0
            const requiredCount = summaryByLocation?.requiredVacationDays ?? 0
            const excludedCount = summaryByLocation
              ? summaryByLocation.weekendExcludedCount + summaryByLocation.holidayExcludedCount
              : 0
            return (
              <div key={person.id} className="rounded-lg overflow-hidden border border-border bg-muted/50">
                <div
                  className="flex flex-wrap items-center justify-between gap-3 p-3"
                  style={{
                    backgroundColor: "var(--calendar-header-bg)",
                    borderBottom: isPlanning ? "1px solid var(--panel-divider)" : "none",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      value={person.name}
                      onChange={(event) => onUpdatePerson(person.id, { name: event.target.value })}
                      className="h-8 w-40"
                      placeholder="Person name"
                    />
                    <Select
                      value={person.calendarId ?? "none"}
                      onValueChange={(calendarId) =>
                        onUpdatePerson(person.id, { calendarId: calendarId === "none" ? null : calendarId })
                      }
                    >
                      <SelectTrigger className="h-8 w-56">
                        <SelectValue placeholder="Select a calendar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        <SelectGroup>
                          <SelectLabel>Official Calendars</SelectLabel>
                          {EUROPEAN_LOCATIONS.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Custom Calendars</SelectLabel>
                          {customCalendars.length === 0 ? (
                            <SelectItem value="custom-none" disabled>
                              No custom calendars
                            </SelectItem>
                          ) : (
                            customCalendars.map((calendar) => (
                              <SelectItem key={calendar.meta.id} value={`custom-${calendar.meta.id}`}>
                                {calendar.meta.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                      <div className="text-xs" style={{ color: "var(--panel-text-muted)" }}>
                        Planned
                      </div>
                      <div className="text-sm font-medium" style={{ color: "var(--panel-text)" }}>
                        {plannedCount}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs" style={{ color: "var(--panel-text-muted)" }}>
                        Excluded
                      </div>
                      <div className="text-sm font-medium" style={{ color: "var(--panel-text-muted)" }}>
                        -{excludedCount}
                      </div>
                    </div>
                    <div className="text-center min-w-16">
                      <div className="text-xs" style={{ color: "var(--panel-text-muted)" }}>
                        Required
                      </div>
                      <div className="text-sm font-medium" style={{ color: "var(--primary)" }}>
                        {requiredCount}
                      </div>
                    </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={isPlanning ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPlanToggle(person.id)}
                      disabled={!isCalendarAssigned}
                    >
                      {isPlanning ? "Stop Planning" : "Plan Vacation"}
                    </Button>
                    {people.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => onRemovePerson(person.id)}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {isPlanning && vacationSummary && (
                  <div className="px-4 pb-4" style={{ backgroundColor: "var(--panel-item-bg)" }}>
                    <div className="space-y-3">
                      <VacationResultsPanel summary={vacationSummary} compact forceExpanded />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex justify-start">
          <Button type="button" variant="outline" size="sm" onClick={() => onAddPerson()}>
            <Plus className="w-4 h-4 mr-1" />
            Add Person
          </Button>
        </div>

      </div>
    </div>
  )
}
