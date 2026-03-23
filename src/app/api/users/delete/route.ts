import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
    const { guest_user_id } = await req.json()

    if (!guest_user_id) {
      return NextResponse.json(
        { error: "guest_user_id erforderlich" },
        { status: 400 }
      )
    }

    // Verify guest has access records from this owner
    const { data: accessRecords } = await supabase
      .from("user_access")
      .select("id")
      .eq("owner_id", ownerUser.id)
      .eq("guest_user_id", guest_user_id)

    if (!accessRecords || accessRecords.length === 0) {
      return NextResponse.json(
        { error: "Dieser Benutzer hat keinen Zugriff auf deine Fahrzeuge" },
        { status: 404 }
      )
    }

    // Delete all user_access records for this guest (RLS enforces ownership)
    const { error: deleteError } = await supabase
      .from("user_access")
      .delete()
      .eq("owner_id", ownerUser.id)
      .eq("guest_user_id", guest_user_id)

    if (deleteError) {
      console.error("Error deleting user access:", deleteError)
      return NextResponse.json(
        { error: `Fehler beim Löschen: ${deleteError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Benutzer wurde gelöscht. Zugriff auf alle Fahrzeuge entfernt.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in POST /api/users/delete:", error)
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}
