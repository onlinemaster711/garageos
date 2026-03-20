'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
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
import { MileageChart } from './mileage-chart'

interface Drive {
  id: string
  vehicle_id: string
  user_id: string
  date: string
  km_driven: number
  mileage_after: number
  notes: string | null
  created_at: string
}

export function MileageTab({ vehicleId }: { vehicleId: string }) {
  const supabase = createClient()
  const { toast } = useToast()

  const [drives, setDrives] = useState<Drive[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddingDrive, setIsAddingDrive] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [driveToDelete, setDriveToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    km_driven: '',
    mileage_after: '',
    notes: '',
  })

  // Fetch drives
  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const { data, error } = await supabase
          .from('drives')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('date', { ascending: false })

        if (error) throw error
        setDrives(data || [])
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

  const handleAddDrive = async () => {
    if (!formData.km_driven || !formData.mileage_after) {
      toast({
        title: 'Fehler',
        description: 'Kilometer gefahren und Kilometerstand danach sind erforderlich',
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
        km_driven: parseInt(formData.km_driven, 10),
        mileage_after: parseInt(formData.mileage_after, 10),
        notes: formData.notes || null,
      }

      const { data: newDrive, error } = await supabase
        .from('drives')
        .insert([driveData])
        .select()
        .single()

      if (error) throw error

      setDrives([newDrive, ...drives])
      setFormData({
        date: new Date().toISOString().split('T')[0],
        km_driven: '',
        mileage_after: '',
        notes: '',
      })
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

  const handleDeleteDrive = async () => {
    if (!driveToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('drives')
        .delete()
        .eq('id', driveToDelete)

      if (error) throw error

      setDrives(drives.filter((d) => d.id !== driveToDelete))
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

  return (
    <>
      <div className="space-y-6">
        {/* Chart */}
        <MileageChart vehicleId={vehicleId} />

        {/* Add Drive Form */}
        <div className="bg-[#2A2D30] rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#E6E6E6]">
              Neue Fahrt hinzufügen
            </h3>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B89A3C]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Fahrt hinzufügen
            </Button>
          </div>
        </div>

        {/* Recent Drives */}
        <div>
          <h3 className="text-lg font-semibold text-[#E6E6E6] mb-4">
            Letzte Fahrten
          </h3>

          {drives.length === 0 ? (
            <div className="bg-[#2A2D30] rounded-lg p-12 border border-gray-700 flex flex-col items-center justify-center text-center">
              <Loader2 className="h-12 w-12 text-gray-600 mb-4 opacity-50" />
              <p className="text-gray-400 mb-2">Noch keine Fahrten erfasst</p>
              <p className="text-sm text-gray-500">
                Fügen Sie Ihre erste Fahrt hinzu, um diese zu verfolgen
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {drives.map((drive) => (
                <div
                  key={drive.id}
                  className="bg-[#2A2D30] rounded-lg p-6 border border-gray-700 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                      <p className="text-sm text-gray-400">
                        {new Date(drive.date).toLocaleDateString('de-DE')}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">
                          Kilometer gefahren
                        </p>
                        <p className="text-gray-300">
                          {drive.km_driven.toLocaleString('de-DE')} km
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">
                          Kilometerstand danach
                        </p>
                        <p className="text-gray-300">
                          {drive.mileage_after.toLocaleString('de-DE')} km
                        </p>
                      </div>
                    </div>

                    {drive.notes && (
                      <p className="text-gray-400 mt-3 text-sm">
                        {drive.notes}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDriveToDelete(drive.id)
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
      </div>

      {/* Add Drive Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#2A2D30] border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Fahrt hinzufügen
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
                className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="km_driven" className="text-gray-300">
                  Kilometer gefahren *
                </Label>
                <Input
                  id="km_driven"
                  type="number"
                  placeholder="km"
                  value={formData.km_driven}
                  onChange={(e) =>
                    setFormData({ ...formData, km_driven: e.target.value })
                  }
                  className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]"
                />
              </div>

              <div>
                <Label htmlFor="mileage_after" className="text-gray-300">
                  Kilometerstand danach *
                </Label>
                <Input
                  id="mileage_after"
                  type="number"
                  placeholder="km"
                  value={formData.mileage_after}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mileage_after: e.target.value,
                    })
                  }
                  className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-gray-300">
                Notizen
              </Label>
              <Textarea
                id="notes"
                placeholder="z.B. Geschäftsfahrt, Urlaub..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6] min-h-20"
              />
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
              onClick={handleAddDrive}
              disabled={isAddingDrive}
              className="bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B89A3C]"
            >
              {isAddingDrive ? 'Wird hinzugefügt...' : 'Hinzufügen'}
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
