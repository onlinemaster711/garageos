'use client'

interface Promise {
  icon: string
  title: string
  description: string
}

const promises: Promise[] = [
  {
    icon: '🏛️',
    title: 'Alles an einem Ort',
    description: 'Fahrzeuge, Dokumente, Termine — keine verstreuten Inseln mehr',
  },
  {
    icon: '🔐',
    title: 'Sicher & privat',
    description:
      'Deine Daten gehören dir. Granulare Zugriffsrechte, DSGVO-konform',
  },
  {
    icon: '✨',
    title: 'Premium-Erlebnis',
    description: 'Kein klobiges Tool, sondern eine App mit Anspruch',
  },
]

export function SolutionSection() {
  return (
    <section
      className="py-24 sm:py-32"
      style={{ backgroundColor: '#0A1A2F' }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Overline */}
        <div className="mb-6">
          <p
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: '#9B9B9B', letterSpacing: '2px' }}
          >
            Die Lösung
          </p>
        </div>

        {/* Headline */}
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
          style={{ color: '#E6E6E6' }}
        >
          Ein System für alles,{' '}
          <span style={{ color: '#E5C97B' }}>was in deiner Garage steht.</span>
        </h2>

        {/* Body Text */}
        <p
          className="text-lg leading-relaxed mb-16 max-w-3xl"
          style={{ color: '#E6E6E6' }}
        >
          GarageOS bringt Ordnung in deine Leidenschaft. Alle Fahrzeuge, Dokumente, Termine, Reifen und Fahrten — zentral, sicher und elegant verwaltet. Kein Werkstatt-Tool. Kein Flottenmanager. Sondern gebaut für Sammler wie dich.
        </p>

        {/* Promises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {promises.map((promise, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl mb-4">{promise.icon}</div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: '#E5C97B' }}
              >
                {promise.title}
              </h3>
              <p
                className="text-base leading-relaxed"
                style={{ color: '#E6E6E6' }}
              >
                {promise.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
