"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, Upload, Check, HelpCircle, Copy, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CustomCalendar } from "@/lib/types"
import {
  loadCustomCalendars,
  addCustomCalendar,
  updateCustomCalendar,
  deleteCustomCalendar,
  validateCustomCalendar,
  EXAMPLE_CUSTOM_CALENDAR,
  createCalendarFromLocation,
  getAllLocationsForDropdown,
  type CustomCalendarValidationError,
} from "@/lib/custom-calendar-service"

interface CustomCalendarManagerProps {
  enabledCalendarIds: string[]
  onEnabledChange: (ids: string[]) => void
  onCalendarsChange: () => void
  colorMap: Map<string, string>
  year?: number
}

export function CustomCalendarManager({
  enabledCalendarIds,
  onEnabledChange,
  onCalendarsChange,
  colorMap,
  year = 2026,
}: CustomCalendarManagerProps) {
  const [calendars, setCalendars] = useState<CustomCalendar[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCalendar, setEditingCalendar] = useState<CustomCalendar | null>(null)
  const [jsonInput, setJsonInput] = useState("")
  const [errors, setErrors] = useState<CustomCalendarValidationError[]>([])
  const [showHelp, setShowHelp] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [allLocations] = useState(() => getAllLocationsForDropdown())

  useEffect(() => {
    setCalendars(loadCustomCalendars())
  }, [])

  const getColor = (calendarId: string) => {
    const fullId = `custom-${calendarId}`
    if (enabledCalendarIds.includes(fullId)) {
      return colorMap.get(fullId) || "#6b7280"
    }
    return "#9ca3af"
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setJsonInput(content)
      setErrors([])
    }
    reader.readAsText(file)
  }

  const handleLoadFromLocation = async (locationId: string) => {
    if (!locationId) return

    setIsLoadingLocation(true)
    setErrors([])

    try {
      const result = await createCalendarFromLocation(locationId, year)

      if (result.success && result.calendar) {
        setJsonInput(JSON.stringify(result.calendar, null, 2))
      } else {
        setErrors([{ field: "root", message: result.error || "Failed to load location data" }])
      }
    } catch (error) {
      setErrors([{ field: "root", message: `Error: ${error}` }])
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const handleValidateAndSave = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const result = validateCustomCalendar(parsed)

      if (!result.valid) {
        setErrors(result.errors)
        return
      }

      if (editingCalendar) {
        const updateResult = updateCustomCalendar(result.calendar!)
        if (!updateResult.success) {
          setErrors([{ field: "root", message: updateResult.error! }])
          return
        }
      } else {
        const addResult = addCustomCalendar(result.calendar!)
        if (!addResult.success) {
          setErrors([{ field: "root", message: addResult.error! }])
          return
        }
        onEnabledChange([...enabledCalendarIds, `custom-${result.calendar!.meta.id}`])
      }

      setCalendars(loadCustomCalendars())
      setIsDialogOpen(false)
      setJsonInput("")
      setErrors([])
      setEditingCalendar(null)
      onCalendarsChange()
    } catch {
      setErrors([{ field: "root", message: "Invalid JSON syntax" }])
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this calendar?")) {
      deleteCustomCalendar(id)
      setCalendars(loadCustomCalendars())
      onEnabledChange(enabledCalendarIds.filter((cid) => cid !== `custom-${id}`))
      onCalendarsChange()
    }
  }

  const handleEdit = (calendar: CustomCalendar) => {
    setEditingCalendar(calendar)
    setJsonInput(JSON.stringify(calendar, null, 2))
    setErrors([])
    setIsDialogOpen(true)
  }

  const handleDownloadJSON = (calendar: CustomCalendar) => {
    const json = JSON.stringify(calendar, null, 2)
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${calendar.meta.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const toggleCalendarEnabled = (calendarId: string) => {
    const fullId = `custom-${calendarId}`
    if (enabledCalendarIds.includes(fullId)) {
      onEnabledChange(enabledCalendarIds.filter((id) => id !== fullId))
    } else {
      onEnabledChange([...enabledCalendarIds, fullId])
    }
  }

  const copyExampleToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(EXAMPLE_CUSTOM_CALENDAR, null, 2))
  }

  const loadExample = () => {
    setJsonInput(JSON.stringify(EXAMPLE_CUSTOM_CALENDAR, null, 2))
    setErrors([])
  }

  const groupedLocations = allLocations.reduce(
    (acc, loc) => {
      const countryName = loc.name.split(" — ")[0]
      if (!acc[countryName]) {
        acc[countryName] = []
      }
      acc[countryName].push(loc)
      return acc
    },
    {} as Record<string, typeof allLocations>,
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Custom Calendars</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingCalendar(null)
                setJsonInput("")
                setErrors([])
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCalendar ? "Edit Custom Calendar" : "Add Custom Calendar"}</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="paste" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="paste">Paste JSON</TabsTrigger>
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="location">From Location</TabsTrigger>
              </TabsList>

              <TabsContent value="paste" className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button variant="ghost" size="sm" onClick={loadExample}>
                    Load Example
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowHelp(!showHelp)}>
                    <HelpCircle className="w-4 h-4 mr-1" />
                    {showHelp ? "Hide" : "Show"} Format Help
                  </Button>
                </div>

                {showHelp && (
                  <div className="bg-muted/50 rounded-lg p-4 text-xs space-y-2">
                    <p className="font-semibold text-foreground">JSON Format:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>
                        <strong>meta.id</strong>: Unique identifier (required)
                      </li>
                      <li>
                        <strong>meta.name</strong>: Display name (required)
                      </li>
                      <li>
                        <strong>meta.defaultColor</strong>: Hex color code (ignored - colors assigned dynamically)
                      </li>
                      <li>
                        <strong>rules.weekend</strong>: Array of day names (optional)
                      </li>
                      <li>
                        <strong>holidays[].date</strong>: YYYY-MM-DD format (required)
                      </li>
                      <li>
                        <strong>holidays[].name</strong>: Holiday name (required)
                      </li>
                      <li>
                        <strong>holidays[].type</strong>: PUBLIC_HOLIDAY | OBSERVANCE | COMPANY_HOLIDAY | OTHER
                      </li>
                      <li>
                        <strong>holidays[].halfDay</strong>: boolean (optional)
                      </li>
                    </ul>
                    <p className="text-muted-foreground italic mt-2">
                      Note: Colors are assigned dynamically for maximum distinction. The defaultColor field is kept for
                      compatibility but not used.
                    </p>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={copyExampleToClipboard}>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Example
                      </Button>
                    </div>
                  </div>
                )}

                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value)
                    setErrors([])
                  }}
                  placeholder="Paste your JSON here..."
                  className="w-full h-64 p-3 text-sm font-mono bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">Upload a .json file</p>
                  <Input type="file" accept=".json" onChange={handleFileUpload} className="max-w-xs mx-auto" />
                </div>

                {jsonInput && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <pre className="text-xs font-mono overflow-auto max-h-40 text-foreground">
                      {jsonInput.slice(0, 500)}...
                    </pre>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-3">
                      <Download className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Load from Existing Location</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Select a country or region to load its {year} holidays as a starting template. You can then
                          modify the generated JSON before saving.
                        </p>
                      </div>
                    </div>

                    <Select onValueChange={handleLoadFromLocation} disabled={isLoadingLocation}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a location..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {Object.entries(groupedLocations).map(([country, locations]) => (
                          <div key={country}>
                            {locations.length === 1 ? (
                              <SelectItem value={locations[0].id}>{locations[0].name}</SelectItem>
                            ) : (
                              <>
                                <SelectItem value={locations.find((l) => l.type === "country")?.id || locations[0].id}>
                                  {country}
                                </SelectItem>
                                {locations
                                  .filter((l) => l.type === "region")
                                  .map((loc) => (
                                    <SelectItem key={loc.id} value={loc.id} className="pl-6">
                                      {loc.name.split(" — ")[1]}
                                    </SelectItem>
                                  ))}
                              </>
                            )}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>

                    {isLoadingLocation && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading holidays for {year}...
                      </div>
                    )}
                  </div>

                  {jsonInput && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Generated JSON (edit as needed, then click Add Calendar):
                      </p>
                      <textarea
                        value={jsonInput}
                        onChange={(e) => {
                          setJsonInput(e.target.value)
                          setErrors([])
                        }}
                        className="w-full h-64 p-3 text-sm font-mono bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {errors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mt-4">
                <p className="text-sm font-medium text-destructive mb-2">Validation Errors:</p>
                <ul className="text-xs text-destructive/80 space-y-1">
                  {errors.map((error, i) => (
                    <li key={i}>
                      <strong>{error.field}:</strong> {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleValidateAndSave} disabled={!jsonInput}>
                {editingCalendar ? "Update" : "Add"} Calendar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* List of custom calendars */}
      {calendars.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No custom calendars added yet</p>
      ) : (
        <div className="space-y-2">
          {calendars.map((calendar) => {
            const isEnabled = enabledCalendarIds.includes(`custom-${calendar.meta.id}`)
            const color = getColor(calendar.meta.id)
            return (
              <div key={calendar.meta.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCalendarEnabled(calendar.meta.id)}
                    className="w-5 h-5 rounded border-2 flex items-center justify-center"
                    style={{
                      borderColor: color,
                      backgroundColor: isEnabled ? color : "transparent",
                    }}
                  >
                    {isEnabled && <Check className="w-3 h-3 text-white" />}
                  </button>
                  {isEnabled && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />}
                  <span className="text-sm text-foreground">{calendar.meta.name}</span>
                  <span className="text-xs text-muted-foreground">({calendar.holidays.length} holidays)</span>
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadJSON(calendar)}>
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download JSON</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(calendar)}>
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(calendar.meta.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
