import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VehicleForm } from '@/components/vehicles/vehicle-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-[#C9A84C] mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Garage
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#F0F0F0]">Neues Fahrzeug</h1>
        <p className="text-gray-400 mt-2">
          Fügen Sie die Details Ihres neuen Fahrzeugs ein
        </p>
      </div>

      <div className="bg-[#1E1E1E] rounded-lg p-8 border border-gray-800">
        <VehicleForm />
      </div>
    </div>
  )
}
