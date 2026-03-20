'use client'

import { FeatureCard } from './FeatureCard'

const features = [
  {
    subheadline: 'Jedes Detail deiner Sammlung — griffbereit.',
    body: 'Alle deine Fahrzeuge zentral verwalten. Marke, Modell, Baujahr, Kaufpreis, Kategorie — plus Bilder. Ob Oldtimer oder moderner Sportwagen: Jedes Auto bekommt den Platz, den es verdient.',
    imagePath: '/screenshots/feature-vehicles.png',
    imageAlt: 'Fahrzeug-Übersicht',
  },
  {
    subheadline: 'Alle Papiere an einem Ort.',
    body: 'Kaufverträge, TÜV-Berichte, Versicherungspapiere — alles organisiert und leicht zu finden. Keine Zettelwirtschaft mehr, keine vergessenen Dokumente.',
    imagePath: '/screenshots/feature-documents.png',
    imageAlt: 'Dokumente-Verwaltung',
    reversed: true,
  },
  {
    subheadline: 'Wartungen und Termine im Blick.',
    body: 'Planen Sie Service-Intervalle, Inspektionen und Reparaturen. GarageOS erinnert dich an wichtige Termine — TÜV, Ölwechsel, Inspektion.',
    imagePath: '/screenshots/feature-schedule.png',
    imageAlt: 'Termine & Wartung',
  },
  {
    subheadline: 'Reifen-Verwaltung leicht gemacht.',
    body: 'Verfolgen Sie Reifenmarken, Modelle und Bedingungen. Wissen Sie, wann Ihre Reifen gewechselt werden müssen, und verwalten Sie Lagerwechsel.',
    imagePath: '/screenshots/feature-tires.png',
    imageAlt: 'Reifen-Management',
    reversed: true,
  },
  {
    subheadline: 'Jede Fahrt erfasst, analysiert, verstanden.',
    body: 'Tracken Sie Fahrten, Kilometer und Verbrauch. Detaillierte Statistiken helfen dir, deine Sammlung besser zu verstehen und zu pflegen.',
    imagePath: '/screenshots/feature-drives.png',
    imageAlt: 'Fahrten-Tracking',
  },
  {
    subheadline: 'Du entscheidest, wer was sieht.',
    body: 'Laden Sie Familie, Freunde oder Ihren Mechaniker ein — mit granularen Zugriffsrechten. Du bestimmst, wer Zugriff hat und was er sehen darf.',
    imagePath: '/screenshots/feature-security.png',
    imageAlt: 'Sicherheit & Zugriff',
    reversed: true,
  },
]

export function FeaturesSection() {
  return (
    <section
      className="py-24 sm:py-32"
      style={{ backgroundColor: '#F0ECE3' }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-20 lg:space-y-32">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
