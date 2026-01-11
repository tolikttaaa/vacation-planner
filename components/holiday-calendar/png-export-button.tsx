"use client"

import { useState, useCallback } from "react"
import { ImageDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toPng } from "html-to-image"
import { logger } from "@/lib/logger"

interface PngExportButtonProps {
  getGridElement: () => HTMLElement | null
  year: number
  disabled?: boolean
  size?: "sm" | "default" | "lg"
}

export function PngExportButton({ getGridElement, year, disabled, size = "sm" }: PngExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  // Render the current grid to a PNG image and download it.
  const handleExport = useCallback(async () => {
    const element = getGridElement()
    if (!element) return

    setIsExporting(true)
    const scrollContainers = Array.from(element.querySelectorAll<HTMLElement>("[data-calendar-scroll]"))
    const originalScrollStyles = scrollContainers.map((container) => ({
      container,
      overflowX: container.style.overflowX,
      overflowY: container.style.overflowY,
      maxWidth: container.style.maxWidth,
    }))
    scrollContainers.forEach((container) => {
      container.style.overflowX = "visible"
      container.style.overflowY = "visible"
      container.style.maxWidth = "none"
      container.scrollLeft = 0
    })
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
      link.download = `vacation-planner-calendar-${year}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      logger.error("Failed to export PNG:", error)
    } finally {
      originalScrollStyles.forEach(({ container, overflowX, overflowY, maxWidth }) => {
        container.style.overflowX = overflowX
        container.style.overflowY = overflowY
        container.style.maxWidth = maxWidth
      })
      setIsExporting(false)
    }
  }, [getGridElement, year])

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleExport}
      disabled={disabled || isExporting}
      className="gap-1.5 bg-transparent"
    >
      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageDown className="w-4 h-4" />}
      <span>Export PNG</span>
    </Button>
  )
}
