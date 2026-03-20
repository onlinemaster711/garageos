'use client'

interface ProblemCard {
  icon: string
  title: string
  description: string
}

const problemCards: ProblemCard[] = [
  {
    icon: '📁',
    title: 'Dokumenten-Chaos',
    description: 'Papiere verstreut über Ordner, Mails und Schubladen',
  },
  {
    icon: '⏰',
    title: 'Vergessene Termine',
    description: 'TÜV abgelaufen, Ölwechsel überzogen, Versicherung unklar',
  },
  {
    icon: '🔍',
    title: 'Kein Überblick',
    description: 'Welches Auto braucht was? Wann wurde was gemacht?',
  },
]

export function ProblemSection() {
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
            Das Problem
          </p>
        </div>

        {/* Headline */}
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
          style={{ color: '#0A1A2F' }}
        >
          Deine Sammlung wächst.{' '}
          <span style={{ color: '#E5C97B' }}>Der Überblick nicht.</span>
        </h2>

        {/* Body Text */}
        <div className="space-y-4 mb-16">
          <p
            className="text-lg leading-relaxed"
            style={{ color: '#333333' }}
          >
            Kaufverträge im Ordner. TÜV-Termine im Kalender. Reifeninformationen auf einem Zettel in der Werkstatt. Und die letzte Ölwechsel-Rechnung? Irgendwo.
          </p>
          <p
            className="text-lg leading-relaxed"
            style={{ color: '#333333' }}
          >
            Je mehr Fahrzeuge du hast, desto schwieriger wird es, alles im Griff zu behalten. Das ist kein Luxusproblem — das ist Alltag für jeden Sammler.
          </p>
          <p
            className="text-lg leading-relaxed"
            style={{ color: '#333333' }}
          >
            Es kostet Zeit. Es kostet Nerven. Und am Ende: Es kostet Geld, weil wichtige Termine übersehen werden.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problemCards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-lg p-6 shadow-md border transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E0DDD4',
              }}
            >
              <div className="text-3xl mb-4">{card.icon}</div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: '#0A1A2F' }}
              >
                {card.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#666666' }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
