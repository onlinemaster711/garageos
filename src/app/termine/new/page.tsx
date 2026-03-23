import Link from "next/link"
import { TopAppBar } from "@/components/TopAppBar"
import { BottomNav } from "@/components/BottomNav"
import { ArrowLeft } from "lucide-react"

export default function NewTerminPage() {
  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 pt-32 pb-32 lg:px-12 lg:pb-12">
        {/* Back Button */}
        <Link
          href="/termine"
          className="mb-8 inline-flex items-center gap-2 text-primary transition-colors duration-300 hover:text-primary/80"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Zurück</span>
        </Link>

        {/* Placeholder */}
        <div className="rounded-lg border border-dashed border-outline-variant/30 bg-surface-container/50 py-24 text-center">
          <h1 className="font-serif text-3xl italic text-on-surface">Neue Wartung hinzufügen</h1>
          <p className="mt-4 text-on-surface-variant">Coming soon... 🚀</p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
