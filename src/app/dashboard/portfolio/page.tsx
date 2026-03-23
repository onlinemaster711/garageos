import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft } from "lucide-react"
import { PortfolioOverview } from "@/components/portfolio/portfolio-overview"

export const metadata = {
  title: "Portfolio | GarageOS",
  description: "Deine Fahrzeugsammlung und -portfolio",
}

export default async function PortfolioDashboardPage({
  params,
}: {
  params: Promise<{ id?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { id } = await params

  if (id) {
    // Detail view for a specific vehicle
    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!vehicle) {
      notFound()
    }

    return (
      <div className="space-y-8">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
        >
          <ArrowLeft className="h-5 w-5" />
          Zurück zum Portfolio
        </Link>

        <PortfolioOverview vehicle={vehicle} />
      </div>
    )
  }

  // List view
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl italic text-on-surface">Mein Portfolio</h1>
        <p className="mt-2 text-on-surface-variant">Übersicht über Deine Fahrzeugsammlung</p>
      </div>

      {vehicles && vehicles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/portfolio/${vehicle.id}`}
              className="group rounded-lg border border-outline-variant/20 bg-surface-container p-6 transition-all hover:border-primary/40 hover:bg-primary/[0.02]"
            >
              <h2 className="font-serif text-xl italic text-on-surface group-hover:text-primary">
                {vehicle.make} {vehicle.model}
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {vehicle.year || "N/A"}
              </p>
              <p className="mt-4 text-xs uppercase tracking-wider text-on-surface-variant">
                {vehicle.category}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-12 text-center">
          <p className="text-on-surface-variant">Keine Fahrzeuge in Deinem Portfolio</p>
        </div>
      )}
    </div>
  )
}
