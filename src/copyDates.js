import { addDays, daysInMonth, formatDateKey, parseDateKey } from './dateUtils'

export function presetNextWeeks(anchorKey) {
  return [1, 2, 3, 4].map((week) => addDays(anchorKey, week * 7))
}

export function presetMonthEnd(anchorKey) {
  const date = parseDateKey(anchorKey)
  const lastDay = daysInMonth(date.getFullYear(), date.getMonth())
  return Array.from({ length: Math.max(0, lastDay - date.getDate()) }, (_, index) =>
    formatDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + index + 1)),
  )
}
