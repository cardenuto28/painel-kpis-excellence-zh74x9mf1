/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add any other utility functions here

export function parseDate(value: string | Date): Date {
  if (value instanceof Date) return value
  if (!value || typeof value !== 'string') return new Date(NaN)

  const trimmed = value.trim()
  if (!trimmed) return new Date(NaN)

  if (trimmed.includes('T')) {
    const d = new Date(trimmed)
    if (!isNaN(d.getTime())) return d
  }

  if (trimmed.includes(' ')) {
    const d = new Date(trimmed.replace(' ', 'T'))
    if (!isNaN(d.getTime())) return d
  }

  const parts = trimmed.split(/[-/]/)
  if (parts.length === 3) {
    const [y, m, d] = parts.map(Number)
    if (y && m && d) {
      const dt = new Date(Date.UTC(y, m - 1, d))
      if (!isNaN(dt.getTime())) return dt
    }
  }

  const d = new Date(trimmed)
  return isNaN(d.getTime()) ? new Date(NaN) : d
}

export function formatDateBR(value: string | Date): string {
  const d = parseDate(value)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

export function toDatePickerValue(value: string | Date): string {
  const d = parseDate(value)
  if (isNaN(d.getTime())) return ''
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
