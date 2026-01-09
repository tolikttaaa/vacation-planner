"use client"

import type { DayLocationInfo } from "@/lib/types"

interface HolidayPieMarkerProps {
  holidays: DayLocationInfo[]
  isWeekend?: boolean
}

export function HolidayPieMarker({ holidays, isWeekend = false }: HolidayPieMarkerProps) {
  if (holidays.length === 0) return null

  const sizeVar = isWeekend ? "var(--marker-size-weekend)" : "var(--marker-size-workday)"

  if (holidays.length === 1) {
    return (
      <div
        className="rounded-full"
        style={{
          width: sizeVar,
          height: sizeVar,
          backgroundColor: holidays[0].color,
        }}
      />
    )
  }

  if (holidays.length <= 8) {
    const total = holidays.length
    let currentAngle = -90

    return (
      <svg className="drop-shadow-sm" style={{ width: sizeVar, height: sizeVar }} viewBox="0 0 24 24">
        {holidays.map((holiday, index) => {
          const sliceAngle = 360 / total
          const startAngle = currentAngle
          const endAngle = currentAngle + sliceAngle
          currentAngle = endAngle

          const startRad = (startAngle * Math.PI) / 180
          const endRad = (endAngle * Math.PI) / 180
          const x1 = 12 + 11 * Math.cos(startRad)
          const y1 = 12 + 11 * Math.sin(startRad)
          const x2 = 12 + 11 * Math.cos(endRad)
          const y2 = 12 + 11 * Math.sin(endRad)

          const largeArc = sliceAngle > 180 ? 1 : 0

          return (
            <path
              key={holiday.locationId + index}
              d={`M12,12 L${x1},${y1} A11,11 0 ${largeArc},1 ${x2},${y2} Z`}
              fill={holiday.color}
            />
          )
        })}
      </svg>
    )
  }

  return (
    <svg className="drop-shadow-sm" style={{ width: sizeVar, height: sizeVar }} viewBox="0 0 24 24">
      {holidays.slice(0, 8).map((holiday, i) => {
        const startAngle = (i * 360) / 8 - 90
        const endAngle = ((i + 1) * 360) / 8 - 90
        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180
        const x1 = 12 + 11 * Math.cos(startRad)
        const y1 = 12 + 11 * Math.sin(startRad)
        const x2 = 12 + 11 * Math.cos(endRad)
        const y2 = 12 + 11 * Math.sin(endRad)
        return <path key={i} d={`M12,12 L${x1},${y1} A11,11 0 0,1 ${x2},${y2} Z`} fill={holiday.color} />
      })}
      {/* Center circle with count */}
      <circle cx="12" cy="12" r="5" fill="var(--calendar-cell-bg)" />
      <text x="12" y="14.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill="var(--foreground)">
        {holidays.length}
      </text>
    </svg>
  )
}
