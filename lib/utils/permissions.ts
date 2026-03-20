import { createClient } from '@/lib/supabase/client'
import type { UserPermissions, PermissionCheckResult } from '@/lib/types/permissions'

export async function isOwner(userId: string, vehicleId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('vehicles')
    .select('user_id')
    .eq('id', vehicleId)
    .single()

  return data?.user_id === userId
}

export function isDateValid(validFrom: string, validUntil: string | null): boolean {
  const now = new Date()
  const from = new Date(validFrom)

  if (now < from) return false
  if (validUntil) {
    const until = new Date(validUntil)
    if (now > until) return false
  }

  return true
}

export async function getUserPermissions(
  userId: string,
  vehicleId: string
): Promise<PermissionCheckResult> {
  const supabase = createClient()

  // Check if owner
  const isOwnerCheck = await isOwner(userId, vehicleId)
  if (isOwnerCheck) {
    return {
      hasAccess: true,
      canEditTermine: true,
      canEditFahrten: true,
      canUploadDokumente: true,
      isExpired: false,
    }
  }

  // Check guest permissions
  const { data: user } = await supabase.auth.getUser()
  if (!user.user?.email) return { hasAccess: false, canEditTermine: false, canEditFahrten: false, canUploadDokumente: false, isExpired: false }

  const { data } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('guest_email', user.user.email)
    .eq('vehicle_id', vehicleId)
    .single()

  if (!data) {
    return {
      hasAccess: false,
      canEditTermine: false,
      canEditFahrten: false,
      canUploadDokumente: false,
      isExpired: false,
    }
  }

  const isValid = isDateValid(data.valid_from, data.valid_until)

  return {
    hasAccess: isValid,
    canEditTermine: isValid && data.permissions.termine,
    canEditFahrten: isValid && data.permissions.fahrten,
    canUploadDokumente: isValid && data.permissions.dokumente,
    isExpired: !isValid,
  }
}

export async function getAccessibleVehicles(userId: string): Promise<string[]> {
  const supabase = createClient()

  // Get owned vehicles
  const { data: ownedVehicles } = await supabase
    .from('vehicles')
    .select('id')
    .eq('user_id', userId)

  // Get user email
  const { data: user } = await supabase.auth.getUser()
  const userEmail = user.user?.email

  let sharedVehicles: string[] = []
  if (userEmail) {
    const { data } = await supabase
      .from('user_permissions')
      .select('vehicle_id')
      .eq('guest_email', userEmail)
      .not('vehicle_id', 'is', null)

    sharedVehicles = data?.map((p) => p.vehicle_id).filter(Boolean) || []
  }

  return [
    ...(ownedVehicles?.map((v) => v.id) || []),
    ...sharedVehicles,
  ]
}

export async function getSharedUsers(vehicleId: string): Promise<any[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false })

  return data || []
}
