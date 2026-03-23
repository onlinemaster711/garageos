import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This is a special route that uses the service role key for user creation
// Only called from the set-password page after user submits password

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    )

    const token = params.token

    // Find and validate invitation token
    const { data: invitation, error: inviteError } = await supabase
      .from("invitation_tokens")
      .select("*")
      .eq("token", token)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: "Einladungs-Token ungültig oder nicht gefunden" },
        { status: 404 }
      )
    }

    // Check if token is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Einladungs-Token ist abgelaufen" },
        { status: 410 }
      )
    }

    // Check if already used
    if (invitation.used_at) {
      return NextResponse.json(
        { error: "Dieses Einladungs-Token wurde bereits verwendet" },
        { status: 410 }
      )
    }

    // Return invitation details (without sensitive data)
    return NextResponse.json(
      {
        valid: true,
        email: invitation.email,
        vehicleCount: invitation.vehicle_ids?.length || 0,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error validating invitation token:", error)
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { password } = await request.json()

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Passwort muss mindestens 8 Zeichen lang sein" },
        { status: 400 }
      )
    }

    const token = params.token

    // Use service role key for user creation
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    const regularSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    )

    // Find and validate invitation token
    const { data: invitation, error: inviteError } = await regularSupabase
      .from("invitation_tokens")
      .select("*")
      .eq("token", token)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: "Einladungs-Token ungültig" },
        { status: 404 }
      )
    }

    // Check expiration
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Einladungs-Token ist abgelaufen" },
        { status: 410 }
      )
    }

    // Check if already used
    if (invitation.used_at) {
      return NextResponse.json(
        { error: "Dieses Token wurde bereits verwendet" },
        { status: 410 }
      )
    }

    // Create user with email and password
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true, // Auto-confirm since this is an invite
    })

    if (authError || !authData.user) {
      console.error("Error creating user:", authError)
      return NextResponse.json(
        { error: `Fehler beim Erstellen des Benutzerkontos: ${authError?.message || "Unknown error"}` },
        { status: 500 }
      )
    }

    const newUserId = authData.user.id

    // Create user_access records for all invited vehicles
    const accessRecords = invitation.vehicle_ids.map((vehicleId: string) => ({
      owner_id: invitation.owner_id,
      guest_user_id: newUserId,
      vehicle_id: vehicleId,
      can_view: true,
      can_edit: false,
      can_upload: false,
      expires_at: null,
    }))

    const { error: accessError } = await regularSupabase
      .from("user_access")
      .insert(accessRecords)

    if (accessError) {
      console.error("Error creating user_access records:", accessError)
      return NextResponse.json(
        { error: "Fehler beim Einrichten des Fahrzeugzugriffs" },
        { status: 500 }
      )
    }

    // Mark invitation as used
    const { error: updateError } = await regularSupabase
      .from("invitation_tokens")
      .update({ used_at: new Date().toISOString(), user_id: newUserId })
      .eq("token", token)

    if (updateError) {
      console.error("Error marking invitation as used:", updateError)
      // Non-critical error, continue
    }

    return NextResponse.json(
      {
        success: true,
        message: "Konto erstellt! Du wirst zum Dashboard weitergeleitet.",
        userId: newUserId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error in POST /api/auth/invite/[token]:", error)
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}
