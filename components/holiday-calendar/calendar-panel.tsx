"use client"

import type React from "react"
import { useState } from "react"
import { Calendar } from "lucide-react"
import type { CustomCalendar, DayInfo, LocationConfig, PersonProfile } from "@/lib/types"
import type { VacationSummary } from "@/lib/vacation-manager"
import { PANEL_STYLES } from "./constants"
import { CalendarGrid } from "./calendar-grid"
import { DayDetailPanel } from "./day-detail-panel"
import { Legend } from "./legend"
import { VacationToolbar } from "./vacation-toolbar"
import { PngExportButton } from "./png-export-button"

interface CalendarPanelProps {
  year: number
  yearData: Map<string, DayInfo>
  isLoading: boolean
  hasCalendar: boolean
  customCalendars: CustomCalendar[]
  selectedLocations: LocationConfig[]
  vacationSummary: VacationSummary | null
  isVacationMode: boolean
  canPlanVacation: boolean
  vacationCount: number
  vacationDates: Set<string>
  vacationPeopleByDate: Map<string, PersonProfile[]>
  rangeStart: string | null
  onRangeStartChange: (dateISO: string | null) => void
  onVacationToggle: (dateISO: string) => void
  onVacationRangeSelect: (startISO: string, endISO: string) => { mode: "add" | "remove"; affectedDates: string[] }
  onVacationDragSelect: (dateISOs: string[], mode: "add" | "remove") => void
  onClearAllVacation: () => void
  exportRef: React.RefObject<HTMLDivElement>
  getGridElement: () => HTMLDivElement | null
}

// Calendar panel handles loading/empty states and renders the grid.
export function CalendarPanel({
  year,
  yearData,
  isLoading,
  hasCalendar,
  customCalendars,
  selectedLocations,
  vacationSummary,
  isVacationMode,
  canPlanVacation,
  vacationCount,
  vacationDates,
  vacationPeopleByDate,
  rangeStart,
  onRangeStartChange,
  onVacationToggle,
  onVacationRangeSelect,
  onVacationDragSelect,
  onClearAllVacation,
  exportRef,
  getGridElement,
}: CalendarPanelProps) {
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null)
  const restingPeople = selectedDay?.dateISO ? vacationPeopleByDate.get(selectedDay.dateISO) ?? [] : []

  return (
    <div className={`${PANEL_STYLES.container} p-4 md:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <img
            src="/img/VacationPlanner_SquareLogo.svg"
            alt="Vacation Planner logo"
            className="h-6 w-6"
          />
          <h2 className="text-lg font-semibold text-foreground">Calendar {year}</h2>
        </div>
        <div className="flex items-center gap-3">
          <PngExportButton getGridElement={getGridElement} year={year} disabled={!hasCalendar} size="lg" />
        </div>
      </div>

      {/* Export wrapper ensures legend is included in PNG output. */}
      <div ref={exportRef} className="space-y-4 w-full">
        <Legend selectedLocations={selectedLocations} customCalendars={customCalendars} />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">Loading holiday data...</span>
            </div>
          </div>
        ) : !hasCalendar ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Calendar className="w-12 h-12 mb-3 text-muted" />
            <p>Select a calendar for the active person to view</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2" data-calendar-scroll>
            <CalendarGrid
              year={year}
              yearData={yearData}
              selectedLocations={selectedLocations}
              customCalendars={customCalendars}
              isVacationMode={isVacationMode}
              vacationDates={vacationDates}
              vacationPeopleByDate={vacationPeopleByDate}
              onVacationToggle={onVacationToggle}
              onVacationRangeSelect={onVacationRangeSelect}
              rangeStart={rangeStart}
              onRangeStartChange={onRangeStartChange}
              onVacationDragSelect={onVacationDragSelect}
              selectedDay={selectedDay}
              onSelectedDayChange={setSelectedDay}
            />
          </div>
        )}

        {canPlanVacation && isVacationMode && (
          <VacationToolbar
            vacationCount={vacationDates.size}
            onClearAll={onClearAllVacation}
            isRangeSelecting={!!rangeStart}
            rangeStart={rangeStart}
          />
        )}

        {!isVacationMode && (
          <DayDetailPanel dayInfo={selectedDay} onClose={() => setSelectedDay(null)} restingPeople={restingPeople} />
        )}

      </div>
    </div>
  )
}
