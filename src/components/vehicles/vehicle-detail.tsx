'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit2,
  Trash2,
  AlertTriangle,
  Wrench,
  FileText,
  Image as ImageIcon,
  Info,
  Shield,
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
import { MaintenanceTab } from './maintenance-tab'
import { DocumentsTab } from './documents-tab'
import { PhotosTab } from './photos-tab'
import { DossierButton } from './dossier-button'
import type { InsurancePolicy } from '@/lib/types'

interface Vehicle {
  id: string
  user_id: string
  make: string
  model: string
  year: number
  color: string
  vin: string
  plate: string
  category: string
  purchase_date: string | null
  purchase_price: number | null
  current_mileage: number | null
  country_code: string | null
  location_name: string | null
  notes: string | null
  cover_photo_url: string | null
  created_at: string
}

type TabType = 'overview' | 'maintenance' | 'documents' | 'photos'

export function VehicleDetail({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('maintenance')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Insurance States
  const [insurances, setInsurances] = useState<InsurancePolicy[]>([])
  const [loadingInsurances, setLoadingInsurances] = useState(true)

  useEffect(() => {
    loadInsurances()
  }, [])

  const loadInsurances = async () => {
    try {
      setLoadingInsurances(true)
      const { data, error } = await supabase
        .from('policy_vehicles')
        .select(`
          insurance_policies(id, user_id, name, file_url, valid_until, created_at)
        `)
        .eq('vehicle_id', vehicle.id)

      if (error) throw error

      const policyData = (data || [])
        .map((item: any) => item.insurance_policies)
        .filter(Boolean) as InsurancePolicy[]

      setInsurances(policyData)
    } catch (error) {
      console.error('Error loading insurances:', error)
    } finally {
      setLoadingInsurances(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicle.id)
        .eq('user_id', vehicle.user_id)

      if (error) throw error

      toast({
        title: 'Erfolg',
        description: 'Fahrzeug wurde gelöscht',
      })

      router.push('/dashboard')
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error ? error.message : 'Fahrzeug konnte nicht gelöscht werden',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const getCategoryBadgeColor = (category: string): string => {
    switch (category) {
      case 'oldtimer':
        return 'bg-purple-900/30 text-purple-400'
      case 'youngtimer':
        return 'bg-blue-900/30 text-blue-400'
      case 'modern':
        return 'bg-green-900/30 text-green-400'
      default:
        return 'bg-gray-900/30 text-gray-400'
    }
  }

  const getCategoryLabel = (category: string): string => {
    const labels: { [key: string]: string } = {
      oldtimer: 'Oldtimer',
      youngtimer: 'Youngtimer',
      modern: 'Modern',
    }
    return labels[category] || category
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-[#0A0A0A]">
        {/* Compact Header - One Line */}
        <div className="bg-[#0A0A0A] border-b border-gray-700 px-4 md:px-8 py-3 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Back Link + Vehicle Info */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/dashboard"
                className="flex-shrink-0 text-gray-400 hover:text-[#C9A84C] transition-colors"
                title="Zurück"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-lg font-bold text-[#F0F0F0] truncate">
                  {vehicle.make} {vehicle.model}
                </h1>
                <span className="flex-shrink-0 text-sm text-gray-400">
                  {vehicle.year}
                </span>
                <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeColor(vehicle.category)}`}>
                  {getCategoryLabel(vehicle.category)}
                </span>
              </div>
            </div>

            {/* Price + Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {vehicle.purchase_price && (
                <span className="text-sm font-semibold text-[#C9A84C] hidden sm:inline">
                  € {vehicle.purchase_price.toLocaleString('de-DE')}
                </span>
              )}
              <DossierButton
                vehicleId={vehicle.id}
                vehicleName={`${vehicle.make} ${vehicle.model}`}
              />
              <Link href={`/vehicles/${vehicle.id}/edit`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#C9A84C] hover:bg-[#C9A84C]/10"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-400/10"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Horizontal Tabs */}
        <div className="bg-[#0A0A0A] border-b border-gray-700 px-4 md:px-8 flex-shrink-0 overflow-x-auto">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                  : 'text-gray-400 hover:text-[#F0F0F0]'
              }`}
            >
              <Info className="h-4 w-4" />
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`py-3 px-1 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'maintenance'
                  ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                  : 'text-gray-400 hover:text-[#F0F0F0]'
              }`}
            >
              <Wrench className="h-4 w-4" />
              Wartung
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-3 px-1 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'documents'
                  ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                  : 'text-gray-400 hover:text-[#F0F0F0]'
              }`}
            >
              <FileText className="h-4 w-4" />
              Dokumente
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`py-3 px-1 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'photos'
                  ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                  : 'text-gray-400 hover:text-[#F0F0F0]'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Fotos
            </button>
          </div>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailCard label="Marke" value={vehicle.make} />
                <DetailCard label="Modell" value={vehicle.model} />
                <DetailCard label="Baujahr" value={vehicle.year.toString()} />
                <DetailCard label="Farbe" value={vehicle.color} />
                <DetailCard label="VIN" value={vehicle.vin} />
                <DetailCard label="Kennzeichen" value={vehicle.plate || '-'} />
                <DetailCard label="Kategorie" value={getCategoryLabel(vehicle.category)} />
                <DetailCard label="Land" value={vehicle.country_code || '-'} />
                <DetailCard
                  label="Kaufdatum"
                  value={
                    vehicle.purchase_date
                      ? new Date(vehicle.purchase_date).toLocaleDateString('de-DE')
                      : '-'
                  }
                />
                <DetailCard
                  label="Kaufpreis"
                  value={
                    vehicle.purchase_price
                      ? `€ ${vehicle.purchase_price.toLocaleString('de-DE')}`
                      : '-'
                  }
                />
                <DetailCard
                  label="Kilometerstand"
                  value={
                    vehicle.current_mileage !== null && vehicle.current_mileage !== undefined
                      ? `${vehicle.current_mileage.toLocaleString('de-DE')} km`
                      : '-'
                  }
                />
                <DetailCard label="Standort" value={vehicle.location_name || '-'} />
              </div>

              {vehicle.notes && (
                <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-[#F0F0F0] mb-3">Notizen</h3>
                  <p className="text-gray-400 whitespace-pre-wrap">{vehicle.notes}</p>
                </div>
              )}

              {/* Insurances Section */}
              <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-[#C9A84C]" />
                  <h3 className="text-lg font-semibold text-[#F0F0F0]">Versicherungen</h3>
                </div>
                {loadingInsurances ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#C9A84C]" />
                  </div>
                ) : insurances.length === 0 ? (
                  <p className="text-gray-400">Keine Versicherungen verlinkt</p>
                ) : (
                  <div className="space-y-3">
                    {insurances.map(insurance => (
                      <div key={insurance.id} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-gray-700">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#F0F0F0] truncate">{insurance.name}</p>
                          {insurance.valid_until && (
                            <p className="text-xs text-gray-500">
                              Gültig bis: {new Date(insurance.valid_until).toLocaleDateString('de-DE')}
                            </p>
                          )}
                        </div>
                        <a href={insurance.file_url} download target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="text-[#C9A84C] hover:bg-[#C9A84C]/10 ml-2">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Maintenance Tab - Full Width */}
          {activeTab === 'maintenance' && (
            <div className="max-w-7xl mx-auto">
              <MaintenanceTab vehicleId={vehicle.id} />
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="max-w-7xl mx-auto">
              <DocumentsTab vehicleId={vehicle.id} />
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="max-w-7xl mx-auto">
              <PhotosTab vehicleId={vehicle.id} />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Fahrzeug löschen
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Sind Sie sicher, dass Sie {vehicle.make} {vehicle.model} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-600"
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
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

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-700">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">{label}</p>
      <p className="text-base font-semibold text-[#F0F0F0] break-words">{value}</p>
    </div>
  )
}
