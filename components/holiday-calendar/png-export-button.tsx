"use client"

import { useState, useCallback } from "react"
import { ImageDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toPng } from "html-to-image"

interface PngExportButtonProps {
  getGridElement: () => HTMLElement | null
  year: number
  disabled?: boolean
}

export function PngExportButton({ getGridElement, year, disabled }: PngExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = useCallback(async () => {
    const element = getGridElement()
    if (!element) return

    setIsExporting(true)
    try {
      // Remove hover highlights before export
      const highlightedElements = element.querySelectorAll(
        ".calendar-row-highlight, .calendar-col-highlight, .calendar-cell-highlight",
      )
      highlightedElements.forEach((el) => {
        el.classList.remove("calendar-row-highlight", "calendar-col-highlight", "calendar-cell-highlight")
      })

      const dataUrl = await toPng(element, {
        backgroundColor: "var(--calendar-bg)",
        pixelRatio: 2,
        cacheBust: true,
      })

      const link = document.createElement("a")
      link.download = `holiday-calendar-${year}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Failed to export PNG:", error)
    } finally {
      setIsExporting(false)
    }
  }, [getGridElement, year])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isExporting}
      className="gap-1.5 bg-transparent"
    >
      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageDown className="w-4 h-4" />}
      <span>Export PNG</span>
    </Button>
  )
}
