import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  // Merge conditional class names with Tailwind conflict resolution.
  return twMerge(clsx(inputs))
}
