"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SetPasswordPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [invitationData, setInvitationData] = useState<{
    email: string
    vehicleCount: number
  } | null>(null)

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/invite/${token}`)

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || "Token ungültig oder abgelaufen")
          setValidating(false)
          return
        }

        const data = await response.json()
        setInvitationData({
          email: data.email,
          vehicleCount: data.vehicleCount,
        })
        setValidating(false)
      } catch (err) {
        setError("Fehler beim Validieren des Tokens")
        setValidating(false)
      }
    }

    validateToken()
  }, [token])

  const validateForm = (): string | null => {
    if (!password) {
      return "Passwort ist erforderlich"
    }

    if (password.length < 8) {
      return "Passwort muss mindestens 8 Zeichen lang sein"
    }

    if (password !== confirmPassword) {
      return "Passwörter stimmen nicht überein"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const formError = validateForm()
    if (formError) {
      setError(formError)
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/auth/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Fehler beim Erstellen des Kontos")
        setLoading(false)
        return
      }

      setSuccess(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError("Ein Fehler ist aufgetreten")
      setLoading(false)
    }
  }

  // Loading state
  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface to-surface-container flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-outline-variant/20 bg-surface-container p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-outline-variant border-t-primary"></div>
          <p className="mt-4 text-on-surface-variant">Validiere Einladungs-Token...</p>
        </div>
      </div>
    )
  }

  // Error state - invalid/expired token
  if (error && !invitationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface to-surface-container flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-outline-variant/20 bg-surface-container p-8">
          <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400 mb-6">
            {error}
          </div>

          <p className="text-on-surface-variant mb-6">
            Der Einladungs-Link ist ungültig oder abgelaufen. Bitte fordere eine neue Einladung an oder kontaktiere den Fahrzeugbesitzer.
          </p>

          <Link href="/auth/login">
            <Button className="w-full champagne-gradient text-surface-container hover:opacity-90">
              Zur Anmeldung
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface to-surface-container flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-outline-variant/20 bg-surface-container p-8 text-center">
          <div className="inline-block h-12 w-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-6">
            <span className="text-2xl">✓</span>
          </div>

          <h2 className="font-serif text-2xl text-on-surface mb-2">Konto erstellt!</h2>
          <p className="text-on-surface-variant mb-6">
            Dein Passwort wurde gespeichert. Du wirst zum Dashboard weitergeleitet...
          </p>

          <div className="h-1 w-full bg-outline-variant/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-container flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-primary hover:opacity-80 mb-8 transition-opacity">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Zurück</span>
        </Link>

        <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl italic text-on-surface mb-2">
              Willkommen bei GarageOS
            </h1>
            <p className="text-on-surface-variant">
              Erstelle dein Passwort, um dein Konto zu aktivieren
            </p>
          </div>

          {/* Invitation details */}
          {invitationData && (
            <div className="rounded-lg bg-primary/10 p-4 mb-6 border border-primary/20">
              <p className="text-sm text-on-surface mb-1">
                <span className="font-semibold">Email:</span> {invitationData.email}
              </p>
              <p className="text-sm text-on-surface">
                <span className="font-semibold">Freigegebene Fahrzeuge:</span> {invitationData.vehicleCount}
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-on-surface-variant mb-2">
                Passwort *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded border border-outline-variant/50 bg-surface-container-low px-4 py-2.5 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none disabled:opacity-50"
                  placeholder="Mindestens 8 Zeichen"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password field */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-on-surface-variant mb-2">
                Passwort bestätigen *
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded border border-outline-variant/50 bg-surface-container-low px-4 py-2.5 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none disabled:opacity-50"
                  placeholder="Passwort wiederholen"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div className="text-xs text-on-surface-variant space-y-1 mt-4 p-3 bg-surface-container-low rounded border border-outline-variant/20">
              <p className={password.length >= 8 ? "text-green-400" : ""}>
                ✓ Mindestens 8 Zeichen
              </p>
              <p className={password === confirmPassword && password ? "text-green-400" : ""}>
                ✓ Passwörter stimmen überein
              </p>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full champagne-gradient text-surface-container hover:opacity-90 mt-6"
            >
              {loading ? "Wird erstellt..." : "Konto erstellen"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-xs text-on-surface-variant text-center mt-6">
            Mit dem Erstellen des Kontos akzeptierst du unsere Nutzungsbedingungen
          </p>
        </div>
      </div>
    </div>
  )
}
