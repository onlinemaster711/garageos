'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  AlertTriangle,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  Calendar,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Drive {
  id: string
  vehicle_id: string
  user_id: string
  date: string
  kilometers: number
  notes: string | null
  created_at: string
}

interface FormDataState {
  date: string
  kilometers: string
  notes: string
}

interface Statistics {
  lastDrive: string | null
  totalKm: number
  avgKmPerMonth: number
}

export function DrivesTab({ vehicleId }: { vehicleId: string }) {
  const supabase = createClient()
  const { toast } = useToast()

  const [drives, setDrives] = useState<Drive[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddingDrive, setIsAddingDrive] = useState(false)
  const [isUpdatingDrive, setIsUpdatingDrive] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [driveToDelete, setDriveToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingDrive, setEditingDrive] = useState<Drive | null>(null)
  const [statistics, setStatistics] = useState<Statistics>({
    lastDrive: null,
    totalKm: 0,
    avgKmPerMonth: 0,
  })

  const [formData, setFormData] = useState<FormDataState>({
    date: new Date().toISOString().split('T')[0],
    kilometers: '',
    notes: '',
  })

  // Fetch drives
  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicle_drives')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('date', { ascending: false })

        if (error) throw error
        setDrives(data || [])
        calculateStatistics(data || [])
      } catch (error) {
        toast({
          title: 'Fehler',
          description:
            error instanceof Error
              ? error.message
              : 'Fahrten konnten nicht geladen werden',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDrives()
  }, [vehicleId, supabase, toast])

  const calculateStatistics = (driveList: Drive[]) => {
    if (driveList.length === 0) {
      setStatistics({
        lastDrive: null,
        totalKm: 0,
        avgKmPerMonth: 0,
      })
      return
    }

    const sortedByDate = [...driveList].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const lastDrive = sortedByDate[0]?.date || null
    const totalKm = driveList.reduce((sum, drive) => sum + drive.kilometers, 0)

    // Calculate average km per month
    const oldestDate = new Date(sortedByDate[sortedByDate.length - 1]?.date)
    const newestDate = new Date(sortedByDate[0]?.date)
    const monthsDiff =
      (newestDate.getFullYear() - oldestDate.getFullYear()) * 12 +
      (newestDate.getMonth() - oldestDate.getMonth())

    const avgKmPerMonth = monthsDiff > 0 ? Math.round(totalKm / monthsDiff) : totalKm

    setStatistics({
      lastDrive,
      totalKm,
      avgKmPerMonth,
    })
  }

  const resetFormData = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      kilometers: '',
      notes: '',
    })
  }

  const handleAddDrive = async () => {
    if (!formData.kilometers) {
      toast({
        title: 'Fehler',
        description: 'Kilometer ist erforderlich',
        variant: 'destructive',
      })
      return
    }

    setIsAddingDrive(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Nicht authentifiziert')

      const driveData = {
        vehicle_id: vehicleId,
        user_id: userData.user.id,
        date: formData.date,
        kilometers: parseInt(formData.kilometers, 10),
        notes: formData.notes || null,
      }

      const { data: newDrive, error } = await supabase
        .from('vehicle_drives')
        .insert([driveData])
        .select()
        .single()

      if (error) throw error

      const updatedDrives = [newDrive, ...drives]
      setDrives(updatedDrives)
      calculateStatistics(updatedDrives)
      resetFormData()
      setIsAddDialogOpen(false)

      toast({
        title: 'Erfolg',
        description: 'Fahrt hinzugefügt',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Fahrt konnte nicht hinzugefügt werden',
        variant: 'destructive',
      })
    } finally {
      setIsAddingDrive(false)
    }
  }

  const handleEditDrive = async () => {
    if (!editingDrive) return
    if (!formData.kilometers) {
      toast({
        title: 'Fehler',
        description: 'Kilometer ist erforderlich',
        variant: 'destructive',
      })
      return
    }

    setIsUpdatingDrive(true)
    try {
      const driveData = {
        date: formData.date,
        kilometers: parseInt(formData.kilometers, 10),
        notes: formData.notes || null,
      }

      const { data: updatedDrive, error } = await supabase
        .from('vehicle_drives')
        .update(driveData)
        .eq('id', editingDrive.id)
        .select()
        .single()

      if (error) throw error

      const updatedDrives = drives.map((d) =>
        d.id === editingDrive.id ? updatedDrive : d
      )
      setDrives(updatedDrives)
      calculateStatistics(updatedDrives)
      setEditingDrive(null)
      setIsEditDialogOpen(false)
      resetFormData()

      toast({
        title: 'Erfolg',
        description: 'Fahrt aktualisiert',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Fahrt konnte nicht aktualisiert werden',
        variant: 'destructive',
      })
    } finally {
      setIsUpdatingDrive(false)
    }
  }

  const handleDeleteDrive = async () => {
    if (!driveToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('vehicle_drives')
        .delete()
        .eq('id', driveToDelete)

      if (error) throw error

      const updatedDrives = drives.filter((d) => d.id !== driveToDelete)
      setDrives(updatedDrives)
      calculateStatistics(updatedDrives)
      setDeleteConfirmOpen(false)
      setDriveToDelete(null)

      toast({
        title: 'Erfolg',
        description: 'Fahrt gelöscht',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Fahrt konnte nicht gelöscht werden',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (drive: Drive) => {
    setEditingDrive(drive)
    setFormData({
      date: drive.date,
      kilometers: drive.kilometers.toString(),
      notes: drive.notes || '',
    })
    setIsEditDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#E5C97B]" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2A2D30] rounded-lg p-4 border border-gray-700">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Letzte Fahrt
            </p>
            <p className="text-lg font-semibold text-[#E6E6E6]">
              {statistics.lastDrive
                ? new Date(statistics.lastDrive).toLocaleDateString('de-DE')
                : '-'}
            </p>
          </div>

          <div className="bg-[#2A2D30] rounded-lg p-4 border border-gray-700">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Gesamt km
            </p>
            <p className="text-lg font-semibold text-[#E5C97B]">
              {statistics.totalKm.toLocaleString('de-DE')} km
            </p>
          </div>

          <div className="bg-[#2A2D30] rounded-lg p-4 border border-gray-700">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Ø km/Monat
            </p>
            <p className="text-lg font-semibold text-[#E6E6E6]">
              {statistics.avgKmPerMonth.toLocaleString('de-DE')} km
            </p>
          </div>
        </div>

        {/* Add Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => {
              resetFormData()
              setEditingDrive(null)
              setIsAddDialogOpen(true)
            }}
            className="bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B89A3C]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Fahrt hinzufügen
          </Button>
        </div>

        {/* Drives List */}
        {drives.length === 0 ? (
          <div className="bg-[#2A2D30] rounded-lg p-12 border border-gray-700 flex flex-col items-center justify-center text-center">
            <MapPin className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400 mb-2">Noch keine Fahrten hinzugefügt</p>
            <p className="text-sm text-gray-500">
              Erfassen Sie Ihre Fahrten, um Statistiken zu verfolgen
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map((drive) => (
              <DriveCard
                key={drive.id}
                drive={drive}
                onEdit={() => openEditDialog(drive)}
                onDelete={() => {
                  setDriveToDelete(drive.id)
                  setDeleteConfirmOpen(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Drive Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setIsEditDialogOpen(false)
            setEditingDrive(null)
            resetFormData()
          }
        }}
      >
        <DialogContent className="bg-[#2A2D30] border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#E6E6E6]">
              {editingDrive ? 'Fahrt bearbeiten' : 'Fahrt hinzufügen'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Date Input */}
            <div>
              <Label htmlFor="date" className="text-gray-300 font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Datum *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6] mt-2"
              />
            </div>

            {/* Kilometers Input */}
            <div>
              <Label htmlFor="kilometers" className="text-gray-300 font-medium">
                Kilometer *
              </Label>
              <Input
                id="kilometers"
                type="number"
                min="0"
                placeholder="z.B. 45"
                value={formData.kilometers}
                onChange={(e) =>
                  setFormData({ ...formData, kilometers: e.target.value })
                }
                className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6] mt-2"
              />
            </div>

            {/* Notes Textarea */}
            <div>
              <Label htmlFor="notes" className="text-gray-300 font-medium">
                Notiz
              </Label>
              <Textarea
                id="notes"
                placeholder="z.B. Zur Arbeit, Einkaufen..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6] mt-2 min-h-20 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                setIsEditDialogOpen(false)
                setEditingDrive(null)
                resetFormData()
              }}
              className="border-gray-600"
            >
              Abbrechen
            </Button>
            <Button
              onClick={editingDrive ? handleEditDrive : handleAddDrive}
              disabled={isAddingDrive || isUpdatingDrive}
              className="bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B89A3C]"
            >
              {isAddingDrive || isUpdatingDrive
                ? 'Wird gespeichert...'
                : editingDrive
                  ? 'Aktualisieren'
                  : 'Hinzufügen'}
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
              Fahrt löschen
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Sind Sie sicher, dass Sie diese Fahrt löschen möchten? Diese
              Aktion kann nicht rückgängig gemacht werden.
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
              onClick={handleDeleteDrive}
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

interface DriveCardProps {
  drive: Drive
  onEdit: () => void
  onDelete: () => void
}

function DriveCard({ drive, onEdit, onDelete }: DriveCardProps) {
  return (
    <div className="bg-[#2A2D30] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <h4 className="text-base font-semibold text-[#E6E6E6]">
              {new Date(drive.date).toLocaleDateString('de-DE')}
            </h4>
          </div>
          <p className="text-sm text-[#E5C97B] font-medium">
            {drive.kilometers.toLocaleString('de-DE')} km
          </p>
        </div>
      </div>

      {drive.notes && (
        <div className="mb-3 p-2 bg-[#0A1A2F] rounded border border-gray-700">
          <p className="text-sm text-gray-300 line-clamp-2">{drive.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="flex-1 text-[#E5C97B] hover:text-[#E5C97B] hover:bg-[#E5C97B]/10"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Bearbeiten
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-950"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Löschen
        </Button>
      </div>
    </div>
  )
}
