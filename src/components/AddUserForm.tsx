"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Vehicle {
  id: string
  make: string
  model: string
  year?: number
}

interface AddUserFormProps {
  vehicles: Vehicle[]
  onUserAdded?: (email: string, vehicleCount: number) => void
}

export function AddUserForm({ vehicles, onUserAdded }: AddUserFormProps) {
  const [email, setEmail] = useState("")
  const [expiryOption, setExpiryOption] = useState<"forever" | "limited">("forever")
  const [expiryDate, setExpiryDate] = useState("")
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Toggle vehicle selection
  const toggleVehicle = (vehicleId: string) => {
    const newSelected = new Set(selectedVehicles)
    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId)
    } else {
      newSelected.add(vehicleId)
    }
    setSelectedVehicles(newSelected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validate email
    if (!email || !email.includes("@")) {
      setError("Bitte geben Sie eine gültige E-Mail-Adresse ein")
      return
    }

    // Validate expiry date if limited
    if (expiryOption === "limited" && !expiryDate) {
      setError("Bitte wählen Sie ein Verfallsdatum aus")
      return
    }

    // Validate at least one vehicle selected
    if (selectedVehicles.size === 0) {
      setError("Bitte wählen Sie mindestens ein Fahrzeug aus")
      return
    }

    setLoading(true)

    try {
      // API call to create user and user_access records
      const response = await fetch("/api/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          vehicleIds: Array.from(selectedVehicles),
          expiresAt: expiryOption === "limited" ? expiryDate : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Fehler beim Hinzufügen des Benutzers")
      }

      const data = await response.json()

      // Success
      setSuccess(true)
      setEmail("")
      setExpiryOption("forever")
      setExpiryDate("")
      setSelectedVehicles(new Set())
      onUserAdded?.(email, selectedVehicles.size)

      // Clear success message after 4s
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-outline-variant/20 bg-surface-container p-6">
      <h3 className="mb-6 font-serif text-xl font-semibold text-on-surface">Benutzer hinzufügen</h3>

      <div className="space-y-6">
        {/* Email Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-on-surface-variant">
            E-Mail-Adresse *
          </label>
          <Input
            id="email"
            type="email"
            placeholder="beispiel@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="border-outline-variant/50 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50"
            required
          />
          <p className="text-xs text-on-surface-variant">
            Der Benutzer muss eine existierende GarageOS-Konto haben
          </p>
        </div>

        {/* Expiry Option */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-on-surface-variant">Gültigkeitsdauer</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="expiry"
                value="forever"
                checked={expiryOption === "forever"}
                onChange={() => setExpiryOption("forever")}
                disabled={loading}
                className="h-4 w-4"
              />
              <span className="text-sm text-on-surface">Für immer</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="expiry"
                value="limited"
                checked={expiryOption === "limited"}
                onChange={() => setExpiryOption("limited")}
                disabled={loading}
                className="h-4 w-4"
              />
              <span className="text-sm text-on-surface">Begrenzt bis</span>
            </label>
          </div>

          {/* Expiry Date Picker */}
          {expiryOption === "limited" && (
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={loading}
              min={new Date().toISOString().split("T")[0]}
              className="rounded border border-outline-variant/50 bg-surface-container-low px-3 py-2 text-on-surface focus:border-primary focus:outline-none"
              required
            />
          )}
        </div>

        {/* Vehicle Selection */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-on-surface-variant">
            Fahrzeuge freigeben * ({selectedVehicles.size} ausgewählt)
          </p>

          {vehicles.length === 0 ? (
            <div className="rounded border border-outline-variant/20 bg-surface-container-low p-4 text-center text-on-surface-variant">
              Noch keine Fahrzeuge vorhanden
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <label
                  key={vehicle.id}
                  className="flex items-start gap-3 rounded border border-outline-variant/20 bg-surface-container-low p-3 cursor-pointer hover:bg-primary/[0.02] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedVehicles.has(vehicle.id)}
                    onChange={() => toggleVehicle(vehicle.id)}
                    disabled={loading}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {vehicle.year ?? "Jahr unbekannt"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
            ✓ Benutzer hinzugefügt! {selectedVehicles.size} Fahrzeuge freigegeben.
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !email || selectedVehicles.size === 0}
          className="champagne-gradient text-surface-container hover:opacity-90 w-full"
        >
          {loading ? "Lädt..." : "Benutzer hinzufügen"}
        </Button>
      </div>
    </form>
  )
}
