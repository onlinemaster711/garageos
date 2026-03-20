'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    setIsLoaded(true)

    const handleScroll = () => {
      setScrollY(window.scrollY * 0.5)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden pt-20"
      style={{
        background: 'linear-gradient(135deg, #0A1A2F 0%, #1A1A2E 100%)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-140px)]">
          {/* Left Content */}
          <div
            className={`flex flex-col justify-center transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Overline */}
            <div className="mb-6">
              <p
                className="text-sm font-semibold tracking-widest uppercase"
                style={{ color: '#9B9B9B', letterSpacing: '2px' }}
              >
                Premium Fahrzeug-Management
              </p>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ color: '#E6E6E6', lineHeight: '1.2' }}
            >
              Deine Sammlung.{' '}
              <span style={{ color: '#E5C97B' }}>Dein System.</span>
            </h1>

            {/* Subline */}
            <p
              className="text-lg sm:text-xl leading-relaxed mb-8 max-w-xl"
              style={{ color: '#E6E6E6' }}
            >
              Verwalte alle Fahrzeuge, Dokumente und Termine an einem Ort — in einer App, die so gut ist wie die Autos darin.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold transition-all duration-200 text-center"
                style={{
                  backgroundColor: '#E5C97B',
                  color: '#0A1A2F',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#D4B85F'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#E5C97B'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                Kostenlos starten
              </Link>
              <button
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all duration-200 group"
                style={{ color: '#E5C97B' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                Demo ansehen
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Trust Element */}
            <p
              className="text-sm"
              style={{ color: '#9B9B9B' }}
            >
              Keine Kreditkarte nötig · Bis 3 Fahrzeuge kostenlos · DSGVO-konform
            </p>
          </div>

          {/* Right Content - Screenshot/Mockup */}
          <div
            className={`relative transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
            style={{
              transform: `translateY(${scrollY}px)`,
            }}
          >
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl border"
              style={{
                borderColor: '#E5C97B',
                boxShadow: '0 20px 60px rgba(229, 201, 123, 0.15)',
              }}
            >
              {/* Hero Dashboard Screenshot */}
              <Image
                src="/screenshots/feature-overview.png"
                alt="GarageOS Dashboard — Fahrzeug-Management System"
                width={800}
                height={500}
                className="w-full h-auto"
                priority={true}
                onError={(result) => {
                  console.error('Image failed to load:', result)
                }}
              />

              {/* Glow Effect */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at top right, rgba(229, 201, 123, 0.1), transparent 70%)',
                }}
              />
            </div>

            {/* Floating Elements (optional) */}
            <div
              className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: '#E5C97B' }}
            />
            <div
              className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{ backgroundColor: '#E5C97B' }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(10, 26, 47, 0.5))',
        }}
      />
    </section>
  )
}
