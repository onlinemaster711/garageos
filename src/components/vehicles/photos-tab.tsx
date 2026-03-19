'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  Camera,
  Star,
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

interface Photo {
  id: string
  vehicle_id: string
  user_id: string
  file_name: string
  file_url: string
  is_cover: boolean
  created_at: string
}

export function PhotosTab({ vehicleId }: { vehicleId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSettingCover, setIsSettingCover] = useState(false)

  // Fetch photos
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicle_photos')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('is_cover', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) throw error
        setPhotos(data || [])
      } catch (error) {
        toast({
          title: 'Fehler',
          description:
            error instanceof Error
              ? error.message
              : 'Fotos konnten nicht geladen werden',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPhotos()
  }, [vehicleId, supabase, toast])

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Nicht authentifiziert')

      const fileName = `${Date.now()}_${file.name}`
      const filePath = `${userData.user.id}/${vehicleId}/${fileName}`

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('vehicle-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('vehicle-photos')
        .getPublicUrl(filePath)

      // Create photo record
      const photoData = {
        vehicle_id: vehicleId,
        user_id: userData.user.id,
        file_name: file.name,
        file_url: publicData.publicUrl,
        is_cover: photos.length === 0,
      }

      const { data: newPhoto, error: insertError } = await supabase
        .from('vehicle_photos')
        .insert([photoData])
        .select()
        .single()

      if (insertError) throw insertError

      setPhotos([newPhoto, ...photos])

      toast({
        title: 'Erfolg',
        description: 'Foto hochgeladen',
      })

      // Reset file input
      const fileInput = document.getElementById('photo-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error ? error.message : 'Foto konnte nicht hochgeladen werden',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSetCover = async (photoId: string) => {
    setIsSettingCover(true)
    try {
      // Update all photos for this vehicle
      const { error: updateError } = await supabase
        .from('vehicle_photos')
        .update({ is_cover: false })
        .eq('vehicle_id', vehicleId)

      if (updateError) throw updateError

      // Set the selected photo as cover
      const { error: coverError } = await supabase
        .from('vehicle_photos')
        .update({ is_cover: true })
        .eq('id', photoId)

      if (coverError) throw coverError

      // Update vehicle cover_photo_url
      const selectedPhotoData = photos.find((p) => p.id === photoId)
      if (selectedPhotoData) {
        await supabase
          .from('vehicles')
          .update({ cover_photo_url: selectedPhotoData.file_url })
          .eq('id', vehicleId)
      }

      // Update local state
      setPhotos(
        photos.map((p) => ({
          ...p,
          is_cover: p.id === photoId,
        }))
      )

      toast({
        title: 'Erfolg',
        description: 'Abdeckungsfoto aktualisiert',
      })

      // Refresh the page to show the new cover
      router.refresh()
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Abdeckungsfoto konnte nicht aktualisiert werden',
        variant: 'destructive',
      })
    } finally {
      setIsSettingCover(false)
    }
  }

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return

    const photo = photos.find((p) => p.id === photoToDelete)
    if (!photo) return

    setIsDeleting(true)
    try {
      // Delete file from storage
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const filePath = `${userData.user.id}/${vehicleId}/${photo.file_name}`
        await supabase.storage.from('vehicle-photos').remove([filePath])
      }

      // Delete photo record
      const { error } = await supabase
        .from('vehicle_photos')
        .delete()
        .eq('id', photoToDelete)

      if (error) throw error

      const remainingPhotos = photos.filter((p) => p.id !== photoToDelete)
      setPhotos(remainingPhotos)

      // If deleted photo was cover, set new cover
      if (photo.is_cover && remainingPhotos.length > 0) {
        await handleSetCover(remainingPhotos[0].id)
      } else if (remainingPhotos.length === 0) {
        // Clear cover if no photos left
        await supabase
          .from('vehicles')
          .update({ cover_photo_url: null })
          .eq('id', vehicleId)
      }

      setDeleteConfirmOpen(false)
      setPhotoToDelete(null)

      toast({
        title: 'Erfolg',
        description: 'Foto gelöscht',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error ? error.message : 'Foto konnte nicht gelöscht werden',
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
      <div className="space-y-6">
        {/* Upload Button */}
        <div className="flex justify-end">
          <label>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              disabled={isUploading}
              className="hidden"
            />
            <Button
              asChild
              disabled={isUploading}
              className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#B89A3C] cursor-pointer"
            >
              <span>
                <Plus className="h-4 w-4 mr-2" />
                {isUploading ? 'Wird hochgeladen...' : 'Foto hinzufügen'}
              </span>
            </Button>
          </label>
        </div>

        {/* Photos */}
        {photos.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-lg p-12 border border-gray-700 flex flex-col items-center justify-center text-center">
            <Camera className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400 mb-2">Noch keine Fotos</p>
            <p className="text-sm text-gray-500">
              Laden Sie Fotos Ihres Fahrzeugs hoch, um diese anzuzeigen
            </p>
          </div>
        ) : (
          <>
            {/* Cover Photo */}
            {photos.find((p) => p.is_cover) && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#F0F0F0] flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#C9A84C]" />
                  Abdeckungsfoto
                </h3>
                <div className="relative group rounded-lg overflow-hidden border border-gray-700 h-64 bg-gray-900">
                  <img
                    src={photos.find((p) => p.is_cover)!.file_url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const coverPhoto = photos.find((p) => p.is_cover)
                      if (coverPhoto) {
                        setPhotoToDelete(coverPhoto.id)
                        setDeleteConfirmOpen(true)
                      }
                    }}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-300 hover:bg-red-950 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Other Photos */}
            {photos.filter((p) => !p.is_cover).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#F0F0F0]">
                  Weitere Fotos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos
                    .filter((p) => !p.is_cover)
                    .map((photo) => (
                      <div
                        key={photo.id}
                        className="relative group rounded-lg overflow-hidden bg-gray-900 aspect-square border border-gray-700 cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <img
                          src={photo.file_url}
                          alt={photo.file_name}
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                        />

                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSetCover(photo.id)
                            }}
                            disabled={isSettingCover}
                            className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#B89A3C]"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Cover
                          </Button>

                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPhotoToDelete(photo.id)
                              setDeleteConfirmOpen(true)
                            }}
                            variant="destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Photo Lightbox */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="bg-[#1E1E1E] border-gray-700 max-w-3xl max-h-[90vh]">
          {selectedPhoto && (
            <div className="relative">
              <img
                src={selectedPhoto.file_url}
                alt={selectedPhoto.file_name}
                className="w-full h-auto rounded-lg"
              />
              <p className="text-gray-400 text-sm mt-4">{selectedPhoto.file_name}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Foto löschen
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Sind Sie sicher, dass Sie dieses Foto löschen möchten? Diese Aktion
              kann nicht rückgängig gemacht werden.
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
              onClick={handleDeletePhoto}
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
