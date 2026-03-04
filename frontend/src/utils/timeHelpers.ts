import { TimeEntry } from '@/types'

/**
 * Calculates the difference in minutes between two time strings (HH:mm)
 */
export const diffMinutes = (start: string | null, end: string | null): number => {
  if (!start || !end) return 0
  const [h1, m1] = start.split(':').map(Number)
  const [h2, m2] = end.split(':').map(Number)
  return (h2 * 60 + m2) - (h1 * 60 + m1)
}

/**
 * Calculates total daily minutes from morning and afternoon time slots
 */
export const dailyMinutes = (item: TimeEntry): number => {
  const m1 = diffMinutes(item.morning_start, item.morning_end)
  const m2 = diffMinutes(item.afternoon_start, item.afternoon_end)
  return m1 + m2
}

/**
 * Formats minutes into human-readable duration string
 */
export const formatDuration = (mins: number): string => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}
