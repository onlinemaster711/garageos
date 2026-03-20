'use client'

import Link from 'next/link'

export function FinalCTASection() {
  return (
    <section
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ backgroundColor: '#0A1A2F' }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          style={{ color: '#E6E6E6' }}
        >
          Deine Sammlung{' '}
          <span style={{ color: '#E5C97B' }}>verdient ein System.</span>
        </h2>

        {/* Subline */}
        <p
          className="text-lg sm:text-xl leading-relaxed mb-12 max-w-2xl mx-auto"
          style={{ color: '#E6E6E6' }}
        >
          Starte kostenlos und erlebe, wie einfach Fahrzeug-Management sein kann.
        </p>

        {/* Primary CTA Button */}
        <Link
          href="/auth/login"
          className="inline-flex px-8 sm:px-10 py-4 sm:py-5 rounded-lg font-bold text-lg transition-all duration-200"
          style={{
            backgroundColor: '#E5C97B',
            color: '#0A1A2F',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#D4B85F'
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(229, 201, 123, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#E5C97B'
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Jetzt kostenlos starten
        </Link>

        {/* Trust Element */}
        <p
          className="text-sm sm:text-base mt-8"
          style={{ color: '#9B9B9B' }}
        >
          Keine Kreditkarte · Kein Risiko · In 2 Minuten startklar
        </p>
      </div>

      {/* Background Decorations */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ backgroundColor: '#E5C97B' }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ backgroundColor: '#E5C97B' }}
      />
    </section>
  )
}
