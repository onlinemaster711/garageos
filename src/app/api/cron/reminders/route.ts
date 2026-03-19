import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendReminderEmail } from '@/lib/email'

// Use service role to access all users' data
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  // Optional: verify cron secret for security
  // const authHeader = request.headers.get('authorization')
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // }

  try {
    // Fetch all open reminders with vehicle info
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select(`
        *,
        vehicles (make, model, year, plate)
      `)
      .eq('status', 'open')
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Failed to fetch reminders:', error)
      return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ message: 'No open reminders', sent: 0 })
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    let emailsSent = 0
    const errors: string[] = []

    for (const reminder of reminders) {
      const dueDate = new Date(reminder.due_date)
      dueDate.setHours(0, 0, 0, 0)
      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Determine which notification to send
      let shouldNotify = false
      let notifyField: string | null = null

      if (daysUntil <= 1 && !reminder.notified_1) {
        shouldNotify = true
        notifyField = 'notified_1'
      } else if (daysUntil <= 7 && !reminder.notified_7) {
        shouldNotify = true
        notifyField = 'notified_7'
      } else if (daysUntil <= 30 && !reminder.notified_30) {
        shouldNotify = true
        notifyField = 'notified_30'
      }

      if (!shouldNotify || !notifyField) continue

      // Get user email
      const { data: userData } = await supabase.auth.admin.getUserById(reminder.user_id)
      if (!userData?.user?.email) continue

      const vehicleName = reminder.vehicles
        ? `${reminder.vehicles.make} ${reminder.vehicles.model}`
        : 'Fahrzeug'

      // Send email
      const result = await sendReminderEmail({
        to: userData.user.email,
        vehicleName,
        reminderTitle: reminder.title,
        dueDate: reminder.due_date,
        daysUntil,
        vehicleId: reminder.vehicle_id,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      })

      if (result.success) {
        // Update notification flag
        await supabase
          .from('reminders')
          .update({ [notifyField]: true })
          .eq('id', reminder.id)
        emailsSent++
      } else {
        errors.push(`Failed for reminder ${reminder.id}: ${JSON.stringify(result.error)}`)
      }
    }

    return NextResponse.json({
      message: `Cron completed. ${emailsSent} emails sent.`,
      sent: emailsSent,
      total: reminders.length,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
