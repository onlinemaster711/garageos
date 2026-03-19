import { SupabaseClient } from '@supabase/supabase-js'

export interface MarketValue {
  id: string
  vehicle_id: string
  user_id: string
  estimated_value: number
  source: 'manual' | 'mobile_de' | 'autoscout24' | null
  notes: string | null
  created_at: string
}

export async function getLatestMarketValue(
  supabase: SupabaseClient,
  vehicleId: string
): Promise<MarketValue | null> {
  const { data, error } = await supabase
    .from('market_values')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows returned" which is fine
    throw error
  }

  return data || null
}

export async function getMarketValueHistory(
  supabase: SupabaseClient,
  vehicleId: string
): Promise<MarketValue[]> {
  const { data, error } = await supabase
    .from('market_values')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data || []
}

export async function addMarketValue(
  supabase: SupabaseClient,
  vehicleId: string,
  userId: string,
  estimatedValue: number,
  source?: 'manual' | 'mobile_de' | 'autoscout24',
  notes?: string
): Promise<MarketValue> {
  const { data, error } = await supabase
    .from('market_values')
    .insert([
      {
        vehicle_id: vehicleId,
        user_id: userId,
        estimated_value: estimatedValue,
        source: source || 'manual',
        notes: notes || null,
      },
    ])
    .select()
    .single()

  if (error) throw error

  return data
}

export function calculateGainLoss(purchasePrice: number | null, currentValue: number): number | null {
  if (purchasePrice === null || purchasePrice === 0) return null
  return currentValue - purchasePrice
}

export function calculateReturnPercentage(purchasePrice: number | null, currentValue: number): number | null {
  if (purchasePrice === null || purchasePrice === 0) return null
  return ((currentValue - purchasePrice) / purchasePrice) * 100
}

export function getGainLossColor(gainLoss: number | null): string {
  if (gainLoss === null) return '#999999'
  if (gainLoss > 0) return '#10B981'
  if (gainLoss < 0) return '#EF4444'
  return '#999999'
}
