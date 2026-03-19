import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VehicleForm } from '@/components/vehicles/vehicle-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Fahrzeug bearbeiten | GarageOS',
  description: 'Bearbeiten Sie Ihre Fahrzeugdetails',
}

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { id } = await params

  // Fetch vehicle
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !vehicle) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/vehicles/${vehicle.id}`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-[#C9A84C] mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu {vehicle.make} {vehicle.model}
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#F0F0F0]">
          {vehicle.make} {vehicle.model} bearbeiten
        </h1>
        <p className="text-gray-400 mt-2">Aktualisieren Sie die Fahrzeugdetails</p>
      </div>

      <div className="bg-[#1E1E1E] rounded-lg p-8 border border-gray-800">
        <VehicleForm vehicle={vehicle} />
      </div>
    </div>
  )
}
