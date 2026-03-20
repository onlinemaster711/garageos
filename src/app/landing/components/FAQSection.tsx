'use client'

import { AccordionItem } from './AccordionItem'

const faqs = [
  {
    question: 'Ist GarageOS wirklich kostenlos?',
    answer:
      'Ja. Der Free-Plan ist dauerhaft kostenlos und umfasst bis zu 3 Fahrzeuge. Kein Ablaufdatum, keine versteckten Kosten. Du upgradest nur, wenn du mehr brauchst.',
  },
  {
    question: 'Sind meine Daten sicher?',
    answer:
      'Absolut. GarageOS ist DSGVO-konform, Daten werden in der EU gespeichert und verschlüsselt übertragen. Du kontrollierst, wer Zugriff hat — bis auf die Minute genau.',
  },
  {
    question: 'Kann ich andere Personen einladen?',
    answer:
      'Im Pro-Plan ja. Du kannst Familie, Freunde oder deinen Mechaniker einladen und genau festlegen, wer was sehen und bearbeiten darf. Zugriff kann zeitlich begrenzt werden.',
  },
  {
    question: 'Funktioniert GarageOS auf dem Handy?',
    answer:
      'Ja. GarageOS ist responsive und funktioniert auf Desktop, Tablet und Smartphone. Deine Sammlung ist immer dabei.',
  },
  {
    question: 'Was passiert, wenn ich kündige?',
    answer:
      'Deine Daten bleiben erhalten. Du wirst auf den Free-Plan zurückgestuft. Fahrzeuge über dem Limit werden nicht gelöscht, aber du kannst erst wieder neue anlegen, wenn du unter dem Limit bist.',
  },
  {
    question: 'Für wen ist GarageOS gedacht?',
    answer:
      'Für Fahrzeugsammler, die ihre Autos ernst nehmen. Egal ob Oldtimer, Sportwagen oder gemischte Sammlungen — wenn du mehr als ein Auto hast und den Überblick behalten willst, ist GarageOS für dich.',
  },
]

export function FAQSection() {
  return (
    <section
      className="py-24 sm:py-32"
      style={{ backgroundColor: '#F0ECE3' }}
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Overline */}
        <div className="mb-6 text-center">
          <p
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: '#9B9B9B', letterSpacing: '2px' }}
          >
            Häufige Fragen
          </p>
        </div>

        {/* Headline */}
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-12 text-center leading-tight"
          style={{ color: '#0A1A2F' }}
        >
          Noch Fragen? Hier die Antworten.
        </h2>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
