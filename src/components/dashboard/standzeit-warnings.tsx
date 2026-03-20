'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { checkStandzeit, formatStandzeitWarning, getStandzeitRisks } from '@/lib/standzeit'
import { AlertTriangle } from 'lucide-react'

interface VehicleStandzeit {
  id: string
  make: string
  model: string
  plate: string | null
  last_driven_date: string | null
  max_standzeit_weeks: number
  daysStanding: number
  risks: string[]
}

export function StandzeitWarnings() {
  const supabase = createClient()
  const router = useRouter()
  const [warnings, setWarnings] = useState<VehicleStandzeit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('id, make, model, plate, last_driven_date, max_standzeit_weeks')
          .not('last_driven_date', 'is', null)

        if (error) throw error

        const vehiclesWithWarnings = (data || [])
          .map((v) => {
            const { daysStanding, isWarning } = checkStandzeit(
              v.last_driven_date,
              v.max_standzeit_weeks || 4
            )
            return {
              ...v,
              daysStanding,
              isWarning,
              risks: getStandzeitRisks(daysStanding),
            }
          })
          .filter((v) => v.isWarning)
          .sort((a, b) => b.daysStanding - a.daysStanding)

        setWarnings(vehiclesWithWarnings)
      } catch (err) {
        console.error('Error fetching standzeit:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  if (loading || warnings.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-[#E6E6E6] flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-[#F97316]" />
        Standzeit-Warnungen
      </h2>
      <div className="space-y-2">
        {warnings.map((v) => (
          <button
            key={v.id}
            onClick={() => router.push(`/vehicles/${v.id}`)}
            className="w-full text-left rounded-lg border border-[#F97316]/30 bg-[#2A2D30] p-4 hover:border-[#F97316]/60 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[#E6E6E6]">
                  {v.make} {v.model}
                  {v.plate && (
                    <span className="ml-2 text-xs text-[#808080]">({v.plate})</span>
                  )}
                </p>
                <p className="mt-1 text-sm text-[#F97316]">
                  {formatStandzeitWarning(v.daysStanding)}
                </p>
                {v.risks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {v.risks.map((risk, i) => (
                      <span
                        key={i}
                        className="inline-block rounded bg-[#F97316]/10 px-2 py-0.5 text-xs text-[#F97316]"
                      >
                        {risk}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <svg
                className="h-5 w-5 flex-shrink-0 text-[#808080] mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
