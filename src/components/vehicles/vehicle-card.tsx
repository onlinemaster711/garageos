'use client'

import { Vehicle } from '@/lib/types'
import { formatMileage } from '@/lib/utils'
import Link from 'next/link'
import { Car, Gauge, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const COUNTRY_NAMES: Record<string, string> = {
  DE: '🇩🇪 Deutschland',
  AT: '🇦🇹 Österreich',
  CH: '🇨🇭 Schweiz',
  ES: '🇪🇸 Spanien',
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  oldtimer: { label: 'Oldtimer', color: 'bg-amber-600' },
  youngtimer: { label: 'Youngtimer', color: 'bg-blue-600' },
  modern: { label: 'Modern', color: 'bg-emerald-600' },
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const category = CATEGORY_LABELS[vehicle.category] || CATEGORY_LABELS.modern
  const countryName = COUNTRY_NAMES[vehicle.country_code] || vehicle.country_code

  return (
    <Link href={`/vehicles/${vehicle.id}`}>
      <div className="group h-full overflow-hidden rounded-xl bg-[#2A2D30] border border-[#4A5260] transition-all duration-300 hover:border-[#E5C97B] hover:shadow-[0_0_20px_rgba(201,168,76,0.2)] hover:-translate-y-1">
        {/* Cover Photo */}
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-[#3D4450] to-[#2A2D30] flex items-center justify-center">
          {vehicle.cover_photo_url ? (
            <img
              src={vehicle.cover_photo_url}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <Car className="h-12 w-12 text-[#E5C97B]" />
              <p className="text-xs text-[#9B9B9B]">Kein Bild</p>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5">
          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-[#E6E6E6] mb-1 group-hover:text-[#E5C97B] transition-colors">
            {vehicle.make} {vehicle.model}
          </h3>

          {/* Year and Category Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {vehicle.year && (
              <Badge variant="secondary" className="text-xs">
                {vehicle.year}
              </Badge>
            )}
            <Badge variant="secondary" className={`text-xs text-white ${category.color}`}>
              {category.label}
            </Badge>
          </div>

          {/* Plate Number */}
          {vehicle.plate && (
            <p className="text-xs sm:text-sm text-[#9B9B9B] font-mono bg-[#3D4450] px-2 py-1 rounded mb-3 inline-block border border-[#4A5260]">
              {vehicle.plate}
            </p>
          )}

          {/* Stats */}
          <div className="space-y-2 mb-4 text-xs sm:text-sm">
            {vehicle.current_mileage !== null && (
              <div className="flex items-center gap-2 text-[#9B9B9B]">
                <Gauge className="h-4 w-4 text-[#E5C97B]" />
                <span>{formatMileage(vehicle.current_mileage)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[#9B9B9B]">
              <MapPin className="h-4 w-4 text-[#E5C97B]" />
              <span>{countryName}</span>
            </div>
          </div>

          {/* Hover indicator */}
          <div className="pt-3 border-t border-[#4A5260] text-xs text-[#E5C97B] font-medium group-hover:translate-x-1 transition-transform">
            Details ansehen →
          </div>
        </div>
      </div>
    </Link>
  )
}
