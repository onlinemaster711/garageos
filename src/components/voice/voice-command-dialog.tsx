'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { ParsedCommand } from '@/lib/speech'

interface Vehicle {
  id: string
  make: string
  model: string
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface VoiceCommandDialogProps {
  open: boolean
  command: ParsedCommand | null
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

const TYPE_LABELS: Record<string, { de: string; icon: string }> = {
  maintenance: { de: 'Wartungseintrag', icon: '🔧' },
  drive: { de: 'Fahrt', icon: '🚗' },
  reminder: { de: 'Erinnerung', icon: '⏰' },
  mileage: { de: 'Kilometerstand', icon: '📊' },
  unknown: { de: 'Unbekannt', icon: '❓' },
}

export function VoiceCommandDialog({
  open,
  command,
  onOpenChange,
  onSave,
}: VoiceCommandDialogProps) {
  const supabase = createClient()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<ParsedCommand>>({})

  // Fetch vehicles on mount
  useEffect(() => {
    const fetchVehicles = async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model')
        .order('make', { ascending: true })

      if (error) {
        console.error('Error fetching vehicles:', error)
        return
      }

      setVehicles(data || [])
    }

    fetchVehicles()
  }, [supabase])

  // Update form data and find best vehicle match when command changes
  useEffect(() => {
    if (!command) {
      setFormData({})
      setSelectedVehicleId('')
      return
    }

    setFormData(command)

    // Try to match vehicle based on hint
    if (command.vehicleHint && vehicles.length > 0) {
      const hint = command.vehicleHint.toLowerCase()
      const matchedVehicle = vehicles.find(v => {
        const fullName = `${v.make} ${v.model}`.toLowerCase()
        return (
          fullName.includes(hint) ||
          hint.includes(v.make.toLowerCase()) ||
          hint.includes(v.model.toLowerCase())
        )
      })

      if (matchedVehicle) {
        setSelectedVehicleId(matchedVehicle.id)
      } else {
        setSelectedVehicleId('')
      }
    }
  }, [command, vehicles])

  const handleSave = async () => {
    if (!command) return

    if (!selectedVehicleId && command.type !== 'reminder') {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie ein Fahrzeug aus.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      switch (command.type) {
        case 'maintenance':
          await supabase.from('maintenance').insert({
            vehicle_id: selectedVehicleId,
            date: formData.date || new Date().toISOString().split('T')[0],
            title: formData.title || 'Wartung',
            cost: formData.cost || null,
            description: formData.notes || null,
          })
          break

        case 'drive':
          await supabase.from('drives').insert({
            vehicle_id: selectedVehicleId,
            date: formData.date || new Date().toISOString().split('T')[0],
            km_driven: formData.km || null,
          })
          break

        case 'reminder':
          if (!selectedVehicleId) {
            toast({
              title: 'Fehler',
              description: 'Bitte wählen Sie ein Fahrzeug für die Erinnerung aus.',
              variant: 'destructive',
            })
            setIsLoading(false)
            return
          }
          await supabase.from('reminders').insert({
            vehicle_id: selectedVehicleId,
            type: 'custom',
            title: formData.title || 'Erinnerung',
            due_date: formData.date || new Date().toISOString().split('T')[0],
            notes: formData.notes || null,
            status: 'open',
          })
          break

        case 'mileage':
          if (formData.mileage === undefined) {
            toast({
              title: 'Fehler',
              description: 'Kilometerstand konnte nicht erkannt werden.',
              variant: 'destructive',
            })
            setIsLoading(false)
            return
          }
          await supabase
            .from('vehicles')
            .update({ current_mileage: formData.mileage })
            .eq('id', selectedVehicleId)
          break

        default:
          toast({
            title: 'Fehler',
            description: 'Unbekannter Befehlstyp.',
            variant: 'destructive',
          })
          setIsLoading(false)
          return
      }

      toast({
        title: 'Erfolgreich gespeichert',
        description: `${TYPE_LABELS[command.type].de} wurde erstellt.`,
      })

      onOpenChange(false)
      onSave?.()
    } catch (error) {
      console.error('Error saving command:', error)
      toast({
        title: 'Fehler',
        description: 'Es gab einen Fehler beim Speichern.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!command) return null

  const typeInfo = TYPE_LABELS[command.type]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#4A5260] bg-[#2A2D30]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#E6E6E6]">
            <span>{typeInfo.icon}</span>
            {typeInfo.de}
          </DialogTitle>
          <DialogDescription className="text-[#A0A0A0]">
            Überprüfen Sie die erkannten Informationen und bearbeiten Sie sie bei Bedarf.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Vehicle Selection (except for unknown type) */}
          {command.type !== 'unknown' && (
            <div className="space-y-2">
              <Label htmlFor="vehicle" className="text-[#E6E6E6]">
                Fahrzeug
              </Label>
              <select
                id="vehicle"
                value={selectedVehicleId}
                onChange={e => setSelectedVehicleId(e.target.value)}
                className="w-full rounded-lg border border-[#4A5260] bg-[#0A1A2F] px-3 py-2 text-[#E6E6E6] placeholder-[#666666] focus:border-[#E5C97B] focus:outline-none focus:ring-1 focus:ring-[#E5C97B]"
              >
                <option value="">Fahrzeug wählen...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model}
                  </option>
                ))}
              </select>
              {command.vehicleHint && (
                <p className="text-xs text-[#888888]">
                  Erkannt: {command.vehicleHint}
                </p>
              )}
            </div>
          )}

          {/* Title (for maintenance, reminder) */}
          {(command.type === 'maintenance' || command.type === 'reminder') && (
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#E6E6E6]">
                Titel
              </Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="border-[#4A5260] bg-[#0A1A2F] text-[#E6E6E6] placeholder-[#666666]"
                placeholder="z.B. Ölwechsel"
              />
            </div>
          )}

          {/* Cost (for maintenance) */}
          {command.type === 'maintenance' && (
            <div className="space-y-2">
              <Label htmlFor="cost" className="text-[#E6E6E6]">
                Kosten (€)
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost || ''}
                onChange={e => setFormData({ ...formData, cost: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="border-[#4A5260] bg-[#0A1A2F] text-[#E6E6E6] placeholder-[#666666]"
                placeholder="z.B. 50"
              />
            </div>
          )}

          {/* Kilometers (for drive) */}
          {command.type === 'drive' && (
            <div className="space-y-2">
              <Label htmlFor="km" className="text-[#E6E6E6]">
                Kilometer
              </Label>
              <Input
                id="km"
                type="number"
                value={formData.km || ''}
                onChange={e => setFormData({ ...formData, km: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="border-[#4A5260] bg-[#0A1A2F] text-[#E6E6E6] placeholder-[#666666]"
                placeholder="z.B. 50"
              />
            </div>
          )}

          {/* Mileage (for mileage update) */}
          {command.type === 'mileage' && (
            <div className="space-y-2">
              <Label htmlFor="mileage" className="text-[#E6E6E6]">
                Kilometerstand
              </Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage || ''}
                onChange={e => setFormData({ ...formData, mileage: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="border-[#4A5260] bg-[#0A1A2F] text-[#E6E6E6] placeholder-[#666666]"
                placeholder="z.B. 150000"
              />
            </div>
          )}

          {/* Date (for all except unknown) */}
          {command.type !== 'unknown' && (
            <div className="space-y-2">
              <Label htmlFor="date" className="text-[#E6E6E6]">
                Datum
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ''}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="border-[#4A5260] bg-[#0A1A2F] text-[#E6E6E6] placeholder-[#666666]"
              />
            </div>
          )}

          {/* Notes (for all except unknown) */}
          {command.type !== 'unknown' && (
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[#E6E6E6]">
                Notizen (optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="border-[#4A5260] bg-[#0A1A2F] text-[#E6E6E6] placeholder-[#666666]"
                placeholder="Zusätzliche Informationen..."
                rows={3}
              />
            </div>
          )}

          {/* Raw transcript for unknown type */}
          {command.type === 'unknown' && (
            <div className="space-y-2">
              <Label className="text-[#E6E6E6]">Erkannter Text</Label>
              <div className="rounded-lg border border-[#4A5260] bg-[#0A1A2F] px-3 py-2 text-[#E6E6E6]">
                {command.raw}
              </div>
              <p className="text-sm text-[#888888]">
                Dieser Befehl konnte nicht erkannt werden. Bitte versuchen Sie es erneut oder geben Sie die Informationen manuell ein.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#4A5260] text-[#E6E6E6] hover:bg-[#2A2D30]"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || (command.type === 'unknown')}
            className="bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B8963D]"
          >
            {isLoading ? 'Speichern...' : 'Speichern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
