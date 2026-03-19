'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  Plus,
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
  Upload,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Document {
  id: string
  vehicle_id: string
  user_id: string
  file_name: string
  file_type: string
  file_url: string
  document_type:
    | 'purchase'
    | 'inspection'
    | 'report'
    | 'receipt'
    | 'insurance'
    | 'registration'
    | 'other'
  expiry_date: string | null
  created_at: string
}

const DOCUMENT_TYPES = {
  purchase: 'Kaufvertrag',
  inspection: 'TÜV / Inspektion',
  report: 'Gutachten',
  receipt: 'Rechnung',
  insurance: 'Versicherung',
  registration: 'Zulassung',
  other: 'Sonstiges',
}

export function DocumentsTab({ vehicleId }: { vehicleId: string }) {
  const supabase = createClient()
  const { toast } = useToast()

  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [docToDelete, setDocToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    documentType: 'other' as Document['document_type'],
    expiryDate: '',
  })

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
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
          description:
            error instanceof Error
              ? error.message
              : 'Dokumente konnten nicht geladen werden',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [vehicleId, supabase, toast])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadData({ ...uploadData, file })
    }
  }

  const handleUpload = async () => {
    if (!uploadData.file) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie eine Datei aus',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Nicht authentifiziert')

      const fileExt = uploadData.file.name.split('.').pop()
      const fileName = `${Date.now()}_${uploadData.file.name}`
      const filePath = `${userData.user.id}/${vehicleId}/${fileName}`

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('vehicle-files')
        .upload(filePath, uploadData.file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('vehicle-files')
        .getPublicUrl(filePath)

      // Create document record
      const docData = {
        vehicle_id: vehicleId,
        user_id: userData.user.id,
        file_name: uploadData.file.name,
        file_type: fileExt || 'unknown',
        file_url: publicData.publicUrl,
        document_type: uploadData.documentType,
        expiry_date: uploadData.expiryDate || null,
      }

      const { data: newDoc, error: insertError } = await supabase
        .from('vehicle_documents')
        .insert([docData])
        .select()
        .single()

      if (insertError) throw insertError

      setDocuments([newDoc, ...documents])
      setUploadData({
        file: null,
        documentType: 'other',
        expiryDate: '',
      })
      setIsUploadDialogOpen(false)

      toast({
        title: 'Erfolg',
        description: 'Dokument hochgeladen',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error ? error.message : 'Dokument konnte nicht hochgeladen werden',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = async () => {
    if (!docToDelete) return

    const doc = documents.find((d) => d.id === docToDelete)
    if (!doc) return

    setIsDeleting(true)
    try {
      // Delete file from storage
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const filePath = `${userData.user.id}/${vehicleId}/${doc.file_name}`
        await supabase.storage.from('vehicle-files').remove([filePath])
      }

      // Delete document record
      const { error } = await supabase
        .from('vehicle_documents')
        .delete()
        .eq('id', docToDelete)

      if (error) throw error

      setDocuments(documents.filter((d) => d.id !== docToDelete))
      setDeleteConfirmOpen(false)
      setDocToDelete(null)

      toast({
        title: 'Erfolg',
        description: 'Dokument gelöscht',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error ? error.message : 'Dokument konnte nicht gelöscht werden',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

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
        <div className="flex justify-end">
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
            className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#B89A3C]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dokument hochladen
          </Button>
        </div>

        {documents.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-lg p-12 border border-gray-700 flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400 mb-2">Noch keine Dokumente</p>
            <p className="text-sm text-gray-500">
              Laden Sie Ihre Fahrzeugdokumente hoch, um diese zu verwalten
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700 flex justify-between items-start"
              >
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-2">
                    <FileText className="h-5 w-5 text-[#C9A84C] flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-[#F0F0F0] break-all">
                      {doc.file_name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide">
                        Dokumenttyp
                      </p>
                      <p className="text-gray-300">
                        {DOCUMENT_TYPES[doc.document_type]}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide">
                        Hochgeladen
                      </p>
                      <p className="text-gray-300">
                        {new Date(doc.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    {doc.expiry_date && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">
                          Verfallsdatum
                        </p>
                        <p
                          className={
                            new Date(doc.expiry_date) < new Date()
                              ? 'text-red-400'
                              : 'text-gray-300'
                          }
                        >
                          {new Date(doc.expiry_date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide">
                        Dateityp
                      </p>
                      <p className="text-gray-300 uppercase">{doc.file_type}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#C9A84C] hover:text-[#B89A3C] hover:bg-[#C9A84C] hover:bg-opacity-10"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDocToDelete(doc.id)
                      setDeleteConfirmOpen(true)
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-[#C9A84C]" />
              Dokument hochladen
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="documentType" className="text-gray-300">
                Dokumenttyp *
              </Label>
              <Select
                value={uploadData.documentType}
                onValueChange={(value) =>
                  setUploadData({
                    ...uploadData,
                    documentType: value as Document['document_type'],
                  })
                }
              >
                <SelectTrigger className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-gray-600">
                  {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="file" className="text-gray-300">
                Datei *
              </Label>
              <div className="mt-2">
                <input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#C9A84C] file:text-[#0A0A0A] hover:file:bg-[#B89A3C]"
                />
              </div>
              {uploadData.file && (
                <p className="text-sm text-gray-400 mt-2">
                  Ausgewählte Datei: {uploadData.file.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="expiryDate" className="text-gray-300">
                Verfallsdatum (optional)
              </Label>
              <input
                id="expiryDate"
                type="date"
                value={uploadData.expiryDate}
                onChange={(e) =>
                  setUploadData({ ...uploadData, expiryDate: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-gray-600 rounded-md text-[#F0F0F0] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
              className="border-gray-600"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !uploadData.file}
              className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#B89A3C]"
            >
              {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
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
              Dokument löschen
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Sind Sie sicher, dass Sie dieses Dokument löschen möchten? Diese
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
              onClick={handleDeleteDocument}
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
