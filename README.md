# Holiday Planner

A comprehensive vacation and holiday planning application built with Next.js that helps you visualize public holidays across multiple European countries and regions, plan your vacations, and calculate required leave days.

## Features

### Multi-Location Holiday Calendar
- **45+ European countries** with 80+ regional subdivisions (German states, Swiss cantons, Spanish autonomous communities, UK countries, etc.)
- **Real-time holiday data** from the Nager.Date API
- **Dynamic color assignment** using perceptually distinct colors computed at runtime
- **Light/Dark theme** support with carefully tuned color palettes

### Calendar Visualization
- **12-month grid view** showing all days of the year at a glance
- **Pie chart markers** for days with multiple holidays from different locations
- **Crosshair highlighting** to easily track row (month) and column (day)
- **Invalid date styling** with cross-hatched pattern for non-existent dates (Feb 30, etc.)

### Custom Calendars
- **Create your own calendars** with custom holidays and weekend rules
- **Import from existing locations** to use as a template
- **JSON import/export** for backup and sharing
- **Full validation** with helpful error messages

### Vacation Planning Mode
- **Click or drag to select** vacation days
- **Shift+click for range selection** with live preview
- **Per-region breakdown** showing required leave days vs. excluded days (weekends/holidays)
- **Interval grouping** displaying vacation periods as date ranges
- **Export to CSV** for use in other applications

### User Experience
- **Responsive design** with horizontal scrolling for smaller screens
- **Persistent state** via localStorage (selected locations, year, vacations, custom calendars)
- **Minimalist vacation-themed background** with line-art illustrations

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui
- **Data Source**: Nager.Date Public Holiday API
- **State**: React hooks with localStorage persistence

## License

MIT
