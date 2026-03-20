'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import type { Vehicle } from '@/lib/types';

type SortBy = 'price-desc' | 'price-asc' | 'year-desc' | 'year-asc' | 'category' | 'name-asc';

export default function PortfolioPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('price-desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
            Meine Autosammlung
          </h1>
          <p className="text-[#C9A84C] text-lg font-medium">
            {sortedVehicles.length} {sortedVehicles.length === 1 ? 'Fahrzeug' : 'Fahrzeuge'}
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="w-full sm:w-auto">
            <label htmlFor="sort" className="text-sm font-semibold text-[#C9A84C] block mb-2">
              Sortierung:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full sm:w-64 px-4 py-2 rounded-lg bg-[#1E1E1E] text-[#F0F0F0] border border-[#2A2A2A] focus:border-[#C9A84C] focus:outline-none"
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
            <p className="text-[#C9A84C]">Lädt Fahrzeuge...</p>
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
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-12 text-center">
            <p className="text-[#808080] text-lg">Keine Fahrzeuge gefunden.</p>
          </div>
        )}

        {/* Vehicles Grid */}
        {!loading && !error && sortedVehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sortedVehicles.map((vehicle) => (
              <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
                <div className="group cursor-pointer h-full">
                  <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#C9A84C] transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A84C]/20 transform hover:scale-105 h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative w-full h-80 bg-[#0A0A0A] overflow-hidden">
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
                      <h3 className="text-2xl font-bold text-[#F0F0F0] mb-3 group-hover:text-[#C9A84C] transition-colors">
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
                            <p className="text-xl font-bold text-[#C9A84C]">
                              € {vehicle.purchase_price.toLocaleString('de-DE')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <div className="mt-6 pt-4 border-t border-[#2A2A2A]">
                        <p className="text-sm font-semibold text-[#C9A84C] group-hover:text-white transition-colors">
                          Details anzeigen →
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}