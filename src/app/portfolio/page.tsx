'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function PortfolioPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [vehiclesLoading, setVehiclesLoading] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user?.id) {
        router.push('/auth/login')
        return
      }

      // Check if user has access through permissions
      const { data } = await supabase
        .from('user_permissions')
        .select('id')
        .eq('guest_email', user.email)
        .single()

      // Only the owner can access portfolio, not guests
      if (data) {
        router.push('/dashboard')
        return
      }

      setIsOwner(true)
      // Load vehicles for owner
      await loadVehicles(user.id)
    } catch (err) {
      // No permission found, so this is the owner
      setIsOwner(true)
      // Load vehicles anyway (will need user ID)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.id) {
        await loadVehicles(user.id)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadVehicles = async (userId: string) => {
    try {
      setVehiclesLoading(true)
      console.log('=== LOADING PORTFOLIO VEHICLES ===')
      console.log('User ID:', userId)

      const { data, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (vehiclesError) {
        console.error('Error loading vehicles:', {
          code: vehiclesError.code,
          message: vehiclesError.message,
          details: vehiclesError.details,
        })
        setVehicles([])
        return
      }

      console.log(`✓ ${data?.length || 0} vehicle(s) loaded`)
      setVehicles(data || [])
    } catch (err) {
      console.error('Exception loading vehicles:', err)
      setVehicles([])
    } finally {
      setVehiclesLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1A2F] flex items-center justify-center">
        <p className="text-[#9B9B9B]">Lädt...</p>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#0A1A2F] flex items-center justify-center px-4">
        <div className="text-center">
          <Lock className="w-12 h-12 text-[#E5C97B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#E6E6E6] mb-2">
            Zugriff verweigert
          </h1>
          <p className="text-[#9B9B9B] mb-6">
            Das Portfolio ist nur für den Owner sichtbar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A1A2F] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#E6E6E6] tracking-tight mb-8">
          Portfolio
        </h1>

        {vehiclesLoading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-[#9B9B9B]">Lädt Fahrzeuge...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-[#2A2D30] border border-[#3D4450] rounded-lg p-6">
            <p className="text-[#9B9B9B] text-center py-16">
              Dein Portfolio ist noch leer.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-[#2A2D30] border border-[#3D4450] rounded-lg overflow-hidden hover:border-[#E5C97B] transition-colors"
              >
                {vehicle.image_url && (
                  <div className="aspect-video bg-[#1A2332] overflow-hidden">
                    <img
                      src={vehicle.image_url}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-[#E6E6E6] mb-1">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-[#9B9B9B] mb-3">
                    {vehicle.year} • {vehicle.category}
                  </p>
                  {vehicle.description && (
                    <p className="text-sm text-[#B0B0B0] line-clamp-2">
                      {vehicle.description}
                    </p>
                  )}
                  {vehicle.purchase_price && (
                    <div className="mt-3 pt-3 border-t border-[#3D4450]">
                      <p className="text-xs text-[#9B9B9B] mb-1">Wert</p>
                      <p className="text-lg font-semibold text-[#E5C97B]">
                        €{vehicle.purchase_price.toLocaleString('de-DE')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
