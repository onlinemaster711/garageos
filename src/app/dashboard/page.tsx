'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import Link from 'next/link'
import { Plus, Car, ChevronDown } from 'lucide-react'

type SortOption = 'recent' | 'value-high' | 'value-low' | 'age-new' | 'age-old' | 'category' | 'name'

export default function DashboardPage() {
  const supabase = createClient()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('recent')

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setVehicles(data)
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

  return (
    <div className="min-h-screen bg-[#0A1A2F] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#E6E6E6]">
              Meine Fahrzeuge
            </h1>
            <p className="text-sm sm:text-base text-[#9B9B9B] mt-1">
              {vehicles.length} Fahrzeug{vehicles.length !== 1 ? 'e' : ''}
            </p>
          </div>
          <Link
            href="/vehicles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#E5C97B] px-4 py-2.5 text-sm font-medium text-[#0A1A2F] hover:bg-[#B8961F] transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Fahrzeug hinzufügen
          </Link>
        </div>

        {vehicles.length > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-[#9B9B9B]">Sortierung:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-[#2A2D30] border border-[#4A5260] text-[#E6E6E6] px-4 py-2 rounded-lg text-sm cursor-pointer hover:border-[#E5C97B] transition-colors pr-8"
              >
                <option value="recent">Hinzugefügt (Neu zuerst)</option>
                <option value="value-high">Wert (Teuer zuerst)</option>
                <option value="value-low">Wert (Günstig zuerst)</option>
                <option value="age-new">Baujahr (Neu zuerst)</option>
                <option value="age-old">Baujahr (Alt zuerst)</option>
                <option value="category">Kategorie</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9B9B9B] pointer-events-none" />
            </div>
          </div>
        )}

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
