'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function PortfolioPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user?.id) {
        router.push('/auth/login')
        return
      }

      // Check if user has access through permissions
      const { data } = await supabase
        .from('user_permissions')
        .select('id')
        .eq('guest_email', user.email)
        .single()

      // Only the owner can access portfolio, not guests
      if (data) {
        router.push('/dashboard')
        return
      }

      setIsOwner(true)
    } catch (err) {
      // No permission found, so this is the owner
      setIsOwner(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1A2F] flex items-center justify-center">
        <p className="text-[#9B9B9B]">Lädt...</p>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#0A1A2F] flex items-center justify-center px-4">
        <div className="text-center">
          <Lock className="w-12 h-12 text-[#E5C97B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#E6E6E6] mb-2">
            Zugriff verweigert
          </h1>
          <p className="text-[#9B9B9B] mb-6">
            Das Portfolio ist nur für den Owner sichtbar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A1A2F] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#E6E6E6] tracking-tight mb-8">
          Portfolio
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder - Erweiterbar mit echtem Portfolio-Content */}
          <div className="bg-[#2A2D30] border border-[#3D4450] rounded-lg p-6">
            <p className="text-[#9B9B9B] text-center py-16">
              Dein Portfolio ist noch leer.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
