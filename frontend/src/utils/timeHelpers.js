/**
 * Calculates the difference in minutes between two time strings (HH:mm)
 * @param {string} start - Start time in HH:mm format
 * @param {string} end - End time in HH:mm format
 * @returns {number} Difference in minutes, or 0 if invalid input
 */
export const diffMinutes = (start, end) => {
  if (!start || !end) return 0
  const [h1, m1] = start.split(':').map(Number)
  const [h2, m2] = end.split(':').map(Number)
  return (h2 * 60 + m2) - (h1 * 60 + m1)
}

/**
 * Calculates total daily minutes from morning and afternoon time slots
 * @param {Object} item - Entry object with morning_start, morning_end, afternoon_start, afternoon_end
 * @returns {number} Total minutes worked
 */
export const dailyMinutes = (item) => {
  const m1 = diffMinutes(item.morning_start, item.morning_end)
  const m2 = diffMinutes(item.afternoon_start, item.afternoon_end)
  return m1 + m2
}

/**
 * Formats minutes into human-readable duration string
 * @param {number} mins - Total minutes to format
 * @returns {string} Formatted duration (e.g., "3h 45m")
 */
export const formatDuration = (mins) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}
