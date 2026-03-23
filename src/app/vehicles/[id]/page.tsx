'use client'

import { useState, useEffect } from "react"
import { redirect, notFound, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { TopAppBar } from "@/components/TopAppBar"
import { BottomNav } from "@/components/BottomNav"
import { DrivesTab } from "@/components/vehicles/drives-tab"
import { TiresTab } from "@/components/vehicles/tires-tab"
import { ArrowLeft, MapPin, FileText, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  category: 'modern' | 'oldtimer' | 'youngtimer'
  color?: string
  cover_photo_url?: string
  user_id: string
}

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("specs")

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const { id } = await params
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single()

        if (error || !data) {
          router.push("/404")
          return
        }

        setVehicle(data)
      } catch (error) {
        console.error("Error fetching vehicle:", error)
        router.push("/404")
      } finally {
        setLoading(false)
      }
    }

    fetchVehicle()
  }, [params, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <TopAppBar />
        <main className="mx-auto max-w-7xl px-6 pt-20 pb-32 lg:px-12 lg:pb-12">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-on-surface-variant">Laden...</p>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-surface">
        <TopAppBar />
        <main className="mx-auto max-w-7xl px-6 pt-20 pb-32 lg:px-12 lg:pb-12">
          <p className="text-center text-on-surface-variant">Fahrzeug nicht gefunden</p>
        </main>
        <BottomNav />
      </div>
    )
  }

  // Mock data for demonstration
  const mockStats = {
    ps: 450,
    acceleration: "4.5",
  }

  const categoryLabels = {
    modern: "Modern",
    oldtimer: "Oldtimer",
    youngtimer: "Youngtimer",
  }

  const categoryColors = {
    modern: { badge: "bg-on-surface-variant/10 text-on-surface-variant border-outline-variant/20" },
    oldtimer: { badge: "bg-primary/10 text-primary border-primary/20" },
    youngtimer: { badge: "bg-tertiary/10 text-tertiary border-tertiary/20" },
  }

  const color = categoryColors[vehicle.category as keyof typeof categoryColors]

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 pt-20 pb-32 lg:px-12 lg:pb-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="mb-12 inline-flex items-center gap-2 text-primary transition-colors duration-300 hover:text-primary/80"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Zurück zu Meine Sammlung</span>
        </Link>

        {/* HERO SECTION */}
        <section className="mb-16">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Text Content - Left */}
            <div className="flex flex-col justify-center space-y-8 lg:col-span-5 order-2 lg:order-1">
              {/* Category Badge */}
              <div className="inline-flex w-fit">
                <span
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${color.badge}`}
                >
                  {categoryLabels[vehicle.category as keyof typeof categoryLabels]}
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-serif text-7xl lg:text-8xl xl:text-9xl italic leading-tight text-on-surface">
                {vehicle.make}
                <br />
                <span className="text-primary">{vehicle.model}</span>
              </h1>

              {/* Description with Left Border */}
              <div className="border-l-4 border-primary/30 pl-6 space-y-4">
                <p className="text-lg text-on-surface-variant leading-relaxed">
                  Ein beeindruckendes Fahrzeug mit präziser Ingenieurkunst und luxuriösem Design.
                </p>
                <p className="text-sm text-on-surface-variant">
                  Baujahr: <span className="font-semibold">{vehicle.year || "N/A"}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row pt-4">
                <Link
                  href={`/vehicles/${vehicle.id}/edit`}
                  className="champagne-gradient flex items-center justify-center rounded-lg px-6 py-3 font-medium text-surface-container transition-all duration-300 hover:scale-105"
                >
                  Fahrzeug bearbeiten
                </Link>
                <button className="flex items-center justify-center rounded-lg border-2 border-primary/40 px-6 py-3 font-medium text-primary transition-all duration-300 hover:border-primary hover:bg-primary/5">
                  Service buchen
                </button>
              </div>

              {/* Floating Stats Card */}
              <div className="mt-8 rounded-lg glass-card border border-outline-variant/20 p-6 space-y-4 w-fit">
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider">Leistung</p>
                    <p className="text-3xl font-bold text-primary">{mockStats.ps} PS</p>
                  </div>
                  <div className="border-l border-outline-variant/20" />
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider">Beschleunigung</p>
                    <p className="text-3xl font-bold text-primary">{mockStats.acceleration}s</p>
                    <p className="text-xs text-on-surface-variant">0-100 km/h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image - Right */}
            <div className="relative lg:col-span-7 order-1 lg:order-2">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-gradient-to-br from-surface-container-high to-surface-container">
                {vehicle.cover_photo_url ? (
                  <Image
                    src={vehicle.cover_photo_url}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-surface-container-high">
                    <p className="text-on-surface-variant/50">Kein Bild verfügbar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* TAB NAVIGATION */}
        <section className="mb-16">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="specs">Technische Daten</TabsTrigger>
              <TabsTrigger value="insurance">Versicherung & Dokumente</TabsTrigger>
              <TabsTrigger value="drives">Fahrten</TabsTrigger>
              <TabsTrigger value="tires">Reifen</TabsTrigger>
            </TabsList>

            {/* SPECIFICATIONS GRID */}
            <TabsContent value="specs" className="mt-8 space-y-8">
              <h2 className="font-serif text-3xl italic text-on-surface">Technische Daten</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Marke", value: vehicle.make },
                  { label: "Modell", value: vehicle.model },
                  { label: "Baujahr", value: vehicle.year || "N/A" },
                  { label: "Farbe", value: vehicle.color },
                  { label: "VIN", value: "WBADT43452G123456" },
                  { label: "Kennzeichen", value: "HH-GS 2024" },
                  { label: "Kaufdatum", value: "2024-03-15" },
                  { label: "Standort", value: "Hamburg, Deutschland" },
                ].map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4 transition-all duration-300 hover:border-primary/40 hover:bg-primary/[0.02]"
                  >
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider">{spec.label}</p>
                    <p className="mt-2 font-semibold text-on-surface">{spec.value}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* INSURANCE & ASSETS */}
            <TabsContent value="insurance" className="mt-8 space-y-8">
              <h2 className="font-serif text-3xl italic text-on-surface">Versicherung & Dokumente</h2>

              {/* Insurance Card */}
              <div className="rounded-lg glass-card border border-outline-variant/20 p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-on-surface">Allianz Luxury Drive</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        <span className="text-xs text-on-surface-variant">Aktiv</span>
                      </div>
                    </div>
                    <p className="text-sm text-on-surface-variant">Versicherungsnummer: AL-2024-12345</p>
                    <p className="text-sm text-on-surface-variant">Gültig bis: 2025-03-15</p>
                  </div>
                  <button className="rounded-lg border border-primary/40 px-4 py-2 text-sm font-medium text-primary transition-all duration-300 hover:border-primary hover:bg-primary/5">
                    Dokument hinzufügen
                  </button>
                </div>
              </div>

              {/* Assets Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <button className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-outline-variant/30 bg-surface-container-low p-8 transition-all duration-300 hover:border-primary hover:bg-primary/[0.02]">
                  <Plus className="h-6 w-6 text-on-surface-variant" />
                  <span className="text-sm font-medium text-on-surface-variant">Dokument hinzufügen</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-outline-variant/30 bg-surface-container-low p-8 transition-all duration-300 hover:border-primary hover:bg-primary/[0.02]">
                  <Plus className="h-6 w-6 text-on-surface-variant" />
                  <span className="text-sm font-medium text-on-surface-variant">Foto hinzufügen</span>
                </button>
              </div>
            </TabsContent>

            {/* DRIVES TAB */}
            <TabsContent value="drives" className="mt-8">
              <DrivesTab vehicleId={vehicle.id} />
            </TabsContent>

            {/* TIRES TAB */}
            <TabsContent value="tires" className="mt-8">
              <TiresTab vehicleId={vehicle.id} />
            </TabsContent>
          </Tabs>
        </section>
      </main>

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  )
}
