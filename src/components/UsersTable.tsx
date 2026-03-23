"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { VehiclePermissionsModal } from "./VehiclePermissionsModal"

export interface UserAccess {
  id: string
  guest_user_id: string
  email: string
  vehicleCount: number
  createdAt: string
}

interface UsersTableProps {
  users: UserAccess[]
  onRevoke?: (userId: string) => void
}

export function UsersTable({ users, onRevoke }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserAccess | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleViewVehicles = (user: UserAccess) => {
    setSelectedUser(user)
    setModalOpen(true)
  }

  if (!users.length) {
    return (
      <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-8 text-center">
        <p className="text-on-surface-variant">Noch keine Benutzer hinzugefügt</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop: Table View */}
      <div className="hidden overflow-hidden rounded-lg border border-outline-variant/20 md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-outline-variant/20 bg-surface-container-high">
            <tr>
              <th className="px-6 py-3 font-semibold text-on-surface">E-Mail</th>
              <th className="px-6 py-3 font-semibold text-on-surface">Autos Zugriff</th>
              <th className="px-6 py-3 font-semibold text-on-surface">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-outline-variant/20 hover:bg-primary/[0.02] transition-colors"
              >
                <td className="px-6 py-4 text-on-surface">{user.email}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleViewVehicles(user)}
                    className="font-semibold text-primary hover:underline"
                  >
                    {user.vehicleCount} Auto{user.vehicleCount !== 1 ? "s" : ""}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      if (confirm(`Wirklich ${user.email} entfernen?`)) {
                        onRevoke?.(user.guest_user_id)
                      }
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Entfernen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card View */}
      <div className="flex flex-col gap-4 md:hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-lg border border-outline-variant/20 bg-surface-container p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-on-surface">{user.email}</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {user.vehicleCount} Auto{user.vehicleCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => handleViewVehicles(user)}
                size="sm"
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/10"
              >
                Berechtigungen
              </Button>
              <Button
                onClick={() => {
                  if (confirm(`Wirklich ${user.email} entfernen?`)) {
                    onRevoke?.(user.guest_user_id)
                  }
                }}
                size="sm"
                variant="outline"
                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Entfernen
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Modal */}
      {selectedUser && (
        <VehiclePermissionsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          user={selectedUser}
        />
      )}
    </>
  )
}
