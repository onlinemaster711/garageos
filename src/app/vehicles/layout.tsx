import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { VoiceInputButton } from '@/components/voice/voice-input-button'

export default async function VehiclesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#0A1A2F]">
      <Header user={user.email || ''} />
      <main>{children}</main>
      <VoiceInputButton />
    </div>
  )
}
