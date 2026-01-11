"use client"

import type React from "react"

import { useState, useCallback, useRef, forwardRef, useImperativeHandle, Fragment } from "react"
import type { DayInfo, LocationConfig, CustomCalendar } from "@/lib/types"
import { HolidayPieMarker } from "./holiday-pie-marker"
import { getDatesBetween } from "@/lib/date-utils"

interface CalendarGridProps {
  year: number
  yearData: Map<string, DayInfo>
  selectedLocations: LocationConfig[]
  customCalendars: CustomCalendar[]
  isVacationMode?: boolean
  vacationDates?: Set<string>
  onVacationToggle?: (dateISO: string) => void
  onVacationRangeSelect?: (
    startISO: string,
    endISO: string,
  ) => { mode: "add" | "remove"; affectedDates: string[] } | void
  rangeStart?: string | null
  onRangeStartChange?: (dateISO: string | null) => void
  onVacationDragSelect?: (dateISOs: string[], mode: "add" | "remove") => void
  selectedDay?: DayInfo | null
  onSelectedDayChange?: (day: DayInfo | null) => void
}

interface CalendarGridRef {
  getGridElement: () => HTMLDivElement | null
}

// Month labels used by the grid rows.
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
const DAY_ROW_HEIGHT = 36
const DAY_CELL_MIN_SIZE = DAY_ROW_HEIGHT

export const CalendarGrid = forwardRef<CalendarGridRef, CalendarGridProps>(function CalendarGrid(
  {
    year,
    yearData,
    selectedLocations,
    customCalendars,
    isVacationMode = false,
    vacationDates = new Set(),
    onVacationToggle,
    onVacationRangeSelect,
    rangeStart = null,
    onRangeStartChange,
    onVacationDragSelect,
    selectedDay = null,
    onSelectedDayChange,
  },
  ref,
) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<"add" | "remove">("add")
  const [draggedDates, setDraggedDates] = useState<Set<string>>(new Set())
  const dragStartPos = useRef<{ x: number; y: number } | null>(null)
  const dragStartDate = useRef<string | null>(null)
  const hasDragMoved = useRef(false)

  const [animatingCells, setAnimatingCells] = useState<Map<string, "add" | "remove">>(new Map())

  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const [hoveredCell, setHoveredCell] = useState<{ month: number; day: number } | null>(null)

  const gridRef = useRef<HTMLDivElement>(null)

  // Expose grid root for PNG export.
  useImperativeHandle(ref, () => ({
    getGridElement: () => gridRef.current,
  }))

  // Toggle the detail panel on single-day selection.
  const handleDaySelect = useCallback(
    (dayInfo: DayInfo) => {
      onSelectedDayChange?.(selectedDay?.dateISO === dayInfo.dateISO ? null : dayInfo)
    },
    [onSelectedDayChange, selectedDay],
  )

  // Begin a drag-select gesture in vacation mode.
  const handleDragStart = useCallback(
    (dateISO: string, isCurrentlySelected: boolean, e: React.MouseEvent) => {
      if (!isVacationMode) return
      dragStartPos.current = { x: e.clientX, y: e.clientY }
      dragStartDate.current = dateISO
      hasDragMoved.current = false
      setDragMode(isCurrentlySelected ? "remove" : "add")
      setDraggedDates(new Set([dateISO]))
    },
    [isVacationMode],
  )

  // Track drag movement to build the selection set.
  const handleDragOver = useCallback(
    (dateISO: string, e: React.MouseEvent) => {
      if (!dragStartPos.current || !isVacationMode) return

      const dx = Math.abs(e.clientX - dragStartPos.current.x)
      const dy = Math.abs(e.clientY - dragStartPos.current.y)

      if (dx > 5 || dy > 5) {
        if (!isDragging) {
          setIsDragging(true)
        }
        hasDragMoved.current = true
        setDraggedDates((prev) => {
          if (prev.has(dateISO)) return prev
          const next = new Set(prev)
          next.add(dateISO)
          return next
        })
      }
    },
    [isDragging, isVacationMode],
  )

  // Commit drag selection and play the animation.
  const handleDragEnd = useCallback(() => {
    if (!dragStartPos.current) return

    if (hasDragMoved.current && isDragging && draggedDates.size > 0 && onVacationDragSelect) {
      const dates = Array.from(draggedDates)
      onVacationDragSelect(dates, dragMode)

      const newAnimating = new Map<string, "add" | "remove">()
      for (const d of dates) {
        newAnimating.set(d, dragMode)
      }
      setAnimatingCells(newAnimating)
      setTimeout(() => setAnimatingCells(new Map()), 300)
    }

    setIsDragging(false)
    setDraggedDates(new Set())
    dragStartPos.current = null
    dragStartDate.current = null
    hasDragMoved.current = false
  }, [isDragging, dragMode, draggedDates, onVacationDragSelect])

  // Shift-click range selection with animation.
  const handleRangeSelect = useCallback(
    (startISO: string, endISO: string) => {
      if (!onVacationRangeSelect) return

      const result = onVacationRangeSelect(startISO, endISO)
      if (result && result.affectedDates) {
        const newAnimating = new Map<string, "add" | "remove">()
        for (const d of result.affectedDates) {
          newAnimating.set(d, result.mode)
        }
        setAnimatingCells(newAnimating)
        setTimeout(() => setAnimatingCells(new Map()), 350)
      }
    },
    [onVacationRangeSelect],
  )

  // Highlight row/column crosshair on hover.
  const handleCellHover = useCallback((month: number | null, day: number | null) => {
    if (month === null || day === null) {
      setHoveredCell(null)
    } else {
      setHoveredCell({ month, day })
    }
  }, [])

  // Shift-click preview highlights the date range before commit.
  const shiftPreviewDates =
    rangeStart && hoveredDate && rangeStart !== hoveredDate
      ? new Set(getDatesBetween(rangeStart, hoveredDate))
      : new Set<string>()

  return (
    <div
      onMouseUp={handleDragEnd}
      onMouseLeave={() => {
        handleDragEnd()
        setHoveredCell(null)
      }}
    >
      <div
        ref={gridRef}
        className="grid select-none w-full"
        style={{
          gridTemplateColumns: `100px repeat(31, minmax(${DAY_CELL_MIN_SIZE}px, 1fr))`,
          gridAutoRows: `${DAY_ROW_HEIGHT}px`,
          backgroundColor: "var(--calendar-bg)",
          minWidth: `calc(100px + 31 * ${DAY_CELL_MIN_SIZE}px)`,
        }}
      >
        {/* Header row */}
        <div
          className="sticky left-0 z-20 px-3 text-left font-semibold text-sm flex items-center h-full"
          style={{
            backgroundColor: "var(--calendar-header-bg)",
            color: "var(--calendar-header-text)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "var(--calendar-grid-line)",
          }}
        >
          Month
        </div>
        {Array.from({ length: 31 }, (_, i) => (
          <div
            key={i}
            className="text-center font-semibold text-sm flex items-center justify-center h-full"
            style={{
              color: "var(--calendar-header-text)",
              backgroundColor: "var(--calendar-header-bg)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "var(--calendar-grid-line)",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </div>
        ))}

        {/* Month rows */}
        {MONTHS.map((month, monthIndex) => (
          <Fragment key={month}>
          <div
            key={`${month}-label`}
            className="sticky left-0 z-10 px-3 font-medium text-sm flex items-center h-full"
            style={{
              backgroundColor: "var(--calendar-month-bg)",
              color: "var(--calendar-header-text)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "var(--calendar-grid-line)",
            }}
          >
              {month}
            </div>
            {Array.from({ length: 31 }, (_, dayIndex) => {
              const day = dayIndex + 1
              const dayInfo = yearData.get(`${monthIndex}-${day}`)
              const isSelected = selectedDay?.dateISO === dayInfo?.dateISO
              const isVacationSelected = dayInfo?.isValid && vacationDates.has(dayInfo.dateISO)
              const isRangeStartCell = rangeStart === dayInfo?.dateISO
              const isBeingDragged = isDragging && dayInfo?.isValid && draggedDates.has(dayInfo.dateISO)
              const isInShiftPreview = dayInfo?.isValid && shiftPreviewDates.has(dayInfo.dateISO)
              const animationMode = dayInfo?.isValid ? animatingCells.get(dayInfo.dateISO) : undefined

              return (
                <GridCalendarCell
                  key={`${monthIndex}-${day}`}
                  dayInfo={dayInfo}
                  day={day}
                  monthIndex={monthIndex}
                  isSelected={isSelected}
                  onSelect={handleDaySelect}
                  isVacationMode={isVacationMode}
                  isVacationSelected={isVacationSelected}
                  isRangeStart={isRangeStartCell}
                  onVacationToggle={onVacationToggle}
                  onVacationRangeSelect={handleRangeSelect}
                  rangeStart={rangeStart}
                  onRangeStartChange={onRangeStartChange}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  isDragging={isDragging}
                  dragMode={dragMode}
                  isBeingDragged={isBeingDragged}
                  isInShiftPreview={isInShiftPreview}
                  animationMode={animationMode}
                  onHover={setHoveredDate}
                  onCellHover={handleCellHover}
                  vacationDates={vacationDates}
                />
              )
            })}
          </Fragment>
        ))}
      </div>

    </div>
  )
})

interface GridCalendarCellProps {
  dayInfo: DayInfo | undefined
  day: number
  monthIndex: number
  isSelected?: boolean
  onSelect?: (dayInfo: DayInfo) => void
  isVacationMode?: boolean
  isVacationSelected?: boolean
  isRangeStart?: boolean
  onVacationToggle?: (dateISO: string) => void
  onVacationRangeSelect?: (startISO: string, endISO: string) => void
  rangeStart?: string | null
  onRangeStartChange?: (dateISO: string | null) => void
  onDragStart?: (dateISO: string, isCurrentlySelected: boolean, e: React.MouseEvent) => void
  onDragOver?: (dateISO: string, e: React.MouseEvent) => void
  isDragging?: boolean
  dragMode?: "add" | "remove"
  isBeingDragged?: boolean
  isInShiftPreview?: boolean
  animationMode?: "add" | "remove"
  onHover?: (dateISO: string | null) => void
  onCellHover?: (month: number | null, day: number | null) => void
  vacationDates?: Set<string>
}

function GridCalendarCell({
  dayInfo,
  day,
  monthIndex,
  isSelected,
  onSelect,
  isVacationMode = false,
  isVacationSelected = false,
  isRangeStart = false,
  onVacationToggle,
  onVacationRangeSelect,
  rangeStart,
  onRangeStartChange,
  onDragStart,
  onDragOver,
  isDragging = false,
  dragMode = "add",
  isBeingDragged = false,
  isInShiftPreview = false,
  animationMode,
  onHover,
  onCellHover,
  vacationDates = new Set(),
}: GridCalendarCellProps) {
  const cellRef = useRef<HTMLDivElement>(null)

  // Start drag selection on mouse down in vacation mode.
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!dayInfo?.isValid || !isVacationMode) return
      if (e.button !== 0) return
      e.preventDefault()
      onDragStart?.(dayInfo.dateISO, isVacationSelected, e)
    },
    [dayInfo, isVacationMode, isVacationSelected, onDragStart],
  )

  // Update hover state and extend drag selection.
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      onCellHover?.(monthIndex, day)
      if (dayInfo?.isValid) {
        onHover?.(dayInfo.dateISO)
        onDragOver?.(dayInfo.dateISO, e)
      }
    },
    [dayInfo, monthIndex, day, onDragOver, onHover, onCellHover],
  )

  // Continue drag selection if the mouse is moving within the cell.
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dayInfo?.isValid) {
        onDragOver?.(dayInfo.dateISO, e)
      }
    },
    [dayInfo, onDragOver],
  )

  const handleMouseLeave = useCallback(() => {
    onHover?.(null)
  }, [onHover])

  // Click handling supports selection, shift-range, and details view.
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!dayInfo?.isValid) return

      if (isVacationMode) {
        if (e.shiftKey && rangeStart && onVacationRangeSelect) {
          onVacationRangeSelect(rangeStart, dayInfo.dateISO)
          onRangeStartChange?.(null)
        } else if (e.shiftKey && !rangeStart) {
          onRangeStartChange?.(dayInfo.dateISO)
        } else {
          onVacationToggle?.(dayInfo.dateISO)
          if (rangeStart) {
            onRangeStartChange?.(null)
          }
        }
      } else {
        onSelect?.(dayInfo)
      }
    },
    [dayInfo, isVacationMode, rangeStart, onVacationToggle, onVacationRangeSelect, onRangeStartChange, onSelect],
  )

  // Keyboard support for accessibility.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && dayInfo?.isValid) {
        e.preventDefault()
        if (isVacationMode) {
          onVacationToggle?.(dayInfo.dateISO)
        } else {
          onSelect?.(dayInfo)
        }
      }
    },
    [dayInfo, isVacationMode, onVacationToggle, onSelect],
  )

  const baseStyle: React.CSSProperties = {
    position: "relative",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--calendar-grid-line)",
    overflow: "hidden",
    height: "100%",
  }

  if (!dayInfo || !dayInfo.isValid) {
    return (
      <div
        className="text-center text-xs"
        style={{
          ...baseStyle,
          background: `repeating-linear-gradient(
            45deg,
            var(--invalid-bg-1),
            var(--invalid-bg-1) 2px,
            var(--invalid-bg-2) 2px,
            var(--invalid-bg-2) 6px
          )`,
        }}
        onMouseEnter={() => onCellHover?.(monthIndex, day)}
        aria-label={`Day ${day} - Invalid date`}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 32 32"
          preserveAspectRatio="none"
        >
          <line x1="4" y1="4" x2="28" y2="28" stroke="var(--invalid-cross)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="28" y1="4" x2="4" y2="28" stroke="var(--invalid-cross)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  const holidayLocations = dayInfo.locations.filter((loc) => loc.isHoliday)
  const isWeekend = dayInfo.isGlobalWeekend
  const hasHolidays = holidayLocations.length > 0

  const ariaLabel = (() => {
    let label = `${dayInfo.dateISO}`
    if (isWeekend) label += " - Weekend"
    if (hasHolidays) {
      label += ` - ${holidayLocations.length} holiday${holidayLocations.length > 1 ? "s" : ""}`
    }
    if (isVacationSelected) label += " - Vacation planned"
    return label
  })()

  const cellBackground = isWeekend ? "var(--calendar-weekend-bg)" : "var(--calendar-cell-bg)"

  const showDragAddPreview = isBeingDragged && !isVacationSelected && dragMode === "add"
  const showDragRemovePreview = isBeingDragged && isVacationSelected && dragMode === "remove"

  const showShiftAddPreview = isInShiftPreview && !isVacationSelected
  const showShiftRemovePreview = isInShiftPreview && isVacationSelected

  const animationClass =
    animationMode === "add" ? "vacation-animate-select" : animationMode === "remove" ? "vacation-animate-deselect" : ""

  return (
    <div
      ref={cellRef}
      className={`text-center text-xs cursor-pointer transition-colors ${
        isSelected && !isVacationMode ? "ring-2 ring-sky-500 ring-inset" : ""
      } ${isRangeStart ? "ring-2 ring-amber-500 ring-inset" : ""} ${animationClass}`}
      style={{
        ...baseStyle,
        backgroundColor: cellBackground || undefined,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={dayInfo.isValid ? 0 : -1}
      role="gridcell"
      aria-label={ariaLabel}
      aria-selected={isSelected}
    >
      {hasHolidays && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <HolidayPieMarker holidays={holidayLocations} isWeekend={isWeekend} />
        </div>
      )}

      {holidayLocations.length === 1 && holidayLocations[0].halfDay && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50" />
      )}

      {showDragAddPreview && <div className="vacation-drag-preview-add" />}
      {showDragRemovePreview && <div className="vacation-drag-preview-remove" />}

      {showShiftAddPreview && <div className="vacation-shift-preview-add" />}
      {showShiftRemovePreview && <div className="vacation-shift-preview-remove" />}

      {isVacationSelected && !showDragRemovePreview && !showShiftRemovePreview && (
        <>
          <div
            className={`absolute inset-0 pointer-events-none ${animationMode === "add" ? "vacation-animate-range" : ""}`}
            style={{
              border: "2px solid var(--primary)",
              boxSizing: "border-box",
            }}
          />
          <div
            className="absolute top-0.5 right-0.5 w-3 h-3 flex items-center justify-center rounded-sm"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <svg viewBox="0 0 24 24" className="w-2 h-2 text-primary-foreground" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        </>
      )}
    </div>
  )
}
