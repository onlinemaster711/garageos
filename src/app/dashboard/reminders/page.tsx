'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Calendar, Clock, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react'

type SortOption = 'date-soon' | 'date-far' | 'vehicle' | 'status-open' | 'cost-high' | 'cost-low'
type StatusFilter = 'all' | 'open' | 'completed'

interface Maintenance {
  id: string
  vehicle_id: string
  date: string
  title: string
  description: string
  cost: number
  status: 'planned' | 'completed'
  vehicles: { make: string; model: string }
}

export default function RemindersPage() {
  const supabase = createClient()
  const [reminders, setReminders] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('date-soon')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = async () => {
    try {
      const { data } = await supabase
        .from('maintenance')
        .select('*, vehicles(make, model)')
        .order('date', { ascending: true })
      
      if (data) setReminders(data as any)
    } catch (err) {
      console.error('Error loading reminders:', err)
    } finally {
      setLoading(false)
    }
  }

  const sortReminders = (list: Maintenance[]) => {
    const sorted = [...list]
    
    switch (sortBy) {
      case 'date-far':
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      case 'vehicle':
        return sorted.sort((a, b) => `${a.vehicles?.make} ${a.vehicles?.model}`.localeCompare(`${b.vehicles?.make} ${b.vehicles?.model}`))
      case 'status-open':
        return sorted.sort((a, b) => (a.status === 'planned' ? -1 : 1))
      case 'cost-high':
        return sorted.sort((a, b) => (b.cost || 0) - (a.cost || 0))
      case 'cost-low':
        return sorted.sort((a, b) => (a.cost || 0) - (b.cost || 0))
      case 'date-soon':
      default:
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
  }

  const filterReminders = (list: Maintenance[]) => {
    if (statusFilter === 'all') return list
    return list.filter(r => r.status === (statusFilter === 'open' ? 'planned' : 'completed'))
  }

  const filteredReminders = filterReminders(sortReminders(reminders))

  const getStatusColor = (status: string) => {
    return status === 'planned' ? 'bg-blue-900/30 border-blue-700' : 'bg-green-900/30 border-green-700'
  }

  const getStatusIcon = (status: string) => {
    return status === 'planned' ? 
      <Clock className="h-4 w-4 text-blue-400" /> : 
      <CheckCircle className="h-4 w-4 text-green-400" />
  }

  const isOverdue = (date: string) => new Date(date) < new Date()

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
Ctrl+C
