import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ReminderEmailData {
  to: string
  vehicleName: string  // e.g. "Mercedes-Benz 300 SL"
  reminderTitle: string
  dueDate: string
  daysUntil: number
  vehicleId: string
  appUrl: string
}

export async function sendReminderEmail(data: ReminderEmailData) {
  const urgencyText = data.daysUntil <= 0
    ? '⚠️ ÜBERFÄLLIG'
    : data.daysUntil === 1
      ? '⚠️ Morgen fällig'
      : `In ${data.daysUntil} Tagen fällig`

  const subject = data.daysUntil <= 0
    ? `⚠️ Überfällig: ${data.reminderTitle} — ${data.vehicleName}`
    : `Erinnerung: ${data.reminderTitle} — ${data.vehicleName}`

  const formattedDate = new Date(data.dueDate).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric'
  })

  // Build a nice HTML email in German
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background-color:#0A0A0A;font-family:system-ui,-apple-system,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#C9A84C;font-size:28px;margin:0;">GarageOS</h1>
          <p style="color:#888;font-size:14px;margin:4px 0 0;">Deine Sammlung auf Autopilot</p>
        </div>
        <div style="background-color:#1E1E1E;border-radius:12px;padding:32px;border:1px solid #333;">
          <p style="color:#F0F0F0;font-size:16px;margin:0 0 8px;">
            ${urgencyText}
          </p>
          <h2 style="color:#F0F0F0;font-size:22px;margin:0 0 24px;">
            ${data.reminderTitle}
          </h2>
          <div style="background-color:#2A2A2A;border-radius:8px;padding:16px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="color:#888;font-size:14px;padding:6px 0;">Fahrzeug</td>
                <td style="color:#F0F0F0;font-size:14px;padding:6px 0;text-align:right;font-weight:600;">${data.vehicleName}</td>
              </tr>
              <tr>
                <td style="color:#888;font-size:14px;padding:6px 0;">Fällig am</td>
                <td style="color:#F0F0F0;font-size:14px;padding:6px 0;text-align:right;font-weight:600;">${formattedDate}</td>
              </tr>
            </table>
          </div>
          <a href="${data.appUrl}/vehicles/${data.vehicleId}"
             style="display:block;text-align:center;background-color:#C9A84C;color:#0A0A0A;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">
            Fahrzeug ansehen
          </a>
        </div>
        <p style="color:#666;font-size:12px;text-align:center;margin-top:24px;">
          Diese E-Mail wurde automatisch von GarageOS gesendet.
        </p>
      </div>
    </body>
    </html>
  `

  try {
    const { data: result, error } = await resend.emails.send({
      from: 'GarageOS <onboarding@resend.dev>',
      to: data.to,
      subject,
      html,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, id: result?.id }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error }
  }
}
