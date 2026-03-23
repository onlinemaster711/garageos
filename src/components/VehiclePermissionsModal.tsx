"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { UserAccess } from "./UsersTable"

export interface Vehicle {
  id: string
  make: string
  model: string
  year?: number
}

export interface VehiclePermission {
  vehicleId: string
  canView: boolean
  canEdit: boolean
  canUpload: boolean
}

interface VehiclePermissionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserAccess
  vehicles?: Vehicle[]
  onSave?: (permissions: VehiclePermission[]) => void
}

export function VehiclePermissionsModal({
  open,
  onOpenChange,
  user,
  vehicles = [],
  onSave,
}: VehiclePermissionsModalProps) {
  const [permissions, setPermissions] = useState<VehiclePermission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize permissions from vehicles
  useEffect(() => {
    if (vehicles.length > 0) {
      setPermissions(
        vehicles.map((v) => ({
          vehicleId: v.id,
          canView: false,
          canEdit: false,
          canUpload: false,
        }))
      )
    }
  }, [vehicles])

  const handleToggle = (
    vehicleId: string,
    key: "canView" | "canEdit" | "canUpload"
  ) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.vehicleId === vehicleId ? { ...p, [key]: !p[key] } : p
      )
    )
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      // TODO: API call to save permissions
      // const response = await fetch('/api/users/permissions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     guestUserId: user.guest_user_id,
      //     permissions
      //   })
      // })
      // if (!response.ok) throw new Error('Failed to save permissions')

      onSave?.(permissions)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-outline-variant/20 bg-surface-container shadow-lg">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-high p-6">
          <h2 className="text-xl font-semibold text-on-surface">
            Berechtigungen für {user.email}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {vehicles.length === 0 ? (
            <p className="text-center text-on-surface-variant">
              Noch keine Autos vorhanden
            </p>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => {
                const perm = permissions.find((p) => p.vehicleId === vehicle.id)
                if (!perm) return null

                return (
                  <div
                    key={vehicle.id}
                    className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4"
                  >
                    <div className="mb-3">
                      <p className="font-semibold text-on-surface">
                        {vehicle.make} {vehicle.model}
                        {vehicle.year && ` (${vehicle.year})`}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* View Permission */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={perm.canView}
                          onChange={() => handleToggle(vehicle.id, "canView")}
                          className="h-4 w-4 accent-primary"
                        />
                        <span className="text-sm text-on-surface">
                          Fahrzeug anzeigen
                        </span>
                      </label>

                      {/* Edit Permission */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={perm.canEdit}
                          onChange={() => handleToggle(vehicle.id, "canEdit")}
                          disabled={!perm.canView}
                          className="h-4 w-4 accent-primary disabled:opacity-50"
                        />
                        <span
                          className={`text-sm ${
                            perm.canView
                              ? "text-on-surface"
                              : "text-on-surface-variant"
                          }`}
                        >
                          Fahrzeug bearbeiten
                        </span>
                      </label>

                      {/* Upload Permission */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={perm.canUpload}
                          onChange={() => handleToggle(vehicle.id, "canUpload")}
                          disabled={!perm.canView}
                          className="h-4 w-4 accent-primary disabled:opacity-50"
                        />
                        <span
                          className={`text-sm ${
                            perm.canView
                              ? "text-on-surface"
                              : "text-on-surface-variant"
                          }`}
                        >
                          Fotos hochladen
                        </span>
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 border-t border-outline-variant/20 bg-surface-container-high p-6">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 border-outline-variant text-on-surface hover:bg-surface-container-high"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 champagne-gradient text-surface-container hover:opacity-90"
          >
            {loading ? "Speichert..." : "Speichern"}
          </Button>
        </div>
      </div>
    </div>
  )
}
