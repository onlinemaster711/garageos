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
      style={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', borderColor: '#333333' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: '#C9A84C' }}>
              GarageOS
            </h2>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#F0F0F0' }}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/reminders"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#F0F0F0' }}
            >
              Termine
            </Link>
            <Link
              href="/portfolio"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#F0F0F0' }}
            >
              Portfolio
            </Link>
            <Link
              href="/settings"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#F0F0F0' }}
            >
              Einstellungen
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
                  color: '#F0F0F0',
                  backgroundColor: isDropdownOpen ? '#2A2A2A' : 'transparent',
                }}
                title="Benutzer Menü"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl border z-50"
                  style={{ backgroundColor: '#1E1E1E', borderColor: '#444444' }}
                >
                  {/* Profil Header */}
                  <div
                    className="px-4 py-3 border-b"
                    style={{ borderColor: '#333333' }}
                  >
                    <p className="text-xs uppercase tracking-wide" style={{ color: '#808080' }}>
                      Profil
                    </p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#F0F0F0' }}>
                      {user}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {/* Settings */}
                    <Link
                      href="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                      style={{ color: '#F0F0F0' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2A2A2A'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <Settings className="w-4 h-4" style={{ color: '#C9A84C' }} />
                      <span>Einstellungen</span>
                    </Link>
                  </div>

                  {/* Logout Footer */}
                  <div
                    className="px-4 py-2 border-t"
                    style={{ borderColor: '#333333' }}
                  >
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center gap-3 w-full text-sm transition-colors py-1.5"
                      style={{ color: '#FF6B6B' }}
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
              style={{ color: '#F0F0F0' }}
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
              style={{ backgroundColor: '#2A2A2A', color: '#F0F0F0' }}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/reminders"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#F0F0F0' }}
            >
              Termine
            </Link>
            <Link
              href="/portfolio"
              className="block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: '#2A2A2A', color: '#F0F0F0' }}
            >
              Portfolio
            </Link>
            <Link
              href="/settings"
              className="block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: '#2A2A2A', color: '#F0F0F0' }}
            >
              Einstellungen
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: '#FF6B6B20', color: '#FF6B6B' }}
            >
              Abmelden
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
