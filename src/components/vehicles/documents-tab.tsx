'use client'

import { useEffect, useState } from 'react'
import { Upload, Download, Trash2, FileText, Loader2, Shield, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Vehicle } from '@/lib/types'

interface Document {
  id: string
  vehicle_id: string
  user_id: string
  category: string
  name: string
  file_url: string
  file_type: string
  uploaded_at: string
  created_at: string
}

const CATEGORIES = [
  { value: 'kaufvertrag', label: 'Kaufvertrag', color: 'bg-blue-900/30 text-blue-400' },
  { value: 'zulassung', label: 'Zulassung', color: 'bg-purple-900/30 text-purple-400' },
  { value: 'tuev', label: 'TÜV-Papiere', color: 'bg-green-900/30 text-green-400' },
  { value: 'versicherung', label: 'Versicherung', color: 'bg-yellow-900/30 text-yellow-400' },
  { value: 'wartung', label: 'Wartung/Rechnung', color: 'bg-orange-900/30 text-orange-400' },
  { value: 'sonstiges', label: 'Sonstiges', color: 'bg-gray-900/30 text-gray-400' },
]

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'image/gif']
const MAX_FILE_SIZE = 20 * 1024 * 1024

export function DocumentsTab({ vehicleId }: { vehicleId: string }) {
  const supabase = createClient()
  const { toast } = useToast()

  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Insurance Modal States
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false)
  const [insuranceDocumentName, setInsuranceDocumentName] = useState('')
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set())
  const [savingInsurance, setSavingInsurance] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)

  const [formData, setFormData] = useState({
    category: 'kaufvertrag',
    name: '',
    file: null as File | null,
  })

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vehicle_documents')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Dokumente konnten nicht geladen werden',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const validateFile = (file: File): string | null => {
    if (!file) return 'Bitte wählen Sie eine Datei aus'
    if (file.size > MAX_FILE_SIZE) return 'Datei darf maximal 20MB groß sein'
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Erlaubte Dateitypen: PDF, DOCX, XLSX, JPG, PNG, GIF'
    }
    return null
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.file) {
      toast({ title: 'Fehler', description: 'Bitte wählen Sie eine Datei aus', variant: 'destructive' })
      return
    }

    if (!formData.name.trim()) {
      toast({ title: 'Fehler', description: 'Bitte geben Sie einen Dokumentennamen ein', variant: 'destructive' })
      return
    }

    const validation = validateFile(formData.file)
    if (validation) {
      toast({ title: 'Fehler', description: validation, variant: 'destructive' })
      return
    }

    if (documents.length >= 20) {
      toast({ title: 'Fehler', description: 'Maximum 20 Dokumente pro Fahrzeug', variant: 'destructive' })
      return
    }

    setUploading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Nicht authentifiziert')

      const timestamp = Date.now()
      const fileExtension = formData.file.name.split('.').pop()
      const fileName = `${timestamp}_${formData.name.replace(/[^a-z0-9]/gi, '_')}.${fileExtension}`
      const filePath = `${userData.user.id}/${vehicleId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('vehicle-documents')
        .upload(filePath, formData.file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('vehicle-documents')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase
        .from('vehicle_documents')
        .insert([
          {
            vehicle_id: vehicleId,
            user_id: userData.user.id,
            category: formData.category,
            name: formData.name,
            file_url: urlData.publicUrl,
            file_type: formData.file.type,
            uploaded_at: new Date().toISOString(),
          },
        ])

      if (dbError) throw dbError

      toast({ title: 'Erfolg', description: 'Dokument hochgeladen' })

      // Open insurance modal if this was an insurance document
      if (formData.category === 'versicherung') {
        setInsuranceDocumentName(formData.name)
        await loadAllVehicles()
        setIsInsuranceModalOpen(true)
      }

      setFormData({ category: 'kaufvertrag', name: '', file: null })

      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      await loadDocuments()
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Dokument konnte nicht hochgeladen werden',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    setDeleting(documentId)
    try {
      const doc = documents.find(d => d.id === documentId)
      if (!doc) return

      const filePath = doc.file_url.split('/').pop()
      if (filePath) {
        await supabase.storage
          .from('vehicle-documents')
          .remove([`${doc.user_id}/${vehicleId}/${filePath}`])
      }

      const { error } = await supabase
        .from('vehicle_documents')
        .delete()
        .eq('id', documentId)
        .eq('vehicle_id', vehicleId)

      if (error) throw error

      toast({ title: 'Erfolg', description: 'Dokument gelöscht' })
      setDocuments(documents.filter(d => d.id !== documentId))
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Dokument konnte nicht gelöscht werden',
        variant: 'destructive',
      })
    } finally {
      setDeleting(null)
    }
  }

  const getCategoryLabel = (value: string) => CATEGORIES.find(c => c.value === value)?.label || value
  const getCategoryColor = (value: string) => CATEGORIES.find(c => c.value === value)?.color || 'bg-gray-900/30 text-gray-400'

  const loadAllVehicles = async () => {
    try {
      setLoadingVehicles(true)
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Nicht authentifiziert')

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('make')

      if (error) throw error
      setAllVehicles(data || [])
      setSelectedVehicles(new Set([vehicleId])) // Pre-select current vehicle
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Fahrzeuge konnten nicht geladen werden',
        variant: 'destructive',
      })
    } finally {
      setLoadingVehicles(false)
    }
  }

  const handleToggleVehicle = (id: string) => {
    const newSelected = new Set(selectedVehicles)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedVehicles(newSelected)
  }

  const handleSaveInsurance = async () => {
    if (selectedVehicles.size === 0) {
      toast({ title: 'Fehler', description: 'Bitte mindestens ein Auto wählen', variant: 'destructive' })
      return
    }

    setSavingInsurance(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Nicht authentifiziert')

      // Get the insurance document we just uploaded
      const insuranceDoc = documents.find(d => d.name === insuranceDocumentName && d.category === 'versicherung')
      if (!insuranceDoc) throw new Error('Versicherungsdokument nicht gefunden')

      // Create insurance policy
      const { data: policyData, error: policyError } = await supabase
        .from('insurance_policies')
        .insert([{
          user_id: userData.user.id,
          name: insuranceDocumentName,
          file_url: insuranceDoc.file_url,
        }])
        .select()
        .single()

      if (policyError) throw policyError

      // Link policy to selected vehicles
      const policyVehicles = Array.from(selectedVehicles).map(vehicleId => ({
        policy_id: policyData.id,
        vehicle_id: vehicleId,
      }))

      const { error: linkError } = await supabase
        .from('policy_vehicles')
        .insert(policyVehicles)

      if (linkError) throw linkError

      const count = selectedVehicles.size
      toast({
        title: 'Erfolg',
        description: `Versicherung für ${count} ${count === 1 ? 'Auto' : 'Autos'} verlinkt`,
      })

      setIsInsuranceModalOpen(false)
      setSelectedVehicles(new Set())
      setInsuranceDocumentName('')
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Versicherung konnte nicht verlinkt werden',
        variant: 'destructive',
      })
    } finally {
      setSavingInsurance(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-[#F0F0F0] mb-4">Dokument hochladen</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Label className="text-gray-300 mb-2 block">Kategorie</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Dokumenten-Name</Label>
            <Input
              placeholder="z.B. Kaufvertrag_2024"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]"
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Datei (Max. 20MB)</Label>
            <div className="relative">
              <input
                id="file-input"
                type="file"
                onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#C9A84C] file:text-[#0A0A0A] hover:file:bg-[#B89A3C]"
                accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,.gif"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">PDF, DOCX, XLSX, JPG, PNG, GIF</p>
          </div>

          <Button
            type="submit"
            disabled={uploading || documents.length >= 20}
            className="w-full bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#B89A3C] disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird hochgeladen...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Hochladen ({documents.length}/20)
              </>
            )}
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-[#1E1E1E] rounded-lg p-12 border border-gray-700 text-center">
          <FileText className="h-12 w-12 text-gray-500 mx-auto mb-3 opacity-50" />
          <p className="text-gray-400">Keine Dokumente hochgeladen</p>
          <p className="text-gray-500 text-sm mt-1">Kategorien: Kaufvertrag, Zulassung, TÜV-Papiere, Versicherung, Wartung/Rechnung, Sonstiges</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => (
            <div key={doc.id} className="bg-[#1E1E1E] rounded-lg p-5 border border-gray-700 flex items-center justify-between hover:border-[#C9A84C] transition-colors">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-[#C9A84C] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-sm font-semibold text-[#F0F0F0] truncate">{doc.name}</h4>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(doc.category)}`}>
                      {getCategoryLabel(doc.category)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(doc.uploaded_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <a href={doc.file_url} download target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="text-[#C9A84C] hover:bg-[#C9A84C]/10">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting === doc.id}
                >
                  {deleting === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insurance Modal */}
      <Dialog open={isInsuranceModalOpen} onOpenChange={setIsInsuranceModalOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#F0F0F0]">
              <Shield className="h-5 w-5 text-[#C9A84C]" />
              Versicherung für Autos
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Wählen Sie die Fahrzeuge aus, die von dieser Versicherung gedeckt sind.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto py-4">
            {loadingVehicles ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#C9A84C]" />
              </div>
            ) : allVehicles.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Keine Fahrzeuge vorhanden</p>
            ) : (
              allVehicles.map(vehicle => (
                <label
                  key={vehicle.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-gray-700 hover:border-[#C9A84C] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedVehicles.has(vehicle.id)}
                    onChange={() => handleToggleVehicle(vehicle.id)}
                    className="w-4 h-4 rounded bg-[#0A0A0A] border-gray-600 accent-[#C9A84C] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F0F0F0] truncate">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-xs text-gray-500">{vehicle.year}</p>
                  </div>
                </label>
              ))
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsInsuranceModalOpen(false)}
              className="border-gray-600"
            >
              <X className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
            <Button
              onClick={handleSaveInsurance}
              disabled={savingInsurance || selectedVehicles.size === 0}
              className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#B89A3C] disabled:opacity-50"
            >
              {savingInsurance ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Speichern
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
