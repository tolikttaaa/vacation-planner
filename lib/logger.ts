import { APP_LOG_PREFIX } from "./constants"

// Minimal console logger with a consistent prefix and timestamp.
function formatPrefix(): string {
  return `[${APP_LOG_PREFIX}] ${new Date().toISOString()}`
}

export const logger = {
  info: (...args: any[]) => {
    const prefix = formatPrefix()
    console.info(prefix, ...args)
  },
  warn: (...args: any[]) => {
    const prefix = formatPrefix()
    console.warn(prefix, ...args)
  },
  error: (...args: any[]) => {
    const prefix = formatPrefix()
    console.error(prefix, ...args)
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      const prefix = formatPrefix()
      console.debug(prefix, ...args)
    }
  },
}

export default logger
