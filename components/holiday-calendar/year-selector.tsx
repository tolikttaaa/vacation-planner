"use client"

import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

interface YearSelectorProps {
  year: number
  onYearChange: (year: number) => void
}

export function YearSelector({ year, onYearChange }: YearSelectorProps) {
  // Year paging with a centered select list.
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onYearChange(year - 1)}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        aria-label="Previous year"
      >
        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
      </button>

      <div className="relative">
        <select
          value={year}
          onChange={(e) => onYearChange(Number.parseInt(e.target.value))}
          className="appearance-none pr-9 pl-4 py-2 text-lg font-semibold bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
        >
          {Array.from({ length: 11 }, (_, i) => year - 5 + i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      <button
        onClick={() => onYearChange(year + 1)}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        aria-label="Next year"
      >
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  )
}
