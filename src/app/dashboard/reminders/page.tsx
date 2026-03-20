'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Calendar, Clock, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react'

export default function RemindersPage() {
  const supabase = createClient()
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('date-soon')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = async () => {
    try {
      const { data } = await supabase
        .from('maintenance')
        .select('*, vehicles(make, model)')
        .order('date', { ascending: true })
      if (data) setReminders(data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const sortReminders = (list: any[]) => {
    const sorted = [...list]
    switch (sortBy) {
      case 'date-far':
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      case 'vehicle':
        return sorted.sort((a, b) => `${a.vehicles?.make}`.localeCompare(`${b.vehicles?.make}`))
      case 'status-open':
        return sorted.sort((a, b) => (a.status === 'planned' ? -1 : 1))
      case 'cost-high':
        return sorted.sort((a, b) => (b.cost || 0) - (a.cost || 0))
      case 'cost-low':
        return sorted.sort((a, b) => (a.cost || 0) - (b.cost || 0))
      default:
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
  }

  const filterReminders = (list: any[]) => {
    if (statusFilter === 'all') return list
    return list.filter(r => r.status === (statusFilter === 'open' ? 'planned' : 'completed'))
  }

  const filtered = filterReminders(sortReminders(reminders))

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#F0F0F0] mb-8">
          Wartungstermine
        </h1>

        {reminders.length > 0 && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#9B9B9B]">Sortierung:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#1E1E1E] border border-[#333333] text-[#F0F0F0] px-3 py-2 rounded-lg text-sm cursor-pointer pr-8"
              >
                <option value="date-soon">Nächstes Datum</option>
                <option value="date-far">Entferntes Datum</option>
                <option value="vehicle">Auto</option>
                <option value="status-open">Status (Offen)</option>
                <option value="cost-high">Kosten (Teuer)</option>
                <option value="cost-low">Kosten (Günstig)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#9B9B9B]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-[#1E1E1E] border border-[#333333] text-[#F0F0F0] px-3 py-2 rounded-lg text-sm cursor-pointer pr-8"
              >
                <option value="all">Alle</option>
                <option value="open">Offen</option>
                <option value="completed">Erledigt</option>
              </select>
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((reminder: any) => (
              <div key={reminder.id} className="border-l-4 border-blue-700 rounded-lg p-4 sm:p-5 bg-blue-900/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#F0F0F0]">{reminder.title}</h3>
                    <p className="text-sm text-[#B0B0B0]">{reminder.vehicles?.make} {reminder.vehicles?.model}</p>
                    {reminder.description && <p className="text-sm text-[#9B9B9B] mt-2">{reminder.description}</p>}
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="text-[#9B9B9B]">{new Date(reminder.date).toLocaleDateString('de-DE')}</span>
                      {reminder.cost && <span className="text-[#C9A84C]">€{reminder.cost}</span>}
                    </div>
                  </div>
                  <Link href={`/vehicles/${reminder.vehicle_id}`} className="px-3 py-2 rounded-lg bg-[#C9A84C] text-[#0A0A0A] text-sm font-medium hover:bg-[#B8961F] whitespace-nowrap">
                    Bearbeiten
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="h-12 w-12 text-[#C9A84C] mb-4 opacity-50" />
            <h2 className="text-lg font-semibold text-[#F0F0F0]">Keine Termine</h2>
          </div>
        ) : (
          <p className="text-[#9B9B9B]">Lädt...</p>
        )}
      </div>
    </div>
  )
}
