'use client'

interface TrustSignal {
  icon: string
  title: string
  description: string
}

const trustSignals: TrustSignal[] = [
  {
    icon: '🔐',
    title: 'DSGVO-konform',
    description:
      'Deine Daten werden in der EU gespeichert und gehören nur dir.',
  },
  {
    icon: '🇩🇪',
    title: 'Made in Germany',
    description: 'Entwickelt und gehostet in Deutschland.',
  },
  {
    icon: '🛡️',
    title: 'Ende-zu-Ende Sicherheit',
    description: 'Verschlüsselte Datenübertragung, granulare Zugriffsrechte.',
  },
]

export function SocialProofSection() {
  return (
    <section
      className="py-24 sm:py-32"
      style={{ backgroundColor: '#F0ECE3' }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Overline */}
        <div className="mb-6">
          <p
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: '#9B9B9B', letterSpacing: '2px' }}
          >
            Was Sammler sagen
          </p>
        </div>

        {/* Headline */}
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
          style={{ color: '#0A1A2F' }}
        >
          Vertrauen entsteht nicht durch Versprechen.
        </h2>

        {/* Trust Signals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustSignals.map((signal, idx) => (
            <div
              key={idx}
              className="rounded-lg p-6 shadow-md border"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E0DDD4',
              }}
            >
              <div className="text-3xl mb-3">{signal.icon}</div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: '#0A1A2F' }}
              >
                {signal.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#666666' }}
              >
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
