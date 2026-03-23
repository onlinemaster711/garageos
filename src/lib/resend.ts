import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendInvitationEmailProps {
  email: string
  token: string
  ownerName?: string
}

export async function sendInvitationEmail({
  email,
  token,
  ownerName = "Ein GarageOS Benutzer",
}: SendInvitationEmailProps) {
  const setPasswordUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password/${token}`

  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Du wurdest zu GarageOS eingeladen",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
                line-height: 1.6;
                color: #1c2b2a;
                background-color: #f2f5f4;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #1c6b5f 0%, #0e3c36 100%);
                color: #f2f5f4;
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content {
                padding: 40px 30px;
              }
              .greeting {
                margin-bottom: 20px;
                font-size: 16px;
              }
              .message {
                margin-bottom: 30px;
                font-size: 15px;
                line-height: 1.7;
              }
              .cta-button {
                display: inline-block;
                background: #1c6b5f;
                color: white;
                padding: 14px 32px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin-bottom: 30px;
                transition: background 0.3s;
              }
              .cta-button:hover {
                background: #0e3c36;
              }
              .footer {
                background-color: #f2f5f4;
                padding: 30px;
                text-align: center;
                font-size: 12px;
                color: #a8a8a8;
                border-top: 1px solid #e0e0e0;
              }
              .footer p {
                margin: 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>GarageOS</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  Hallo,
                </div>
                <div class="message">
                  <p>${ownerName} hat dich zu GarageOS eingeladen und möchte Fahrzeuge mit dir teilen.</p>
                  <p>Um loszulegen, klicke auf den Button unten und erstelle dein Passwort. Danach kannst du dich anmelden und die freigegebenen Fahrzeuge ansehen.</p>
                </div>
                <a href="${setPasswordUrl}" class="cta-button">
                  Passwort setzen &rarr;
                </a>
                <div class="message" style="font-size: 14px; color: #a8a8a8;">
                  <p>Dieser Link verfällt in 24 Stunden. Falls du diese Einladung nicht erwartet hast, kannst du diese E-Mail ignorieren.</p>
                  <p>Direkter Link (falls der Button nicht funktioniert):<br />
                  <code style="background: #f2f5f4; padding: 8px; border-radius: 4px; display: inline-block; margin-top: 8px; word-break: break-all;">${setPasswordUrl}</code></p>
                </div>
              </div>
              <div class="footer">
                <p>&copy; 2026 GarageOS. Alle Rechte vorbehalten.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (response.error) {
      console.error("Resend email error:", response.error)
      throw new Error(`Failed to send invitation email: ${response.error.message}`)
    }

    return response
  } catch (error) {
    console.error("Error sending invitation email:", error)
    throw error
  }
}
