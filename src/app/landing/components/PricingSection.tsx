'use client'

import { PricingCard } from './PricingCard'

const freeFeatures = [
  { label: 'Bis 3 Fahrzeuge', included: true },
  { label: '5 Dokumente pro Auto', included: true },
  { label: 'Nur du', included: true },
  { label: 'Letzte 10 Fahrten', included: true },
  { label: 'Reifen-Management', included: false },
  { label: 'Community Support', included: false },
]

const proFeatures = [
  { label: 'Unbegrenzte Fahrzeuge', included: true },
  { label: '20 Dokumente pro Auto', included: true },
  { label: 'Familie & Mechaniker einladen', included: true },
  { label: 'Unbegrenzte Fahrten + Statistiken', included: true },
  { label: 'Reifen-Management', included: true },
  { label: 'Prioritäts-Support', included: true },
]

export function PricingSection() {
  return (
    <section
      className="py-24 sm:py-32"
      style={{ backgroundColor: '#0A1A2F' }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Overline */}
        <div className="mb-6 text-center">
          <p
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: '#9B9B9B', letterSpacing: '2px' }}
          >
            Preise
          </p>
        </div>

        {/* Headline */}
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center leading-tight"
          style={{ color: '#E6E6E6' }}
        >
          Starte kostenlos.{' '}
          <span style={{ color: '#E5C97B' }}>
            Upgrade, wenn deine Sammlung wächst.
          </span>
        </h2>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16 max-w-4xl mx-auto">
          <PricingCard
            title="Garage Free"
            price="Kostenlos"
            features={freeFeatures}
            buttonLabel="Kostenlos starten"
          />
          <PricingCard
            title="Garage Pro"
            price="9,90 €"
            description="Monatlich kündbar"
            features={proFeatures}
            buttonLabel="Pro wählen"
            isPopular={true}
          />
        </div>

        {/* Footer Text */}
        <p
          className="text-center text-sm mt-12"
          style={{ color: '#9B9B9B' }}
        >
          Alle Preise inkl. MwSt. · Monatlich kündbar · Keine versteckten Kosten
        </p>
      </div>
    </section>
  )
}
