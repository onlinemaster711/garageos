import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { VoiceInputButton } from '@/components/voice/voice-input-button'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <Header user={user.email || ''} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <VoiceInputButton />
    </div>
  )
}
