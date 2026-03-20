'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { User, Lock, Key, Users, X, Plus, Edit2, Trash2 } from 'lucide-react'
import type { SharedUser } from '@/lib/types/permissions'

type TabType = 'profil' | 'passwort' | 'konto' | 'benutzer'

export default function SettingsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabType>('profil')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Profil Form
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  // Passwort Form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Konto
  const [googleConnected, setGoogleConnected] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Benutzer Management
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SharedUser | null>(null)
  const [usersLoading, setUsersLoading] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPermissions, setNewUserPermissions] = useState({
    termine: false,
    fahrten: false,
    dokumente: false,
  })
  const [newUserValidFrom, setNewUserValidFrom] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [newUserValidUntil, setNewUserValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
        setProfileEmail(user.email || '')
        setProfileName(user.user_metadata?.name || '')
      }

      if (activeTab === 'benutzer') {
        loadSharedUsers()
      }
    } catch (err) {
      console.error('Error loading settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadSharedUsers = async () => {
    try {
      setUsersLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.id) {
        const { data } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('owner_id', user.id)

        setSharedUsers(
          data?.map((p) => ({
            id: p.id,
            email: p.guest_email,
            permissions: p.permissions,
            valid_from: p.valid_from,
            valid_until: p.valid_until,
          })) || []
        )
      }
    } catch (err) {
      console.error('Error loading shared users:', err)
    } finally {
      setUsersLoading(false)
    }
  }

  // Profil speichern
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast({
        title: 'Fehler',
        description: 'Name darf nicht leer sein.',
        variant: 'destructive',
      })
      return
    }

    try {
      setProfileLoading(true)
      const { error } = await supabase.auth.updateUser({
        data: { name: profileName },
      })

      if (error) throw error

      toast({
        title: 'Erfolg',
        description: 'Profil aktualisiert.',
      })
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Profil konnte nicht aktualisiert werden.',
        variant: 'destructive',
      })
    } finally {
      setProfileLoading(false)
    }
  }

  // Passwort ändern
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Fehler',
        description: 'Alle Felder sind erforderlich.',
        variant: 'destructive',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Fehler',
        description: 'Neue Passwörter stimmen nicht überein.',
        variant: 'destructive',
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Fehler',
        description: 'Passwort muss mindestens 6 Zeichen lang sein.',
        variant: 'destructive',
      })
      return
    }

    try {
      setPasswordLoading(true)
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      toast({
        title: 'Erfolg',
        description: 'Passwort geändert.',
      })
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Passwort konnte nicht geändert werden.',
        variant: 'destructive',
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  // Konto löschen
  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true)
      const { error } = await supabase.auth.admin.deleteUser(
        currentUser?.id || ''
      )

      if (error) throw error

      await supabase.auth.signOut()
      toast({
        title: 'Erfolg',
        description: 'Konto gelöscht.',
      })
      router.push('/auth/login')
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Konto konnte nicht gelöscht werden.',
        variant: 'destructive',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  // Benutzer hinzufügen
  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      toast({
        title: 'Fehler',
        description: 'Email ist erforderlich.',
        variant: 'destructive',
      })
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user?.id) return

      const { error } = await supabase.from('user_permissions').insert({
        owner_id: user.id,
        guest_email: newUserEmail.toLowerCase(),
        vehicle_id: null,
        permissions: newUserPermissions,
        valid_from: newUserValidFrom,
        valid_until: newUserValidUntil,
      })

      if (error) throw error

      setNewUserEmail('')
      setNewUserPermissions({
        termine: false,
        fahrten: false,
        dokumente: false,
      })
      setNewUserValidFrom(new Date().toISOString().split('T')[0])
      setNewUserValidUntil(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      )
      setAddModalOpen(false)

      await loadSharedUsers()

      toast({
        title: 'Erfolg',
        description: 'Benutzer hinzugefügt.',
      })
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Benutzer konnte nicht hinzugefügt werden.',
        variant: 'destructive',
      })
    }
  }

  // Benutzer löschen
  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('id', userId)

      if (error) throw error

      await loadSharedUsers()

      toast({
        title: 'Erfolg',
        description: 'Benutzer entfernt.',
      })
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Benutzer konnte nicht entfernt werden.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-[#9B9B9B]">Lädt...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A1A2F] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-[#E6E6E6] mb-8">Einstellungen</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[#3D4450]">
          {[
            { id: 'profil', label: 'Profil', icon: User },
            { id: 'passwort', label: 'Passwort', icon: Lock },
            { id: 'konto', label: 'Konto', icon: Key },
            { id: 'benutzer', label: 'Benutzer', icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id as TabType)
                if (id === 'benutzer') loadSharedUsers()
              }}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-[#E5C97B] text-[#E5C97B]'
                  : 'border-transparent text-[#9B9B9B] hover:text-[#E6E6E6]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* PROFIL TAB */}
        {activeTab === 'profil' && (
          <div className="space-y-6 bg-[#2A2D30] p-6 rounded-lg border border-[#3D4450]">
            <div>
              <label className="block text-sm font-medium text-[#E6E6E6] mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileEmail}
                disabled
                className="w-full px-4 py-2 bg-[#1A2332] border border-[#4A5260] rounded-lg text-[#9B9B9B] cursor-not-allowed"
              />
              <p className="text-xs text-[#9B9B9B] mt-1">Nicht änderbar</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E6E6E6] mb-2">
                Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-2 bg-[#1A2332] border border-[#4A5260] rounded-lg text-[#E6E6E6] focus:outline-none focus:border-[#E5C97B] transition-colors"
                placeholder="Dein Name"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={profileLoading}
              className="w-full bg-[#E5C97B] hover:bg-[#B8961F] disabled:opacity-50 text-[#0A1A2F] font-medium py-2 rounded-lg transition-colors"
            >
              {profileLoading ? 'Speichert...' : 'Speichern'}
            </button>
          </div>
        )}

        {/* PASSWORT TAB */}
        {activeTab === 'passwort' && (
          <div className="space-y-6 bg-[#2A2D30] p-6 rounded-lg border border-[#3D4450]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-[#E6E6E6]">Passwörter</h3>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1A2332] hover:bg-[#3D4450] text-[#E5C97B] text-xs font-medium rounded-lg transition-colors"
              >
                <span className="text-lg">👁️</span>
                <span>{showPassword ? 'Verbergen' : 'Anzeigen'}</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E6E6E6] mb-2">
                Aktuelles Passwort
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#1A2332] border border-[#4A5260] rounded-lg text-[#E6E6E6] focus:outline-none focus:border-[#E5C97B] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E6E6E6] mb-2">
                Neues Passwort
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#1A2332] border border-[#4A5260] rounded-lg text-[#E6E6E6] focus:outline-none focus:border-[#E5C97B] transition-colors"
                placeholder="Neues Passwort"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E6E6E6] mb-2">
                Wiederholen
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#1A2332] border border-[#4A5260] rounded-lg text-[#E6E6E6] focus:outline-none focus:border-[#E5C97B] transition-colors"
                placeholder="Passwort wiederholen"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="w-full bg-[#E5C97B] hover:bg-[#B8961F] disabled:opacity-50 text-[#0A1A2F] font-medium py-2 rounded-lg transition-colors"
            >
              {passwordLoading ? 'Ändert...' : 'Passwort ändern'}
            </button>
          </div>
        )}

        {/* KONTO TAB */}
        {activeTab === 'konto' && (
          <div className="space-y-6 bg-[#2A2D30] p-6 rounded-lg border border-[#3D4450]">
            <div className="flex items-center justify-between p-4 bg-[#1A2332] rounded-lg border border-[#3D4450]">
              <div>
                <p className="text-sm font-medium text-[#E6E6E6]">Google Login</p>
                <p className="text-xs text-[#9B9B9B] mt-1">
                  {googleConnected ? 'Verbunden' : 'Nicht verbunden'}
                </p>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  googleConnected ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
            </div>

            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
              <p className="text-sm text-[#E6E6E6] font-medium mb-4">
                Konto löschen
              </p>
              <p className="text-xs text-[#9B9B9B] mb-4">
                Diese Aktion kann nicht rückgängig gemacht werden. Alle deine
                Daten werden dauerhaft gelöscht.
              </p>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Konto löschen
              </button>
            </div>

            {deleteModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-[#2A2D30] border border-[#3D4450] rounded-lg p-6 max-w-md">
                  <h3 className="text-lg font-semibold text-[#E6E6E6] mb-4">
                    Konto wirklich löschen?
                  </h3>
                  <p className="text-sm text-[#9B9B9B] mb-6">
                    Diese Aktion kann nicht rückgängig gemacht werden.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteModalOpen(false)}
                      className="flex-1 px-4 py-2 bg-[#3D4450] hover:bg-[#4A5260] text-[#E6E6E6] rounded-lg transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
                    >
                      {deleteLoading ? 'Löscht...' : 'Löschen'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BENUTZER TAB */}
        {activeTab === 'benutzer' && (
          <div className="space-y-6">
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E5C97B] hover:bg-[#B8961F] text-[#0A1A2F] font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Benutzer hinzufügen
            </button>

            {usersLoading ? (
              <p className="text-[#9B9B9B]">Lädt...</p>
            ) : sharedUsers.length === 0 ? (
              <p className="text-[#9B9B9B] text-center py-8">
                Noch keine Benutzer freigegeben
              </p>
            ) : (
              <div className="space-y-3">
                {sharedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-[#2A2D30] border border-[#3D4450] rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#E6E6E6]">
                        {user.email}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.permissions.termine && (
                          <span className="text-xs px-2 py-1 bg-[#1A2332] text-[#E5C97B] rounded">
                            Termine
                          </span>
                        )}
                        {user.permissions.fahrten && (
                          <span className="text-xs px-2 py-1 bg-[#1A2332] text-[#E5C97B] rounded">
                            Fahrten
                          </span>
                        )}
                        {user.permissions.dokumente && (
                          <span className="text-xs px-2 py-1 bg-[#1A2332] text-[#E5C97B] rounded">
                            Dokumente
                          </span>
                        )}
                      </div>
                      {user.valid_until && (
                        <p className="text-xs text-[#9B9B9B] mt-2">
                          Gültig bis: {new Date(user.valid_until).toLocaleDateString('de-DE')}
                        </p>
                      )}
                      {!user.valid_until && (
                        <p className="text-xs text-[#9B9B9B] mt-2">
                          Für immer
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 hover:bg-[#3D4450] text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add User Modal */}
            {addModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-[#2A2D30] border border-[#3D4450] rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[#E6E6E6]">
                      Benutzer hinzufügen
                    </h3>
                    <button
                      onClick={() => setAddModalOpen(false)}
                      className="text-[#9B9B9B] hover:text-[#E6E6E6]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#E6E6E6] mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1A2332] border border-[#4A5260] rounded-lg text-[#E6E6E6] focus:outline-none focus:border-[#E5C97B] text-sm"
                        placeholder="benutzer@beispiel.de"
                      />
                    </div>

                    <div className="space-y-3 border-t border-[#3D4450] pt-4">
                      <p className="text-sm font-medium text-[#E6E6E6]">Berechtigungen</p>
                      {[
                        {
                          key: 'termine',
                          label: 'Termine (hinzufügen, bearbeiten, löschen)',
                        },
                        {
                          key: 'fahrten',
                          label: 'Fahrten (hinzufügen, bearbeiten, löschen)',
                        },
                        { key: 'dokumente', label: 'Dokumente (nur hochladen)' },
                      ].map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={
                              newUserPermissions[key as keyof typeof newUserPermissions]
                            }
                            onChange={(e) =>
                              setNewUserPermissions({
                                ...newUserPermissions,
                                [key]: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded accent-[#E5C97B]"
                          />
                          <span className="text-sm text-[#E6E6E6]">{label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-3 border-t border-[#3D4450] pt-4">
                      <p className="text-sm font-medium text-[#E6E6E6]">Zeitbegrenzung</p>

                      <div>
                        <label className="block text-xs font-medium text-[#9B9B9B] mb-1">
                          Ab
                        </label>
                        <input
                          type="date"
                          value={newUserValidFrom}
                          onChange={(e) => setNewUserValidFrom(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1A2332] border border-[#4A5260] rounded-lg text-[#E6E6E6] focus:outline-none focus:border-[#E5C97B] text-sm"
                          placeholder="dd.mm.yyyy"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#9B9B9B] mb-1">
                          Bis
                        </label>
                        <input
                          type="date"
                          value={newUserValidUntil}
                          onChange={(e) => setNewUserValidUntil(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1A2332] border border-[#4A5260] rounded-lg text-[#E6E6E6] focus:outline-none focus:border-[#E5C97B] text-sm"
                          placeholder="dd.mm.yyyy"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 border-t border-[#3D4450] pt-4">
                      <button
                        onClick={() => setAddModalOpen(false)}
                        className="flex-1 px-3 py-2 bg-[#3D4450] hover:bg-[#4A5260] text-[#E6E6E6] rounded-lg transition-colors text-sm font-medium"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={handleAddUser}
                        className="flex-1 px-3 py-2 bg-[#E5C97B] hover:bg-[#B8961F] text-[#0A1A2F] rounded-lg transition-colors text-sm font-medium"
                      >
                        Hinzufügen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
