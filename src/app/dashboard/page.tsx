'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import Link from 'next/link'
import { Plus, Car, Sliders } from 'lucide-react'

type SortOption = 'recent' | 'value-high' | 'value-low' | 'age-new' | 'age-old' | 'category' | 'name'

export default function DashboardPage() {
  const supabase = createClient()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [oldtimerCount, setOldtimerCount] = useState(0)
  const [modernCount, setModernCount] = useState(0)

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setVehicles(data)
        const oldtimers = data.filter((v) => v.category === 'oldtimer').length
        const moderns = data.filter((v) => v.category === 'modern').length
        setOldtimerCount(oldtimers)
        setModernCount(moderns)
      }
    } catch (err) {
      console.error('Error loading vehicles:', err)
    } finally {
      setLoading(false)
    }
  }

  const sortVehicles = (vehicleList: any[]) => {
    const list = [...vehicleList]
    
    switch (sortBy) {
      case 'value-high':
        return list.sort((a, b) => (b.purchase_price || 0) - (a.purchase_price || 0))
      case 'value-low':
        return list.sort((a, b) => (a.purchase_price || 0) - (b.purchase_price || 0))
      case 'age-new':
        return list.sort((a, b) => (b.year || 0) - (a.year || 0))
      case 'age-old':
        return list.sort((a, b) => (a.year || 0) - (b.year || 0))
      case 'category':
        return list.sort((a, b) => (a.category || '').localeCompare(b.category || ''))
      case 'name':
        return list.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`))
      case 'recent':
      default:
        return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  }

  const sortedVehicles = sortVehicles(vehicles)

  const getSortLabel = (option: SortOption): string => {
    const labels: Record<SortOption, string> = {
      recent: 'Hinzugefügt (Neu zuerst)',
      'value-high': 'Wert (Teuer zuerst)',
      'value-low': 'Wert (Günstig zuerst)',
      'age-new': 'Baujahr (Neu zuerst)',
      'age-old': 'Baujahr (Alt zuerst)',
      category: 'Kategorie',
      name: 'Name (A-Z)',
    }
    return labels[option]
  }

  return (
    <div className="min-h-screen bg-[#0A1A2F] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section - Premium Design */}
        <div className="mb-10">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#E6E6E6] tracking-tight">
              Meine Sammlung
            </h1>
          </div>

          {/* Subtitle with Categories */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base">
              {vehicles.length > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl">🏛️</span>
                    <span className="text-gray-300">
                      <span className="font-semibold text-[#E5C97B]">{oldtimerCount}</span>
                      <span className="text-gray-400"> Oldtimer</span>
                    </span>
                  </div>
                  <span className="text-gray-500">·</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl">🏎️</span>
                    <span className="text-gray-300">
                      <span className="font-semibold text-[#E5C97B]">{modernCount}</span>
                      <span className="text-gray-400"> Modern</span>
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-gray-400">Keine Fahrzeuge</span>
              )}
            </div>

            {/* Buttons Section */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/vehicles/new"
                className="flex-1 sm:flex-none inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-[#E5C97B] px-4 py-2 text-sm font-medium text-[#0A1A2F] hover:bg-[#B8961F] transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Fahrzeug hinzufügen</span>
                <span className="sm:hidden">Hinzufügen</span>
              </Link>

              {/* Sortierung Dropdown */}
              {vehicles.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-2 rounded-lg bg-[#2A2D30] text-[#E6E6E6] hover:bg-[#3D4450] transition-colors border border-[#4A5260]"
                    title="Sortierung"
                  >
                    <Sliders className="h-4 w-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#2A2D30] border border-[#4A5260] rounded-lg shadow-xl z-50">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setSortBy('recent')
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            sortBy === 'recent'
                              ? 'bg-[#E5C97B] text-[#0A1A2F] font-medium'
                              : 'text-[#E6E6E6] hover:bg-[#3D4450]'
                          }`}
                        >
                          Hinzugefügt (Neu zuerst)
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('value-high')
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            sortBy === 'value-high'
                              ? 'bg-[#E5C97B] text-[#0A1A2F] font-medium'
                              : 'text-[#E6E6E6] hover:bg-[#3D4450]'
                          }`}
                        >
                          Wert (Teuer zuerst)
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('value-low')
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            sortBy === 'value-low'
                              ? 'bg-[#E5C97B] text-[#0A1A2F] font-medium'
                              : 'text-[#E6E6E6] hover:bg-[#3D4450]'
                          }`}
                        >
                          Wert (Günstig zuerst)
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('age-new')
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            sortBy === 'age-new'
                              ? 'bg-[#E5C97B] text-[#0A1A2F] font-medium'
                              : 'text-[#E6E6E6] hover:bg-[#3D4450]'
                          }`}
                        >
                          Baujahr (Neu zuerst)
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('age-old')
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            sortBy === 'age-old'
                              ? 'bg-[#E5C97B] text-[#0A1A2F] font-medium'
                              : 'text-[#E6E6E6] hover:bg-[#3D4450]'
                          }`}
                        >
                          Baujahr (Alt zuerst)
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('category')
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            sortBy === 'category'
                              ? 'bg-[#E5C97B] text-[#0A1A2F] font-medium'
                              : 'text-[#E6E6E6] hover:bg-[#3D4450]'
                          }`}
                        >
                          Kategorie
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('name')
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            sortBy === 'name'
                              ? 'bg-[#E5C97B] text-[#0A1A2F] font-medium'
                              : 'text-[#E6E6E6] hover:bg-[#3D4450]'
                          }`}
                        >
                          Name (A-Z)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {!loading && vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
            <div className="rounded-full bg-[#2A2D30] p-4 sm:p-6 mb-6">
              <Car className="h-10 w-10 sm:h-12 sm:w-12 text-[#E5C97B]" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#E6E6E6] mb-2">
              Noch keine Fahrzeuge
            </h2>
            <p className="text-sm sm:text-base text-[#9B9B9B] mb-6 max-w-md">
              Füge dein erstes Fahrzeug hinzu und beginne mit der Verwaltung deiner Sammlung.
            </p>
            <Link
              href="/vehicles/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#E5C97B] px-4 py-2.5 text-sm font-medium text-[#0A1A2F] hover:bg-[#B8961F] transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              Erstes Fahrzeug hinzufügen
            </Link>
          </div>
        ) : (
          <div className="flex justify-center items-center py-16">
            <p className="text-[#9B9B9B]">Lädt...</p>
          </div>
        )}
      </div>
    </div>
  )
}
