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
    <div className="min-h-screen bg-[#0A1A2F] text-[#E6E6E6] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Wartungen & Reminders</h1>
          <p className="text-[#E5C97B]">
            {displayReminders.length} {displayReminders.length === 1 ? 'Eintrag' : 'Einträge'}
          </p>
        </div>

        <div className="bg-[#2A2D30] rounded-lg p-6 mb-8 space-y-6 border border-[#3D4450]">
          {/* Type Filter */}
          <div>
            <label className="text-sm font-semibold text-[#E5C97B] mb-3 block">Typ:</label>
            <div className="flex flex-wrap gap-3">
              {(['all', 'maintenance', 'reminder'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    typeFilter === type
                      ? 'bg-[#E5C97B] text-[#0A1A2F]'
                      : 'bg-[#3D4450] text-[#E6E6E6] hover:bg-[#454A55]'
                  }`}
                >
                  {type === 'all' && 'Alle'}
                  {type === 'maintenance' && '🔧 Nur Wartung'}
                  {type === 'reminder' && '🛒 Nur Reminder'}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="text-sm font-semibold text-[#E5C97B] mb-3 block">
              Status:
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-4 py-2 rounded-lg bg-[#3D4450] text-[#E6E6E6] border border-[#454A55] focus:border-[#E5C97B] focus:outline-none"
            >
              <option value="all">Alle</option>
              <option value="planned">Geplant</option>
              <option value="completed">Erledigt</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort" className="text-sm font-semibold text-[#E5C97B] mb-3 block">
              Sortieren:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full px-4 py-2 rounded-lg bg-[#3D4450] text-[#E6E6E6] border border-[#454A55] focus:border-[#E5C97B] focus:outline-none"
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

        {/* Reminders List */}
        {!loading && !error && displayReminders.length > 0 && (
          <div className="space-y-4">
            {displayReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-[#2A2D30] border border-[#3D4450] rounded-lg p-6 hover:border-[#E5C97B] transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-[#E6E6E6]">{reminder.title}</h3>
                      <span className="text-2xl">{getTypeIcon(reminder.type)}</span>
                      {reminder.status === 'completed' && (
                        <span className="text-green-400 text-lg font-bold">✓</span>
                      )}
                    </div>
                    <Link
                      href={`/vehicles/${reminder.vehicle_id}`}
                      className="text-[#E5C97B] hover:underline text-sm"
                    >
                      {reminder.vehicles.make} {reminder.vehicles.model} ({reminder.vehicles.year})
                    </Link>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reminder.status === 'completed'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-yellow-900/30 text-yellow-400'
                      }`}
                    >
                      {reminder.status === 'completed' ? 'Erledigt' : 'Geplant'}
                    </span>
                    <span className="text-[#E5C97B] text-xs font-semibold">
                      {getTypeLabel(reminder.type)}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <p className="text-[#808080] text-sm mb-3">
                  📅 {new Date(reminder.date).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>

                {/* Description */}
                {reminder.description && (
                  <p className="text-[#D0D0D0] mb-4">{reminder.description}</p>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {reminder.workshop && (
                    <div className="bg-[#0A1A2F] rounded p-3">
                      <p className="text-[#808080] text-xs mb-1">Werkstatt</p>
                      <p className="text-[#E6E6E6] font-medium">{reminder.workshop}</p>
                    </div>
                  )}
                  {reminder.cost && (
                    <div className="bg-[#0A1A2F] rounded p-3">
                      <p className="text-[#808080] text-xs mb-1">Kosten</p>
                      <p className="text-[#E5C97B] font-medium">€ {reminder.cost.toFixed(2)}</p>
                    </div>
                  )}
                  {reminder.mileage && (
                    <div className="bg-[#0A1A2F] rounded p-3">
                      <p className="text-[#808080] text-xs mb-1">Kilometerstand</p>
                      <p className="text-[#E6E6E6] font-medium">
                        {reminder.mileage.toLocaleString('de-DE')} km
                      </p>
                    </div>
                  )}
                  {reminder.vehicles.current_mileage && (
                    <div className="bg-[#0A1A2F] rounded p-3">
                      <p className="text-[#808080] text-xs mb-1">Aktuell</p>
                      <p className="text-[#E6E6E6] font-medium">
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