'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface DossierButtonProps {
  vehicleId: string
  vehicleName: string
}

export function DossierButton({ vehicleId, vehicleName }: DossierButtonProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/dossier`)

      if (!response.ok) {
        throw new Error('Fehler beim Generieren des Dossiers')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Dossier_${vehicleName.replace(/\s+/g, '_')}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Erfolg',
        description: 'Dossier wurde heruntergeladen',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Dossier konnte nicht generiert werden',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isLoading}
      className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#B89A3C]"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Wird erstellt...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Dossier herunterladen
        </>
      )}
    </Button>
  )
}
