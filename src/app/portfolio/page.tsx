'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, ChevronLeft, ChevronRight, ArrowRight, Edit2 } from 'lucide-react'

export default function PortfolioPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [vehiclesLoading, setVehiclesLoading] = useState(false)
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({})

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

      // Initialize carousel indices
      const indices: Record<string, number> = {}
      data?.forEach((v) => {
        indices[v.id] = 0
      })
      setCarouselIndices(indices)
    } catch (err) {
      console.error('Exception loading vehicles:', err)
      setVehicles([])
    } finally {
      setVehiclesLoading(false)
    }
  }

  // Calculate total value
  const totalValue = vehicles.reduce((sum, v) => sum + (v.purchase_price || 0), 0)

  // Count by category
  const oldtimerCount = vehicles.filter((v) => v.category === 'oldtimer').length
  const modernCount = vehicles.filter((v) => v.category === 'modern').length

  // Carousel navigation
  const handleCarouselPrev = (vehicleId: string, images: string[]) => {
    const currentIndex = carouselIndices[vehicleId] || 0
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    setCarouselIndices({ ...carouselIndices, [vehicleId]: newIndex })
  }

  const handleCarouselNext = (vehicleId: string, images: string[]) => {
    const currentIndex = carouselIndices[vehicleId] || 0
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    setCarouselIndices({ ...carouselIndices, [vehicleId]: newIndex })
  }

  // Get images array for vehicle
  const getVehicleImages = (vehicle: any) => {
    const images = []
    if (vehicle.image_url) images.push(vehicle.image_url)
    if (vehicle.image_url_2) images.push(vehicle.image_url_2)
    if (vehicle.image_url_3) images.push(vehicle.image_url_3)
    if (vehicle.image_url_4) images.push(vehicle.image_url_4)
    return images.length > 0 ? images : ['/placeholder.jpg']
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
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#E6E6E6] tracking-tight mb-6">
            Portfolio
          </h1>

          {!vehiclesLoading && vehicles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Total Value */}
              <div className="bg-gradient-to-br from-[#2A2D30] to-[#1A2332] border border-[#3D4450] rounded-lg p-6 hover:border-[#E5C97B] transition-colors">
                <p className="text-sm text-[#9B9B9B] mb-2">Gesamtwert</p>
                <p className="text-3xl sm:text-4xl font-bold text-[#E5C97B]">
                  €{totalValue.toLocaleString('de-DE')}
                </p>
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-br from-[#2A2D30] to-[#1A2332] border border-[#3D4450] rounded-lg p-6 hover:border-[#E5C97B] transition-colors">
                <p className="text-sm text-[#9B9B9B] mb-3">Sammlung</p>
                <div className="space-y-2">
                  <p className="text-lg text-[#E6E6E6]">
                    <span className="font-bold text-[#E5C97B]">{vehicles.length}</span> Autos
                  </p>
                  <p className="text-sm text-[#B0B0B0]">
                    <span className="text-[#E5C97B]">{oldtimerCount}</span> Oldtimer • <span className="text-[#E5C97B]">{modernCount}</span> Modern
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {vehiclesLoading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-[#9B9B9B]">Lädt Fahrzeuge...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-[#2A2D30] border border-[#3D4450] rounded-lg p-8 text-center">
            <p className="text-[#9B9B9B] py-16">Dein Portfolio ist noch leer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => {
              const images = getVehicleImages(vehicle)
              const currentImageIndex = carouselIndices[vehicle.id] || 0
              const currentImage = images[currentImageIndex]

              return (
                <div
                  key={vehicle.id}
                  className="group bg-[#2A2D30] border border-[#3D4450] rounded-lg overflow-hidden hover:border-[#E5C97B] hover:shadow-lg hover:shadow-[#E5C97B]/10 transition-all duration-300"
                >
                  {/* Image Carousel */}
                  <div className="relative aspect-video bg-[#1A2332] overflow-hidden">
                    <img
                      src={currentImage}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />

                    {/* Carousel Controls */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => handleCarouselPrev(vehicle.id, images)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleCarouselNext(vehicle.id, images)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Image Indicators */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() =>
                                setCarouselIndices({
                                  ...carouselIndices,
                                  [vehicle.id]: idx,
                                })
                              }
                              className={`w-2 h-2 rounded-full transition-colors ${
                                idx === currentImageIndex
                                  ? 'bg-[#E5C97B]'
                                  : 'bg-white/40 hover:bg-white/60'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-4">
                    {/* Title & Meta */}
                    <div>
                      <h3 className="text-xl font-semibold text-[#E6E6E6] mb-1">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-[#9B9B9B]">
                        {vehicle.year} • <span className="capitalize">{vehicle.category}</span>
                      </p>
                    </div>

                    {/* Price */}
                    {vehicle.purchase_price && (
                      <div className="pt-3 border-t border-[#3D4450]">
                        <p className="text-xs text-[#9B9B9B] mb-1">Wert</p>
                        <p className="text-2xl font-bold text-[#E5C97B]">
                          €{vehicle.purchase_price.toLocaleString('de-DE')}
                        </p>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E5C97B] hover:bg-[#B8961F] text-[#0A1A2F] font-medium rounded-lg transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/vehicles/${vehicle.id}/edit`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3D4450] hover:bg-[#4A5260] text-[#E6E6E6] font-medium rounded-lg transition-colors"
                      >
                        <span>Bearbeiten</span>
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
