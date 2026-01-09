"use client"

import type React from "react"

import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react"
import type { DayInfo, LocationConfig, CustomCalendar } from "@/lib/types"
import { DayDetailPanel } from "./day-detail-panel"
import { HolidayPieMarker } from "./holiday-pie-marker"

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
}

interface CalendarGridRef {
  getGridElement: () => HTMLDivElement | null
}

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

function getDatesBetween(startISO: string, endISO: string): string[] {
  const dates: string[] = []
  const start = new Date(startISO)
  const end = new Date(endISO)

  if (start > end) {
    const temp = new Date(start)
    start.setTime(end.getTime())
    end.setTime(temp.getTime())
  }

  const current = new Date(start)
  while (current <= end) {
    dates.push(current.toISOString().split("T")[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}

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
  },
  ref,
) {
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null)
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

  useImperativeHandle(ref, () => ({
    getGridElement: () => gridRef.current,
  }))

  const handleDaySelect = useCallback((dayInfo: DayInfo) => {
    setSelectedDay((prev) => (prev?.dateISO === dayInfo.dateISO ? null : dayInfo))
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedDay(null)
  }, [])

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

  const handleCellHover = useCallback((month: number | null, day: number | null) => {
    if (month === null || day === null) {
      setHoveredCell(null)
    } else {
      setHoveredCell({ month, day })
    }
  }, [])

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
          gridTemplateColumns: "100px repeat(31, 1fr)",
          backgroundColor: "var(--calendar-bg)",
        }}
      >
        {/* Header row */}
        <div
          className="sticky left-0 z-20 px-3 py-3 text-left font-semibold text-sm flex items-center"
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
            className={`py-3 text-center font-semibold text-sm flex items-center justify-center ${
              hoveredCell?.day === i + 1 ? "calendar-col-highlight" : ""
            }`}
            style={{
              color: "var(--calendar-header-text)",
              backgroundColor: hoveredCell?.day === i + 1 ? undefined : "var(--calendar-header-bg)",
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
          <>
            <div
              key={`${month}-label`}
              className={`sticky left-0 z-10 px-3 py-2 font-medium text-sm flex items-center ${
                hoveredCell?.month === monthIndex ? "calendar-row-highlight" : ""
              }`}
              style={{
                backgroundColor: hoveredCell?.month === monthIndex ? undefined : "var(--calendar-month-bg)",
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

              const isInHighlightedRow = hoveredCell?.month === monthIndex
              const isInHighlightedCol = hoveredCell?.day === day
              const isHighlightedCell = isInHighlightedRow && isInHighlightedCol

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
                  isInHighlightedRow={isInHighlightedRow}
                  isInHighlightedCol={isInHighlightedCol}
                  isHighlightedCell={isHighlightedCell}
                />
              )
            })}
          </>
        ))}
      </div>

      {!isVacationMode && <DayDetailPanel dayInfo={selectedDay} onClose={handleClosePanel} />}
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
  isInHighlightedRow?: boolean
  isInHighlightedCol?: boolean
  isHighlightedCell?: boolean
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
  isInHighlightedRow = false,
  isInHighlightedCol = false,
  isHighlightedCell = false,
}: GridCalendarCellProps) {
  const cellRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!dayInfo?.isValid || !isVacationMode) return
      if (e.button !== 0) return
      e.preventDefault()
      onDragStart?.(dayInfo.dateISO, isVacationSelected, e)
    },
    [dayInfo, isVacationMode, isVacationSelected, onDragStart],
  )

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
    aspectRatio: "1 / 1",
    position: "relative",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--calendar-grid-line)",
    overflow: "hidden",
  }

  if (!dayInfo || !dayInfo.isValid) {
    return (
      <div
        className={`text-center text-xs ${isInHighlightedRow || isInHighlightedCol ? "calendar-col-highlight" : ""}`}
        style={{
          ...baseStyle,
          background:
            isInHighlightedRow || isInHighlightedCol
              ? undefined
              : `repeating-linear-gradient(
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
        {!(isInHighlightedRow || isInHighlightedCol) && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 32 32"
            preserveAspectRatio="none"
          >
            <line x1="4" y1="4" x2="28" y2="28" stroke="var(--invalid-cross)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="28" y1="4" x2="4" y2="28" stroke="var(--invalid-cross)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
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

  let cellBackground: string
  if (isHighlightedCell) {
    cellBackground = ""
  } else if (isInHighlightedRow || isInHighlightedCol) {
    cellBackground = ""
  } else {
    cellBackground = isWeekend ? "var(--calendar-weekend-bg)" : "var(--calendar-cell-bg)"
  }

  const showDragAddPreview = isBeingDragged && !isVacationSelected && dragMode === "add"
  const showDragRemovePreview = isBeingDragged && isVacationSelected && dragMode === "remove"

  const showShiftAddPreview = isInShiftPreview && !isVacationSelected
  const showShiftRemovePreview = isInShiftPreview && isVacationSelected

  const animationClass =
    animationMode === "add" ? "vacation-animate-select" : animationMode === "remove" ? "vacation-animate-deselect" : ""

  const highlightClass = isHighlightedCell
    ? "calendar-cell-highlight"
    : isInHighlightedRow || isInHighlightedCol
      ? "calendar-col-highlight"
      : ""

  return (
    <div
      ref={cellRef}
      className={`text-center text-xs cursor-pointer transition-colors ${
        isSelected && !isVacationMode ? "ring-2 ring-primary ring-inset" : ""
      } ${isRangeStart ? "ring-2 ring-amber-500 ring-inset" : ""} ${animationClass} ${highlightClass}`}
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
