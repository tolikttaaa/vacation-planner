"use client"

// Footer attribution for the data source.
export function FooterNote() {
  return (
    <div className="text-center text-xs text-muted-foreground pb-2">
      Holiday data provided by{" "}
      <a
        href="https://date.nager.at"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        Nager.Date API
      </a>
      . Covers all European countries with regional subdivisions where available.
    </div>
  )
}
