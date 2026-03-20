export interface UserPermissions {
  id: string
  owner_id: string
  guest_email: string
  vehicle_id: string | null
  permissions: {
    termine: boolean
    fahrten: boolean
    dokumente: boolean
  }
  valid_from: string
  valid_until: string | null
  created_at: string
}

export interface PermissionCheckResult {
  hasAccess: boolean
  canEditTermine: boolean
  canEditFahrten: boolean
  canUploadDokumente: boolean
  isExpired: boolean
}

export interface SharedUser {
  email: string
  permissions: {
    termine: boolean
    fahrten: boolean
    dokumente: boolean
  }
  valid_from: string
  valid_until: string | null
  id: string
}
