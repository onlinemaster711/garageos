'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface MileageDataPoint {
  date: Date
  mileage: number
}

export function MileageChart({ vehicleId }: { vehicleId: string }) {
  const supabase = createClient()
  const { toast } = useToast()

  const [dataPoints, setDataPoints] = useState<MileageDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch drives data
        const { data: drivesData, error: drivesError } = await supabase
          .from('drives')
          .select('date, mileage_after')
          .eq('vehicle_id', vehicleId)
          .order('date', { ascending: true })

        if (drivesError) throw drivesError

        // Fetch maintenance data
        const { data: maintenanceData, error: maintenanceError } = await supabase
          .from('maintenance')
          .select('date, mileage')
          .eq('vehicle_id', vehicleId)
          .not('mileage', 'is', null)
          .order('date', { ascending: true })

        if (maintenanceError) throw maintenanceError

        // Combine and sort data
        const combined: MileageDataPoint[] = []

        // Add drives data
        if (drivesData) {
          drivesData.forEach((drive: any) => {
            if (drive.mileage_after !== null) {
              combined.push({
                date: new Date(drive.date),
                mileage: drive.mileage_after,
              })
            }
          })
        }

        // Add maintenance data
        if (maintenanceData) {
          maintenanceData.forEach((maintenance: any) => {
            if (maintenance.mileage !== null) {
              combined.push({
                date: new Date(maintenance.date),
                mileage: maintenance.mileage,
              })
            }
          })
        }

        // Remove duplicates and sort by date
        const uniqueData = Array.from(
          new Map(
            combined.map((item) => [
              item.date.toISOString().split('T')[0],
              item,
            ])
          ).values()
        ).sort((a, b) => a.date.getTime() - b.date.getTime())

        setDataPoints(uniqueData)
      } catch (error) {
        toast({
          title: 'Fehler',
          description:
            error instanceof Error
              ? error.message
              : 'Kilometerstanddaten konnten nicht geladen werden',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [vehicleId, supabase, toast])

  // Calculate statistics
  const totalKilometers =
    dataPoints.length > 0
      ? dataPoints[dataPoints.length - 1].mileage - dataPoints[0].mileage
      : 0
  const avgKmPerMonth = calculateAvgPerMonth(dataPoints)
  const avgKmPerYear = calculateAvgPerYear(dataPoints)

  function calculateAvgPerMonth(points: MileageDataPoint[]): number {
    if (points.length < 2) return 0
    const totalKm = points[points.length - 1].mileage - points[0].mileage
    const firstDate = points[0].date
    const lastDate = points[points.length - 1].date
    const months =
      (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
      (lastDate.getMonth() - firstDate.getMonth())
    return months > 0 ? totalKm / months : 0
  }

  function calculateAvgPerYear(points: MileageDataPoint[]): number {
    if (points.length < 2) return 0
    const totalKm = points[points.length - 1].mileage - points[0].mileage
    const firstDate = points[0].date
    const lastDate = points[points.length - 1].date
    const years = (lastDate.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    return years > 0 ? totalKm / years : 0
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
      </div>
    )
  }

  if (dataPoints.length === 0) {
    return (
      <div className="bg-[#1E1E1E] rounded-lg p-12 border border-gray-700 flex flex-col items-center justify-center text-center">
        <TrendingUp className="h-12 w-12 text-gray-600 mb-4" />
        <p className="text-gray-400 mb-2">
          Noch keine Fahrten oder Wartungseinträge mit Kilometerstand vorhanden
        </p>
      </div>
    )
  }

  // Chart dimensions
  const width = 800
  const height = 300
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate scales
  const minMileage = Math.min(...dataPoints.map((p) => p.mileage))
  const maxMileage = Math.max(...dataPoints.map((p) => p.mileage))
  const mileageRange = maxMileage - minMileage || 1

  const minDate = dataPoints[0].date.getTime()
  const maxDate = dataPoints[dataPoints.length - 1].date.getTime()
  const dateRange = maxDate - minDate || 1

  // Generate chart path
  const points = dataPoints.map((point) => {
    const x =
      padding.left +
      ((point.date.getTime() - minDate) / dateRange) * chartWidth
    const y =
      padding.top +
      chartHeight -
      ((point.mileage - minMileage) / mileageRange) * chartHeight
    return { x, y, ...point }
  })

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  // Y-axis labels (4 labels)
  const yAxisSteps = 4
  const yLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
    const value = minMileage + (mileageRange * i) / yAxisSteps
    return Math.round(value)
  })

  // X-axis labels (show date every nth point)
  const xLabelInterval = Math.max(1, Math.floor(dataPoints.length / 5))
  const xLabels = points.filter((_, i) => i % xLabelInterval === 0)

  return (
    <div className="space-y-6">
      {/* SVG Chart */}
      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700 overflow-x-auto">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="mx-auto"
          style={{ minWidth: '100%' }}
        >
          {/* Y-axis labels */}
          {yLabels.map((label, i) => {
            const y =
              padding.top +
              chartHeight -
              (i / yAxisSteps) * chartHeight
            return (
              <g key={`y-label-${i}`}>
                <text
                  x={padding.left - 10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-gray-500"
                >
                  {label.toLocaleString('de-DE')}
                </text>
                {i > 0 && (
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    className="stroke-gray-700"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                )}
              </g>
            )
          })}

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            className="stroke-gray-600"
            strokeWidth="2"
          />

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={width - padding.right}
            y2={padding.top + chartHeight}
            className="stroke-gray-600"
            strokeWidth="2"
          />

          {/* Chart line */}
          <path
            d={pathD}
            fill="none"
            stroke="#C9A84C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, i) => (
            <circle
              key={`point-${i}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#C9A84C"
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer transition-all"
              style={{
                opacity: hoveredPoint === i ? 1 : 0.7,
                r: hoveredPoint === i ? 6 : 4,
              }}
            />
          ))}

          {/* Hover tooltip */}
          {hoveredPoint !== null && points[hoveredPoint] && (
            <g>
              <rect
                x={points[hoveredPoint].x - 70}
                y={points[hoveredPoint].y - 40}
                width="140"
                height="35"
                fill="#0A0A0A"
                stroke="#C9A84C"
                strokeWidth="1"
                rx="4"
              />
              <text
                x={points[hoveredPoint].x}
                y={points[hoveredPoint].y - 22}
                textAnchor="middle"
                className="text-xs fill-[#C9A84C] font-semibold"
              >
                {points[hoveredPoint].date.toLocaleDateString('de-DE')}
              </text>
              <text
                x={points[hoveredPoint].x}
                y={points[hoveredPoint].y - 10}
                textAnchor="middle"
                className="text-xs fill-gray-300"
              >
                {points[hoveredPoint].mileage.toLocaleString('de-DE')} km
              </text>
            </g>
          )}

          {/* X-axis labels */}
          {xLabels.map((point, i) => (
            <g key={`x-label-${i}`}>
              <text
                x={point.x}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {point.date.toLocaleDateString('de-DE', {
                  month: 'short',
                  day: 'numeric',
                })}
              </text>
            </g>
          ))}

          {/* Y-axis label */}
          <text
            x={-height / 2}
            y={15}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${height / 2})`}
            className="text-xs fill-gray-500"
          >
            Kilometerstand (km)
          </text>
        </svg>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
            Gesamtkilometer
          </p>
          <p className="text-2xl font-bold text-[#C9A84C]">
            {totalKilometers.toLocaleString('de-DE')} km
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Von {dataPoints[0].mileage.toLocaleString('de-DE')} bis{' '}
            {dataPoints[dataPoints.length - 1].mileage.toLocaleString('de-DE')} km
          </p>
        </div>

        <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
            Durchschnitt pro Monat
          </p>
          <p className="text-2xl font-bold text-[#F0F0F0]">
            {avgKmPerMonth.toLocaleString('de-DE', {
              maximumFractionDigits: 0,
            })}{' '}
            km
          </p>
        </div>

        <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
            Durchschnitt pro Jahr
          </p>
          <p className="text-2xl font-bold text-[#F0F0F0]">
            {avgKmPerYear.toLocaleString('de-DE', { maximumFractionDigits: 0 })}{' '}
            km
          </p>
        </div>
      </div>
    </div>
  )
}
