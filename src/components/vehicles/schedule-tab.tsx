'use client'

import { useEffect, useState } from 'react'
import {
  Wrench,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  CalendarCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Send,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MaintenanceRecord {
  id: string
  vehicle_id: string
  user_id: string
  date: string
  title: string
  description: string | null
  workshop: string | null
  cost: number | null
  mileage: number | null
  type: 'maintenance' | 'reminder'
  status: 'planned' | 'completed'
  has_appointment: boolean
  created_at: string
}

interface ServiceContact {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  specialization: string | null
  notes: string | null
  created_at: string
}

export function ScheduleTab({ vehicleId }: { vehicleId: string }) {
  const supabase = createClient()
  const { toast } = useToast()

  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [serviceContacts, setServiceContacts] = useState<ServiceContact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'planned' | 'completed' | 'contacts'>('planned')

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddingRecord, setIsAddingRecord] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Service contact dialog
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [deleteContactConfirm, setDeleteContactConfirm] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<string | null>(null)

  // Email dialog
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [emailTarget, setEmailTarget] = useState<ServiceContact | null>(null)
  const [emailData, setEmailData] = useState({ subject: '', body: '' })
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    workshop: '',
    cost: '',
    mileage: '',
    type: 'maintenance' as 'maintenance' | 'reminder',
    status: 'planned' as 'planned' | 'completed',
    has_appointment: false,
  })

  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    notes: '',
  })

  // Fetch maintenance records + service contacts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes, contactsRes] = await Promise.all([
          supabase
            .from('maintenance')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('date', { ascending: false }),
          supabase
            .from('service_contacts')
            .select('*')
            .order('name', { ascending: true }),
        ])

        if (recordsRes.error) throw recordsRes.error
        setRecords(
          (recordsRes.data || []).map((r: Record<string, unknown>) => ({
            ...r,
            type: (r.type as string) || 'maintenance',
            status: (r.status as string) || 'completed',
            has_appointment: (r.has_appointment as boolean) || false,
          })) as MaintenanceRecord[]
        )

        if (!contactsRes.error) {
          setServiceContacts(contactsRes.data || [])
        }
      } catch (error) {
        toast({
          title: 'Fehler',
          description: error instanceof Error ? error.message : 'Daten konnten nicht geladen werden',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [vehicleId, supabase, toast])

  const plannedRecords = records.filter((r) => r.status === 'planned')
  const completedRecords = records.filter((r) => r.status === 'completed')

  const handleAddRecord = async () => {
    if (!formData.title) {
      toast({ title: 'Fehler', description: 'Titel ist erforderlich', variant: 'destructive' })
      return
    }

    setIsAddingRecord(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Nicht authentifiziert')

      const recordData = {
        vehicle_id: vehicleId,
        user_id: userData.user.id,
        date: formData.date,
        title: formData.title,
        description: formData.description || null,
        workshop: formData.workshop || null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        mileage: formData.mileage ? parseInt(formData.mileage, 10) : null,
        type: formData.type,
        status: formData.status,
        has_appointment: formData.has_appointment,
      }

      const { data: newRecord, error } = await supabase
        .from('maintenance')
        .insert([recordData])
        .select()
        .single()

      if (error) throw error

      setRecords([newRecord, ...records])
      setFormData({
        date: new Date().toISOString().split('T')[0],
        title: '',
        description: '',
        workshop: '',
        cost: '',
        mileage: '',
        type: 'maintenance',
        status: 'planned',
        has_appointment: false,
      })
      setIsAddDialogOpen(false)
      toast({ title: 'Erfolg', description: 'Termin hinzugefügt' })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Eintrag konnte nicht hinzugefügt werden',
        variant: 'destructive',
      })
    } finally {
      setIsAddingRecord(false)
    }
  }

  const handleMarkCompleted = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance')
        .update({ status: 'completed' })
        .eq('id', id)

      if (error) throw error
      setRecords(records.map((r) => (r.id === id ? { ...r, status: 'completed' as const } : r)))
      toast({ title: 'Erfolg', description: 'Als erledigt markiert' })
    } catch {
      toast({ title: 'Fehler', description: 'Status konnte nicht geändert werden', variant: 'destructive' })
    }
  }

  const handleToggleAppointment = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('maintenance')
        .update({ has_appointment: !current })
        .eq('id', id)

      if (error) throw error
      setRecords(records.map((r) => (r.id === id ? { ...r, has_appointment: !current } : r)))
    } catch {
      toast({ title: 'Fehler', description: 'Termin-Status konnte nicht geändert werden', variant: 'destructive' })
    }
  }

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('maintenance').delete().eq('id', recordToDelete)
      if (error) throw error
      setRecords(records.filter((r) => r.id !== recordToDelete))
      setDeleteConfirmOpen(false)
      setRecordToDelete(null)
      toast({ title: 'Erfolg', description: 'Termin gelöscht' })
    } catch {
      toast({ title: 'Fehler', description: 'Konnte nicht gelöscht werden', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
    }
  }

  // Service contacts
  const handleAddContact = async () => {
    if (!contactFormData.name) {
      toast({ title: 'Fehler', description: 'Name ist erforderlich', variant: 'destructive' })
      return
    }
    setIsAddingContact(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Nicht authentifiziert')

      const { data, error } = await supabase
        .from('service_contacts')
        .insert([{ ...contactFormData, user_id: userData.user.id, email: contactFormData.email || null, phone: contactFormData.phone || null, address: contactFormData.address || null, specialization: contactFormData.specialization || null, notes: contactFormData.notes || null }])
        .select()
        .single()

      if (error) throw error
      setServiceContacts([...serviceContacts, data])
      setContactFormData({ name: '', email: '', phone: '', address: '', specialization: '', notes: '' })
      setIsContactDialogOpen(false)
      toast({ title: 'Erfolg', description: 'Service-Kontakt hinzugefügt' })
    } catch (error) {
      toast({ title: 'Fehler', description: error instanceof Error ? error.message : 'Fehler', variant: 'destructive' })
    } finally {
      setIsAddingContact(false)
    }
  }

  const handleDeleteContact = async () => {
    if (!contactToDelete) return
    try {
      await supabase.from('service_contacts').delete().eq('id', contactToDelete)
      setServiceContacts(serviceContacts.filter((c) => c.id !== contactToDelete))
      setDeleteContactConfirm(false)
      setContactToDelete(null)
      toast({ title: 'Erfolg', description: 'Kontakt gelöscht' })
    } catch {
      toast({ title: 'Fehler', description: 'Konnte nicht gelöscht werden', variant: 'destructive' })
    }
  }

  const handleSendEmail = async () => {
    if (!emailTarget?.email || !emailData.subject || !emailData.body) {
      toast({ title: 'Fehler', description: 'Bitte alle Felder ausfüllen', variant: 'destructive' })
      return
    }
    setIsSendingEmail(true)
    try {
      const res = await fetch('/api/service-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTarget.email,
          subject: emailData.subject,
          body: emailData.body,
          contactName: emailTarget.name,
        }),
      })
      if (!res.ok) throw new Error('E-Mail konnte nicht gesendet werden')
      toast({ title: 'Erfolg', description: `E-Mail an ${emailTarget.name} gesendet` })
      setIsEmailDialogOpen(false)
      setEmailData({ subject: '', body: '' })
      setEmailTarget(null)
    } catch (error) {
      toast({ title: 'Fehler', description: error instanceof Error ? error.message : 'Senden fehlgeschlagen', variant: 'destructive' })
    } finally {
      setIsSendingEmail(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#E5C97B]" />
      </div>
    )
  }

  const getTypeIcon = (type: 'maintenance' | 'reminder'): string => {
    return type === 'reminder' ? '🛒' : '🔧'
  }

  const getTypeLabel = (type: 'maintenance' | 'reminder'): string => {
    return type === 'reminder' ? 'Reminder' : 'Wartung'
  }

  const renderRecord = (record: MaintenanceRecord, showActions = true) => (
    <div
      key={record.id}
      className="bg-[#2A2D30] rounded-lg px-5 py-4 border border-gray-700 flex justify-between items-start"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl">{getTypeIcon(record.type)}</span>
          <h3 className="text-base font-semibold text-[#E6E6E6]">{record.title}</h3>
          <span className="text-xs font-medium text-[#E5C97B] bg-[#E5C97B]/20 px-2 py-0.5 rounded">
            {getTypeLabel(record.type)}
          </span>
          <span className="text-sm text-gray-400">
            {new Date(record.date).toLocaleDateString('de-DE')}
          </span>
          {record.status === 'planned' && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                record.has_appointment
                  ? 'bg-green-900/40 text-green-400 border border-green-800'
                  : 'bg-yellow-900/40 text-yellow-400 border border-yellow-800'
              }`}
            >
              {record.has_appointment ? (
                <><CalendarCheck className="h-3 w-3" /> Termin steht</>
              ) : (
                <><Clock className="h-3 w-3" /> Termin offen</>
              )}
            </span>
          )}
        </div>

        {record.description && (
          <p className="text-gray-400 mb-3 text-sm">{record.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          {record.workshop && (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Werkstatt</p>
              <p className="text-gray-300">{record.workshop}</p>
            </div>
          )}
          {record.cost !== null && (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Kosten</p>
              <p className="text-gray-300">€ {record.cost.toLocaleString('de-DE')}</p>
            </div>
          )}
          {record.mileage !== null && (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Kilometerstand</p>
              <p className="text-gray-300">{record.mileage.toLocaleString('de-DE')} km</p>
            </div>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-2 ml-3">
          {record.status === 'planned' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleAppointment(record.id, record.has_appointment)}
                className={`${record.has_appointment ? 'text-green-400 hover:text-green-300' : 'text-yellow-400 hover:text-yellow-300'} hover:bg-gray-800`}
                title={record.has_appointment ? 'Termin entfernen' : 'Termin bestätigen'}
              >
                <CalendarCheck className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkCompleted(record.id)}
                className="text-green-400 hover:text-green-300 hover:bg-green-950"
                title="Als erledigt markieren"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setRecordToDelete(record.id); setDeleteConfirmOpen(true) }}
            className="text-red-400 hover:text-red-300 hover:bg-red-950"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <>
      <div className="space-y-4">
        {/* Filter Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Filter Label */}
          <span className="text-sm font-medium text-gray-300">Filter:</span>

          {/* Filter Buttons */}
          <div className="flex flex-col md:flex-row gap-2 flex-1">
            <button
              onClick={() => setActiveSection('planned')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors md:flex-initial flex-1 ${
                activeSection === 'planned'
                  ? 'bg-[#E5C97B] text-[#0A1A2F]'
                  : 'text-gray-400 hover:text-[#E6E6E6] bg-[#2A2D30] border border-gray-700'
              }`}
            >
              <Clock className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Geplant ({plannedRecords.length})
            </button>
            <button
              onClick={() => setActiveSection('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors md:flex-initial flex-1 ${
                activeSection === 'completed'
                  ? 'bg-[#E5C97B] text-[#0A1A2F]'
                  : 'text-gray-400 hover:text-[#E6E6E6] bg-[#2A2D30] border border-gray-700'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Erledigt ({completedRecords.length})
            </button>
            <button
              onClick={() => setActiveSection('contacts')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors md:flex-initial flex-1 ${
                activeSection === 'contacts'
                  ? 'bg-[#E5C97B] text-[#0A1A2F]'
                  : 'text-gray-400 hover:text-[#E6E6E6] bg-[#2A2D30] border border-gray-700'
              }`}
            >
              <Building2 className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Service ({serviceContacts.length})
            </button>
          </div>

          {/* Add Button */}
          <Button
            onClick={() => {
              if (activeSection === 'contacts') {
                setIsContactDialogOpen(true)
              } else {
                setFormData(prev => ({ ...prev, status: activeSection === 'planned' ? 'planned' : 'completed' }))
                setIsAddDialogOpen(true)
              }
            }}
            className="bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B89A3C] w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {activeSection === 'contacts' ? 'Kontakt hinzufügen' : 'Termin hinzufügen'}
          </Button>
        </div>

        {/* Planned maintenance */}
        {activeSection === 'planned' && (
          <div className="space-y-3">
            {plannedRecords.length === 0 ? (
              <div className="bg-[#2A2D30] rounded-lg px-5 py-4 border border-gray-700 flex flex-col items-center text-center">
                <Clock className="h-10 w-10 text-gray-600 mb-3" />
                <p className="text-gray-400 mb-1">Keine geplanten Termine</p>
                <p className="text-sm text-gray-500">Planen Sie Ihre nächsten Termine</p>
              </div>
            ) : (
              plannedRecords.map((r) => renderRecord(r))
            )}
          </div>
        )}

        {/* Completed maintenance */}
        {activeSection === 'completed' && (
          <div className="space-y-3">
            {completedRecords.length === 0 ? (
              <div className="bg-[#2A2D30] rounded-lg px-5 py-4 border border-gray-700 flex flex-col items-center text-center">
                <CheckCircle2 className="h-10 w-10 text-gray-600 mb-3" />
                <p className="text-gray-400 mb-1">Keine erledigten Termine</p>
                <p className="text-sm text-gray-500">Abgeschlossene Wartungen erscheinen hier</p>
              </div>
            ) : (
              completedRecords.map((r) => renderRecord(r))
            )}
          </div>
        )}

        {/* Service contacts */}
        {activeSection === 'contacts' && (
          <div className="space-y-3">
            {serviceContacts.length === 0 ? (
              <div className="bg-[#2A2D30] rounded-lg px-5 py-4 border border-gray-700 flex flex-col items-center text-center">
                <Building2 className="h-10 w-10 text-gray-600 mb-3" />
                <p className="text-gray-400 mb-1">Keine Service-Kontakte</p>
                <p className="text-sm text-gray-500">Speichern Sie Werkstätten und Dienstleister</p>
              </div>
            ) : (
              serviceContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-[#2A2D30] rounded-lg px-5 py-4 border border-gray-700 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-[#E5C97B]" />
                      <h3 className="text-base font-semibold text-[#E6E6E6]">{contact.name}</h3>
                      {contact.specialization && (
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                          {contact.specialization}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {contact.email && (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Mail className="h-3.5 w-3.5" />
                          {contact.email}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Phone className="h-3.5 w-3.5" />
                          {contact.phone}
                        </div>
                      )}
                      {contact.address && (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <MapPin className="h-3.5 w-3.5" />
                          {contact.address}
                        </div>
                      )}
                    </div>
                    {contact.notes && (
                      <p className="text-xs text-gray-500 mt-2">{contact.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {contact.email && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEmailTarget(contact)
                          setEmailData({ subject: '', body: '' })
                          setIsEmailDialogOpen(true)
                        }}
                        className="text-[#E5C97B] hover:text-[#E0BC5A] hover:bg-[#E5C97B]/10"
                        title="E-Mail senden"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setContactToDelete(contact.id); setDeleteContactConfirm(true) }}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Maintenance Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#2A2D30] border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#E5C97B]" />
              Termin hinzufügen
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Termintyp</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormData({ ...formData, type: 'maintenance' })}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                    formData.type === 'maintenance'
                      ? 'bg-[#E5C97B] text-[#0A1A2F]'
                      : 'bg-[#0A1A2F] text-[#E6E6E6] border border-gray-600 hover:border-[#E5C97B]'
                  }`}
                >
                  🔧 Termin
                </button>
                <button
                  onClick={() => setFormData({ ...formData, type: 'reminder' })}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                    formData.type === 'reminder'
                      ? 'bg-[#E5C97B] text-[#0A1A2F]'
                      : 'bg-[#0A1A2F] text-[#E6E6E6] border border-gray-600 hover:border-[#E5C97B]'
                  }`}
                >
                  🛒 Reminder
                </button>
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as 'planned' | 'completed' })}>
                <SelectTrigger className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Geplant</SelectItem>
                  <SelectItem value="completed">Erledigt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Datum</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]" />
            </div>

            <div>
              <Label className="text-gray-300">Titel *</Label>
              <Input placeholder="z.B. Ölwechsel" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]" />
            </div>

            <div>
              <Label className="text-gray-300">Beschreibung</Label>
              <Textarea placeholder="Details zum Termin..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6] min-h-20" />
            </div>

            <div>
              <Label className="text-gray-300">Werkstatt</Label>
              <Input placeholder="Name der Werkstatt (optional)" value={formData.workshop} onChange={(e) => setFormData({ ...formData, workshop: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]" />
            </div>

            {formData.status === 'planned' && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="has_appointment"
                  checked={formData.has_appointment}
                  onChange={(e) => setFormData({ ...formData, has_appointment: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-600 bg-[#0A1A2F] text-[#E5C97B] focus:ring-[#E5C97B]"
                />
                <Label htmlFor="has_appointment" className="text-gray-300 cursor-pointer">
                  Termin steht bereits
                </Label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-300">Kosten (€)</Label>
                <Input type="number" step="0.01" placeholder="0,00" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]" />
              </div>
              <div>
                <Label className="text-gray-300">Kilometerstand</Label>
                <Input type="number" placeholder="km" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-gray-600">Abbrechen</Button>
            <Button onClick={handleAddRecord} disabled={isAddingRecord} className="bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B89A3C]">
              {isAddingRecord ? 'Wird hinzugefügt...' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Service Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="bg-[#2A2D30] border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#E5C97B]" />
              Service-Kontakt hinzufügen
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Name *</Label>
              <Input placeholder="z.B. Porsche Zentrum München" value={contactFormData.name} onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]" />
            </div>
            <div>
              <Label className="text-gray-300">E-Mail</Label>
              <Input type="email" placeholder="info@werkstatt.de" value={contactFormData.email} onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]" />
            </div>
            <div>
              <Label className="text-gray-300">Telefon</Label>
              <Input placeholder="+49 89 123456" value={contactFormData.phone} onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]" />
            </div>
            <div>
              <Label className="text-gray-300">Adresse</Label>
              <Input placeholder="Straße, PLZ Ort" value={contactFormData.address} onChange={(e) => setContactFormData({ ...contactFormData, address: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]" />
            </div>
            <div>
              <Label className="text-gray-300">Spezialisierung</Label>
              <Input placeholder="z.B. Oldtimer, Porsche, Lack" value={contactFormData.specialization} onChange={(e) => setContactFormData({ ...contactFormData, specialization: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]" />
            </div>
            <div>
              <Label className="text-gray-300">Notizen</Label>
              <Textarea placeholder="Weitere Informationen..." value={contactFormData.notes} onChange={(e) => setContactFormData({ ...contactFormData, notes: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6] min-h-16" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactDialogOpen(false)} className="border-gray-600">Abbrechen</Button>
            <Button onClick={handleAddContact} disabled={isAddingContact} className="bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B89A3C]">
              {isAddingContact ? 'Wird hinzugefügt...' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="bg-[#2A2D30] border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#E5C97B]" />
              E-Mail an {emailTarget?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {emailTarget?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Betreff *</Label>
              <Input placeholder="z.B. Terminanfrage für Inspektion" value={emailData.subject} onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]" />
            </div>
            <div>
              <Label className="text-gray-300">Nachricht *</Label>
              <Textarea placeholder="Ihre Nachricht..." value={emailData.body} onChange={(e) => setEmailData({ ...emailData, body: e.target.value })} className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6] min-h-32" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)} className="border-gray-600">Abbrechen</Button>
            <Button onClick={handleSendEmail} disabled={isSendingEmail} className="bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B89A3C]">
              {isSendingEmail ? 'Wird gesendet...' : 'Senden'}
              <Send className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-[#2A2D30] border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Termin löschen
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Sind Sie sicher, dass Sie diesen Termin löschen möchten?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="border-gray-600">Abbrechen</Button>
            <Button variant="destructive" onClick={handleDeleteRecord} disabled={isDeleting}>
              {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Contact Confirmation Dialog */}
      <Dialog open={deleteContactConfirm} onOpenChange={setDeleteContactConfirm}>
        <DialogContent className="bg-[#2A2D30] border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Kontakt löschen
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Sind Sie sicher, dass Sie diesen Service-Kontakt löschen möchten?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteContactConfirm(false)} className="border-gray-600">Abbrechen</Button>
            <Button variant="destructive" onClick={handleDeleteContact}>Löschen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
