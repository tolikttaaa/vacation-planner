# Implementation Details

This document describes the technical architecture and implementation decisions for the Vacation Planner application.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## How to Use

1. Choose holiday calendars in the Holiday calendars panel to browse holidays in overview mode.
2. Add a person in the Vacation Planning panel and assign a calendar.
3. Click Plan Vacation on a person to enter their planning mode.
4. Select days on the calendar (click to toggle, shift+click for ranges, or drag to paint).
5. Review the required vs. excluded days in the person panel, and use the day details panel for holiday context.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui
- **Data Source**: Nager.Date Public Holiday API
- **State**: React hooks with localStorage persistence

## Development Notes

- **LocalStorage reset**: Clear `localStorage` if you need a fresh state or change persisted schema.
- **Holiday data caching**: Year/location data is cached in memory to reduce API calls during navigation.
- **PNG export**: The export button uses the current viewport layout, so test at target sizes before sharing.

## Architecture Overview

```
lib/
├── types.ts                    # TypeScript interfaces and type definitions
├── european-locations.ts       # Location definitions with Nager.Date API codes
├── holiday-service.ts          # API client for fetching public holidays
├── custom-calendar-service.ts  # Custom calendar CRUD operations
├── vacation-manager.ts         # Vacation selection and calculation logic
├── color-manager.ts            # Dynamic color assignment algorithm
├── theme-context.tsx           # React context for light/dark theme
├── constants.ts                # App-wide labels and storage keys
├── date-utils.ts               # Shared date helpers (ISO, ranges, weekdays)
└── storage.ts                  # localStorage helpers with legacy migration

components/holiday-calendar/
├── index.tsx                   # Main orchestrator component
├── constants.ts                # Layout tokens for the main panels
├── controls-panel.tsx          # App-level controls and selection UI
├── calendar-panel.tsx          # Calendar grid + loading/empty states
├── footer-note.tsx             # Data source attribution
├── calendar-grid.tsx           # 12x31 grid with drag selection
├── calendar-cell.tsx           # Individual day cell (unused, logic merged into grid)
├── holiday-pie-marker.tsx      # SVG pie chart for multi-holiday days
├── location-selector.tsx       # Country/region picker with search
├── custom-calendar-manager.tsx # Dialog for creating/editing custom calendars
├── person-panel.tsx            # Person cards and per-person planning actions
├── vacation-toolbar.tsx        # Controls for vacation mode
├── vacation-results-panel.tsx  # Summary table with interval breakdown
├── vacation-mode-toggle.tsx    # Toggle button for vacation selection mode
├── legend.tsx                  # Color legend for selected locations
├── year-selector.tsx           # Year navigation controls
├── theme-toggle.tsx            # Light/dark/system theme switcher
├── png-export-button.tsx       # PNG export functionality
├── day-detail-panel.tsx        # Expandable details for selected day
├── smart-tooltip.tsx           # Position-aware tooltip
├── vacation-background.tsx     # Decorative SVG background pattern
└── hooks/
    ├── use-calendar-state.ts   # Persisted selection state
    ├── use-holiday-data.ts     # Year data fetching
    └── use-vacation-state.ts   # Vacation selection + summary
```

## Key Implementation Details

### 1. Dynamic Color Assignment (`lib/color-manager.ts`)

Colors are computed at runtime using a golden-angle HSL distribution algorithm:

1. Generate candidate colors evenly distributed around the color wheel
2. Apply greedy selection to maximize perceptual distance between colors
3. Adjust saturation/lightness based on current theme (light vs dark mode)
4. Compute contrast-safe text colors for badges using WCAG luminance formula

```typescript
// Golden angle provides optimal distribution
const goldenAngle = 137.508
hue = (index * goldenAngle) % 360
```

### 2. Holiday Data Fetching (`lib/holiday-service.ts`)

- Uses the free Nager.Date API (https://date.nager.at)
- Implements caching to avoid redundant API calls
- Filters regional holidays by subdivision code (e.g., DE-BY for Bavaria)
- Handles API errors gracefully with fallback empty arrays

### 3. Vacation Calculation (`lib/vacation-manager.ts`)

The `computeVacationSummary` function:

1. Takes selected vacation dates and active locations
2. For each location, categorizes each date as:
   - **Required**: Working day that needs a vacation day
   - **Excluded (Weekend)**: Saturday/Sunday based on location's weekend rule
   - **Excluded (Holiday)**: Public holiday for that location
3. Groups consecutive dates into intervals for cleaner display
4. Returns per-location breakdown with min/max summary

### 4. Interval Grouping Algorithm

Uses timezone-safe date arithmetic to group consecutive dates:

```typescript
function getNextDayISO(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + 1)
  // Format using local values to avoid UTC shift
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
```

### 5. Drag Selection (`calendar-grid.tsx`)

- **Mouse down** records start position
- **Mouse move** after 5px threshold initiates drag mode
- **Drag operation mode** (add/remove) determined by initial cell state
- **Live preview** shows dashed borders on cells that will be affected
- **Mouse up** commits the selection by calling `toggleVacationDates`

### 6. Person-Centric Planning

- Each person has a single assigned calendar (official or custom).
- Vacation selections and summaries are stored per person.
- Overview mode allows browsing holiday data without selecting a person.
- The calendar grid highlights days that include any person on vacation and the day detail panel lists those people.
- Legend markers document multi-holiday days, selected days, and vacation states.

### 7. Theme System (`lib/theme-context.tsx`)

- Stores preference in localStorage
- Supports "light", "dark", and "system" modes
- System mode uses `prefers-color-scheme` media query
- Applies `.dark` class to `<html>` element for Tailwind dark mode

### 8. Custom Calendar JSON Schema

```typescript
interface CustomCalendar {
  meta: {
    id: string            // Unique identifier
    name: string          // Display name
    description?: string  // Optional description
    timezone?: string     // Optional timezone
    defaultColor: string  // Base color (overridden by dynamic assignment)
  }
  rules?: {
    weekend?: string[]    // Day names, e.g. ["SATURDAY", "SUNDAY"]
  }
  holidays: Array<{
    date: string          // ISO format: "YYYY-MM-DD"
    name: string          // Holiday name
    type: string          // PUBLIC_HOLIDAY | OBSERVANCE | COMPANY_HOLIDAY | OTHER
    halfDay?: boolean     // Optional half-day flag
    notes?: string        // Optional notes
  }>
}
```

### 9. CSS Variables for Theming

All colors are defined as CSS variables in `globals.css`:

```css
:root {
  --calendar-bg: #ffffff;
  --calendar-cell-bg: #f9fafb;
  --calendar-weekend-bg: #e5e7eb;
  --calendar-grid-line: #e5e7eb;
  /* ... */
}

.dark {
  --calendar-bg: oklch(0.18 0.01 250);
  --calendar-cell-bg: oklch(0.22 0.01 250);
  /* ... */
}
```

### 10. Performance Considerations

- **Memoization**: Heavy computations wrapped in `useMemo`
- **Lazy loading**: Holiday data fetched on-demand per year/location
- **Efficient re-renders**: Grid cells only update when their specific state changes
- **localStorage batching**: State persisted on change, not on every keystroke

## API Reference

### Nager.Date API

```
GET https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}

Response: Array<{
  date: string
  localName: string
  name: string
  countryCode: string
  counties: string[] | null  // Regional subdivision codes
  types: string[]
}>
```

## Browser Support

- Modern browsers with ES2020+ support
- CSS Grid and Flexbox
- CSS Custom Properties (variables)
- LocalStorage API
