'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Vehicle } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { Camera, Plus, X, Star, Loader2, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CAR_MAKES = [
  'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW',
  'Bugatti', 'Cadillac', 'Chevrolet', 'Citroën', 'Daimler',
  'De Tomaso', 'Ferrari', 'Fiat', 'Ford', 'Honda',
  'Jaguar', 'Lamborghini', 'Lancia', 'Land Rover', 'Lexus',
  'Lotus', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz',
  'MG', 'Mini', 'Nissan', 'Opel', 'Pagani',
  'Peugeot', 'Porsche', 'Renault', 'Rolls-Royce', 'Saab',
  'Shelby', 'Subaru', 'Tesla', 'Toyota', 'Triumph',
  'Volkswagen', 'Volvo',
]

interface VehicleFormProps {
  vehicle?: Vehicle
  onSuccess?: () => void
}

interface PhotoItem {
  id: string
  file_url: string
  file_name: string
  is_cover: boolean
  isNew?: boolean
  file?: File
}

export function VehicleForm({ vehicle, onSuccess }: VehicleFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [photosLoaded, setPhotosLoaded] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  

  

  // Load existing photos for edit mode
  if (vehicle?.id && !photosLoaded) {
    setPhotosLoaded(true)
    supabase
      .from('vehicle_photos')
      .select('id, file_url, file_name, is_cover')
      .eq('vehicle_id', vehicle.id)
      .order('is_cover', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPhotos(data)
      })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploadingPhoto(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Nicht authentifiziert')

      const vehicleId = vehicle?.id
      if (!vehicleId) {
        toast({
          title: 'Hinweis',
          description: 'Bitte speichern Sie das Fahrzeug zuerst, bevor Sie Fotos hochladen.',
          variant: 'destructive',
        })
        setIsUploadingPhoto(false)
        return
      }

      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}_${file.name}`
        const filePath = `${userData.user.id}/${vehicleId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('vehicle-photos')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: publicData } = supabase.storage
          .from('vehicle-photos')
          .getPublicUrl(filePath)

        const isCover = photos.length === 0
        const { data: newPhoto, error: insertError } = await supabase
          .from('vehicle_photos')
          .insert([{
            vehicle_id: vehicleId,
            user_id: userData.user.id,
            file_name: file.name,
            file_url: publicData.publicUrl,
            is_cover: isCover,
          }])
          .select()
          .single()

        if (insertError) throw insertError

        if (isCover) {
          await supabase
            .from('vehicles')
            .update({ cover_photo_url: publicData.publicUrl })
            .eq('id', vehicleId)
        }

        setPhotos(prev => [...prev, newPhoto])
      }

      toast({ title: 'Erfolg', description: 'Foto(s) hochgeladen' })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Upload fehlgeschlagen',
        variant: 'destructive',
      })
    } finally {
      setIsUploadingPhoto(false)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    const photo = photos.find(p => p.id === photoId)
    if (!photo) return

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user && vehicle?.id) {
        const filePath = `${userData.user.id}/${vehicle.id}/${photo.file_name}`
        await supabase.storage.from('vehicle-photos').remove([filePath])
      }

      await supabase.from('vehicle_photos').delete().eq('id', photoId)

      const remaining = photos.filter(p => p.id !== photoId)
      setPhotos(remaining)

      if (photo.is_cover && remaining.length > 0) {
        await supabase.from('vehicle_photos').update({ is_cover: true }).eq('id', remaining[0].id)
        const { data: coverData } = await supabase.from('vehicle_photos').select('file_url').eq('id', remaining[0].id).single()
        if (coverData && vehicle?.id) {
          await supabase.from('vehicles').update({ cover_photo_url: coverData.file_url }).eq('id', vehicle.id)
        }
        setPhotos(prev => prev.map(p => ({ ...p, is_cover: p.id === remaining[0].id })))
      } else if (remaining.length === 0 && vehicle?.id) {
        await supabase.from('vehicles').update({ cover_photo_url: null }).eq('id', vehicle.id)
      }

      toast({ title: 'Erfolg', description: 'Foto gelöscht' })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Foto konnte nicht gelöscht werden',
        variant: 'destructive',
      })
    }
  }

  const handleSetCover = async (photoId: string) => {
    if (!vehicle?.id) return
    try {
      await supabase.from('vehicle_photos').update({ is_cover: false }).eq('vehicle_id', vehicle.id)
      await supabase.from('vehicle_photos').update({ is_cover: true }).eq('id', photoId)
      const photo = photos.find(p => p.id === photoId)
      if (photo) {
        await supabase.from('vehicles').update({ cover_photo_url: photo.file_url }).eq('id', vehicle.id)
      }
      setPhotos(prev => prev.map(p => ({ ...p, is_cover: p.id === photoId })))
      toast({ title: 'Erfolg', description: 'Titelbild gesetzt' })
    } catch {
      toast({ title: 'Fehler', description: 'Titelbild konnte nicht gesetzt werden', variant: 'destructive' })
    }
  }

  const [formData, setFormData] = useState({
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year?.toString() || '',
    color: vehicle?.color || '',
    vin: vehicle?.vin || '',
    plate: vehicle?.plate || '',
    category: vehicle?.category || 'modern',
    country_code: vehicle?.country_code || 'DE',
    purchase_date: vehicle?.purchase_date || '',
    purchase_price: vehicle?.purchase_price?.toString() || '',
    current_mileage: vehicle?.current_mileage?.toString() || '',
    location_name: (vehicle?.location_name) || '',
    storage_address: (vehicle?.storage_address) || '',
    notes: vehicle?.notes || '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.make.trim() || !formData.model.trim()) {
      toast({
        title: 'Fehler',
        description: 'Marke und Modell sind erforderlich.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: 'Fehler',
          description: 'Sie sind nicht angemeldet.',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      const vehicleData = {
        user_id: user.id,
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: formData.year ? parseInt(formData.year) : null,
        color: formData.color.trim() || null,
        vin: formData.vin.trim() || null,
        plate: formData.plate.trim() || null,
        category: formData.category,
        country_code: formData.country_code,
        purchase_date: formData.purchase_date || null,
        purchase_price: formData.purchase_price
          ? parseFloat(formData.purchase_price)
          : null,
        current_mileage: formData.current_mileage
          ? parseInt(formData.current_mileage)
          : null,
        location_name: formData.location_name.trim() || null,
        storage_address: formData.storage_address.trim() || null,
        notes: formData.notes.trim() || null,
      }

      if (vehicle?.id) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', vehicle.id)

        if (error) {
          toast({
            title: 'Fehler',
            description: 'Fahrzeug konnte nicht aktualisiert werden.',
            variant: 'destructive',
          })
          setLoading(false)
          return
        }

        toast({
          title: 'Erfolg',
          description: 'Fahrzeug wurde aktualisiert.',
        })

        if (onSuccess) {
          onSuccess()
        } else {
          router.push(`/vehicles/${vehicle.id}`)
        }
      } else {
        // Create new vehicle
        const { data, error } = await supabase
          .from('vehicles')
          .insert([vehicleData])
          .select()

        if (error || !data || data.length === 0) {
          toast({
            title: 'Fehler',
            description: 'Fahrzeug konnte nicht erstellt werden.',
            variant: 'destructive',
          })
          setLoading(false)
          return
        }

        toast({
          title: 'Erfolg',
          description: 'Fahrzeug wurde erstellt.',
        })

        if (onSuccess) {
          onSuccess()
        } else {
          router.push(`/vehicles/${data[0].id}`)
        }
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast({
        title: 'Fehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten.',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Marke */}
        <div className="space-y-2">
          <Label htmlFor="make" className="text-[#F0F0F0]">
            Marke *
          </Label>
          <Select value={formData.make} onValueChange={(value) => handleSelectChange('make', value)}>
            <SelectTrigger id="make">
              <SelectValue placeholder="Marke wählen" />
            </SelectTrigger>
            <SelectContent>
              {CAR_MAKES.map((make) => (
                <SelectItem key={make} value={make}>{make}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Modell */}
        <div className="space-y-2">
          <Label htmlFor="model" className="text-[#F0F0F0]">
            Modell *
          </Label>
          <Input
            id="model"
            name="model"
            type="text"
            value={formData.model}
            onChange={handleInputChange}
            placeholder="z. B. 300 SL"
            required
          />
        </div>

        {/* Baujahr */}
        <div className="space-y-2">
          <Label htmlFor="year" className="text-[#F0F0F0]">
            Baujahr
          </Label>
          <Input
            id="year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleInputChange}
            placeholder="z. B. 1954"
            min="1900"
            max={new Date().getFullYear() + 1}
          />
        </div>

        {/* Farbe */}
        <div className="space-y-2">
          <Label htmlFor="color" className="text-[#F0F0F0]">
            Farbe
          </Label>
          <Input
            id="color"
            name="color"
            type="text"
            value={formData.color}
            onChange={handleInputChange}
            placeholder="z. B. Silber metallic"
          />
        </div>

        {/* Fahrgestellnummer */}
        <div className="space-y-2">
          <Label htmlFor="vin" className="text-[#F0F0F0]">
            Fahrgestellnummer (VIN)
          </Label>
          <Input
            id="vin"
            name="vin"
            type="text"
            value={formData.vin}
            onChange={handleInputChange}
            placeholder="z. B. WVWZZZ3CZ9E123456"
          />
        </div>

        {/* Kennzeichen */}
        <div className="space-y-2">
          <Label htmlFor="plate" className="text-[#F0F0F0]">
            Kennzeichen
          </Label>
          <Input
            id="plate"
            name="plate"
            type="text"
            value={formData.plate}
            onChange={handleInputChange}
            placeholder="z. B. M-AA 1234"
          />
        </div>

        {/* Kategorie */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-[#F0F0F0]">
            Kategorie
          </Label>
          <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oldtimer">Oldtimer</SelectItem>
              <SelectItem value="youngtimer">Youngtimer</SelectItem>
              <SelectItem value="modern">Modern</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Land */}
        <div className="space-y-2">
          <Label htmlFor="country_code" className="text-[#F0F0F0]">
            Land
          </Label>
          <Select value={formData.country_code} onValueChange={(value) => handleSelectChange('country_code', value)}>
            <SelectTrigger id="country_code">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DE">Deutschland</SelectItem>
              <SelectItem value="AT">Österreich</SelectItem>
              <SelectItem value="CH">Schweiz</SelectItem>
              <SelectItem value="BE">Belgien</SelectItem>
              <SelectItem value="DK">Dänemark</SelectItem>
              <SelectItem value="ES">Spanien</SelectItem>
              <SelectItem value="FR">Frankreich</SelectItem>
              <SelectItem value="GB">Großbritannien</SelectItem>
              <SelectItem value="GR">Griechenland</SelectItem>
              <SelectItem value="HR">Kroatien</SelectItem>
              <SelectItem value="IT">Italien</SelectItem>
              <SelectItem value="LU">Luxemburg</SelectItem>
              <SelectItem value="MC">Monaco</SelectItem>
              <SelectItem value="NL">Niederlande</SelectItem>
              <SelectItem value="NO">Norwegen</SelectItem>
              <SelectItem value="PL">Polen</SelectItem>
              <SelectItem value="PT">Portugal</SelectItem>
              <SelectItem value="SE">Schweden</SelectItem>
              <SelectItem value="US">USA</SelectItem>
              <SelectItem value="AE">VAE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Kaufdatum */}
        <div className="space-y-2">
          <Label htmlFor="purchase_date" className="text-[#F0F0F0]">
            Kaufdatum
          </Label>
          <Input
            id="purchase_date"
            name="purchase_date"
            type="date"
            value={formData.purchase_date}
            onChange={handleInputChange}
          />
        </div>

        {/* Kaufpreis */}
        <div className="space-y-2">
          <Label htmlFor="purchase_price" className="text-[#F0F0F0]">
            Kaufpreis (€)
          </Label>
          <Input
            id="purchase_price"
            name="purchase_price"
            type="number"
            value={formData.purchase_price}
            onChange={handleInputChange}
            placeholder="z. B. 45000"
            min="0"
            step="100"
          />
        </div>

        {/* Aktueller Kilometerstand */}
        <div className="space-y-2">
          <Label htmlFor="current_mileage" className="text-[#F0F0F0]">
            Aktueller Kilometerstand
          </Label>
          <Input
            id="current_mileage"
            name="current_mileage"
            type="number"
            value={formData.current_mileage}
            onChange={handleInputChange}
            placeholder="z. B. 125000"
            min="0"
          />
        </div>
        {/* Standort */}
        <div className="space-y-2">
          <Label htmlFor="location_name" className="text-[#F0F0F0]">
            Standort
          </Label>
          <Input
            id="location_name"
            name="location_name"
            type="text"
            value={formData.location_name}
            onChange={handleInputChange}
            placeholder="z. B. Garage München, Scheune Starnberg"
          />
        </div>

        {/* Stellplatz-Adresse */}
        <div className="space-y-2">
          <Label htmlFor="storage_address" className="text-[#F0F0F0]">
            Stellplatz / Adresse
          </Label>
          <Input
            id="storage_address"
            name="storage_address"
            type="text"
            value={formData.storage_address}
            onChange={handleInputChange}
            placeholder="z. B. Garagenhof Musterstr. 12, 80331 München"
          />
        </div>
      </div>

      {/* Notizen */}
      <div className="space-y-2 mb-8">
        <Label htmlFor="notes" className="text-[#F0F0F0]">
          Notizen
        </Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Weitere Informationen über dein Fahrzeug..."
          className="min-h-28"
        />
      </div>

      {/* Fotos */}
      {vehicle?.id && (
        <div className="space-y-4 mb-8">
          <Label className="text-[#F0F0F0] text-lg font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#C9A84C]" />
            Fahrzeugfotos
          </Label>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`relative group rounded-lg overflow-hidden aspect-square border-2 ${
                  photo.is_cover ? 'border-[#C9A84C]' : 'border-gray-700'
                } bg-gray-900`}
              >
                <img
                  src={photo.file_url}
                  alt={photo.file_name}
                  className="w-full h-full object-cover"
                />
                {photo.is_cover && (
                  <div className="absolute top-1.5 left-1.5 bg-[#C9A84C] text-[#0A0A0A] text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Cover
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                  {!photo.is_cover && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(photo.id)}
                      className="bg-[#C9A84C] text-[#0A0A0A] rounded-md p-1.5 hover:bg-[#B89A3C] transition-colors"
                      title="Als Titelbild setzen"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="bg-red-600 text-white rounded-md p-1.5 hover:bg-red-700 transition-colors"
                    title="Löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Upload-Kachel */}
            <label className="relative rounded-lg border-2 border-dashed border-gray-600 hover:border-[#C9A84C] aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#1E1E1E] hover:bg-[#252525]">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="hidden"
              />
              {isUploadingPhoto ? (
                <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
              ) : (
                <>
                  <Plus className="h-8 w-8 text-gray-500 mb-1" />
                  <span className="text-xs text-gray-500">Foto hinzufügen</span>
                </>
              )}
            </label>
          </div>

          {photos.length === 0 && (
            <p className="text-sm text-gray-500">
              Noch keine Fotos — laden Sie Bilder Ihres Fahrzeugs hoch
            </p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto bg-[#C9A84C] hover:bg-[#B8961F] text-[#0A0A0A] font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Wird gespeichert...' : 'Fahrzeug speichern'}
      </button>
    </form>
  )
}
