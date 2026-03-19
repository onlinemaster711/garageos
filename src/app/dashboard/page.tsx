import { createClient } from '@/lib/supabase/server'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { ReminderList } from '@/components/reminders/reminder-list'
import { StandzeitWarnings } from '@/components/dashboard/standzeit-warnings'
import Link from 'next/link'
import { Plus, Car } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F0F0F0]">
              Deine Garage
            </h1>
            <p className="text-sm sm:text-base text-[#9B9B9B] mt-1">
              {vehicles?.length || 0} Fahrzeug{vehicles?.length !== 1 ? 'e' : ''}
            </p>
          </div>
          <Link
            href="/vehicles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2.5 text-sm font-medium text-[#0A0A0A] hover:bg-[#B8961F] transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Fahrzeug hinzufügen
          </Link>
        </div>

        {/* Warnings & Reminders Section */}
        {vehicles && vehicles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-[#F0F0F0] mb-3">Anstehende Erinnerungen</h2>
              <ReminderList />
            </div>
            <div>
              <StandzeitWarnings />
            </div>
          </div>
        )}

        {/* Vehicle Grid or Empty State */}
        {vehicles && vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
            <div className="rounded-full bg-[#1E1E1E] p-4 sm:p-6 mb-6">
              <Car className="h-10 w-10 sm:h-12 sm:w-12 text-[#C9A84C]" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#F0F0F0] mb-2">
              Noch keine Fahrzeuge
            </h2>
            <p className="text-sm sm:text-base text-[#9B9B9B] mb-6 max-w-md">
              Füge dein erstes Fahrzeug hinzu und beginne mit der Verwaltung deiner Sammlung.
            </p>
            <Link
              href="/vehicles/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2.5 text-sm font-medium text-[#0A0A0A] hover:bg-[#B8961F] transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              Erstes Fahrzeug hinzufügen
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
