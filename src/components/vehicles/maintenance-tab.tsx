'use client'

import { useEffect, useState } from 'react'
import {
  Wrench,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
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
  created_at: string
}

export function MaintenanceTab({ vehicleId }: { vehicleId: string }) {
  const supabase = createClient()
  const { toast } = useToast()

  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddingRecord, setIsAddingRecord] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    workshop: '',
    cost: '',
    mileage: '',
  })

  // Fetch maintenance records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('maintenance_records')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('date', { ascending: false })

        if (error) throw error
        setRecords(data || [])
      } catch (error) {
        toast({
          title: 'Fehler',
          description:
            error instanceof Error
              ? error.message
              : 'Wartungseinträge konnten nicht geladen werden',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecords()
  }, [vehicleId, supabase, toast])

  const handleAddRecord = async () => {
    if (!formData.title) {
      toast({
        title: 'Fehler',
        description: 'Titel ist erforderlich',
        variant: 'destructive',
      })
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
      }

      const { data: newRecord, error } = await supabase
        .from('maintenance_records')
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
      })
      setIsAddDialogOpen(false)

      toast({
        title: 'Erfolg',
        description: 'Wartungseintrag hinzugefügt',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Wartungseintrag konnte nicht hinzugefügt werden',
        variant: 'destructive',
      })
    } finally {
      setIsAddingRecord(false)
    }
  }

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('maintenance_records')
        .delete()
        .eq('id', recordToDelete)

      if (error) throw error

      setRecords(records.filter((r) => r.id !== recordToDelete))
      setDeleteConfirmOpen(false)
      setRecordToDelete(null)

      toast({
        title: 'Erfolg',
        description: 'Wartungseintrag gelöscht',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Wartungseintrag konnte nicht gelöscht werden',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#B89A3C]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Wartung hinzufügen
          </Button>
        </div>

        {records.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-lg p-12 border border-gray-700 flex flex-col items-center justify-center text-center">
            <Wrench className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400 mb-2">Noch keine Wartungseinträge</p>
            <p className="text-sm text-gray-500">
              Fügen Sie Ihre erste Wartung hinzu, um diese zu verfolgen
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700 flex justify-between items-start"
              >
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#F0F0F0]">
                      {record.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {new Date(record.date).toLocaleDateString('de-DE')}
                    </p>
                  </div>

                  {record.description && (
                    <p className="text-gray-400 mb-3 text-sm">
                      {record.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {record.workshop && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">
                          Werkstatt
                        </p>
                        <p className="text-gray-300">{record.workshop}</p>
                      </div>
                    )}
                    {record.cost !== null && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">
                          Kosten
                        </p>
                        <p className="text-gray-300">
                          € {record.cost.toLocaleString('de-DE')}
                        </p>
                      </div>
                    )}
                    {record.mileage !== null && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">
                          Kilometerstand
                        </p>
                        <p className="text-gray-300">
                          {record.mileage.toLocaleString('de-DE')} km
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRecordToDelete(record.id)
                    setDeleteConfirmOpen(true)
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-950 ml-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Maintenance Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#C9A84C]" />
              Wartung hinzufügen
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="date" className="text-gray-300">
                Datum
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]"
              />
            </div>

            <div>
              <Label htmlFor="title" className="text-gray-300">
                Titel *
              </Label>
              <Input
                id="title"
                placeholder="z.B. Ölwechsel"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-300">
                Beschreibung
              </Label>
              <Textarea
                id="description"
                placeholder="Details zur Wartung..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0] min-h-20"
              />
            </div>

            <div>
              <Label htmlFor="workshop" className="text-gray-300">
                Werkstatt
              </Label>
              <Input
                id="workshop"
                placeholder="Name der Werkstatt (optional)"
                value={formData.workshop}
                onChange={(e) =>
                  setFormData({ ...formData, workshop: e.target.value })
                }
                className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cost" className="text-gray-300">
                  Kosten (€)
                </Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]"
                />
              </div>

              <div>
                <Label htmlFor="mileage" className="text-gray-300">
                  Kilometerstand
                </Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="km"
                  value={formData.mileage}
                  onChange={(e) =>
                    setFormData({ ...formData, mileage: e.target.value })
                  }
                  className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="border-gray-600"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleAddRecord}
              disabled={isAddingRecord}
              className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#B89A3C]"
            >
              {isAddingRecord ? 'Wird hinzugefügt...' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Wartungseintrag löschen
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Sind Sie sicher, dass Sie diesen Wartungseintrag löschen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-gray-600"
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRecord}
              disabled={isDeleting}
            >
              {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
