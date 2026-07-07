import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseDate(value: string | Date | undefined | null): Date {
  if (!value) return new Date(NaN)
  if (value instanceof Date) return value
  const trimmed = String(value).trim()
  if (!trimmed) return new Date(NaN)
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (dateOnly) {
    return new Date(
      parseInt(dateOnly[1], 10),
      parseInt(dateOnly[2], 10) - 1,
      parseInt(dateOnly[3], 10),
    )
  }
  const normalized = trimmed.replace(' ', 'T')
  const parsed = new Date(normalized)
  return isNaN(parsed.getTime()) ? new Date(NaN) : parsed
}

export function toDatePickerValue(value: string | Date | undefined | null): string {
  if (!value) return ''
  const trimmed = String(value).trim()
  if (!trimmed) return ''
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (dateOnly) return trimmed
  const date = value instanceof Date ? value : parseDate(value)
  if (isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateBR(value: string | Date | undefined | null): string {
  if (!value) return ''
  const date = parseDate(value)
  if (isNaN(date.getTime())) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}
