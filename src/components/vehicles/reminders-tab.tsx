'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  formatDueDate,
  getReminderTypeLabel,
  getUrgencyColor,
  getNextRecurringDate,
  ReminderWithVehicle,
} from '@/lib/reminder-helpers'
import { getAutoReminders, getReminderTypes } from '@/lib/country-rules'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { Trash2, Plus, Wand2 } from 'lucide-react'

interface RemindersTabProps {
  vehicleId: string
  countryCode: string
  category: string
}

interface FormData {
  type: string
  title: string
  dueDate: string
  repeatMonths: string
  notes: string
}

export function RemindersTab({ vehicleId, countryCode, category }: RemindersTabProps) {
  const supabase = createClient()
  const [reminders, setReminders] = useState<ReminderWithVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    type: 'inspection',
    title: '',
    dueDate: '',
    repeatMonths: '',
    notes: '',
  })

  const reminderTypes = getReminderTypes()

  // Fetch reminders for this vehicle
  const fetchReminders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
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
          created_at
        `
        )
        .eq('vehicle_id', vehicleId)
        .eq('status', 'open')
        .order('due_date', { ascending: true })

      if (error) throw error
      setReminders((data || []) as ReminderWithVehicle[])
    } catch (err) {
      console.error('Error fetching reminders:', err)
      toast({ title: 'Fehler', description: 'Erinnerungen konnten nicht geladen werden', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()
  }, [vehicleId])

  // Update form title when type changes
  useEffect(() => {
    if (formData.type === 'custom') {
      setFormData((prev) => ({ ...prev, title: '' }))
      return
    }

    const selected = reminderTypes.find((t) => t.value === formData.type)
    if (selected) {
      setFormData((prev) => ({ ...prev, title: selected.label }))
    }
  }, [formData.type])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.dueDate) {
      toast({ title: 'Fehler', description: 'Bitte füllen Sie alle erforderlichen Felder aus', variant: 'destructive' })
      return
    }

    try {
      setSubmitting(true)

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const repeatMonths = formData.repeatMonths ? parseInt(formData.repeatMonths) : null

      const { error } = await supabase.from('reminders').insert([
        {
          vehicle_id: vehicleId,
          user_id: userData.user.id,
          type: formData.type,
          title: formData.title,
          due_date: formData.dueDate,
          repeat_months: repeatMonths,
          notes: formData.notes || null,
          status: 'open',
        },
      ])

      if (error) throw error

      toast({ title: 'Erfolg', description: 'Erinnerung erstellt' })
      setShowDialog(false)
      setFormData({
        type: 'inspection',
        title: '',
        dueDate: '',
        repeatMonths: '',
        notes: '',
      })
      await fetchReminders()
    } catch (err) {
      console.error('Error creating reminder:', err)
      toast({ title: 'Fehler', description: 'Erinnerung konnte nicht erstellt werden', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  // Mark reminder as done
  const handleMarkDone = async (reminder: ReminderWithVehicle) => {
    try {
      if (reminder.repeat_months && reminder.repeat_months > 0) {
        // Create next occurrence
        const nextDueDate = getNextRecurringDate(reminder.due_date, reminder.repeat_months)

        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) throw new Error('Not authenticated')

        // Insert new reminder for next occurrence
        await supabase.from('reminders').insert([
          {
            vehicle_id: reminder.vehicle_id,
            user_id: userData.user.id,
            type: reminder.type,
            title: reminder.title,
            due_date: nextDueDate,
            repeat_months: reminder.repeat_months,
            notes: reminder.notes,
            status: 'open',
          },
        ])
      }

      // Mark current as done
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'done' })
        .eq('id', reminder.id)

      if (error) throw error

      toast({ title: 'Erfolg', description: 'Erinnerung als erledigt markiert' })
      await fetchReminders()
    } catch (err) {
      console.error('Error marking done:', err)
      toast({ title: 'Fehler', description: 'Fehler beim Aktualisieren', variant: 'destructive' })
    }
  }

  // Delete reminder
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('reminders').delete().eq('id', id)

      if (error) throw error

      toast({ title: 'Erfolg', description: 'Erinnerung gelöscht' })
      await fetchReminders()
    } catch (err) {
      console.error('Error deleting reminder:', err)
      toast({ title: 'Fehler', description: 'Fehler beim Löschen', variant: 'destructive' })
    }
  }

  // Create automatic reminders for this vehicle
  const handleCreateAutoReminders = async () => {
    try {
      setSubmitting(true)

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const autoReminders = getAutoReminders(countryCode, category)
      const today = new Date().toISOString().split('T')[0]

      const remindersToInsert = autoReminders.map((reminder) => ({
        vehicle_id: vehicleId,
        user_id: userData.user.id,
        type: reminder.type,
        title: reminder.title,
        due_date: today,
        repeat_months: reminder.repeatMonths,
        notes: null,
        status: 'open',
      }))

      const { error } = await supabase.from('reminders').insert(remindersToInsert)

      if (error) throw error

      toast({ title: 'Erfolg', description: 'Automatische Erinnerungen erstellt' })
      await fetchReminders()
    } catch (err) {
      console.error('Error creating auto reminders:', err)
      toast({ title: 'Fehler', description: 'Fehler beim Erstellen der Erinnerungen', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5C97B] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 bg-[#E5C97B] text-black hover:bg-[#B89A3C]"
        >
          <Plus className="h-4 w-4" />
          Erinnerung hinzufügen
        </Button>
        <Button
          onClick={handleCreateAutoReminders}
          disabled={submitting}
          variant="outline"
          className="flex items-center gap-2 border-[#E5C97B] text-[#E5C97B] hover:bg-[#2A2D30]"
        >
          <Wand2 className="h-4 w-4" />
          Automatische Erinnerungen
        </Button>
      </div>

      {/* Reminders list */}
      {reminders.length === 0 ? (
        <div className="rounded-lg border border-[#4A5260] bg-[#2A2D30] p-8 text-center">
          <p className="text-sm text-[#A0A0A0]">Noch keine Erinnerungen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const urgencyColor = getUrgencyColor(reminder.due_date)
            return (
              <div
                key={reminder.id}
                className="flex items-center gap-4 rounded-lg border border-[#4A5260] bg-[#2A2D30] p-4 transition-colors hover:border-[#E5C97B]/30"
              >
                {/* Urgency dot */}
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: urgencyColor }}
                />

                {/* Reminder details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded bg-[#E5C97B] px-2 py-1 text-xs font-medium text-black">
                      {getReminderTypeLabel(reminder.type)}
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-[#E6E6E6]">{reminder.title}</p>
                  <p className="text-sm text-[#A0A0A0]">{formatDueDate(reminder.due_date)}</p>
                  {reminder.repeat_months && reminder.repeat_months > 0 && (
                    <p className="text-xs text-[#808080]">
                      Wiederholt alle {reminder.repeat_months} Monate
                    </p>
                  )}
                  {reminder.notes && (
                    <p className="mt-2 text-xs italic text-[#808080]">{reminder.notes}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={() => handleMarkDone(reminder)}
                    size="sm"
                    className="bg-[#22C55E] text-black hover:bg-[#16A34A]"
                  >
                    Erledigt
                  </Button>
                  <Button
                    onClick={() => handleDelete(reminder.id)}
                    size="sm"
                    variant="ghost"
                    className="text-[#EF4444] hover:bg-[#EF4444]/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialog for adding reminder */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="border-[#4A5260] bg-[#0A1A2F]">
          <DialogHeader>
            <DialogTitle className="text-[#E6E6E6]">Erinnerung hinzufügen</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type select */}
            <div>
              <label className="block text-sm font-medium text-[#E6E6E6] mb-1">Typ</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full rounded-md border border-[#4A5260] bg-[#2A2D30] px-3 py-2 text-[#E6E6E6] outline-none focus:border-[#E5C97B]"
              >
                {reminderTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title input */}
            <div>
              <label className="block text-sm font-medium text-[#E6E6E6] mb-1">Titel</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="z.B. TÜV Inspektion fällig"
                className="border-[#4A5260] bg-[#2A2D30] text-[#E6E6E6] placeholder-[#808080]"
              />
            </div>

            {/* Due date */}
            <div>
              <label className="block text-sm font-medium text-[#E6E6E6] mb-1">
                Fälligkeitsdatum
              </label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="border-[#4A5260] bg-[#2A2D30] text-[#E6E6E6]"
              />
            </div>

            {/* Repeat months */}
            <div>
              <label className="block text-sm font-medium text-[#E6E6E6] mb-1">
                Wiederholen alle X Monate (optional)
              </label>
              <Input
                type="number"
                value={formData.repeatMonths}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, repeatMonths: e.target.value }))
                }
                placeholder="z.B. 12 oder 24"
                className="border-[#4A5260] bg-[#2A2D30] text-[#E6E6E6] placeholder-[#808080]"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[#E6E6E6] mb-1">
                Notizen (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Zusätzliche Informationen..."
                rows={3}
                className="w-full rounded-md border border-[#4A5260] bg-[#2A2D30] px-3 py-2 text-[#E6E6E6] outline-none focus:border-[#E5C97B] resize-none"
              />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#E5C97B] text-black hover:bg-[#B89A3C]"
            >
              {submitting ? 'Wird erstellt...' : 'Erinnerung erstellen'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
