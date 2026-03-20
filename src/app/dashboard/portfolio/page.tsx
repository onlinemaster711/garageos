'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import type { Vehicle, Maintenance } from '@/lib/types';

interface VehicleWithMaintenance extends Vehicle {
  nextMaintenances: Maintenance[];
}

export default function PortfolioPage() {
  const [mostExpensive, setMostExpensive] = useState<VehicleWithMaintenance | null>(null);
  const [cheapest, setCheapest] = useState<VehicleWithMaintenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);

      // Load all vehicles sorted by purchase_price
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select(
          `id, user_id, make, model, year, plate, vin, color, country_code, category,
          purchase_date, purchase_price, current_mileage, last_driven_date,
          max_standzeit_weeks, location_id, cover_photo_url, notes, location_name,
          storage_address, created_at`
        )
        .order('purchase_price', { ascending: false });

      if (vehiclesError) throw vehiclesError;

      const typedVehicles = (vehicles || []) as Vehicle[];

      // Get most expensive
      if (typedVehicles.length > 0) {
        const expensive = typedVehicles[0];
        const maintenances = await loadMaintenances(expensive.id);
        setMostExpensive({
          ...expensive,
          nextMaintenances: maintenances,
        });
      }

      // Get cheapest
      if (typedVehicles.length > 0) {
        const cheap = typedVehicles[typedVehicles.length - 1];
        const maintenances = await loadMaintenances(cheap.id);
        setCheapest({
          ...cheap,
          nextMaintenances: maintenances,
        });
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Portfolios');
      console.error('Error loading portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMaintenances = async (vehicleId: string): Promise<Maintenance[]> => {
    try {
      const { data, error: maintenanceError } = await supabase
        .from('maintenance')
        .select(
          `id, vehicle_id, user_id, date, title, description, workshop, cost, mileage,
          type, status, created_at`
        )
        .eq('vehicle_id', vehicleId)
        .eq('status', 'planned')
        .order('date', { ascending: true })
        .limit(3);

      if (maintenanceError) throw maintenanceError;

      return (data || []).map((item) => ({
        ...item,
        type: (item.type || 'maintenance') as 'maintenance' | 'reminder',
        status: (item.status || 'planned') as 'planned' | 'completed',
      })) as Maintenance[];
    } catch (err) {
      console.error('Error loading maintenances:', err);
      return [];
    }
  };

  const getTypeIcon = (type: string): string => {
    return type === 'reminder' ? '🛒' : '🔧';
  };

  const getTypeLabel = (type: string): string => {
    return type === 'reminder' ? 'Reminder' : 'Wartung';
  };

  const VehicleCard = ({ vehicle, title }: { vehicle: VehicleWithMaintenance; title: string }) => (
    <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg overflow-hidden hover:border-[#C9A84C] transition-colors">
      {/* Vehicle Image */}
      <div className="relative w-full h-64 bg-[#0A0A0A]">
        {vehicle.cover_photo_url ? (
          <Image
            src={vehicle.cover_photo_url}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#808080]">
            Kein Bild verfügbar
          </div>
        )}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4">
          <p className="text-[#C9A84C] text-sm font-semibold">{title}</p>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="p-6">
        <Link
          href={`/vehicles/${vehicle.id}`}
          className="group"
        >
          <h3 className="text-2xl font-bold text-[#F0F0F0] group-hover:text-[#C9A84C] transition-colors mb-2">
            {vehicle.make} {vehicle.model}
          </h3>
        </Link>

        <div className="space-y-3 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-[#808080]">Baujahr:</span>
            <span className="text-[#F0F0F0] font-medium">{vehicle.year}</span>
          </div>
          {vehicle.purchase_price && (
            <div className="flex justify-between">
              <span className="text-[#808080]">Kaufpreis:</span>
              <span className="text-[#C9A84C] font-medium">
                € {vehicle.purchase_price.toLocaleString('de-DE')}
              </span>
            </div>
          )}
          {vehicle.current_mileage && (
            <div className="flex justify-between">
              <span className="text-[#808080]">Kilometerstand:</span>
              <span className="text-[#F0F0F0] font-medium">
                {vehicle.current_mileage.toLocaleString('de-DE')} km
              </span>
            </div>
          )}
        </div>

        {/* Edit Button */}
        <Link
          href={`/vehicles/${vehicle.id}`}
          className="block w-full px-4 py-2 bg-[#C9A84C] text-[#0A0A0A] rounded-lg font-medium hover:bg-[#B8961F] transition-colors mb-6 text-center"
        >
          Bearbeiten
        </Link>

        {/* Next Maintenances */}
        <div className="border-t border-[#2A2A2A] pt-6">
          <h4 className="text-sm font-semibold text-[#C9A84C] mb-4">Nächste Termine</h4>
          {vehicle.nextMaintenances.length === 0 ? (
            <p className="text-[#808080] text-sm">Keine geplanten Wartungen</p>
          ) : (
            <div className="space-y-3">
              {vehicle.nextMaintenances.map((maintenance) => (
                <div
                  key={maintenance.id}
                  className="bg-[#0A0A0A] rounded p-3 border border-[#2A2A2A]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(maintenance.type)}</span>
                      <span className="text-xs font-medium text-[#C9A84C] bg-[#C9A84C]/20 px-2 py-0.5 rounded">
                        {getTypeLabel(maintenance.type)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[#F0F0F0] font-medium text-sm mb-1">
                    {maintenance.title}
                  </p>
                  <p className="text-[#808080] text-xs">
                    📅 {new Date(maintenance.date).toLocaleDateString('de-DE', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Fahrzeug Portfolio</h1>
          <p className="text-[#C9A84C]">Übersicht deiner Fahrzeuge und nächsten Wartungen</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-[#C9A84C]">Lädt Portfolio...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-8">
            <p className="text-red-400">Fehler: {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !mostExpensive && !cheapest && (
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-8 text-center">
            <p className="text-[#808080]">Keine Fahrzeuge gefunden.</p>
          </div>
        )}

        {/* Portfolio Cards */}
        {!loading && !error && (mostExpensive || cheapest) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mostExpensive && (
              <VehicleCard vehicle={mostExpensive} title="💎 Teuerstes Auto" />
            )}
            {cheapest && mostExpensive && cheapest.id !== mostExpensive.id && (
              <VehicleCard vehicle={cheapest} title="💰 Günstigstes Auto" />
            )}
            {cheapest && !mostExpensive && (
              <VehicleCard vehicle={cheapest} title="💰 Günstigstes Auto" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}