// Lightweight localStorage helpers with legacy key fallback and JSON parsing.

export function readStorageValue(key: string, legacyKey?: string): string | null {
  if (typeof window === "undefined") return null

  const value = localStorage.getItem(key) ?? (legacyKey ? localStorage.getItem(legacyKey) : null)
  if (value !== null && legacyKey && !localStorage.getItem(key)) {
    localStorage.setItem(key, value)
  }
  return value
}

export function writeStorageValue(key: string, value: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, value)
}

export function readJsonStorage<T>(key: string, legacyKey?: string): T | null {
  const raw = readStorageValue(key, legacyKey)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJsonStorage<T>(key: string, value: T): void {
  writeStorageValue(key, JSON.stringify(value))
}
