import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VehicleDetail } from '@/components/vehicles/vehicle-detail'

export const metadata = {
  title: 'Fahrzeugdetails | GarageOS',
  description: 'Fahrzeugdetails und Wartungshistorie',
}

export default async function VehicleDetailPage({
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
      <VehicleDetail vehicle={vehicle} />
    </div>
  )
}
