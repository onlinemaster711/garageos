import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RolesManager } from '@/components/settings/roles-manager'

export const metadata = {
  title: 'Einstellungen | GarageOS',
  description: 'Verwalten Sie Ihre GarageOS-Einstellungen',
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-8">
      <RolesManager userId={user.id} />
    </div>
  )
}
