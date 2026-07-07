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
  if (!value) return new Date(NaN)
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  return new Date(normalized)
}

export function formatDateBR(value: string | Date): string {
  const d = parseDate(value)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR')
}

export function toDatePickerValue(value: string | Date): string {
  const d = parseDate(value)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
