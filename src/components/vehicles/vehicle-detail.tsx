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
  Circle,
  Car,
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
import { ScheduleTab } from './schedule-tab'
import { DocumentsTab } from './documents-tab'
import { PhotosTab } from './photos-tab'
import { TiresTab } from './tires-tab'
import { DrivesTab } from './drives-tab'
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

type TabType = 'overview' | 'schedule' | 'documents' | 'photos' | 'tires' | 'drives'

export function VehicleDetail({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [checkingOwner, setCheckingOwner] = useState(true)

  // Insurance States
  const [insurances, setInsurances] = useState<InsurancePolicy[]>([])
  const [loadingInsurances, setLoadingInsurances] = useState(true)

  useEffect(() => {
    checkOwnershipAndLoadData()
  }, [])

  const checkOwnershipAndLoadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.id === vehicle.user_id) {
        setIsOwner(true)
      }
    } catch (err) {
      console.error('Error checking ownership:', err)
    } finally {
      setCheckingOwner(false)
      loadInsurances()
    }
  }

  const loadInsurances = async () => {
    try {
      setLoadingInsurances(true)

      console.log('📋 Loading insurances for vehicle:', vehicle.id)

      // Query policy_vehicles to get linked insurance IDs
      const { data: policyVehicleData, error: policyError } = await supabase
        .from('policy_vehicles')
        .select('policy_id')
        .eq('vehicle_id', vehicle.id)

      if (policyError) {
        console.error('❌ Error querying policy_vehicles:', {
          code: policyError.code,
          message: policyError.message,
          details: policyError.details,
          hint: policyError.hint,
        })
        setInsurances([])
        return
      }

      console.log('✓ Found policy_vehicle links:', policyVehicleData?.length || 0)

      // If no linked policies, return empty
      if (!policyVehicleData || policyVehicleData.length === 0) {
        console.log('ℹ️ No linked insurance policies')
        setInsurances([])
        return
      }

      // Get policy IDs
      const policyIds = policyVehicleData
        .map((item: any) => item.policy_id)
        .filter(Boolean)

      if (policyIds.length === 0) {
        console.log('ℹ️ No valid policy IDs found')
        setInsurances([])
        return
      }

      console.log('📌 Fetching insurance policies with IDs:', policyIds)

      // Query insurance_policies by IDs (use wildcard to get all available columns)
      const { data: insuranceData, error: insuranceError } = await supabase
        .from('insurance_policies')
        .select('*')
        .in('id', policyIds)

      if (insuranceError) {
        console.error('❌ Error querying insurance_policies:', {
          code: insuranceError.code,
          message: insuranceError.message,
          details: insuranceError.details,
          hint: insuranceError.hint,
        })
        setInsurances([])
        return
      }

      console.log('✓ Loaded insurance policies:', insuranceData?.length || 0)
      setInsurances(insuranceData as InsurancePolicy[])
    } catch (error) {
      console.error('❌ Exception loading insurances:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      })
      setInsurances([])
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
      <div className="flex flex-col h-screen bg-[#0A1A2F]">
        {/* Compact Header - One Line */}
        <div className="bg-[#0A1A2F] border-b border-gray-700 px-4 md:px-8 py-3 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Back Link + Vehicle Info */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/dashboard"
                className="flex-shrink-0 text-gray-400 hover:text-[#E5C97B] transition-colors"
                title="Zurück"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-lg font-bold text-[#E6E6E6] truncate">
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
                <span className="text-sm font-semibold text-[#E5C97B] hidden sm:inline">
                  € {vehicle.purchase_price.toLocaleString('de-DE')}
                </span>
              )}
              {isOwner && (
                <Link href={`/vehicles/${vehicle.id}/edit`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#E5C97B] hover:bg-[#E5C97B]/10"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation - Horizontal Tabs - Responsive */}
        <div className="bg-[#0A1A2F] border-b border-gray-700 overflow-x-auto flex-shrink-0 scrollbar-hide">
          <div className="flex gap-1 md:gap-6 px-4 md:px-8 min-w-min scroll-smooth">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 md:px-0 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'text-[#E5C97B] border-b-2 border-[#E5C97B]'
                  : 'text-gray-400 hover:text-[#E6E6E6]'
              }`}
            >
              <Info className={`h-4 w-4 ${activeTab === 'overview' ? 'text-[#E5C97B]' : 'text-[#E6E6E6]'}`} />
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-2 md:px-0 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'schedule'
                  ? 'text-[#E5C97B] border-b-2 border-[#E5C97B]'
                  : 'text-gray-400 hover:text-[#E6E6E6]'
              }`}
            >
              <Wrench className={`h-4 w-4 ${activeTab === 'schedule' ? 'text-[#E5C97B]' : 'text-[#E6E6E6]'}`} />
              Termine
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-2 md:px-0 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'documents'
                  ? 'text-[#E5C97B] border-b-2 border-[#E5C97B]'
                  : 'text-gray-400 hover:text-[#E6E6E6]'
              }`}
            >
              <FileText className={`h-4 w-4 ${activeTab === 'documents' ? 'text-[#E5C97B]' : 'text-[#E6E6E6]'}`} />
              Dokumente
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`py-4 px-2 md:px-0 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'photos'
                  ? 'text-[#E5C97B] border-b-2 border-[#E5C97B]'
                  : 'text-gray-400 hover:text-[#E6E6E6]'
              }`}
            >
              <ImageIcon className={`h-4 w-4 ${activeTab === 'photos' ? 'text-[#E5C97B]' : 'text-[#E6E6E6]'}`} />
              Fotos
            </button>
            <button
              onClick={() => setActiveTab('tires')}
              className={`py-4 px-2 md:px-0 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'tires'
                  ? 'text-[#E5C97B] border-b-2 border-[#E5C97B]'
                  : 'text-gray-400 hover:text-[#E6E6E6]'
              }`}
            >
              <Circle className={`h-4 w-4 ${activeTab === 'tires' ? 'text-[#E5C97B]' : 'text-[#E6E6E6]'}`} />
              Reifen
            </button>
            <button
              onClick={() => setActiveTab('drives')}
              className={`py-4 px-2 md:px-0 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'drives'
                  ? 'text-[#E5C97B] border-b-2 border-[#E5C97B]'
                  : 'text-gray-400 hover:text-[#E6E6E6]'
              }`}
            >
              <Car className={`h-4 w-4 ${activeTab === 'drives' ? 'text-[#E5C97B]' : 'text-[#E6E6E6]'}`} />
              Fahrten
            </button>
          </div>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailCard label="Marke" value={vehicle.make} />
                <DetailCard label="Modell" value={vehicle.model} />
                <DetailCard label="Baujahr" value={vehicle.year ? vehicle.year.toString() : '-'} />
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
                <div className="bg-[#2A2D30] rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-[#E6E6E6] mb-3">Notizen</h3>
                  <p className="text-gray-400 whitespace-pre-wrap">{vehicle.notes}</p>
                </div>
              )}

              {/* Insurances Section */}
              <div className="bg-[#2A2D30] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-[#E5C97B]" />
                  <h3 className="text-lg font-semibold text-[#E6E6E6]">Versicherungen</h3>
                </div>
                {loadingInsurances ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#E5C97B]" />
                  </div>
                ) : insurances.length === 0 ? (
                  <p className="text-gray-400">Keine Versicherungen verlinkt</p>
                ) : (
                  <div className="space-y-3">
                    {insurances.map(insurance => (
                      <div key={insurance.id} className="flex items-center justify-between p-3 bg-[#0A1A2F] rounded-lg border border-gray-700">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#E6E6E6] truncate">{insurance.name}</p>
                          {insurance.valid_until && (
                            <p className="text-xs text-gray-500">
                              Gültig bis: {new Date(insurance.valid_until).toLocaleDateString('de-DE')}
                            </p>
                          )}
                        </div>
                        <a href={insurance.file_url} download target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="text-[#E5C97B] hover:bg-[#E5C97B]/10 ml-2">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete Button Section */}
              {isOwner && (
                <div className="pt-6 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#9B9B9B] hover:text-[#E6E6E6] hover:bg-[#9B9B9B]/10"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Fahrzeug löschen
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Schedule Tab - Full Width */}
          {activeTab === 'schedule' && (
            <div className="max-w-7xl mx-auto">
              <ScheduleTab vehicleId={vehicle.id} />
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

          {/* Tires Tab */}
          {activeTab === 'tires' && (
            <div className="max-w-7xl mx-auto">
              <TiresTab vehicleId={vehicle.id} />
            </div>
          )}

          {/* Drives Tab */}
          {activeTab === 'drives' && (
            <div className="max-w-7xl mx-auto">
              <DrivesTab vehicleId={vehicle.id} />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#2A2D30] border-gray-700">
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
    <div className="bg-[#2A2D30] rounded-lg p-6 border border-[#1A1A2E] shadow-lg hover:shadow-xl transition-shadow duration-200">
      <p className="text-xs uppercase tracking-wide text-[#9B9B9B] mb-2">{label}</p>
      <p className="text-base font-semibold text-[#E6E6E6] break-words">{value}</p>
    </div>
  )
}
