/**
 * Structured JSON logger (A33)
 */

type Level = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: Level
  ts: string
  msg: string
  [key: string]: unknown
}

const LEVELS: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const MIN_LEVEL: Level = (process.env.LOG_LEVEL as Level) ?? 'info'

function shouldLog(level: Level): boolean {
  return LEVELS[level] >= LEVELS[MIN_LEVEL]
}

function write(level: Level, msg: string, data?: Record<string, unknown>): void {
  if (!shouldLog(level)) return
  const entry: LogEntry = {
    level,
    ts: new Date().toISOString(),
    msg,
    ...data,
  }
  const line = JSON.stringify(entry)
  if (level === 'error' || level === 'warn') {
    console.error(line)
  } else {
    console.log(line)
  }
}

export const logger = {
  debug: (msg: string, data?: Record<string, unknown>) => write('debug', msg, data),
  info:  (msg: string, data?: Record<string, unknown>) => write('info',  msg, data),
  warn:  (msg: string, data?: Record<string, unknown>) => write('warn',  msg, data),
  error: (msg: string, data?: Record<string, unknown>) => write('error', msg, data),
}
