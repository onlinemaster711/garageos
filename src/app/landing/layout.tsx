import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GarageOS — Premium Fahrzeug-Management für Sammler',
  description: 'Verwalte alle deine Fahrzeuge, Dokumente und Termine zentral. Kostenlos starten — keine Kreditkarte nötig.',
  keywords: ['Fahrzeugverwaltung', 'Autosammlung', 'Fahrzeug-Management', 'Dokumentenverwaltung', 'Wartungstermine'],
  authors: [{ name: 'GarageOS' }],
  openGraph: {
    title: 'GarageOS — Premium Fahrzeug-Management für Sammler',
    description: 'Verwalte alle deine Fahrzeuge, Dokumente und Termine zentral. Kostenlos starten.',
    url: 'https://garageos.app',
    siteName: 'GarageOS',
    images: [
      {
        url: 'https://garageos.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GarageOS',
      },
    ],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GarageOS — Premium Fahrzeug-Management für Sammler',
    description: 'Verwalte alle deine Fahrzeuge, Dokumente und Termine zentral. Kostenlos starten.',
  },
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
