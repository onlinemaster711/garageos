export interface Vehicle {
  id: string
  user_id: string
  make: string
  model: string
  year: number | null
  plate: string | null
  vin: string | null
  color: string | null
  country_code: string
  category: 'oldtimer' | 'youngtimer' | 'modern'
  purchase_date: string | null
  purchase_price: number | null
  current_mileage: number | null
  last_driven_date: string | null
  max_standzeit_weeks: number
  location_id: string | null
  cover_photo_url: string | null
  notes: string | null
  created_at: string
}

export interface Location {
  id: string
  user_id: string
  name: string
  address: string | null
  type: string | null
  climate_controlled: boolean
  contact_name: string | null
  contact_phone: string | null
  notes: string | null
}

export interface Document {
  id: string
  vehicle_id: string
  user_id: string
  type: string | null
  file_url: string
  file_name: string | null
  expires_at: string | null
  notes: string | null
  uploaded_at: string
}

export interface Reminder {
  id: string
  vehicle_id: string
  user_id: string
  type: string
  title: string
  due_date: string
  repeat_months: number | null
  status: 'open' | 'done' | 'dismissed'
  notified_30: boolean
  notified_7: boolean
  notified_1: boolean
  notes: string | null
  created_at: string
}

export interface Maintenance {
  id: string
  vehicle_id: string
  user_id: string
  date: string
  title: string
  description: string | null
  workshop: string | null
  cost: number | null
  mileage: number | null
  created_at: string
}

export interface Tire {
  id: string
  vehicle_id: string
  user_id: string
  type: 'summer' | 'winter' | 'allseason'
  brand: string | null
  size: string | null
  purchase_date: string | null
  mileage_km: number
  tread_depth_mm: number | null
  condition: string | null
  storage_location: string | null
  last_mounted_date: string | null
  notes: string | null
}

export interface Drive {
  id: string
  vehicle_id: string
  user_id: string
  date: string
  km_driven: number | null
  mileage_after: number | null
  notes: string | null
  created_at: string
}

export interface UserRole {
  id: string
  owner_id: string
  member_email: string
  member_id: string | null
  role: 'owner' | 'assistant' | 'viewer'
  created_at: string
}
