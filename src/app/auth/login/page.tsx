'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: 'Fehler',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Erfolg',
          description: 'Du wurdest erfolgreich angemeldet.',
        })
        router.push('/dashboard')
        router.refresh()
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0A0A0A' }}>
      <div
        className="w-full max-w-md rounded-lg p-8 shadow-2xl border"
        style={{ backgroundColor: '#1E1E1E', borderColor: '#333333' }}
      >
        {/* Logo and Tagline */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#C9A84C' }}>
            GarageOS
          </h1>
          <p className="text-sm" style={{ color: '#A0A0A0' }}>
            Deine Sammlung auf Autopilot
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#F0F0F0' }}>
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
                backgroundColor: '#2A2A2A',
                borderColor: '#444444',
                color: '#F0F0F0',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#F0F0F0' }}>
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
                backgroundColor: '#2A2A2A',
                borderColor: '#444444',
                color: '#F0F0F0',
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 font-medium transition-all"
            style={{
              backgroundColor: '#C9A84C',
              color: '#0A0A0A',
            }}
          >
            {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
          </Button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center text-sm" style={{ color: '#A0A0A0' }}>
          Noch kein Konto?{' '}
          <Link
            href="/auth/signup"
            className="font-medium hover:underline"
            style={{ color: '#C9A84C' }}
          >
            Jetzt registrieren
          </Link>
        </div>
      </div>
    </div>
  )
}
