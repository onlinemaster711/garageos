import { COUNTRY_RULES } from './country-rules'

export type ReminderStatus = 'open' | 'done' | 'overdue' | 'snoozed'

export interface ReminderWithVehicle {
  id: string
  vehicle_id: string
  user_id: string
  type: string
  title: string
  due_date: string
  repeat_months: number | null
  status: string
  notified_30: boolean
  notified_7: boolean
  notified_1: boolean
  notes: string | null
  created_at: string
  vehicles?: {
    make: string
    model: string
    year: number | null
    plate: string | null
    category: string
    country_code: string
  }
}

// Calculate days until due
export function daysUntilDue(dueDate: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diff = due.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Get urgency level for styling
export function getUrgencyLevel(dueDate: string): 'overdue' | 'urgent' | 'soon' | 'normal' {
  const days = daysUntilDue(dueDate)
  if (days < 0) return 'overdue'
  if (days <= 7) return 'urgent'
  if (days <= 30) return 'soon'
  return 'normal'
}

// Get urgency color
export function getUrgencyColor(dueDate: string): string {
  const level = getUrgencyLevel(dueDate)
  switch (level) {
    case 'overdue':
      return '#EF4444' // red
    case 'urgent':
      return '#F97316' // orange
    case 'soon':
      return '#EAB308' // yellow
    case 'normal':
      return '#22C55E' // green
  }
}

// Format due date in German
export function formatDueDate(dueDate: string): string {
  const days = daysUntilDue(dueDate)
  const date = new Date(dueDate)
  const formatted = date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  if (days < 0) return `Überfällig seit ${Math.abs(days)} Tagen (${formatted})`
  if (days === 0) return `Heute fällig (${formatted})`
  if (days === 1) return `Morgen fällig (${formatted})`
  if (days <= 7) return `In ${days} Tagen fällig (${formatted})`
  if (days <= 30) return `In ${days} Tagen (${formatted})`
  return formatted
}

// Get the type label in German
export function getReminderTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    inspection: 'TÜV / HU',
    insurance: 'Versicherung',
    tax: 'KFZ-Steuer',
    tire_change_spring: 'Reifenwechsel Frühjahr',
    tire_change_fall: 'Reifenwechsel Herbst',
    maintenance: 'Wartung',
    registration: 'Zulassung',
    standzeit: 'Standzeit-Warnung',
    custom: 'Eigene Erinnerung',
  }
  return labels[type] || type
}

// Calculate next due date for recurring reminders
export function getNextRecurringDate(currentDueDate: string, repeatMonths: number): string {
  const date = new Date(currentDueDate)
  date.setMonth(date.getMonth() + repeatMonths)
  return date.toISOString().split('T')[0]
}
