'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  formatDueDate,
  getReminderTypeLabel,
  getUrgencyLevel,
  getUrgencyColor,
  ReminderWithVehicle,
  daysUntilDue,
} from '@/lib/reminder-helpers'

interface ReminderWithVehicleData extends ReminderWithVehicle {
  vehicles: {
    make: string
    model: string
    year: number | null
    plate: string | null
    category: string
    country_code: string
  }
}

export function ReminderList() {
  const supabase = createClient()
  const router = useRouter()
  const [reminders, setReminders] = useState<ReminderWithVehicleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all open reminders with vehicle info
  const fetchReminders = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('reminders')
        .select(
          `
          id,
          vehicle_id,
          user_id,
          type,
          title,
          due_date,
          repeat_months,
          status,
          notified_30,
          notified_7,
          notified_1,
          notes,
          created_at,
          vehicles (
            make,
            model,
            year,
            plate,
            category,
            country_code
          )
        `
        )
        .eq('status', 'open')
        .order('due_date', { ascending: true })

      if (queryError) throw queryError
      setReminders((data || []) as unknown as ReminderWithVehicleData[])
    } catch (err) {
      console.error('Error fetching reminders:', err)
      setError('Erinnerungen konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()
  }, [])

  // Group reminders by urgency
  const groupedReminders = {
    overdue: reminders.filter((r) => daysUntilDue(r.due_date) < 0),
    urgent: reminders.filter(
      (r) => daysUntilDue(r.due_date) >= 0 && daysUntilDue(r.due_date) <= 7
    ),
    soon: reminders.filter(
      (r) => daysUntilDue(r.due_date) > 7 && daysUntilDue(r.due_date) <= 30
    ),
    later: reminders.filter((r) => daysUntilDue(r.due_date) > 30),
  }

  const handleReminderClick = (vehicleId: string) => {
    router.push(`/vehicles/${vehicleId}?tab=reminders`)
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[#4A5260] bg-[#2A2D30] p-6">
        <p className="text-sm text-[#EF4444]">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5C97B] border-t-transparent"></div>
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <div className="rounded-lg border border-[#4A5260] bg-[#2A2D30] p-8 text-center">
        <p className="text-[#E6E6E6]">
          Keine offenen Erinnerungen — alles im grünen Bereich!
        </p>
      </div>
    )
  }

  const renderSection = (
    title: string,
    items: ReminderWithVehicleData[],
    colorCode: string
  ) => {
    if (items.length === 0) return null

    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#808080]">
          {title}
        </h3>
        <div className="space-y-2">
          {items.map((reminder) => (
            <button
              key={reminder.id}
              onClick={() => handleReminderClick(reminder.vehicle_id)}
              className="w-full text-left transition-all hover:bg-[#2a2a2a]"
            >
              <div className="flex items-start gap-3 rounded-lg border border-[#4A5260] bg-[#2A2D30] p-3 hover:border-[#E5C97B]/30">
                {/* Urgency dot */}
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: colorCode }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#E6E6E6]">
                      {reminder.vehicles?.make} {reminder.vehicles?.model}
                    </p>
                    {reminder.vehicles?.plate && (
                      <span className="text-xs text-[#808080]">({reminder.vehicles.plate})</span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-block rounded bg-[#E5C97B]/20 px-2 py-0.5 text-xs font-medium text-[#E5C97B]">
                      {getReminderTypeLabel(reminder.type)}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-[#A0A0A0]">{reminder.title}</p>
                  <p className="text-xs text-[#808080]">{formatDueDate(reminder.due_date)}</p>
                </div>

                {/* Arrow indicator */}
                <svg
                  className="h-5 w-5 flex-shrink-0 text-[#808080]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {renderSection('Überfällig', groupedReminders.overdue, '#EF4444')}
      {renderSection('Diese Woche', groupedReminders.urgent, '#F97316')}
      {renderSection('Dieser Monat', groupedReminders.soon, '#EAB308')}
      {renderSection('Später', groupedReminders.later, '#22C55E')}
    </div>
  )
}
