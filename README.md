![Vacation Planner Logo](public/img/VacationPlanner_LogoWithName.svg)

# Vacation Planner

A comprehensive vacation and holiday planning application built with Next.js that helps you visualize public holidays across multiple European countries and regions, plan your vacations, and calculate required leave days.

This is a personal pet project built by with AI agents (no manual coding).

## Features

### Multi-Location Holiday Calendar
- **45+ European countries** with 80+ regional subdivisions (German states, Swiss cantons, Spanish autonomous communities, UK countries, etc.)
- **Real-time holiday data** from the Nager.Date API
- **Dynamic color assignment** using perceptually distinct colors computed at runtime
- **Light/Dark theme** support with carefully tuned color palettes

### Calendar Visualization
- **12-month grid view** showing all days of the year at a glance
- **Pie chart markers** for days with multiple holidays from different locations
- **Fixed headers and legend** so month/day labels stay visible while scrolling the grid
- **Invalid date styling** with cross-hatched pattern for non-existent dates (Feb 30, etc.)
- **Adaptive cell sizing** with a minimum width and consistent row height

### Custom Calendars
- **Create your own calendars** with custom holidays and weekend rules
- **Import from existing locations** to use as a template
- **JSON import/export** for backup and sharing
- **Full validation** with helpful error messages

### Vacation Planning Mode
- **Person-based planning** with one calendar assigned per person
- **Multiple people support** with independent vacation plans and summaries
- **Overview mode** to browse holidays without selecting a person
- **Click or drag to select** vacation days
- **Shift+click for range selection** with live preview
- **Per-person breakdown** showing required leave days vs. excluded days (weekends/holidays)
- **Interval grouping** displaying vacation periods as date ranges
- **Shared vacation highlights** across the grid with per-day people listings in the detail panel

### User Experience
- **Responsive design** with horizontal grid scrolling while panels and detail sections remain fixed
- **Persistent state** via localStorage (selected locations, year, vacations, custom calendars)
- **Minimalist vacation-themed background** with line-art illustrations and themed panel styling
- **Legend enhancements** for vacation states and multi-holiday markers

## Implementation Guide

- [Implementation details and usage](IMPLEMENTATION.md)

## Stories

- [Logo creation story](docs/LOGO.md)

## Buy Me a Coffee

- Support the project: https://buymeacoffee.com/ttaaa
