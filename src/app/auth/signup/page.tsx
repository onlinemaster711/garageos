'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const { toast } = useToast()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const validatePasswords = (): boolean => {
    if (password.length < 6) {
      toast({
        title: 'Fehler',
        description: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
        variant: 'destructive',
      })
      return false
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Fehler',
        description: 'Die Passwörter stimmen nicht überein.',
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswords()) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast({
          title: 'Fehler',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        setShowSuccess(true)
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0A1A2F' }}>
      <div
        className="w-full max-w-md rounded-lg p-8 shadow-2xl border"
        style={{ backgroundColor: '#2A2D30', borderColor: '#4A5260' }}
      >
        {/* Logo and Tagline */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#E5C97B' }}>
            GarageOS
          </h1>
          <p className="text-sm" style={{ color: '#A0A0A0' }}>
            Deine Sammlung auf Autopilot
          </p>
        </div>

        {showSuccess ? (
          <div className="text-center">
            <div className="mb-4 text-5xl">✓</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#E6E6E6' }}>
              Registrierung erfolgreich
            </h2>
            <p className="text-sm mb-6" style={{ color: '#A0A0A0' }}>
              Bitte überprüfe dein E-Mail-Postfach. Wir haben dir einen Bestätigungslink gesendet.
            </p>
            <Link href="/auth/login" className="text-sm font-medium hover:underline" style={{ color: '#E5C97B' }}>
              Zurück zur Anmeldung
            </Link>
          </div>
        ) : (
          <>
            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#E6E6E6' }}>
                  E-Mail
                </label>
                <Input
                  type="email"
                  placeholder="dein@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full"
                  style={{
                    backgroundColor: '#3D4450',
                    borderColor: '#5A6270',
                    color: '#E6E6E6',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#E6E6E6' }}>
                  Passwort
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full"
                  style={{
                    backgroundColor: '#3D4450',
                    borderColor: '#5A6270',
                    color: '#E6E6E6',
                  }}
                />
                <p className="text-xs mt-1" style={{ color: '#808080' }}>
                  Mindestens 6 Zeichen
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#E6E6E6' }}>
                  Passwort wiederholen
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full"
                  style={{
                    backgroundColor: '#3D4450',
                    borderColor: '#5A6270',
                    color: '#E6E6E6',
                  }}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 font-medium transition-all"
                style={{
                  backgroundColor: '#E5C97B',
                  color: '#0A1A2F',
                }}
              >
                {isLoading ? 'Wird registriert...' : 'Registrieren'}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm" style={{ color: '#A0A0A0' }}>
              Bereits ein Konto?{' '}
              <Link
                href="/auth/login"
                className="font-medium hover:underline"
                style={{ color: '#E5C97B' }}
              >
                Anmelden
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
