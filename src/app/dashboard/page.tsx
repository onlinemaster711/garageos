import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { TopAppBar } from "@/components/TopAppBar"
import { BottomNav } from "@/components/BottomNav"
import { VehicleCard } from "@/components/VehicleCard"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Meine Sammlung — GarageOS",
  description: "Verwalte deine private Fahrzeugsammlung auf Autopilot",
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  current_mileage: number
  color: string
  category: "modern" | "oldtimer" | "youngtimer"
  cover_photo_url: string | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch vehicles for current user
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const vehicleList = (vehicles as Vehicle[]) || []

  // Get user initials for TopAppBar
  const userInitials = user.email
    ?.split("@")[0]
    .substring(0, 2)
    .toUpperCase() || "GB"

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar userInitials={userInitials} userName={user.email || "User"} />

      <main className="mx-auto max-w-7xl px-6 py-8 pt-32 lg:px-12 lg:pb-32">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Meine Sammlung</h1>
            <p className="mt-2 text-on-surface-variant">
              {vehicleList.length} {vehicleList.length === 1 ? "Fahrzeug" : "Fahrzeuge"}
            </p>
          </div>
          <Link href="/vehicles/new">
            <Button className="bg-primary text-surface-container hover:bg-primary/90">
              <Plus className="mr-2 h-5 w-5" />
              Fahrzeug hinzufügen
            </Button>
          </Link>
        </div>

        {/* Empty State */}
        {vehicleList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant/30 px-8 py-16 text-center">
            <h2 className="text-2xl font-semibold text-foreground">
              Noch keine Fahrzeuge
            </h2>
            <p className="mt-2 text-on-surface-variant">
              Starten Sie mit der Verwaltung Ihrer Sammlung und fügen Sie ihr erstes Fahrzeug hinzu.
            </p>
            <Link href="/vehicles/new" className="mt-6">
              <Button className="bg-primary text-surface-container hover:bg-primary/90">
                <Plus className="mr-2 h-5 w-5" />
                Erstes Fahrzeug hinzufügen
              </Button>
            </Link>
          </div>
        ) : (
          /* Vehicle Grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicleList.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                id={vehicle.id}
                make={vehicle.make}
                model={vehicle.model}
                year={vehicle.year}
                mileage={vehicle.current_mileage}
                color={vehicle.color}
                category={vehicle.category}
                coverPhotoUrl={vehicle.cover_photo_url || undefined}
              />
            ))}

            {/* Add Vehicle Card - Placeholder */}
            <Link href="/vehicles/new">
              <div className="group cursor-pointer">
                <div className="flex aspect-[4/5] items-center justify-center rounded-lg border-2 border-dashed border-outline-variant/30 bg-surface-container/40 transition-colors duration-200 group-hover:border-primary/50 group-hover:bg-surface-container-high/60">
                  <Plus className="h-12 w-12 text-outline-variant/50 transition-colors duration-200 group-hover:text-primary" />
                </div>
                <div className="mt-4 px-1">
                  <p className="text-center font-serif text-lg italic text-on-surface-variant">
                    Fahrzeug hinzufügen
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </main>

      {/* FAB - Floating Action Button (Mobile) */}
      <Link
        href="/vehicles/new"
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full champagne-gradient text-surface-container shadow-lg transition-transform hover:scale-110 lg:hidden"
      >
        <Plus className="h-6 w-6" />
      </Link>

      <BottomNav />
    </div>
  )
}
