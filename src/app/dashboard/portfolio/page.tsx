'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, X, ArrowRight } from 'lucide-react';
import type { Vehicle } from '@/lib/types';

type SortBy = 'price-desc' | 'price-asc' | 'year-desc' | 'year-asc' | 'category' | 'name-asc';

export default function PortfolioPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('price-desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const { data, error: vehiclesError } = await supabase
        .from('vehicles')
        .select(
          `id, user_id, make, model, year, plate, vin, color, country_code, category,
          purchase_date, purchase_price, current_mileage, last_driven_date,
          max_standzeit_weeks, location_id, cover_photo_url, notes, location_name,
          storage_address, created_at`
        );

      if (vehiclesError) throw vehiclesError;

      const typedVehicles = (data || []) as Vehicle[];
      setVehicles(typedVehicles);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Fahrzeuge');
      console.error('Error loading vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortVehicles = (items: Vehicle[]): Vehicle[] => {
    const sorted = [...items];
    switch (sortBy) {
      case 'price-desc':
        return sorted.sort((a, b) => (b.purchase_price || 0) - (a.purchase_price || 0));
      case 'price-asc':
        return sorted.sort((a, b) => (a.purchase_price || 0) - (b.purchase_price || 0));
      case 'year-desc':
        return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'year-asc':
        return sorted.sort((a, b) => (a.year || 0) - (b.year || 0));
      case 'category':
        return sorted.sort((a, b) => a.category.localeCompare(b.category));
      case 'name-asc':
        return sorted.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
      default:
        return sorted;
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels: { [key: string]: string } = {
      oldtimer: 'Oldtimer',
      youngtimer: 'Youngtimer',
      modern: 'Modern',
    };
    return labels[category] || category;
  };

  const getCategoryBadgeColor = (category: string): string => {
    switch (category) {
      case 'oldtimer':
        return 'bg-purple-900/30 text-purple-400';
      case 'youngtimer':
        return 'bg-blue-900/30 text-blue-400';
      case 'modern':
        return 'bg-green-900/30 text-green-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  const sortedVehicles = sortVehicles(vehicles);

  return (
    <div className="min-h-screen bg-[#0A1A2F] text-[#E6E6E6] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
            Meine Autosammlung
          </h1>
          <p className="text-[#E5C97B] text-lg font-medium">
            {sortedVehicles.length} {sortedVehicles.length === 1 ? 'Fahrzeug' : 'Fahrzeuge'}
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="w-full sm:w-auto">
            <label htmlFor="sort" className="text-sm font-semibold text-[#E5C97B] block mb-2">
              Sortierung:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full sm:w-64 px-4 py-2 rounded-lg bg-[#2A2D30] text-[#E6E6E6] border border-[#3D4450] focus:border-[#E5C97B] focus:outline-none"
            >
              <option value="price-desc">Preis (↓ teuer)</option>
              <option value="price-asc">Preis (↑ günstig)</option>
              <option value="year-desc">Baujahr (↓ neu)</option>
              <option value="year-asc">Baujahr (↑ alt)</option>
              <option value="category">Kategorie</option>
              <option value="name-asc">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-[#E5C97B]">Lädt Fahrzeuge...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-8">
            <p className="text-red-400">Fehler: {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sortedVehicles.length === 0 && (
          <div className="bg-[#2A2D30] border border-[#3D4450] rounded-lg p-12 text-center">
            <p className="text-[#808080] text-lg">Keine Fahrzeuge gefunden.</p>
          </div>
        )}

        {/* Vehicles Grid */}
        {!loading && !error && sortedVehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sortedVehicles.map((vehicle) => (
              <div key={vehicle.id} className="group cursor-pointer h-full" onClick={() => setSelectedVehicleId(vehicle.id)}>
                <div className="bg-[#2A2D30] border border-[#3D4450] rounded-xl overflow-hidden hover:border-[#E5C97B] transition-all duration-300 hover:shadow-xl hover:shadow-[#E5C97B]/20 transform hover:scale-105 h-full flex flex-col">
                  {/* Image Container */}
                  <div className="relative w-full h-80 bg-[#0A1A2F] overflow-hidden">
                    {vehicle.cover_photo_url ? (
                      <Image
                        src={vehicle.cover_photo_url}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#808080]">
                        <div className="text-center">
                          <p className="text-sm">Kein Bild</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/60"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Make + Model */}
                    <h3 className="text-2xl font-bold text-[#E6E6E6] mb-3 group-hover:text-[#E5C97B] transition-colors">
                      {vehicle.make} {vehicle.model}
                    </h3>

                    {/* Year + Category */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm text-[#808080]">
                        {vehicle.year}
                      </span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getCategoryBadgeColor(vehicle.category)}`}>
                        {getCategoryLabel(vehicle.category)}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-grow">
                      {vehicle.purchase_price && (
                        <div className="mb-2">
                          <p className="text-[#808080] text-sm">Kaufpreis</p>
                          <p className="text-xl font-bold text-[#E5C97B]">
                            € {vehicle.purchase_price.toLocaleString('de-DE')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <div className="mt-6 pt-4 border-t border-[#3D4450]">
                      <p className="text-sm font-semibold text-[#E5C97B] group-hover:text-white transition-colors">
                        Details anzeigen →
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vehicle Detail Modal */}
        {selectedVehicleId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedVehicleId(null)}>
            <div className="bg-[#2A2D30] border border-[#3D4450] rounded-xl max-w-md w-full max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Close Button */}
              <div className="flex justify-end p-4 border-b border-[#3D4450]">
                <button
                  onClick={() => setSelectedVehicleId(null)}
                  className="p-1 hover:bg-[#3D4450] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#E6E6E6]" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {/* Image */}
                {selectedVehicleId && sortedVehicles.find(v => v.id === selectedVehicleId)?.cover_photo_url && (
                  <div className="relative w-full h-48 bg-[#0A1A2F] rounded-lg overflow-hidden">
                    <Image
                      src={sortedVehicles.find(v => v.id === selectedVehicleId)?.cover_photo_url || ''}
                      alt={`${sortedVehicles.find(v => v.id === selectedVehicleId)?.make} ${sortedVehicles.find(v => v.id === selectedVehicleId)?.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Vehicle Info */}
                {selectedVehicleId && sortedVehicles.find(v => v.id === selectedVehicleId) && (
                  <>
                    <div>
                      <h2 className="text-3xl font-bold text-[#E6E6E6]">
                        {sortedVehicles.find(v => v.id === selectedVehicleId)?.make} {sortedVehicles.find(v => v.id === selectedVehicleId)?.model}
                      </h2>
                      <p className="text-sm text-[#808080] mt-1">
                        {sortedVehicles.find(v => v.id === selectedVehicleId)?.year}
                      </p>
                    </div>

                    {/* Purchase Price */}
                    {sortedVehicles.find(v => v.id === selectedVehicleId)?.purchase_price && (
                      <div className="pt-4 border-t border-[#3D4450]">
                        <p className="text-sm text-[#808080] mb-1">Kaufpreis</p>
                        <p className="text-2xl font-bold text-[#E5C97B]">
                          € {sortedVehicles.find(v => v.id === selectedVehicleId)?.purchase_price?.toLocaleString('de-DE')}
                        </p>
                      </div>
                    )}

                    {/* Purchase Date */}
                    {sortedVehicles.find(v => v.id === selectedVehicleId)?.purchase_date && (
                      <div className="pt-3 border-t border-[#3D4450]">
                        <p className="text-sm text-[#808080] mb-1">Kaufdatum</p>
                        <p className="text-base text-[#E6E6E6]">
                          {new Date(sortedVehicles.find(v => v.id === selectedVehicleId)?.purchase_date || '').toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-[#3D4450]">
                      <Link href={`/vehicles/${selectedVehicleId}`} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E5C97B] hover:bg-[#B8961F] text-[#0A1A2F] font-medium rounded-lg transition-colors">
                          <span>Details anzeigen</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedVehicleId(null);
                          window.location.href = `/vehicles/${selectedVehicleId}#dokumente`;
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3D4450] hover:bg-[#4A5260] text-[#E6E6E6] font-medium rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Dokumente</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}