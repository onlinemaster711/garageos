'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { User, LogOut, Settings } from 'lucide-react'

interface HeaderProps {
  user: string
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: 'Erfolg',
        description: 'Du wurdest erfolgreich abgemeldet.',
      })
      router.push('/auth/login')
      router.refresh()
    } catch {
      toast({
        title: 'Fehler',
        description: 'Fehler beim Abmelden.',
        variant: 'destructive',
      })
    }
  }

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ backgroundColor: 'rgba(10, 26, 47, 0.95)', borderColor: '#3D4450' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: '#E5C97B' }}>
              GarageOS
            </h2>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#E6E6E6' }}
            >
              Fahrzeuge
            </Link>
            <Link
              href="/dashboard/reminders"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#E6E6E6' }}
            >
              Termine
            </Link>
          </nav>

          {/* User Menu & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* User Icon Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2 rounded-lg transition-all"
                style={{
                  color: '#E6E6E6',
                  backgroundColor: isDropdownOpen ? '#3D4450' : 'transparent',
                }}
                title="Benutzer Menü"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl border z-50"
                  style={{ backgroundColor: '#2A2D30', borderColor: '#4A5260' }}
                >
                  {/* Profil Header */}
                  <div
                    className="px-4 py-3 border-b"
                    style={{ borderColor: '#3D4450' }}
                  >
                    <p className="text-xs uppercase tracking-wide" style={{ color: '#909090' }}>
                      Profil
                    </p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#E6E6E6' }}>
                      {user}
                    </p>
                  </div>

                  {/* Settings & Logout Footer */}
                  <div
                    className="px-4 py-2 border-t space-y-1"
                    style={{ borderColor: '#3D4450' }}
                  >
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 w-full text-sm transition-colors py-1.5 rounded"
                      style={{ color: '#E6E6E6' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                      }}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Einstellungen</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center gap-3 w-full text-sm transition-colors py-1.5 rounded"
                      style={{ color: '#E6E6E6' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Abmelden</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: '#E6E6E6' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: '#3D4450', color: '#E6E6E6' }}
            >
              Fahrzeuge
            </Link>
            <Link
              href="/dashboard/reminders"
              className="block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: '#3D4450', color: '#E6E6E6' }}
            >
              Termine
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: '#3D4450', color: '#E6E6E6' }}
            >
              Abmelden
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
