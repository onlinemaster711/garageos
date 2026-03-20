'use client'

import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: '#1A1A2E',
        borderColor: '#2A2D30',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Column 1 - Logo & Description */}
          <div>
            <h3
              className="text-2xl font-bold mb-3"
              style={{ color: '#E5C97B' }}
            >
              GarageOS
            </h3>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: '#9B9B9B' }}
            >
              Premium Fahrzeug-Management für Sammler. Deine Sammlung verdient ein System.
            </p>
            <p
              className="text-sm"
              style={{ color: '#9B9B9B' }}
            >
              © {currentYear} GarageOS GmbH
            </p>
          </div>

          {/* Column 2 - Product Links */}
          <div>
            <h4
              className="font-semibold mb-6"
              style={{ color: '#E6E6E6' }}
            >
              Produkt
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Preise', href: '#pricing' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Kontakt', href: 'mailto:hello@garageos.app' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: '#9B9B9B' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#E5C97B'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9B9B9B'
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Legal Links */}
          <div>
            <h4
              className="font-semibold mb-6"
              style={{ color: '#E6E6E6' }}
            >
              Rechtliches
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Impressum', href: '/legal/impressum' },
                { label: 'Datenschutz', href: '/legal/datenschutz' },
                { label: 'AGB', href: '/legal/agb' },
                { label: 'Cookies', href: '/legal/cookies' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: '#9B9B9B' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#E5C97B'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9B9B9B'
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Divider & Credit */}
        <div
          className="pt-8 border-t text-center text-xs"
          style={{ borderColor: '#2A2D30', color: '#9B9B9B' }}
        >
          <p>
            Made with care by{' '}
            <span style={{ color: '#E5C97B' }}>GarageOS</span> · Powered by Next.js
          </p>
        </div>
      </div>
    </footer>
  )
}
