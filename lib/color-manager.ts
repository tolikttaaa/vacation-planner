/**
 * ColorManager - Dynamic color assignment for maximally distinct colors
 *
 * This module assigns colors at runtime when calendars are selected,
 * choosing colors that are maximally distinguishable among active calendars.
 *
 * Algorithm: HSL/OKLCH spacing with golden angle distribution
 * - Generate N colors by spacing hue evenly using golden angle (~137.5°)
 * - Controlled saturation/lightness tuned per theme (light vs dark)
 * - Colors are recomputed when the active set changes
 * - Contrast-safe text colors computed via relative luminance
 */

export interface ColorAssignment {
  id: string
  color: string
}

// OKLCH-like color distance approximation using HSL
// Higher values = more different colors
function colorDistance(hsl1: [number, number, number], hsl2: [number, number, number]): number {
  // Hue distance (circular, 0-180 range)
  const hueDiff = Math.min(Math.abs(hsl1[0] - hsl2[0]), 360 - Math.abs(hsl1[0] - hsl2[0]))
  const normalizedHueDiff = hueDiff / 180

  // Saturation and lightness distances (0-1 range)
  const satDiff = Math.abs(hsl1[1] - hsl2[1])
  const lightDiff = Math.abs(hsl1[2] - hsl2[2])

  // Weighted Euclidean distance - hue is most important for distinction
  return Math.sqrt(normalizedHueDiff ** 2 * 2 + satDiff ** 2 + lightDiff ** 2)
}

// Convert HSL to hex string
function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100
  const lNorm = l / 100

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let r = 0,
    g = 0,
    b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Parse hex to HSL
function hexToHsl(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [0, 70, 50]

  const r = Number.parseInt(result[1], 16) / 255
  const g = Number.parseInt(result[2], 16) / 255
  const b = Number.parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [128, 128, 128]

  return [Number.parseInt(result[1], 16), Number.parseInt(result[2], 16), Number.parseInt(result[3], 16)]
}

/**
 * Calculate relative luminance per WCAG 2.0
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate contrast ratio between two colors per WCAG 2.0
 */
function getContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Get contrast-safe text color for a given background
 * Returns light (#fff) or dark (#111) text color based on luminance
 * Aims for WCAG AA compliance (4.5:1 for normal text)
 */
export function getContrastTextColor(bgColor: string): "#ffffff" | "#111111" {
  const rgb = hexToRgb(bgColor)
  const bgLuminance = getRelativeLuminance(rgb)

  // Compare contrast ratio with white vs black text
  const whiteLum = getRelativeLuminance([255, 255, 255])
  const blackLum = getRelativeLuminance([17, 17, 17]) // #111

  const contrastWithWhite = getContrastRatio(bgLuminance, whiteLum)
  const contrastWithBlack = getContrastRatio(bgLuminance, blackLum)

  // Choose the color with better contrast
  return contrastWithWhite >= contrastWithBlack ? "#ffffff" : "#111111"
}

/**
 * Adjust color lightness to ensure it's theme-safe
 * Light mode: avoid too light colors (L > 75)
 * Dark mode: avoid too dark colors (L < 35)
 */
export function ensureThemeSafeColor(hex: string, theme: "light" | "dark"): string {
  const [h, s, l] = hexToHsl(hex)

  if (theme === "light") {
    // In light mode, ensure colors aren't too light (hard to see on white)
    const adjustedL = Math.min(l, 55)
    const adjustedS = Math.max(s, 50) // Ensure adequate saturation
    return hslToHex(h, adjustedS, adjustedL)
  } else {
    // In dark mode, ensure colors aren't too dark (hard to see on dark bg)
    const adjustedL = Math.max(l, 50)
    const adjustedS = Math.max(s, 45) // Ensure adequate saturation
    return hslToHex(h, adjustedS, adjustedL)
  }
}

// Golden angle in degrees for optimal hue distribution
const GOLDEN_ANGLE = 137.508

// Theme-specific color parameters
interface ThemeColorParams {
  saturation: number
  lightness: number
  saturationVariance: number
  lightnessVariance: number
  minLightness: number
  maxLightness: number
}

const THEME_PARAMS: Record<"light" | "dark", ThemeColorParams> = {
  light: {
    saturation: 70,
    lightness: 45, // Lower for better visibility on white
    saturationVariance: 15,
    lightnessVariance: 8,
    minLightness: 35,
    maxLightness: 55,
  },
  dark: {
    saturation: 65,
    lightness: 58, // Higher for better visibility on dark
    saturationVariance: 10,
    lightnessVariance: 6,
    minLightness: 50,
    maxLightness: 68,
  },
}

// Generate candidate colors using golden angle distribution
function generateCandidateColors(count: number, theme: "light" | "dark"): [number, number, number][] {
  const params = THEME_PARAMS[theme]
  const colors: [number, number, number][] = []

  // Start with a random-ish offset but deterministic based on count
  const startHue = (count * 31) % 360

  for (let i = 0; i < count; i++) {
    const hue = (startHue + i * GOLDEN_ANGLE) % 360

    // Add slight variation to saturation/lightness for more distinction
    const satVariation = ((i % 3) - 1) * params.saturationVariance
    const lightVariation = ((i % 5) - 2) * params.lightnessVariance * 0.5

    const saturation = Math.max(40, Math.min(90, params.saturation + satVariation))
    const lightness = Math.max(params.minLightness, Math.min(params.maxLightness, params.lightness + lightVariation))

    colors.push([hue, saturation, lightness])
  }

  return colors
}

// Greedy selection of maximally distinct colors from candidates
function selectDistinctColors(candidates: [number, number, number][], count: number): [number, number, number][] {
  if (count === 0) return []
  if (count >= candidates.length) return candidates

  const selected: [number, number, number][] = []
  const remaining = [...candidates]

  // Pick first color (deterministic - always the first candidate)
  selected.push(remaining[0])
  remaining.splice(0, 1)

  // Greedily pick the color that maximizes minimum distance to selected colors
  while (selected.length < count && remaining.length > 0) {
    let bestIdx = 0
    let bestMinDist = -1

    for (let i = 0; i < remaining.length; i++) {
      let minDist = Number.POSITIVE_INFINITY
      for (const sel of selected) {
        const dist = colorDistance(remaining[i], sel)
        minDist = Math.min(minDist, dist)
      }
      if (minDist > bestMinDist) {
        bestMinDist = minDist
        bestIdx = i
      }
    }

    selected.push(remaining[bestIdx])
    remaining.splice(bestIdx, 1)
  }

  return selected
}

// Stable sort for deterministic ordering
function stableSortIds(ids: string[]): string[] {
  return [...ids].sort((a, b) => a.localeCompare(b))
}

/**
 * Assign maximally distinct colors to active calendars
 *
 * @param activeCalendarIds - Array of calendar IDs that are currently selected
 * @param theme - Current theme ("light" or "dark")
 * @returns Map of calendar ID to assigned hex color
 */
export function assignColors(activeCalendarIds: string[], theme: "light" | "dark"): Map<string, string> {
  const sortedIds = stableSortIds(activeCalendarIds)
  const count = sortedIds.length

  if (count === 0) {
    return new Map()
  }

  // Generate more candidates than needed for better selection
  const candidateCount = Math.max(count * 3, 24)
  const candidates = generateCandidateColors(candidateCount, theme)

  // Select the most distinct colors
  const selectedHsl = selectDistinctColors(candidates, count)

  // Map colors to calendar IDs
  const colorMap = new Map<string, string>()
  sortedIds.forEach((id, index) => {
    const hsl = selectedHsl[index]
    colorMap.set(id, hslToHex(hsl[0], hsl[1], hsl[2]))
  })

  return colorMap
}

/**
 * Get minimum color distance among a set of colors (for testing)
 */
export function getMinimumDistance(colors: string[]): number {
  if (colors.length < 2) return Number.POSITIVE_INFINITY

  let minDist = Number.POSITIVE_INFINITY
  const hslColors = colors.map(hexToHsl)

  for (let i = 0; i < hslColors.length; i++) {
    for (let j = i + 1; j < hslColors.length; j++) {
      const dist = colorDistance(hslColors[i], hslColors[j])
      minDist = Math.min(minDist, dist)
    }
  }

  return minDist
}

/**
 * Check if colors are sufficiently distinct (threshold ~0.3 for good visibility)
 */
export function areColorsDistinct(colors: string[], threshold = 0.25): boolean {
  return getMinimumDistance(colors) >= threshold
}
