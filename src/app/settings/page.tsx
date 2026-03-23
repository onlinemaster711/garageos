"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { TopAppBar } from "@/components/TopAppBar"
import { BottomNav } from "@/components/BottomNav"
import { AddUserForm } from "@/components/AddUserForm"
import { UsersTable, type UserAccess } from "@/components/UsersTable"
import { VehiclePermissionsModal, type Vehicle } from "@/components/VehiclePermissionsModal"
import { ArrowLeft } from "lucide-react"

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState("")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [users, setUsers] = useState<UserAccess[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUserEmail(user.email || "")

    // Load user's vehicles
    const { data: vehiclesData } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    setVehicles((vehiclesData || []).map(v => ({
      id: v.id,
      make: v.make,
      model: v.model,
      year: v.year
    })))

    // Load users with access to this user's vehicles
    // TODO: Query user_access table to get list of guest users and their vehicle counts
    // For now, show empty list
    setUsers([])

    setLoading(false)
  }

  const handleUserAdded = async (email: string) => {
    // TODO: Create user_access record for email with can_view = true for all vehicles
    console.log("User added:", email)
    loadData()
  }

  const handleRevokeAccess = async (userId: string) => {
    try {
      const response = await fetch("/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_user_id: userId }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || "Fehler beim Löschen des Benutzers")
        return
      }

      // Reload data after successful deletion
      loadData()
    } catch (error) {
      console.error("Error revoking access:", error)
      alert("Ein Fehler ist aufgetreten")
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 pt-32 pb-32 lg:px-12 lg:pb-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Zurück zu Meine Sammlung</span>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl italic text-on-surface">Einstellungen</h1>
          <p className="mt-2 text-on-surface-variant">Benutzer-Management und Fahrzeug-Zugriff</p>
          {userEmail && (
            <p className="mt-4 text-sm text-on-surface-variant">
              Angemeldet als: <span className="font-semibold text-on-surface">{userEmail}</span>
            </p>
          )}
        </div>


        {/* Content */}
        {loading ? (
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-8 text-center">
            <p className="text-on-surface-variant">Lädt...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Add User Form */}
            <AddUserForm
              vehicles={vehicles}
              onUserAdded={handleUserAdded}
            />

            {/* Users Table */}
            <UsersTable users={users} onRevoke={handleRevokeAccess} />

            {/* My Vehicles Info */}
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-6">
              <h3 className="font-semibold text-on-surface mb-4">Deine Fahrzeuge ({vehicles.length})</h3>
              {vehicles.length === 0 ? (
                <p className="text-on-surface-variant">Noch keine Fahrzeuge</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {vehicles.map(v => (
                    <div key={v.id} className="rounded border border-outline-variant/20 bg-surface-container-low p-3">
                      <p className="font-medium text-on-surface text-sm">{v.make} {v.model}</p>
                      <p className="text-xs text-on-surface-variant">{v.year ?? "N/A"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
