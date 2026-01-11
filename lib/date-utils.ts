// Shared date helpers for ISO formatting and range operations.

export function formatDateISO(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

export function getWeekdayName(dateISO: string, locale = "en-US"): string {
  const [year, month, day] = dateISO.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(locale, { weekday: "long" })
}

export function getNextDayISO(dateISO: string): string {
  const [year, month, day] = dateISO.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + 1)
  const nextYear = date.getFullYear()
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0")
  const nextDay = String(date.getDate()).padStart(2, "0")
  return `${nextYear}-${nextMonth}-${nextDay}`
}

export function getDatesBetween(startISO: string, endISO: string): string[] {
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
