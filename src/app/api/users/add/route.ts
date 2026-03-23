import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendInvitationEmail } from "@/lib/resend"
import { randomBytes } from "crypto"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user (owner)
    const {
      data: { user: ownerUser },
    } = await supabase.auth.getUser()

    if (!ownerUser) {
      return NextResponse.json(
        { error: "Du musst angemeldet sein" },
        { status: 401 }
      )
    }

    // Parse request body
    const { email, vehicleIds, expiresAt } = await req.json()

    // Validate inputs
    if (!email || !vehicleIds || vehicleIds.length === 0) {
      return NextResponse.json(
        { error: "Email und mindestens ein Fahrzeug erforderlich" },
        { status: 400 }
      )
    }

    // Verify all vehicles belong to owner
    const { data: vehicleData } = await supabase
      .from("vehicles")
      .select("id")
      .eq("user_id", ownerUser.id)
      .in("id", vehicleIds)

    if (!vehicleData || vehicleData.length !== vehicleIds.length) {
      return NextResponse.json(
        { error: "Eines oder mehrere Fahrzeuge gehören dir nicht" },
        { status: 403 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()

    // If user exists, create user_access records
    if (existingUser) {
      const accessRecords = vehicleIds.map((vehicleId: string) => ({
        owner_id: ownerUser.id,
        guest_user_id: existingUser.id,
        vehicle_id: vehicleId,
        can_view: true,
        can_edit: false,
        can_upload: false,
        expires_at: expiresAt || null,
      }))

      const { error: insertError } = await supabase
        .from("user_access")
        .insert(accessRecords)

      if (insertError) {
        if (insertError.code === "23505") {
          return NextResponse.json(
            { error: `Benutzer hat bereits Zugriff auf ein oder mehrere dieser Fahrzeuge` },
            { status: 409 }
          )
        }

        return NextResponse.json(
          { error: `Fehler beim Erstellen des Zugriffs: ${insertError.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          success: true,
          message: `Benutzer '${email}' hinzugefügt mit Zugriff auf ${vehicleIds.length} Fahrzeug(e)`,
          vehicleCount: vehicleIds.length,
        },
        { status: 201 }
      )
    }

    // User doesn't exist - send invitation
    const token = randomBytes(32).toString("hex")
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create invitation token record (user_id will be set when they set password)
    const { data: invitationRecord, error: inviteError } = await supabase
      .from("invitation_tokens")
      .insert({
        token,
        email,
        owner_id: ownerUser.id,
        vehicle_ids: vehicleIds,
        expires_at: tokenExpiresAt,
      })
      .select()
      .single()

    if (inviteError) {
      console.error("Error creating invitation record:", inviteError)
      return NextResponse.json(
        { error: "Fehler beim Erstellen der Einladung" },
        { status: 500 }
      )
    }

    // Send invitation email
    try {
      await sendInvitationEmail({
        email,
        token,
        ownerName: ownerUser.user_metadata?.name || ownerUser.email || "Ein GarageOS Benutzer",
      })
    } catch (emailError) {
      console.error("Error sending invitation email:", emailError)
      // Delete the token if email fails
      await supabase.from("invitation_tokens").delete().eq("token", token)

      return NextResponse.json(
        { error: "Fehler beim Senden der Einladungs-Email" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: `Einladung an '${email}' gesendet. Sie erhalten einen Link zum Passwort setzen.`,
        isNewUser: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error in POST /api/users/add:", error)
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}
