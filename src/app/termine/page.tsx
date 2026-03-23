import Link from "next/link"
import { Plus } from "lucide-react"
import { TopAppBar } from "@/components/TopAppBar"
import { BottomNav } from "@/components/BottomNav"

interface Termin {
  id: string
  fahrzeug: string
  typ: "wartung" | "reminder"
  beschreibung: string
  datum: string
  status: "pending" | "completed" | "overdue"
}

const TERMINE: Termin[] = [
  {
    id: "1",
    fahrzeug: "Porsche 911 Carrera",
    typ: "wartung",
    beschreibung: "Ölwechsel",
    datum: "2026-03-25",
    status: "pending",
  },
  {
    id: "2",
    fahrzeug: "Mercedes-Benz E-Class",
    typ: "reminder",
    beschreibung: "TÜV-Überprüfung",
    datum: "2026-04-10",
    status: "pending",
  },
  {
    id: "3",
    fahrzeug: "BMW M5",
    typ: "wartung",
    beschreibung: "Bremsenwechsel",
    datum: "2026-03-20",
    status: "overdue",
  },
  {
    id: "4",
    fahrzeug: "Audi RS6 Avant",
    typ: "reminder",
    beschreibung: "Reifenrotation",
    datum: "2026-03-18",
    status: "completed",
  },
]

function getStatusConfig(status: string) {
  switch (status) {
    case "pending":
      return { label: "Anstehend", bg: "bg-amber/20", text: "text-amber", border: "border-amber/30" }
    case "completed":
      return { label: "Abgeschlossen", bg: "bg-success/20", text: "text-success", border: "border-success/30" }
    case "overdue":
      return { label: "Überfällig", bg: "bg-error/20", text: "text-error", border: "border-error/30" }
    default:
      return { label: "Unbekannt", bg: "bg-outline-variant/20", text: "text-on-surface-variant", border: "border-outline-variant/30" }
  }
}

function getTypeLabel(typ: string) {
  return typ === "wartung" ? "Wartung" : "Reminder"
}

export default function TerminePage() {
  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 pt-32 pb-32 lg:px-12 lg:pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl italic text-on-surface">Wartungstermine</h1>
          <p className="mt-2 text-on-surface-variant">Verwaltung von Wartungen und Erinnerungen</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {["Alle", "Wartung", "Reminder"].map((filter) => (
            <button
              key={filter}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                filter === "Alle"
                  ? "bg-primary text-surface"
                  : "border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Termine List */}
        <div className="space-y-4">
          {TERMINE.map((termin) => {
            const statusConfig = getStatusConfig(termin.status)
            const datum = new Date(termin.datum)
            const formattedDate = datum.toLocaleDateString("de-DE", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })

            return (
              <div
                key={termin.id}
                className="flex items-center gap-4 rounded-lg border border-outline-variant/20 bg-surface-container-low p-4 transition-all duration-300 hover:border-outline-variant/40 hover:bg-surface-container md:gap-6"
              >
                {/* Date Badge */}
                <div className="flex flex-shrink-0 flex-col items-center rounded-lg bg-surface-container-high px-3 py-2 text-center">
                  <span className="text-2xl font-bold text-primary">{datum.getDate()}</span>
                  <span className="text-xs uppercase text-on-surface-variant">
                    {datum.toLocaleDateString("de-DE", { month: "short" })}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-lg italic text-on-surface">{termin.beschreibung}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{termin.fahrzeug}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-block rounded-full bg-outline-variant/10 px-3 py-1 text-xs font-medium text-on-surface-variant">
                      {getTypeLabel(termin.typ)}
                    </span>
                    <span
                      className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="hidden flex-shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-surface transition-all duration-300 hover:bg-primary/90 md:block">
                  Bearbeiten
                </button>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {TERMINE.length === 0 && (
          <div className="rounded-lg border border-dashed border-outline-variant/30 bg-surface-container/50 py-12 text-center">
            <p className="text-on-surface-variant">Keine Termine gefunden</p>
          </div>
        )}
      </main>

      {/* FAB - Neue Wartung */}
      <Link
        href="/termine/new"
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full champagne-gradient text-surface transition-all duration-300 hover:scale-110 lg:bottom-8"
      >
        <Plus className="h-6 w-6" />
      </Link>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
