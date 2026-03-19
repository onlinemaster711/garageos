'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Vehicle, Maintenance } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Car } from 'lucide-react'

interface VehicleWithCosts extends Vehicle {
  maintenanceCost: number
  costRatio: number
}

interface PortfolioStats {
  totalValue: number
  vehicleCount: number
  averagePrice: number
  totalMaintenanceCost: number
  vehiclesWithCosts: VehicleWithCosts[]
  mostExpensiveVehicle: VehicleWithCosts | null
  cheapestVehicle: VehicleWithCosts | null
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function PortfolioOverview() {
  const [stats, setStats] = useState<PortfolioStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const supabase = createClient()

        // Fetch all vehicles
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')

        if (vehiclesError) throw vehiclesError

        // Fetch all maintenance records
        const { data: maintenance, error: maintenanceError } = await supabase
          .from('maintenance')
          .select('*')

        if (maintenanceError) throw maintenanceError

        // Group maintenance costs by vehicle_id
        const maintenanceCostMap = new Map<string, number>()
        if (maintenance) {
          maintenance.forEach((record: Maintenance) => {
            const cost = record.cost || 0
            maintenanceCostMap.set(
              record.vehicle_id,
              (maintenanceCostMap.get(record.vehicle_id) || 0) + cost
            )
          })
        }

        // Calculate portfolio stats
        const vehiclesWithCosts: VehicleWithCosts[] = (vehicles || [])
          .map((vehicle: Vehicle) => {
            const maintenanceCost = maintenanceCostMap.get(vehicle.id) || 0
            const purchasePrice = vehicle.purchase_price || 0
            const costRatio = purchasePrice > 0 ? (maintenanceCost / purchasePrice) * 100 : 0

            return {
              ...vehicle,
              maintenanceCost,
              costRatio,
            }
          })
          .sort((a, b) => (b.purchase_price || 0) - (a.purchase_price || 0))

        const totalValue = vehiclesWithCosts.reduce(
          (sum, v) => sum + (v.purchase_price || 0),
          0
        )
        const totalMaintenanceCost = vehiclesWithCosts.reduce(
          (sum, v) => sum + v.maintenanceCost,
          0
        )
        const vehicleCount = vehiclesWithCosts.length
        const averagePrice = vehicleCount > 0 ? totalValue / vehicleCount : 0

        // Find most and least expensive vehicles
        const mostExpensiveVehicle =
          vehiclesWithCosts.length > 0
            ? vehiclesWithCosts.reduce((prev, current) =>
                (current.purchase_price || 0) > (prev.purchase_price || 0) ? current : prev
              )
            : null

        const cheapestVehicle =
          vehiclesWithCosts.length > 0
            ? vehiclesWithCosts.reduce((prev, current) =>
                (current.purchase_price || 0) < (prev.purchase_price || 0) ? current : prev
              )
            : null

        setStats({
          totalValue,
          vehicleCount,
          averagePrice,
          totalMaintenanceCost,
          vehiclesWithCosts,
          mostExpensiveVehicle,
          cheapestVehicle,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolioData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#C9A84C] border-t-transparent mx-auto mb-4" />
          <p style={{ color: '#9B9B9B' }}>Laden...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[#FF6B6B] bg-[#FF6B6B20] p-4">
        <p style={{ color: '#FF6B6B' }}>Fehler beim Laden der Portfolio-Daten: {error}</p>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#F0F0F0] mb-2">Portfolio-Dashboard</h1>
        <p style={{ color: '#9B9B9B' }}>Übersicht deiner Fahrzeugsammlung und deren Wert</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gesamtwert */}
        <Card style={{ backgroundColor: '#1E1E1E', borderColor: '#333333' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#9B9B9B' }}>
              Gesamtwert
            </CardTitle>
            <DollarSign className="h-4 w-4" style={{ color: '#C9A84C' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-[#F0F0F0]">
              {formatCurrency(stats.totalValue)}
            </div>
            <p className="text-xs mt-1" style={{ color: '#9B9B9B' }}>
              Summe der Kaufpreise
            </p>
          </CardContent>
        </Card>

        {/* Anzahl Fahrzeuge */}
        <Card style={{ backgroundColor: '#1E1E1E', borderColor: '#333333' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#9B9B9B' }}>
              Anzahl Fahrzeuge
            </CardTitle>
            <Car className="h-4 w-4" style={{ color: '#C9A84C' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-[#F0F0F0]">
              {stats.vehicleCount}
            </div>
            <p className="text-xs mt-1" style={{ color: '#9B9B9B' }}>
              Fahrzeuge in der Sammlung
            </p>
          </CardContent>
        </Card>

        {/* Durchschnittspreis */}
        <Card style={{ backgroundColor: '#1E1E1E', borderColor: '#333333' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#9B9B9B' }}>
              Durchschnittspreis
            </CardTitle>
            <TrendingUp className="h-4 w-4" style={{ color: '#C9A84C' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-[#F0F0F0]">
              {formatCurrency(stats.averagePrice)}
            </div>
            <p className="text-xs mt-1" style={{ color: '#9B9B9B' }}>
              Pro Fahrzeug
            </p>
          </CardContent>
        </Card>

        {/* Gesamtkosten Wartung */}
        <Card style={{ backgroundColor: '#1E1E1E', borderColor: '#333333' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#9B9B9B' }}>
              Gesamtkosten Wartung
            </CardTitle>
            <TrendingDown className="h-4 w-4" style={{ color: '#C9A84C' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-[#F0F0F0]">
              {formatCurrency(stats.totalMaintenanceCost)}
            </div>
            <p className="text-xs mt-1" style={{ color: '#9B9B9B' }}>
              Alle Fahrzeuge
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Teuerstes und Günstigstes Fahrzeug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Teuerstes Fahrzeug */}
        {stats.mostExpensiveVehicle && (
          <Card style={{ backgroundColor: '#1E1E1E', borderColor: '#C9A84C' }} className="border-2">
            <CardHeader>
              <CardTitle className="text-lg text-[#C9A84C]">Teuerstes Fahrzeug</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm" style={{ color: '#9B9B9B' }}>
                  Fahrzeug
                </p>
                <p className="text-xl font-bold text-[#F0F0F0]">
                  {stats.mostExpensiveVehicle.make} {stats.mostExpensiveVehicle.model}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#9B9B9B' }}>
                  Kaufpreis
                </p>
                <p className="text-lg font-semibold text-[#C9A84C]">
                  {formatCurrency(stats.mostExpensiveVehicle.purchase_price || 0)}
                </p>
              </div>
              <div className="pt-2 border-t border-[#333333]">
                <p className="text-sm" style={{ color: '#9B9B9B' }}>
                  Wartungskosten
                </p>
                <p className="text-lg font-semibold text-[#F0F0F0]">
                  {formatCurrency(stats.mostExpensiveVehicle.maintenanceCost)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Günstigstes Fahrzeug */}
        {stats.cheapestVehicle && (
          <Card style={{ backgroundColor: '#1E1E1E', borderColor: '#C9A84C' }} className="border-2">
            <CardHeader>
              <CardTitle className="text-lg text-[#C9A84C]">Günstigstes Fahrzeug</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm" style={{ color: '#9B9B9B' }}>
                  Fahrzeug
                </p>
                <p className="text-xl font-bold text-[#F0F0F0]">
                  {stats.cheapestVehicle.make} {stats.cheapestVehicle.model}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#9B9B9B' }}>
                  Kaufpreis
                </p>
                <p className="text-lg font-semibold text-[#C9A84C]">
                  {formatCurrency(stats.cheapestVehicle.purchase_price || 0)}
                </p>
              </div>
              <div className="pt-2 border-t border-[#333333]">
                <p className="text-sm" style={{ color: '#9B9B9B' }}>
                  Wartungskosten
                </p>
                <p className="text-lg font-semibold text-[#F0F0F0]">
                  {formatCurrency(stats.cheapestVehicle.maintenanceCost)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fahrzeuge Liste */}
      <Card style={{ backgroundColor: '#1E1E1E', borderColor: '#333333' }}>
        <CardHeader>
          <CardTitle>Kosten pro Fahrzeug</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.vehiclesWithCosts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderColor: '#333333' }} className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-[#9B9B9B]">
                      Fahrzeug
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-[#9B9B9B]">
                      Kaufpreis
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-[#9B9B9B]">
                      Wartungskosten
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-[#9B9B9B]">
                      Kostenquote
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.vehiclesWithCosts.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      style={{ borderColor: '#333333' }}
                      className="border-b hover:bg-[#2A2A2A] transition-colors"
                    >
                      <td className="py-4 px-4 text-[#F0F0F0]">
                        {vehicle.make} {vehicle.model}
                        {vehicle.year && <span style={{ color: '#9B9B9B' }}> ({vehicle.year})</span>}
                      </td>
                      <td className="text-right py-4 px-4 text-[#F0F0F0]">
                        {formatCurrency(vehicle.purchase_price || 0)}
                      </td>
                      <td className="text-right py-4 px-4 text-[#F0F0F0]">
                        {formatCurrency(vehicle.maintenanceCost)}
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[#C9A84C] font-semibold">
                            {vehicle.costRatio.toFixed(1)}%
                          </span>
                          {vehicle.costRatio > 50 && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: '#FF6B6B' }}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p style={{ color: '#9B9B9B' }}>Keine Fahrzeuge gefunden</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
