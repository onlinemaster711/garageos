'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import type { Maintenance, Vehicle } from '@/lib/types';

type SortBy = 'date-asc' | 'date-desc' | 'cost-asc' | 'cost-desc';
type StatusFilter = 'all' | 'planned' | 'completed';
type TypeFilter = 'all' | 'maintenance' | 'reminder';

interface MaintenanceWithVehicle extends Maintenance {
  vehicles: Vehicle;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<MaintenanceWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('date-asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const supabase = createClient();

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('maintenance')
        .select(
          `*, vehicles(id, user_id, make, model, year, plate, vin, color, country_code,
          category, purchase_date, purchase_price, current_mileage, last_driven_date,
          max_standzeit_weeks, location_id, cover_photo_url, notes, location_name,
          storage_address, created_at)`
        )
        .order('date', { ascending: true });

      if (fetchError) throw fetchError;

      const typedData = (data || []).map((item) => ({
        ...item,
        type: (item.type || 'maintenance') as 'maintenance' | 'reminder',
        status: (item.status || 'planned') as 'planned' | 'completed',
      })) as MaintenanceWithVehicle[];

      setReminders(typedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Wartungen');
      console.error('Error loading reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: 'maintenance' | 'reminder'): string => {
    return type === 'reminder' ? '🛒' : '🔧';
  };

  const getTypeLabel = (type: 'maintenance' | 'reminder'): string => {
    return type === 'reminder' ? 'Reminder' : 'Wartung';
  };

  const filterReminders = (): MaintenanceWithVehicle[] => {
    return reminders.filter((reminder) => {
      const statusMatch = statusFilter === 'all' || reminder.status === statusFilter;
      const typeMatch = typeFilter === 'all' || reminder.type === typeFilter;
      return statusMatch && typeMatch;
    });
  };

  const sortReminders = (items: MaintenanceWithVehicle[]): MaintenanceWithVehicle[] => {
    const sorted = [...items];
    switch (sortBy) {
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'cost-asc':
        return sorted.sort((a, b) => (a.cost || 0) - (b.cost || 0));
      case 'cost-desc':
        return sorted.sort((a, b) => (b.cost || 0) - (a.cost || 0));
      default:
        return sorted;
    }
  };

  const filteredReminders = filterReminders();
  const displayReminders = sortReminders(filteredReminders);

  return (
    <div className="min-h-screen bg-[#0A1A2F] text-[#E6E6E6] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#E6E6E6] tracking-tight mb-3">
            Wartungen & Reminders
          </h1>
          <p className="text-lg text-[#E5C97B] font-medium">
            {displayReminders.length} {displayReminders.length === 1 ? 'Eintrag' : 'Einträge'}
          </p>
        </div>

        {/* Filter Section - Luxury Design */}
        <div className="bg-gradient-to-br from-[#2A2D30] to-[#1F2228] rounded-xl px-8 py-8 mb-10 border border-[#3D4450] shadow-lg hover:shadow-xl hover:shadow-[#E5C97B]/5 transition-shadow duration-300 space-y-6">
          {/* Type Filter - Premium Styling */}
          <div>
            <label className="text-base font-semibold text-[#E5C97B] mb-4 block">Typ</label>
            <div className="flex flex-wrap gap-4">
              {(['all', 'maintenance', 'reminder'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    typeFilter === type
                      ? 'bg-[#E5C97B] text-[#0A1A2F] shadow-md'
                      : 'bg-[#3D4450] text-[#E6E6E6] hover:bg-[#454A55] border border-transparent hover:border-[#E5C97B]/30'
                  }`}
                >
                  {type === 'all' && 'Alle'}
                  {type === 'maintenance' && '🔧 Wartung'}
                  {type === 'reminder' && '🛒 Reminder'}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter - Premium Select */}
          <div>
            <label htmlFor="status" className="text-base font-semibold text-[#E5C97B] mb-4 block">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-6 py-3 rounded-lg bg-[#3D4450] text-[#E6E6E6] border border-[#454A55] focus:border-[#E5C97B] focus:outline-none focus:ring-2 focus:ring-[#E5C97B]/20 transition-all font-medium"
            >
              <option value="all">Alle</option>
              <option value="planned">Geplant</option>
              <option value="completed">Erledigt</option>
            </select>
          </div>

          {/* Sort By - Premium Select */}
          <div>
            <label htmlFor="sort" className="text-base font-semibold text-[#E5C97B] mb-4 block">
              Sortieren nach
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full px-6 py-3 rounded-lg bg-[#3D4450] text-[#E6E6E6] border border-[#454A55] focus:border-[#E5C97B] focus:outline-none focus:ring-2 focus:ring-[#E5C97B]/20 transition-all font-medium"
            >
              <option value="date-asc">Datum (früher)</option>
              <option value="date-desc">Datum (später)</option>
              <option value="cost-asc">Kosten (niedrig)</option>
              <option value="cost-desc">Kosten (hoch)</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-[#E5C97B]">Lädt Wartungen...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-8">
            <p className="text-red-400">Fehler: {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && displayReminders.length === 0 && (
          <div className="bg-[#2A2D30] border border-[#3D4450] rounded-lg p-8 text-center">
            <p className="text-[#808080]">Keine Wartungen oder Reminders gefunden.</p>
          </div>
        )}

        {/* Reminders List - Premium Cards */}
        {!loading && !error && displayReminders.length > 0 && (
          <div className="space-y-6">
            {displayReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-gradient-to-br from-[#2A2D30] to-[#1F2228] border border-[#3D4450] rounded-xl p-6 sm:p-8 hover:border-[#E5C97B] hover:shadow-lg hover:shadow-[#E5C97B]/10 transition-all duration-300"
              >
                {/* Header Section */}
                <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-[#3D4450]">
                  <div className="flex-1">
                    {/* Title with Icon */}
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl">{getTypeIcon(reminder.type)}</span>
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-[#E6E6E6] leading-tight">
                          {reminder.title}
                        </h3>
                      </div>
                      {reminder.status === 'completed' && (
                        <span className="ml-auto text-green-400 text-2xl font-bold">✓</span>
                      )}
                    </div>
                    {/* Vehicle Link */}
                    <Link
                      href={`/vehicles/${reminder.vehicle_id}`}
                      className="text-[#E5C97B] hover:text-[#F0D89B] font-medium text-base transition-colors"
                    >
                      {reminder.vehicles.make} {reminder.vehicles.model} ({reminder.vehicles.year})
                    </Link>
                  </div>
                  {/* Status Badge */}
                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                        reminder.status === 'completed'
                          ? 'bg-green-900/30 text-green-300 border border-green-700/30'
                          : 'bg-yellow-900/30 text-yellow-300 border border-yellow-700/30'
                      }`}
                    >
                      {reminder.status === 'completed' ? 'Erledigt' : 'Geplant'}
                    </span>
                    <span className="text-[#E5C97B] text-sm font-semibold px-3 py-1 bg-[#E5C97B]/10 rounded-lg">
                      {getTypeLabel(reminder.type)}
                    </span>
                  </div>
                </div>

                {/* Date Section */}
                <div className="mb-6 pb-6 border-b border-[#3D4450]">
                  <p className="text-[#9B9B9B] text-base font-medium flex items-center gap-3">
                    <span className="text-xl">📅</span>
                    {new Date(reminder.date).toLocaleDateString('de-DE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Description */}
                {reminder.description && (
                  <div className="mb-6 pb-6 border-b border-[#3D4450]">
                    <p className="text-[#D0D0D0] text-base leading-relaxed">{reminder.description}</p>
                  </div>
                )}

                {/* Details Grid - Premium Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {reminder.workshop && (
                    <div className="bg-[#0A1A2F] rounded-lg p-5 border border-[#3D4450]/50">
                      <p className="text-[#9B9B9B] text-xs font-semibold uppercase tracking-wide mb-2">
                        Werkstatt
                      </p>
                      <p className="text-[#E6E6E6] font-semibold text-lg">{reminder.workshop}</p>
                    </div>
                  )}
                  {reminder.cost && (
                    <div className="bg-[#0A1A2F] rounded-lg p-5 border border-[#3D4450]/50">
                      <p className="text-[#9B9B9B] text-xs font-semibold uppercase tracking-wide mb-2">
                        Kosten
                      </p>
                      <p className="text-[#E5C97B] font-bold text-lg">€ {reminder.cost.toFixed(2)}</p>
                    </div>
                  )}
                  {reminder.mileage && (
                    <div className="bg-[#0A1A2F] rounded-lg p-5 border border-[#3D4450]/50">
                      <p className="text-[#9B9B9B] text-xs font-semibold uppercase tracking-wide mb-2">
                        Fällig bei
                      </p>
                      <p className="text-[#E6E6E6] font-semibold text-lg">
                        {reminder.mileage.toLocaleString('de-DE')} km
                      </p>
                    </div>
                  )}
                  {reminder.vehicles.current_mileage && (
                    <div className="bg-[#0A1A2F] rounded-lg p-5 border border-[#3D4450]/50">
                      <p className="text-[#9B9B9B] text-xs font-semibold uppercase tracking-wide mb-2">
                        Aktuell
                      </p>
                      <p className="text-[#E6E6E6] font-semibold text-lg">
                        {reminder.vehicles.current_mileage.toLocaleString('de-DE')} km
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}