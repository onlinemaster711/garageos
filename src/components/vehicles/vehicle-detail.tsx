'use client'

import { useState } from 'react'
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
  Bell,
  TrendingUp,
  CircleDot,
  Shield,
  Gauge,
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
import { RemindersTab } from './reminders-tab'
import { TiresTab } from './tires-tab'
import { MarktwertTab } from './marktwert-tab'
import { InsuranceTab } from './insurance-tab'
import { MileageTab } from './mileage-tab'
import { DossierButton } from './dossier-button'

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
  mileage: number | null
  country: string | null
  location: string | null
  notes: string | null
  cover_photo_url: string | null
  created_at: string
  updated_at: string
}

type TabType = 'overview' | 'maintenance' | 'documents' | 'photos' | 'reminders' | 'tires' | 'marktwert' | 'insurance' | 'mileage'

export function VehicleDetail({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const categoryLabel = {
    sedan: 'Limousine',
    suv: 'SUV',
    coupe: 'Coupé',
    convertible: 'Cabrio',
    wagon: 'Kombi',
    hatchback: 'Schrägheck',
    pickup: 'Pickup',
    van: 'Van',
    sports: 'Sportwagen',
    other: 'Sonstiges',
  }[vehicle.category] || vehicle.category

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#C9A84C] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Garage
        </Link>

        {/* Cover Photo or Placeholder */}
        <div className="relative h-72 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg mb-6 overflow-hidden flex items-center justify-center border border-gray-700">
          {vehicle.cover_photo_url ? (
            <img
              src={vehicle.cover_photo_url}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <ImageIcon className="h-16 w-16 mb-2 opacity-50" />
              <p className="text-sm">Keine Abdeckung hochgeladen</p>
            </div>
          )}
        </div>

        {/* Vehicle Header Info */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-[#F0F0F0]">
              {vehicle.make} {vehicle.model}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-lg text-gray-400">{vehicle.year}</span>
              <span className="px-3 py-1 bg-[#C9A84C] bg-opacity-20 text-[#C9A84C] rounded-full text-sm font-medium">
                {categoryLabel}
              </span>
              {vehicle.plate && (
                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm font-mono">
                  {vehicle.plate}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <DossierButton
              vehicleId={vehicle.id}
              vehicleName={`${vehicle.make} ${vehicle.model}`}
            />
            <Link href={`/vehicles/${vehicle.id}/edit`}>
              <Button
                variant="outline"
                className="border-gray-600 text-[#F0F0F0] hover:bg-[#C9A84C] hover:text-[#0A0A0A] hover:border-[#C9A84C]"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-700">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                : 'text-gray-400 hover:text-[#F0F0F0]'
            }`}
          >
            <Info className="h-4 w-4 inline-block mr-2" />
            Übersicht
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`pb-4 px-1 font-medium text-sm transition-colors ${
              activeTab === 'maintenance'
                ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                : 'text-gray-400 hover:text-[#F0F0F0]'
            }`}
          >
            <Wrench className="h-4 w-4 inline-block mr-2" />
            Wartung
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-4 px-1 font-medium text-sm transition-colors ${
              activeTab === 'documents'
                ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                : 'text-gray-400 hover:text-[#F0F0F0]'
            }`}
          >
            <FileText className="h-4 w-4 inline-block mr-2" />
            Dokumente
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-4 px-1 font-medium text-sm transition-colors ${
              activeTab === 'photos'
                ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                : 'text-gray-400 hover:text-[#F0F0F0]'
            }`}
          >
            <ImageIcon className="h-4 w-4 inline-block mr-2" />
            Fotos
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`pb-4 px-1 font-medium text-sm transition-colors ${
              activeTab === 'reminders'
                ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                : 'text-gray-400 hover:text-[#F0F0F0]'
            }`}
          >
            <Bell className="h-4 w-4 inline-block mr-2" />
            Erinnerungen
          </button>
          <button
            onClick={() => setActiveTab('tires')}
            className={`pb-4 px-1 font-medium text-sm transition-colors ${
              activeTab === 'tires'
                ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                : 'text-gray-400 hover:text-[#F0F0F0]'
            }`}
          >
            <CircleDot className="h-4 w-4 inline-block mr-2" />
            Reifen
          </button>
          <button
            onClick={() => setActiveTab('marktwert')}
            className={`pb-4 px-1 font-medium text-sm transition-colors ${
              activeTab === 'marktwert'
                ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                : 'text-gray-400 hover:text-[#F0F0F0]'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline-block mr-2" />
            Marktwert
          </button>
          <button
            onClick={() => setActiveTab('insurance')}
            className={`pb-4 px-1 font-medium text-sm transition-colors ${
              activeTab === 'insurance'
                ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                : 'text-gray-400 hover:text-[#F0F0F0]'
            }`}
          >
            <Shield className="h-4 w-4 inline-block mr-2" />
            Versicherung
          </button>
          <button
            onClick={() => setActiveTab('mileage')}
            className={`pb-4 px-1 font-medium text-sm transition-colors ${
              activeTab === 'mileage'
                ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                : 'text-gray-400 hover:text-[#F0F0F0]'
            }`}
          >
            <Gauge className="h-4 w-4 inline-block mr-2" />
            Kilometer
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Make */}
            <DetailCard label="Marke" value={vehicle.make} />

            {/* Model */}
            <DetailCard label="Modell" value={vehicle.model} />

            {/* Year */}
            <DetailCard label="Baujahr" value={vehicle.year.toString()} />

            {/* Color */}
            <DetailCard label="Farbe" value={vehicle.color} />

            {/* VIN */}
            <DetailCard label="Fahrgestellnummer (VIN)" value={vehicle.vin} />

            {/* Plate */}
            <DetailCard label="Kennzeichen" value={vehicle.plate} />

            {/* Category */}
            <DetailCard label="Kategorie" value={categoryLabel} />

            {/* Country */}
            <DetailCard
              label="Land"
              value={vehicle.country || '-'}
            />

            {/* Purchase Date */}
            <DetailCard
              label="Kaufdatum"
              value={
                vehicle.purchase_date
                  ? new Date(vehicle.purchase_date).toLocaleDateString('de-DE')
                  : '-'
              }
            />

            {/* Purchase Price */}
            <DetailCard
              label="Kaufpreis"
              value={
                vehicle.purchase_price
                  ? `€ ${vehicle.purchase_price.toLocaleString('de-DE')}`
                  : '-'
              }
            />

            {/* Mileage */}
            <DetailCard
              label="Kilometerstand"
              value={
                vehicle.mileage !== null && vehicle.mileage !== undefined
                  ? `${vehicle.mileage.toLocaleString('de-DE')} km`
                  : '-'
              }
            />

            {/* Location */}
            <DetailCard
              label="Standort"
              value={vehicle.location || '-'}
            />
          </div>

          {/* Notes */}
          {vehicle.notes && (
            <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-[#F0F0F0] mb-3">
                Notizen
              </h3>
              <p className="text-gray-400 whitespace-pre-wrap">{vehicle.notes}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <MaintenanceTab vehicleId={vehicle.id} />
      )}

      {activeTab === 'documents' && (
        <DocumentsTab vehicleId={vehicle.id} />
      )}

      {activeTab === 'photos' && <PhotosTab vehicleId={vehicle.id} />}

      {activeTab === 'reminders' && (
        <RemindersTab
          vehicleId={vehicle.id}
          countryCode={vehicle.country || 'DE'}
          category={vehicle.category || 'modern'}
        />
      )}

      {activeTab === 'tires' && (
        <TiresTab vehicleId={vehicle.id} />
      )}

      {activeTab === 'marktwert' && (
        <MarktwertTab vehicleId={vehicle.id} purchasePrice={vehicle.purchase_price} />
      )}

      {activeTab === 'insurance' && (
        <InsuranceTab vehicleId={vehicle.id} purchasePrice={vehicle.purchase_price} />
      )}

      {activeTab === 'mileage' && (
        <MileageTab vehicleId={vehicle.id} />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Fahrzeug löschen
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Sind Sie sicher, dass Sie {vehicle.make} {vehicle.model} löschen
              möchten? Diese Aktion kann nicht rückgängig gemacht werden.
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
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
        {label}
      </p>
      <p className="text-lg font-semibold text-[#F0F0F0] break-words">
        {value}
      </p>
    </div>
  )
}
