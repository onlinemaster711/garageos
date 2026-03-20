'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#2A2D30]/95 backdrop-blur-md border-b border-[#3D4450]'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl font-bold" style={{ color: '#E5C97B' }}>
            GarageOS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm font-medium transition-colors duration-200 hover:opacity-80"
            style={{ color: '#E6E6E6' }}
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium transition-colors duration-200 hover:opacity-80"
            style={{ color: '#E6E6E6' }}
          >
            Preise
          </Link>
          <Link
            href="#faq"
            className="text-sm font-medium transition-colors duration-200 hover:opacity-80"
            style={{ color: '#E6E6E6' }}
          >
            FAQ
          </Link>
        </div>

        {/* CTA Button + Mobile Menu */}
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="hidden md:inline-flex px-6 py-2.5 rounded-lg font-semibold transition-all duration-200"
            style={{
              backgroundColor: '#E5C97B',
              color: '#0A1A2F',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#D4B85F'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E5C97B'
            }}
          >
            Jetzt starten
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#E6E6E6' }}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden px-4 py-4 border-t"
          style={{ backgroundColor: '#2A2D30', borderColor: '#3D4450' }}
        >
          <div className="space-y-3">
            <Link
              href="#features"
              className="block px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: '#3D4450',
                color: '#E6E6E6',
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="block px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: '#3D4450',
                color: '#E6E6E6',
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Preise
            </Link>
            <Link
              href="#faq"
              className="block px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: '#3D4450',
                color: '#E6E6E6',
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/auth/login"
              className="block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full text-center"
              style={{
                backgroundColor: '#E5C97B',
                color: '#0A1A2F',
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Jetzt starten
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
