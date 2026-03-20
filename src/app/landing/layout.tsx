import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

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
  return (
    <html lang="de" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0A1A2F" />
      </head>
      <body className={`${inter.className} bg-[#0A1A2F] text-[#E6E6E6]`}>
        {children}
      </body>
    </html>
  )
}
