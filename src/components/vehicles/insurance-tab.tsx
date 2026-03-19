'use client'

import { useEffect, useState } from 'react'
import {
  Shield,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  AlertCircle,
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

interface InsurancePolicy {
  id: string
  vehicle_id: string
  user_id: string
  provider: string
  policy_number: string | null
  type: 'haftpflicht' | 'teilkasko' | 'vollkasko'
  insured_value: number | null
  annual_premium: number | null
  start_date: string | null
  end_date: string | null
  notes: string | null
  created_at: string
}

export function InsuranceTab({
  vehicleId,
  purchasePrice,
}: {
  vehicleId: string
  purchasePrice: number | null
}) {
  const supabase = createClient()
  const { toast } = useToast()

  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddingPolicy, setIsAddingPolicy] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    provider: '',
    policy_number: '',
    type: 'haftpflicht' as 'haftpflicht' | 'teilkasko' | 'vollkasko',
    insured_value: '',
    annual_premium: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  })

  // Fetch insurance policies
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const { data, error } = await supabase
          .from('insurance_policies')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setPolicies(data || [])
      } catch (error) {
        toast({
          title: 'Fehler',
          description:
            error instanceof Error
              ? error.message
              : 'Versicherungspolicen konnten nicht geladen werden',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPolicies()
  }, [vehicleId, supabase, toast])

  const handleAddPolicy = async () => {
    if (!formData.provider) {
      toast({
        title: 'Fehler',
        description: 'Anbieter ist erforderlich',
        variant: 'destructive',
      })
      return
    }

    setIsAddingPolicy(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Nicht authentifiziert')

      const policyData = {
        vehicle_id: vehicleId,
        user_id: userData.user.id,
        provider: formData.provider,
        policy_number: formData.policy_number || null,
        type: formData.type,
        insured_value: formData.insured_value
          ? parseFloat(formData.insured_value)
          : null,
        annual_premium: formData.annual_premium
          ? parseFloat(formData.annual_premium)
          : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        notes: formData.notes || null,
      }

      const { data: newPolicy, error } = await supabase
        .from('insurance_policies')
        .insert([policyData])
        .select()
        .single()

      if (error) throw error

      setPolicies([newPolicy, ...policies])
      setFormData({
        provider: '',
        policy_number: '',
        type: 'haftpflicht',
        insured_value: '',
        annual_premium: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: '',
      })
      setIsAddDialogOpen(false)

      toast({
        title: 'Erfolg',
        description: 'Versicherungspolice hinzugefügt',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Versicherungspolice konnte nicht hinzugefügt werden',
        variant: 'destructive',
      })
    } finally {
      setIsAddingPolicy(false)
    }
  }

  const handleDeletePolicy = async () => {
    if (!policyToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('insurance_policies')
        .delete()
        .eq('id', policyToDelete)

      if (error) throw error

      setPolicies(policies.filter((p) => p.id !== policyToDelete))
      setDeleteConfirmOpen(false)
      setPolicyToDelete(null)

      toast({
        title: 'Erfolg',
        description: 'Versicherungspolice gelöscht',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Versicherungspolice konnte nicht gelöscht werden',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const typeLabels = {
    haftpflicht: 'Haftpflicht',
    teilkasko: 'Teilkasko',
    vollkasko: 'Vollkasko',
  }

  // Calculate total annual premium
  const totalAnnualPremium = policies.reduce((sum, policy) => {
    return sum + (policy.annual_premium || 0)
  }, 0)

  // Find expiring policies (within 30 days)
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const expiringPolicies = policies.filter((policy) => {
    if (!policy.end_date) return false
    const endDate = new Date(policy.end_date)
    return endDate >= today && endDate <= thirtyDaysFromNow
  })

  // Check for underinsurance warning
  const maxInsuredValue = Math.max(
    ...policies.map((p) => p.insured_value || 0),
    0
  )
  const isUnderinsured =
    purchasePrice && maxInsuredValue > 0 && maxInsuredValue < purchasePrice

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
        {/* Underinsurance Warning */}
        {isUnderinsured && (
          <div className="bg-orange-950 border border-orange-700 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-400">
                Achtung: Mögliche Unterversicherung!
              </h3>
              <p className="text-orange-300 text-sm mt-1">
                Versicherter Wert (€
                {maxInsuredValue.toLocaleString('de-DE')}) liegt unter dem
                Kaufpreis (€{purchasePrice.toLocaleString('de-DE')})
              </p>
            </div>
          </div>
        )}

        {/* Expiring Policies Warning */}
        {expiringPolicies.length > 0 && (
          <div className="bg-amber-950 border border-amber-700 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-400">
                {expiringPolicies.length} Police(n) verfallen bald
              </h3>
              <ul className="text-amber-300 text-sm mt-1 space-y-1">
                {expiringPolicies.map((policy) => (
                  <li key={policy.id}>
                    {policy.provider} endet am{' '}
                    {new Date(policy.end_date!).toLocaleDateString('de-DE')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Stats */}
        {policies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Gesamtjährliche Prämie
              </p>
              <p className="text-2xl font-bold text-[#C9A84C]">
                €{totalAnnualPremium.toLocaleString('de-DE')}
              </p>
            </div>
            <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Anzahl der Policen
              </p>
              <p className="text-2xl font-bold text-[#F0F0F0]">{policies.length}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#B89A3C]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Versicherung hinzufügen
          </Button>
        </div>

        {policies.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-lg p-12 border border-gray-700 flex flex-col items-center justify-center text-center">
            <Shield className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400 mb-2">Noch keine Versicherungen</p>
            <p className="text-sm text-gray-500">
              Fügen Sie Ihre Versicherungspolicen hinzu, um diese zu verwalten
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {policies.map((policy) => {
              const isExpiringSoon =
                policy.end_date &&
                new Date(policy.end_date) <= thirtyDaysFromNow &&
                new Date(policy.end_date) >= today

              return (
                <div
                  key={policy.id}
                  className={`rounded-lg p-6 border flex justify-between items-start ${
                    isExpiringSoon
                      ? 'bg-amber-950 border-amber-700'
                      : 'bg-[#1E1E1E] border-gray-700'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#F0F0F0]">
                        {policy.provider}
                      </h3>
                      <span className="px-2 py-1 bg-[#C9A84C] bg-opacity-20 text-[#C9A84C] rounded text-xs font-medium">
                        {typeLabels[policy.type]}
                      </span>
                      {isExpiringSoon && (
                        <span className="px-2 py-1 bg-amber-600 text-amber-100 rounded text-xs font-medium">
                          Verfällt bald
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      {policy.policy_number && (
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wide">
                            Policennummer
                          </p>
                          <p className="text-gray-300">{policy.policy_number}</p>
                        </div>
                      )}
                      {policy.annual_premium !== null && (
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wide">
                            Jährliche Prämie
                          </p>
                          <p className="text-gray-300">
                            €{policy.annual_premium.toLocaleString('de-DE')}
                          </p>
                        </div>
                      )}
                      {policy.insured_value !== null && (
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wide">
                            Versicherter Wert
                          </p>
                          <p className="text-gray-300">
                            €{policy.insured_value.toLocaleString('de-DE')}
                          </p>
                        </div>
                      )}
                      {policy.start_date && (
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wide">
                            Startdatum
                          </p>
                          <p className="text-gray-300">
                            {new Date(policy.start_date).toLocaleDateString(
                              'de-DE'
                            )}
                          </p>
                        </div>
                      )}
                      {policy.end_date && (
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wide">
                            Enddatum
                          </p>
                          <p className="text-gray-300">
                            {new Date(policy.end_date).toLocaleDateString(
                              'de-DE'
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {policy.notes && (
                      <p className="text-gray-400 mt-4 text-sm">
                        {policy.notes}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPolicyToDelete(policy.id)
                      setDeleteConfirmOpen(true)
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950 ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Insurance Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#C9A84C]" />
              Versicherung hinzufügen
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="provider" className="text-gray-300">
                Anbieter *
              </Label>
              <Input
                id="provider"
                placeholder="z.B. AXA, Allianz"
                value={formData.provider}
                onChange={(e) =>
                  setFormData({ ...formData, provider: e.target.value })
                }
                className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]"
              />
            </div>

            <div>
              <Label htmlFor="policy_number" className="text-gray-300">
                Policennummer
              </Label>
              <Input
                id="policy_number"
                placeholder="Optional"
                value={formData.policy_number}
                onChange={(e) =>
                  setFormData({ ...formData, policy_number: e.target.value })
                }
                className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]"
              />
            </div>

            <div>
              <Label htmlFor="type" className="text-gray-300">
                Versicherungstyp *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as 'haftpflicht' | 'teilkasko' | 'vollkasko',
                  })
                }
              >
                <SelectTrigger className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-gray-600">
                  <SelectItem value="haftpflicht">Haftpflicht</SelectItem>
                  <SelectItem value="teilkasko">Teilkasko</SelectItem>
                  <SelectItem value="vollkasko">Vollkasko</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="insured_value" className="text-gray-300">
                  Versicherter Wert (€)
                </Label>
                <Input
                  id="insured_value"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.insured_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insured_value: e.target.value,
                    })
                  }
                  className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]"
                />
              </div>

              <div>
                <Label htmlFor="annual_premium" className="text-gray-300">
                  Jährliche Prämie (€)
                </Label>
                <Input
                  id="annual_premium"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.annual_premium}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      annual_premium: e.target.value,
                    })
                  }
                  className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start_date" className="text-gray-300">
                  Startdatum
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]"
                />
              </div>

              <div>
                <Label htmlFor="end_date" className="text-gray-300">
                  Enddatum
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]"
                />
              </div>
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
                className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0] min-h-20"
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
              onClick={handleAddPolicy}
              disabled={isAddingPolicy}
              className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#B89A3C]"
            >
              {isAddingPolicy ? 'Wird hinzugefügt...' : 'Hinzufügen'}
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
              Versicherungspolice löschen
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Sind Sie sicher, dass Sie diese Versicherungspolice löschen
              möchten? Diese Aktion kann nicht rückgängig gemacht werden.
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
              onClick={handleDeletePolicy}
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
