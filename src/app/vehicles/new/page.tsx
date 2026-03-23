import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VehicleForm } from '@/components/vehicles/vehicle-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TopAppBar } from '@/components/TopAppBar'
import { BottomNav } from '@/components/BottomNav'

export const metadata = {
  title: 'Neues Fahrzeug | GarageOS',
  description: 'Fügen Sie ein neues Fahrzeug zu Ihrer Garage hinzu',
}

export default async function NewVehiclePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const userInitials = user.email
    ?.split("@")[0]
    .substring(0, 2)
    .toUpperCase() || "GB"

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar userInitials={userInitials} userName={user.email || "User"} />

      <main className="mx-auto max-w-7xl px-6 py-8 pt-32 lg:px-12 lg:pb-32">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Garage
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Neues Fahrzeug</h1>
          <p className="text-on-surface-variant mt-2">
            Fügen Sie die Details Ihres neuen Fahrzeugs ein
          </p>
        </div>

        <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-8">
          <VehicleForm />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
