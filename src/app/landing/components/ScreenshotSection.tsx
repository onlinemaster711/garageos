'use client'

import Image from 'next/image'

export function ScreenshotSection() {
  return (
    <section
      className="py-24 sm:py-32"
      style={{ backgroundColor: '#2A2D30' }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Overline */}
        <div className="mb-6 text-center">
          <p
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: '#9B9B9B', letterSpacing: '2px' }}
          >
            So sieht GarageOS aus
          </p>
        </div>

        {/* Headline */}
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center leading-tight"
          style={{ color: '#E6E6E6' }}
        >
          Gebaut mit Anspruch.{' '}
          <span style={{ color: '#E5C97B' }}>Für Menschen mit Anspruch.</span>
        </h2>

        {/* Body Text */}
        <p
          className="text-lg sm:text-xl leading-relaxed mb-16 max-w-3xl mx-auto text-center"
          style={{ color: '#E6E6E6' }}
        >
          Ein Blick sagt mehr als tausend Features. Erlebe das Dashboard, die Fahrzeug-Ansicht und die Dokumenten-Verwaltung.
        </p>

        {/* Screenshot Container */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl mx-auto max-w-4xl border" style={{ borderColor: '#E5C97B', borderWidth: '2px' }}>
          <Image
            src="/screenshots/feature-overview.png"
            alt="GarageOS Full Dashboard — Complete Vehicle Management Overview"
            width={1000}
            height={600}
            className="w-full h-auto"
            priority={false}
            onError={(result) => {
              console.error('Screenshot failed to load:', result)
            }}
          />

          {/* Glow Effect */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at top right, rgba(229, 201, 123, 0.1), transparent 70%)',
            }}
          />

          {/* Floating Decoration */}
          <div
            className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ backgroundColor: '#E5C97B' }}
          />
        </div>
      </div>
    </section>
  )
}
