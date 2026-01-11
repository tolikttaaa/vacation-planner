"use client"

import {
  Calendar,
  Palmtree,
  Sun,
  Cloud,
  Waves,
  Luggage,
  Plane,
  Anchor,
  MapPin,
  Compass,
} from "lucide-react"

// Seamless, non-overlapping icon pattern for the dashboard background.
export function VacationBackground() {
  const viewWidth = 2000
  const viewHeight = 1200
  const columns = 18
  const rows = 10
  const cellWidth = viewWidth / columns
  const cellHeight = viewHeight / rows

  const seedRandom = (seed: number) => () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const rand = seedRandom(42)

  const icons = [Calendar, Palmtree, Sun, Cloud, Waves, Luggage, Plane, Anchor, MapPin, Compass]

  const placements = [] as Array<{ x: number; y: number; iconIndex: number; scale: number }>
  const grid: number[][] = Array.from({ length: rows }, () => Array.from({ length: columns }, () => -1))

  const pickIconIndex = (row: number, col: number) => {
    const forbidden = new Set<number>()
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const r = row + dy
        const c = col + dx
        if (r < 0 || r >= rows || c < 0 || c >= columns) continue
        const neighbor = grid[r][c]
        if (neighbor !== -1) forbidden.add(neighbor)
      }
    }

    const candidates = icons.map((_, index) => index).filter((index) => !forbidden.has(index))
    if (candidates.length === 0) return Math.floor(rand() * icons.length)
    return candidates[Math.floor(rand() * candidates.length)]
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const paddingX = cellWidth * 0.2
      const paddingY = cellHeight * 0.2
      const x = col * cellWidth + paddingX + rand() * (cellWidth - paddingX * 2)
      const y = row * cellHeight + paddingY + rand() * (cellHeight - paddingY * 2)
      const iconIndex = pickIconIndex(row, col)
      const scale = 0.9 + rand() * 0.25

      grid[row][col] = iconIndex
      placements.push({ x, y, iconIndex, scale })
    }
  }

  const renderPattern = (
    background: string,
    coolColor: string,
    warmColor: string,
    coolOpacity: number,
    warmOpacity: number,
  ) => (
    <svg
      className="w-full h-full"
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="100%" height="100%" fill={background} />
      {placements.map((placement, index) => {
        const Icon = icons[placement.iconIndex]
        const warmAccent = (placement.x + placement.y + index) % 9 === 0
        const color = warmAccent ? `rgba(${warmColor}, ${warmOpacity})` : `rgba(${coolColor}, ${coolOpacity})`

        return (
          <g
            key={`${placement.x}-${placement.y}-${index}`}
            transform={`translate(${placement.x} ${placement.y}) scale(${placement.scale})`}
            style={{ color }}
          >
            <Icon width={32} height={32} />
          </g>
        )
      })}
    </svg>
  )

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="h-full w-full block dark:hidden">
        {renderPattern("#f7f9fa", "79, 185, 97", "79, 185, 97", 0.16, 0.2)}
      </div>
      <div className="h-full w-full hidden dark:block">
        {renderPattern("#0b0d0f", "79, 185, 97", "79, 185, 97", 0.18, 0.22)}
      </div>
    </div>
  )
}
