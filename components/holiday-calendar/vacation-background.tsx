"use client"

export function VacationBackground() {
  // Define all vacation-themed icons as SVG paths (outline only, no fill)
  const icons = {
    palmTree: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V14" />
        <path d="M12 14C12 14 8 12 4 14" />
        <path d="M12 14C12 14 16 12 20 14" />
        <path d="M12 14C12 14 9 8 4 6" />
        <path d="M12 14C12 14 15 8 20 6" />
        <path d="M12 14C12 14 12 6 12 2" />
      </g>
    ),
    sun: (
      <g strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2V4" />
        <path d="M12 20V22" />
        <path d="M4.93 4.93L6.34 6.34" />
        <path d="M17.66 17.66L19.07 19.07" />
        <path d="M2 12H4" />
        <path d="M20 12H22" />
        <path d="M4.93 19.07L6.34 17.66" />
        <path d="M17.66 6.34L19.07 4.93" />
      </g>
    ),
    wave: (
      <g strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 12C2 12 5 8 8 12C11 16 14 8 17 12C20 16 22 12 22 12" />
        <path d="M2 17C2 17 5 13 8 17C11 21 14 13 17 17C20 21 22 17 22 17" />
      </g>
    ),
    shell: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22C12 22 4 18 4 12C4 6 8 2 12 2C16 2 20 6 20 12C20 18 12 22 12 22Z" />
        <path d="M12 2V22" />
        <path d="M4 12C8 12 12 8 12 2" />
        <path d="M20 12C16 12 12 8 12 2" />
      </g>
    ),
    sunglasses: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="12" r="4" />
        <circle cx="18" cy="12" r="4" />
        <path d="M10 12H14" />
        <path d="M2 12H2.01" />
        <path d="M22 12H22.01" />
      </g>
    ),
    tropicalLeaf: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22C12 22 4 16 4 10C4 4 12 2 12 2C12 2 20 4 20 10C20 16 12 22 12 22Z" />
        <path d="M12 2V22" />
        <path d="M8 6L12 10" />
        <path d="M16 6L12 10" />
        <path d="M8 14L12 18" />
        <path d="M16 14L12 18" />
      </g>
    ),
    umbrella: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6 2 2 8 2 8H22C22 8 18 2 12 2Z" />
        <path d="M12 8V20" />
        <path d="M12 20C12 21 13 22 14 22" />
      </g>
    ),
    starfish: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L14 9L21 9L15.5 13L17.5 20L12 16L6.5 20L8.5 13L3 9L10 9L12 2Z" />
      </g>
    ),
    cocktail: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2L16 2L12 10L12 18" />
        <path d="M8 22H16" />
        <path d="M12 18V22" />
        <circle cx="16" cy="5" r="2" />
        <path d="M14 2L18 6" />
      </g>
    ),
    flipFlop: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="14" rx="6" ry="8" />
        <path d="M12 6V14" />
        <path d="M8 10L12 14L16 10" />
      </g>
    ),
    sailboat: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2V16" />
        <path d="M12 2L20 14H12" />
        <path d="M12 6L6 14H12" />
        <path d="M4 18H20" />
        <path d="M6 22H18" />
      </g>
    ),
    fish: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12C2 12 6 6 12 6C18 6 22 12 22 12C22 12 18 18 12 18C6 18 2 12 2 12Z" />
        <circle cx="16" cy="12" r="1" />
        <path d="M2 12L6 8V16L2 12Z" />
      </g>
    ),
    anchor: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3" />
        <path d="M12 8V22" />
        <path d="M5 18C5 18 8 22 12 22C16 22 19 18 19 18" />
        <path d="M8 12H16" />
      </g>
    ),
    cloud: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10H18.01C20.21 10 22 11.79 22 14C22 16.21 20.21 18 18 18H6C3.79 18 2 16.21 2 14C2 11.79 3.79 10 6 10H6.01" />
        <path d="M6 10C6 6.69 8.69 4 12 4C15.31 4 18 6.69 18 10" />
      </g>
    ),
    iceCream: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 17L8 22H16L12 17Z" />
        <circle cx="12" cy="10" r="7" />
        <path d="M9 8C9 8 10 6 12 6C14 6 15 8 15 8" />
      </g>
    ),
    camera: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <circle cx="12" cy="13" r="4" />
        <path d="M8 2L10 6H14L16 2" />
      </g>
    ),
    surfboard: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="12" rx="3" ry="10" />
        <path d="M12 6V18" />
        <path d="M9 9H15" />
      </g>
    ),
    seagull: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 10C2 10 6 6 12 10" />
        <path d="M22 10C22 10 18 6 12 10" />
      </g>
    ),
    coconut: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="14" r="8" />
        <ellipse cx="9" cy="12" rx="1.5" ry="2" />
        <ellipse cx="15" cy="12" rx="1.5" ry="2" />
        <ellipse cx="12" cy="16" rx="1.5" ry="2" />
      </g>
    ),
    hammock: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 8V16" />
        <path d="M22 8V16" />
        <path d="M2 10C2 10 8 18 12 18C16 18 22 10 22 10" />
        <path d="M2 14C2 14 8 22 12 22C16 22 22 14 22 14" />
      </g>
    ),
    pineapple: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="15" rx="5" ry="7" />
        <path d="M12 8V2" />
        <path d="M9 4L12 8L15 4" />
        <path d="M7 6L12 8L17 6" />
        <path d="M9 12L12 15L15 12" />
        <path d="M9 18L12 15L15 18" />
      </g>
    ),
    beachBall: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2C12 2 6 8 6 12C6 16 12 22 12 22" />
        <path d="M12 2C12 2 18 8 18 12C18 16 12 22 12 22" />
        <path d="M2 12H22" />
      </g>
    ),
    lighthouse: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 22H14" />
        <path d="M9 22L10 10H14L15 22" />
        <path d="M8 10H16" />
        <path d="M10 10V6H14V10" />
        <path d="M12 6V4" />
        <path d="M8 4H16" />
      </g>
    ),
    towel: (
      <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="1" />
        <path d="M4 8H20" />
        <path d="M4 12H20" />
        <path d="M4 16H20" />
      </g>
    ),
  }

  const iconKeys = Object.keys(icons) as (keyof typeof icons)[]

  // Seeded random for consistent render (mulberry32 algorithm)
  const seededRandom = (seed: number) => {
    return () => {
      let t = (seed += 0x6d2b79f5)
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  const random = seededRandom(42)

  const positions: { x: number; y: number; icon: number; rotation: number; scale: number }[] = []
  const numIcons = 100 // increased from 70
  const cellSize = 10 // reduced from 14 for tighter but non-overlapping grid
  const usedCells = new Set<string>()

  for (let i = 0; i < numIcons * 3 && positions.length < numIcons; i++) {
    const x = random() * 100 // Full 0-100% range
    const y = random() * 100 // Full 0-100% range
    const cellKey = `${Math.floor(x / cellSize)}-${Math.floor(y / cellSize)}`

    // Skip if cell already has an icon (simple collision avoidance)
    if (usedCells.has(cellKey)) continue
    usedCells.add(cellKey)

    positions.push({
      x,
      y,
      icon: Math.floor(random() * iconKeys.length),
      rotation: (random() - 0.5) * 30,
      scale: 0.12 + random() * 0.03, // slightly smaller: 0.12 to 0.15 to prevent edge clipping
    })
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <svg
        className="w-full h-full opacity-[0.10] dark:opacity-[0.07]"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.15"
      >
        {positions.map((pos, index) => {
          const iconKey = iconKeys[pos.icon]
          return (
            <g key={index} transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation}) scale(${pos.scale})`}>
              <g transform="translate(-12, -12)">{icons[iconKey]}</g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
