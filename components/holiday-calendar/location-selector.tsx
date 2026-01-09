"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Check, ChevronDown, ChevronRight, Search, X } from "lucide-react"
import type { LocationConfig } from "@/lib/types"
import { getLocationsByCountry } from "@/lib/european-locations"

interface LocationSelectorProps {
  locations: LocationConfig[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  colorMap: Map<string, string>
}

export function LocationSelector({ locations, selectedIds, onSelectionChange, colorMap }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  const getColor = (id: string) => {
    if (selectedIds.includes(id)) {
      return colorMap.get(id) || "#6b7280"
    }
    return "#9ca3af" // Neutral gray for unselected
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Group locations by country
  const groupedLocations = useMemo(() => {
    const grouped = getLocationsByCountry()

    if (!search) return grouped

    // Filter by search
    const filtered = new Map<string, LocationConfig[]>()
    const searchLower = search.toLowerCase()

    grouped.forEach((locs, countryName) => {
      const matchingLocs = locs.filter(
        (loc) => loc.name.toLowerCase().includes(searchLower) || loc.countryCode.toLowerCase().includes(searchLower),
      )
      if (matchingLocs.length > 0) {
        filtered.set(countryName, matchingLocs)
      }
    })

    return filtered
  }, [search])

  const toggleLocation = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  const toggleCountryExpand = (countryName: string) => {
    const newExpanded = new Set(expandedCountries)
    if (newExpanded.has(countryName)) {
      newExpanded.delete(countryName)
    } else {
      newExpanded.add(countryName)
    }
    setExpandedCountries(newExpanded)
  }

  const selectAllInCountry = (countryName: string) => {
    const countryLocs = groupedLocations.get(countryName) || []
    const countryIds = countryLocs.map((l) => l.id)
    const allSelected = countryIds.every((id) => selectedIds.includes(id))

    if (allSelected) {
      onSelectionChange(selectedIds.filter((id) => !countryIds.includes(id)))
    } else {
      const newIds = new Set([...selectedIds, ...countryIds])
      onSelectionChange(Array.from(newIds))
    }
  }

  const selectedLocations = locations.filter((loc) => selectedIds.includes(loc.id))

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg shadow-sm hover:bg-muted transition-colors min-w-[200px]"
      >
        <span className="flex-1 text-left text-sm text-foreground">
          {selectedIds.length === 0
            ? "Select locations..."
            : `${selectedIds.length} location${selectedIds.length > 1 ? "s" : ""} selected`}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg z-50">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries or regions..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-1">
            {Array.from(groupedLocations.entries()).map(([countryName, countryLocs]) => {
              const hasRegions = countryLocs.length > 1
              const isExpanded = expandedCountries.has(countryName) || search.length > 0
              const countryLoc = countryLocs.find((l) => l.type === "country")
              const regions = countryLocs.filter((l) => l.type === "region")
              const allRegionsSelected = regions.length > 0 && regions.every((r) => selectedIds.includes(r.id))

              return (
                <div key={countryName} className="mb-1">
                  <div className="flex items-center">
                    {hasRegions && (
                      <button onClick={() => toggleCountryExpand(countryName)} className="p-1 hover:bg-muted rounded">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    )}

                    {countryLoc && (
                      <button
                        onClick={() => toggleLocation(countryLoc.id)}
                        className="flex-1 flex items-center gap-2 px-2 py-1.5 text-left hover:bg-muted rounded-md transition-colors"
                      >
                        <div
                          className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: getColor(countryLoc.id),
                            backgroundColor: selectedIds.includes(countryLoc.id)
                              ? getColor(countryLoc.id)
                              : "transparent",
                          }}
                        >
                          {selectedIds.includes(countryLoc.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium text-foreground">{countryLoc.name}</span>
                        {selectedIds.includes(countryLoc.id) && (
                          <div
                            className="w-3 h-3 rounded-full ml-auto flex-shrink-0"
                            style={{ backgroundColor: getColor(countryLoc.id) }}
                          />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Regions */}
                  {hasRegions && isExpanded && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {regions.length > 1 && (
                        <button
                          onClick={() => selectAllInCountry(countryName)}
                          className="text-xs text-primary hover:text-primary/80 px-2 py-1"
                        >
                          {allRegionsSelected ? "Deselect all regions" : "Select all regions"}
                        </button>
                      )}
                      {regions.map((region) => (
                        <button
                          key={region.id}
                          onClick={() => toggleLocation(region.id)}
                          className="flex items-center gap-2 w-full px-2 py-1 text-left hover:bg-muted rounded-md transition-colors"
                        >
                          <div
                            className="w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0"
                            style={{
                              borderColor: getColor(region.id),
                              backgroundColor: selectedIds.includes(region.id) ? getColor(region.id) : "transparent",
                            }}
                          >
                            {selectedIds.includes(region.id) && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="text-xs text-muted-foreground">{region.name.split(" — ")[1]}</span>
                          {selectedIds.includes(region.id) && (
                            <div
                              className="w-2.5 h-2.5 rounded-full ml-auto flex-shrink-0"
                              style={{ backgroundColor: getColor(region.id) }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {groupedLocations.size === 0 && (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">No locations found</p>
            )}
          </div>
        </div>
      )}

      {/* Selected locations chips - use dynamic colors */}
      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedLocations.slice(0, 5).map((location) => (
            <span
              key={location.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full text-white"
              style={{ backgroundColor: colorMap.get(location.id) || "#6b7280" }}
            >
              {location.name.length > 20
                ? location.name.split(" — ")[1] || location.name.slice(0, 15) + "..."
                : location.name}
              <button onClick={() => toggleLocation(location.id)} className="hover:bg-white/20 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedLocations.length > 5 && (
            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
              +{selectedLocations.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  )
}
