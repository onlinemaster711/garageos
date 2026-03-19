'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Vehicle } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
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

export function VehicleForm({ vehicle, onSuccess }: VehicleFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
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
              <SelectItem value="ES">Spanien</SelectItem>
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
