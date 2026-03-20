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
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F0F0F0]">
              Meine Fahrzeuge
            </h1>
            <p className="text-sm sm:text-base text-[#9B9B9B] mt-1">
              {vehicles.length} Fahrzeug{vehicles.length !== 1 ? 'e' : ''}
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

        {/* Sorting Bar */}
        {vehicles.length > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-[#9B9B9B]">Sortierung:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}






Ctrl+C
Ctrl+C
