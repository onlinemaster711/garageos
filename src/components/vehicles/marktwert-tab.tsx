'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  Plus,
  Loader2,
  AlertTriangle,
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
import {
  MarketValue,
  getLatestMarketValue,
  getMarketValueHistory,
  addMarketValue,
  calculateGainLoss,
  calculateReturnPercentage,
  getGainLossColor,
} from '@/lib/marktwert'

interface MarktwertTabProps {
  vehicleId: string
  purchasePrice: number | null
}

export function MarktwertTab({ vehicleId, purchasePrice }: MarktwertTabProps) {
  const supabase = createClient()
  const { toast } = useToast()

  const [latestValue, setLatestValue] = useState<MarketValue | null>(null)
  const [history, setHistory] = useState<MarketValue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const [formData, setFormData] = useState({
    estimatedValue: '',
    source: 'manual' as 'manual' | 'mobile_de' | 'autoscout24',
    notes: '',
  })

  // Load market values
  useEffect(() => {
    const loadValues = async () => {
      try {
        const latest = await getLatestMarketValue(supabase, vehicleId)
        setLatestValue(latest)

        const hist = await getMarketValueHistory(supabase, vehicleId)
        setHistory(hist)
      } catch (error) {
        toast({
          title: 'Fehler',
          description:
            error instanceof Error
              ? error.message
              : 'Marktwerte konnten nicht geladen werden',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadValues()
  }, [vehicleId, supabase, toast])

  const handleAddValue = async () => {
    if (!formData.estimatedValue) {
      toast({
        title: 'Fehler',
        description: 'Marktwert ist erforderlich',
        variant: 'destructive',
      })
      return
    }

    setIsAdding(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Nicht authentifiziert')

      const newValue = await addMarketValue(
        supabase,
        vehicleId,
        userData.user.id,
        parseFloat(formData.estimatedValue),
        formData.source,
        formData.notes || undefined
      )

      setLatestValue(newValue)
      setHistory([newValue, ...history])
      setFormData({
        estimatedValue: '',
        source: 'manual',
        notes: '',
      })
      setIsAddDialogOpen(false)

      toast({
        title: 'Erfolg',
        description: 'Marktwert hinzugefügt',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Marktwert konnte nicht hinzugefügt werden',
        variant: 'destructive',
      })
    } finally {
      setIsAdding(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
      </div>
    )
  }

  const gainLoss = latestValue
    ? calculateGainLoss(purchasePrice, latestValue.estimated_value)
    : null
  const returnPercentage = latestValue
    ? calculateReturnPercentage(purchasePrice, latestValue.estimated_value)
    : null
  const gainLossColor = getGainLossColor(gainLoss)

  return (
    <>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Purchase Price */}
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Kaufpreis
            </p>
            <p className="text-2xl font-bold text-[#F0F0F0]">
              {purchasePrice ? `€ ${purchasePrice.toLocaleString('de-DE')}` : '-'}
            </p>
          </div>

          {/* Current Market Value */}
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Aktueller Marktwert
            </p>
            <p className="text-2xl font-bold text-[#F0F0F0]">
              {latestValue
                ? `€ ${latestValue.estimated_value.toLocaleString('de-DE')}`
                : '-'}
            </p>
            {latestValue && (
              <p className="text-xs text-gray-500 mt-1">
                {new Date(latestValue.created_at).toLocaleDateString('de-DE')}
              </p>
            )}
          </div>

          {/* Difference */}
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Differenz
            </p>
            {gainLoss !== null ? (
              <p
                className="text-2xl font-bold"
                style={{ color: gainLossColor }}
              >
                {gainLoss >= 0 ? '+' : ''}€ {Math.abs(gainLoss).toLocaleString('de-DE')}
              </p>
            ) : (
              <p className="text-2xl font-bold text-gray-500">-</p>
            )}
          </div>

          {/* Return Percentage */}
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Rendite
            </p>
            {returnPercentage !== null ? (
              <p
                className="text-2xl font-bold"
                style={{ color: gainLossColor }}
              >
                {returnPercentage >= 0 ? '+' : ''}
                {returnPercentage.toFixed(1)}%
              </p>
            ) : (
              <p className="text-2xl font-bold text-gray-500">-</p>
            )}
          </div>
        </div>

        {/* Add Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#B89A3C]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Marktwert hinzufügen
          </Button>
        </div>

        {/* History */}
        {history.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-lg p-12 border border-gray-700 flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400 mb-2">Noch keine Marktwerte</p>
            <p className="text-sm text-gray-500">
              Fügen Sie Ihren ersten Marktwert hinzu, um diese zu verfolgen
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((value) => (
              <div
                key={value.id}
                className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                      <p className="text-lg font-semibold text-[#F0F0F0]">
                        € {value.estimated_value.toLocaleString('de-DE')}
                      </p>
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-medium">
                        {value.source === 'manual'
                          ? 'Manuell'
                          : value.source === 'mobile_de'
                          ? 'Mobile.de'
                          : value.source === 'autoscout24'
                          ? 'AutoScout24'
                          : 'Unbekannt'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      {new Date(value.created_at).toLocaleDateString(
                        'de-DE',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                    {value.notes && (
                      <p className="text-sm text-gray-400 italic">
                        "{value.notes}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Market Value Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#C9A84C]" />
              Marktwert hinzufügen
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Geben Sie den aktuellen geschätzten Marktwert des Fahrzeugs ein
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="value" className="text-gray-300">
                Marktwert (€) *
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.estimatedValue}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedValue: e.target.value })
                }
                className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]"
              />
            </div>

            <div>
              <Label htmlFor="source" className="text-gray-300">
                Quelle
              </Label>
              <Select
                value={formData.source}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    source: value as 'manual' | 'mobile_de' | 'autoscout24',
                  })
                }
              >
                <SelectTrigger className="bg-[#0A0A0A] border-gray-600 text-[#F0F0F0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-gray-600">
                  <SelectItem value="manual">Manuell</SelectItem>
                  <SelectItem value="mobile_de">Mobile.de</SelectItem>
                  <SelectItem value="autoscout24">AutoScout24</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes" className="text-gray-300">
                Notizen
              </Label>
              <Textarea
                id="notes"
                placeholder="z.B. Schätzung basierend auf ähnlichen Fahrzeugen"
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
              onClick={handleAddValue}
              disabled={isAdding}
              className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#B89A3C]"
            >
              {isAdding ? 'Wird hinzugefügt...' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
