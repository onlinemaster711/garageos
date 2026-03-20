'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  AlertTriangle,
  Calendar,
  Edit2,
  Loader2,
  Plus,
  Trash2,
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

interface Tire {
  id: string
  vehicle_id: string
  user_id: string
  type: 'summer' | 'winter' | 'allseason'
  size: string
  purchase_date: string | null
  created_at: string
}

type TireType = 'summer' | 'winter' | 'allseason'

interface FormDataState {
  type: TireType
  size: string
  purchase_date: string
}

export function TiresTab({ vehicleId }: { vehicleId: string }) {
  const supabase = createClient()
  const { toast } = useToast()

  const [tires, setTires] = useState<Tire[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddingTire, setIsAddingTire] = useState(false)
  const [isUpdatingTire, setIsUpdatingTire] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [tireToDelete, setTireToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingTire, setEditingTire] = useState<Tire | null>(null)

  const [formData, setFormData] = useState<FormDataState>({
    type: 'summer',
    size: '',
    purchase_date: new Date().toISOString().split('T')[0],
  })

  // Fetch tires
  useEffect(() => {
    const fetchTires = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicle_tires')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('type', { ascending: true })

        if (error) throw error
        setTires(data || [])
      } catch (error) {
        toast({
          title: 'Fehler',
          description:
            error instanceof Error
              ? error.message
              : 'Reifen konnten nicht geladen werden',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTires()
  }, [vehicleId, supabase, toast])

  const resetFormData = () => {
    setFormData({
      type: 'summer',
      size: '',
      purchase_date: new Date().toISOString().split('T')[0],
    })
  }

  const handleAddTire = async () => {
    if (!formData.size) {
      toast({
        title: 'Fehler',
        description: 'Reifengröße ist erforderlich',
        variant: 'destructive',
      })
      return
    }

    setIsAddingTire(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Nicht authentifiziert')

      const tireData = {
        vehicle_id: vehicleId,
        user_id: userData.user.id,
        type: formData.type,
        size: formData.size,
        purchase_date: formData.purchase_date || null,
      }

      const { data: newTire, error } = await supabase
        .from('vehicle_tires')
        .insert([tireData])
        .select()
        .single()

      if (error) throw error

      setTires([...tires, newTire])
      resetFormData()
      setIsAddDialogOpen(false)

      toast({
        title: 'Erfolg',
        description: 'Reifen hinzugefügt',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Reifen konnten nicht hinzugefügt werden',
        variant: 'destructive',
      })
    } finally {
      setIsAddingTire(false)
    }
  }

  const handleEditTire = async () => {
    if (!editingTire) return
    if (!formData.size) {
      toast({
        title: 'Fehler',
        description: 'Reifengröße ist erforderlich',
        variant: 'destructive',
      })
      return
    }

    setIsUpdatingTire(true)
    try {
      const tireData = {
        type: formData.type,
        size: formData.size,
        purchase_date: formData.purchase_date || null,
      }

      const { data: updatedTire, error } = await supabase
        .from('vehicle_tires')
        .update(tireData)
        .eq('id', editingTire.id)
        .select()
        .single()

      if (error) throw error

      setTires(tires.map((t) => (t.id === editingTire.id ? updatedTire : t)))
      setEditingTire(null)
      setIsEditDialogOpen(false)
      resetFormData()

      toast({
        title: 'Erfolg',
        description: 'Reifen aktualisiert',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Reifen konnten nicht aktualisiert werden',
        variant: 'destructive',
      })
    } finally {
      setIsUpdatingTire(false)
    }
  }

  const handleDeleteTire = async () => {
    if (!tireToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from('vehicle_tires').delete().eq('id', tireToDelete)

      if (error) throw error

      setTires(tires.filter((t) => t.id !== tireToDelete))
      setDeleteConfirmOpen(false)
      setTireToDelete(null)

      toast({
        title: 'Erfolg',
        description: 'Reifen gelöscht',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Reifen konnten nicht gelöscht werden',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (tire: Tire) => {
    setEditingTire(tire)
    setFormData({
      type: tire.type,
      size: tire.size || '',
      purchase_date: tire.purchase_date || new Date().toISOString().split('T')[0],
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

  const tiresByType = {
    summer: tires.filter((t) => t.type === 'summer'),
    winter: tires.filter((t) => t.type === 'winter'),
    allseason: tires.filter((t) => t.type === 'allseason'),
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => {
              resetFormData()
              setEditingTire(null)
              setIsAddDialogOpen(true)
            }}
            className="bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B89A3C]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Reifen hinzufügen
          </Button>
        </div>

        {tires.length === 0 ? (
          <div className="bg-[#2A2D30] rounded-lg p-12 border border-gray-700 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 mb-2">Noch keine Reifen hinzugefügt</p>
            <p className="text-sm text-gray-500">
              Fügen Sie Ihre Reifensätze hinzu, um diese zu verwalten
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Sommerreifen */}
            {tiresByType.summer.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#E6E6E6] mb-4">
                  {TIRE_TYPE_LABELS.summer}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tiresByType.summer.map((tire) => (
                    <TireCard
                      key={tire.id}
                      tire={tire}
                      onEdit={() => openEditDialog(tire)}
                      onDelete={() => {
                        setTireToDelete(tire.id)
                        setDeleteConfirmOpen(true)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Winterreifen */}
            {tiresByType.winter.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#E6E6E6] mb-4">
                  {TIRE_TYPE_LABELS.winter}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tiresByType.winter.map((tire) => (
                    <TireCard
                      key={tire.id}
                      tire={tire}
                      onEdit={() => openEditDialog(tire)}
                      onDelete={() => {
                        setTireToDelete(tire.id)
                        setDeleteConfirmOpen(true)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Ganzjahresreifen */}
            {tiresByType.allseason.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#E6E6E6] mb-4">
                  {TIRE_TYPE_LABELS.allseason}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tiresByType.allseason.map((tire) => (
                    <TireCard
                      key={tire.id}
                      tire={tire}
                      onEdit={() => openEditDialog(tire)}
                      onDelete={() => {
                        setTireToDelete(tire.id)
                        setDeleteConfirmOpen(true)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Tire Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setIsEditDialogOpen(false)
            setEditingTire(null)
            resetFormData()
          }
        }}
      >
        <DialogContent className="bg-[#2A2D30] border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#E6E6E6]">
              {editingTire ? 'Reifen bearbeiten' : 'Reifen hinzufügen'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Type Selection */}
            <div>
              <Label className="text-gray-300 mb-3 block font-medium">
                Reifentyp *
              </Label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[#3D4450] transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value="summer"
                    checked={formData.type === 'summer'}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as TireType })
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-gray-300">Sommerreifen</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[#3D4450] transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value="winter"
                    checked={formData.type === 'winter'}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as TireType })
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-gray-300">Winterreifen</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[#3D4450] transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value="allseason"
                    checked={formData.type === 'allseason'}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as TireType })
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-gray-300">Ganzjahresreifen</span>
                </label>
              </div>
            </div>

            {/* Size Input */}
            <div>
              <Label htmlFor="size" className="text-gray-300 font-medium">
                Reifengröße *
              </Label>
              <Input
                id="size"
                placeholder="z.B. 205/55R16"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
                className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6] mt-2"
              />
            </div>

            {/* Purchase Date */}
            <div>
              <Label htmlFor="purchase_date" className="text-gray-300 font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Kaufdatum
              </Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_date: e.target.value })
                }
                className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6] mt-2"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                setIsEditDialogOpen(false)
                setEditingTire(null)
                resetFormData()
              }}
              className="border-gray-600"
            >
              Abbrechen
            </Button>
            <Button
              onClick={editingTire ? handleEditTire : handleAddTire}
              disabled={isAddingTire || isUpdatingTire}
              className="bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B89A3C]"
            >
              {isAddingTire || isUpdatingTire
                ? 'Wird gespeichert...'
                : editingTire
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
              Reifen löschen
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Sind Sie sicher, dass Sie diesen Reifen löschen möchten? Diese
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
              onClick={handleDeleteTire}
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

interface TireCardProps {
  tire: Tire
  onEdit: () => void
  onDelete: () => void
}

const TIRE_TYPE_LABELS: Record<TireType, string> = {
  summer: 'Sommerreifen',
  winter: 'Winterreifen',
  allseason: 'Ganzjahresreifen',
}

function TireCard({ tire, onEdit, onDelete }: TireCardProps) {
  return (
    <div className="bg-[#2A2D30] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-base font-semibold text-[#E6E6E6]">{tire.size}</h4>
          <p className="text-sm text-gray-400">{TIRE_TYPE_LABELS[tire.type]}</p>
        </div>
      </div>

      {tire.purchase_date && (
        <div className="text-sm mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-400">Gekauft:</span>
          <span className="text-gray-300">
            {new Date(tire.purchase_date).toLocaleDateString('de-DE')}
          </span>
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
