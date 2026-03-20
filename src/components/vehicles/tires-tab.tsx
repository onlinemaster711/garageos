'use client'

import { useEffect, useState } from 'react'
import {
  Gauge,
  Plus,
  Trash2,
  Edit2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Tire {
  id: string
  vehicle_id: string
  user_id: string
  type: 'summer' | 'winter' | 'allseason'
  brand: string | null
  size: string | null
  purchase_date: string | null
  mileage_km: number | null
  tread_depth_mm: number | null
  condition: 'new' | 'good' | 'fair' | 'worn' | 'replace'
  storage_location: string | null
  last_mounted_date: string | null
  notes: string | null
}

const TIRE_TYPE_LABELS: Record<string, string> = {
  summer: 'Sommerreifen',
  winter: 'Winterreifen',
  allseason: 'Ganzjahresreifen',
}

const CONDITION_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-emerald-900', text: 'text-emerald-200' },
  good: { bg: 'bg-blue-900', text: 'text-blue-200' },
  fair: { bg: 'bg-yellow-900', text: 'text-yellow-200' },
  worn: { bg: 'bg-orange-900', text: 'text-orange-200' },
  replace: { bg: 'bg-red-900', text: 'text-red-200' },
}

const CONDITION_LABELS: Record<string, string> = {
  new: 'Neu',
  good: 'Gut',
  fair: 'Befriedigend',
  worn: 'Abgenutzt',
  replace: 'Austausch erforderlich',
}

interface FormData {
  type: 'summer' | 'winter' | 'allseason'
  brand: string
  size: string
  purchase_date: string
  mileage_km: string
  tread_depth_mm: string
  condition: 'new' | 'good' | 'fair' | 'worn' | 'replace'
  storage_location: string
  last_mounted_date: string
  notes: string
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

  const [formData, setFormData] = useState<FormData>({
    type: 'summer',
    brand: '',
    size: '',
    purchase_date: new Date().toISOString().split('T')[0],
    mileage_km: '',
    tread_depth_mm: '',
    condition: 'good',
    storage_location: '',
    last_mounted_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  // Fetch tires
  useEffect(() => {
    const fetchTires = async () => {
      try {
        const { data, error } = await supabase
          .from('tires')
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
      brand: '',
      size: '',
      purchase_date: new Date().toISOString().split('T')[0],
      mileage_km: '',
      tread_depth_mm: '',
      condition: 'good',
      storage_location: '',
      last_mounted_date: new Date().toISOString().split('T')[0],
      notes: '',
    })
  }

  const handleAddTire = async () => {
    if (!formData.brand || !formData.size) {
      toast({
        title: 'Fehler',
        description: 'Marke und Größe sind erforderlich',
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
        brand: formData.brand || null,
        size: formData.size || null,
        purchase_date: formData.purchase_date || null,
        mileage_km: formData.mileage_km ? parseInt(formData.mileage_km, 10) : null,
        tread_depth_mm: formData.tread_depth_mm
          ? parseFloat(formData.tread_depth_mm)
          : null,
        condition: formData.condition,
        storage_location: formData.storage_location || null,
        last_mounted_date: formData.last_mounted_date || null,
        notes: formData.notes || null,
      }

      const { data: newTire, error } = await supabase
        .from('tires')
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
    if (!formData.brand || !formData.size) {
      toast({
        title: 'Fehler',
        description: 'Marke und Größe sind erforderlich',
        variant: 'destructive',
      })
      return
    }

    setIsUpdatingTire(true)
    try {
      const tireData = {
        type: formData.type,
        brand: formData.brand || null,
        size: formData.size || null,
        purchase_date: formData.purchase_date || null,
        mileage_km: formData.mileage_km ? parseInt(formData.mileage_km, 10) : null,
        tread_depth_mm: formData.tread_depth_mm
          ? parseFloat(formData.tread_depth_mm)
          : null,
        condition: formData.condition,
        storage_location: formData.storage_location || null,
        last_mounted_date: formData.last_mounted_date || null,
        notes: formData.notes || null,
      }

      const { data: updatedTire, error } = await supabase
        .from('tires')
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
      const { error } = await supabase.from('tires').delete().eq('id', tireToDelete)

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
      brand: tire.brand || '',
      size: tire.size || '',
      purchase_date: tire.purchase_date || new Date().toISOString().split('T')[0],
      mileage_km: tire.mileage_km?.toString() || '',
      tread_depth_mm: tire.tread_depth_mm?.toString() || '',
      condition: tire.condition,
      storage_location: tire.storage_location || '',
      last_mounted_date:
        tire.last_mounted_date || new Date().toISOString().split('T')[0],
      notes: tire.notes || '',
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
            <Gauge className="h-12 w-12 text-gray-600 mb-4" />
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
                <h3 className="text-lg font-semibold text-[#E6E6E6] mb-4 flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-[#E5C97B]" />
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
                <h3 className="text-lg font-semibold text-[#E6E6E6] mb-4 flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-[#E5C97B]" />
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
                <h3 className="text-lg font-semibold text-[#E6E6E6] mb-4 flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-[#E5C97B]" />
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
            <DialogTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-[#E5C97B]" />
              {editingTire ? 'Reifen bearbeiten' : 'Reifen hinzufügen'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="type" className="text-gray-300">
                Reifentyp *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as any })
                }
              >
                <SelectTrigger className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2D30] border-gray-600">
                  <SelectItem value="summer">Sommerreifen</SelectItem>
                  <SelectItem value="winter">Winterreifen</SelectItem>
                  <SelectItem value="allseason">Ganzjahresreifen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand" className="text-gray-300">
                Marke *
              </Label>
              <Input
                id="brand"
                placeholder="z.B. Michelin"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]"
              />
            </div>

            <div>
              <Label htmlFor="size" className="text-gray-300">
                Größe *
              </Label>
              <Input
                id="size"
                placeholder="z.B. 205/55R16"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
                className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]"
              />
            </div>

            <div>
              <Label htmlFor="condition" className="text-gray-300">
                Zustand *
              </Label>
              <Select
                value={formData.condition}
                onValueChange={(value) =>
                  setFormData({ ...formData, condition: value as any })
                }
              >
                <SelectTrigger className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2D30] border-gray-600">
                  <SelectItem value="new">Neu</SelectItem>
                  <SelectItem value="good">Gut</SelectItem>
                  <SelectItem value="fair">Befriedigend</SelectItem>
                  <SelectItem value="worn">Abgenutzt</SelectItem>
                  <SelectItem value="replace">Austausch erforderlich</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-gray-700" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tread_depth" className="text-gray-300 text-sm">
                  Profiltiefe (mm)
                </Label>
                <Input
                  id="tread_depth"
                  type="number"
                  step="0.1"
                  placeholder="z.B. 7.5"
                  value={formData.tread_depth_mm}
                  onChange={(e) =>
                    setFormData({ ...formData, tread_depth_mm: e.target.value })
                  }
                  className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]"
                />
              </div>

              <div>
                <Label htmlFor="mileage" className="text-gray-300 text-sm">
                  Km auf Reifen
                </Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="km"
                  value={formData.mileage_km}
                  onChange={(e) =>
                    setFormData({ ...formData, mileage_km: e.target.value })
                  }
                  className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="purchase_date" className="text-gray-300">
                Kaufdatum
              </Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_date: e.target.value })
                }
                className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]"
              />
            </div>

            <div>
              <Label htmlFor="last_mounted" className="text-gray-300">
                Zuletzt montiert
              </Label>
              <Input
                id="last_mounted"
                type="date"
                value={formData.last_mounted_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    last_mounted_date: e.target.value,
                  })
                }
                className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]"
              />
            </div>

            <div>
              <Label htmlFor="storage" className="text-gray-300">
                Lagerort
              </Label>
              <Input
                id="storage"
                placeholder="z.B. Garage, Keller"
                value={formData.storage_location}
                onChange={(e) =>
                  setFormData({ ...formData, storage_location: e.target.value })
                }
                className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-gray-300">
                Notizen
              </Label>
              <Textarea
                id="notes"
                placeholder="Zusätzliche Informationen..."
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

function TireCard({ tire, onEdit, onDelete }: TireCardProps) {
  const conditionColor = CONDITION_COLORS[tire.condition]
  const conditionLabel = CONDITION_LABELS[tire.condition]

  return (
    <div className="bg-[#2A2D30] rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-[#E6E6E6]">
            {tire.brand} {tire.size}
          </h4>
          <p className="text-sm text-gray-400">{TIRE_TYPE_LABELS[tire.type]}</p>
        </div>
        <Badge className={`${conditionColor.bg} ${conditionColor.text} border-0`}>
          {conditionLabel}
        </Badge>
      </div>

      {/* Details Grid */}
      <div className="space-y-3 mb-4">
        {tire.tread_depth_mm !== null && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Profiltiefe:</span>
            <span className="text-gray-300">{tire.tread_depth_mm} mm</span>
          </div>
        )}

        {tire.mileage_km !== null && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Kilometer:</span>
            <span className="text-gray-300">
              {tire.mileage_km.toLocaleString('de-DE')} km
            </span>
          </div>
        )}

        {tire.storage_location && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Lagerort:</span>
            <span className="text-gray-300">{tire.storage_location}</span>
          </div>
        )}

        {tire.last_mounted_date && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Zuletzt montiert:</span>
            <span className="text-gray-300">
              {new Date(tire.last_mounted_date).toLocaleDateString('de-DE')}
            </span>
          </div>
        )}

        {tire.purchase_date && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Kaufdatum:</span>
            <span className="text-gray-300">
              {new Date(tire.purchase_date).toLocaleDateString('de-DE')}
            </span>
          </div>
        )}

        {tire.notes && (
          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Notizen:</p>
            <p className="text-sm text-gray-300 line-clamp-2">{tire.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-700">
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
