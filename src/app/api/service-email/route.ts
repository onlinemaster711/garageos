import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authHeader = request.headers.get('cookie')
    if (!authHeader) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { to, subject, body, contactName } = await request.json()

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Empfänger, Betreff und Nachricht sind erforderlich' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'GarageOS <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A0A0A; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #C9A84C; margin: 0; font-size: 20px;">GarageOS</h2>
          </div>
          <div style="background: #1E1E1E; padding: 24px; border-radius: 0 0 8px 8px; color: #F0F0F0;">
            <p style="margin-top: 0;">Sehr geehrte Damen und Herren${contactName ? ` bei ${contactName}` : ''},</p>
            <div style="white-space: pre-wrap; line-height: 1.6;">${body}</div>
            <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
            <p style="color: #888; font-size: 12px; margin-bottom: 0;">
              Gesendet über GarageOS — Fahrzeugverwaltung für Sammler
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'E-Mail konnte nicht gesendet werden' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Service email error:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
