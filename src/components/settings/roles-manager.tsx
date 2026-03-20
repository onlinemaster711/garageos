'use client'

import { useEffect, useState } from 'react'
import { Users, Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface UserRole {
  id: string
  owner_id: string
  member_email: string
  member_id: string | null
  role: 'assistant' | 'viewer'
  created_at: string
}

export function RolesManager({ userId }: { userId: string }) {
  const supabase = createClient()
  const { toast } = useToast()

  const [roles, setRoles] = useState<UserRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    role: 'viewer' as 'assistant' | 'viewer',
  })

  // Load roles
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        setRoles(data || [])
      } catch (error) {
        toast({
          title: 'Fehler',
          description:
            error instanceof Error
              ? error.message
              : 'Rollen konnten nicht geladen werden',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadRoles()
  }, [userId, supabase, toast])

  const handleAddRole = async () => {
    if (!formData.email) {
      toast({
        title: 'Fehler',
        description: 'E-Mail ist erforderlich',
        variant: 'destructive',
      })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: 'Fehler',
        description: 'Ungültige E-Mail-Adresse',
        variant: 'destructive',
      })
      return
    }

    setIsAdding(true)
    try {
      const { data: newRole, error } = await supabase
        .from('user_roles')
        .insert([
          {
            owner_id: userId,
            member_email: formData.email,
            role: formData.role,
            member_id: null,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setRoles([newRole, ...roles])
      setFormData({
        email: '',
        role: 'viewer',
      })
      setIsAddDialogOpen(false)

      toast({
        title: 'Erfolg',
        description: `Benutzer eingeladen als ${formData.role === 'assistant' ? 'Assistent' : 'Betrachter'}`,
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Benutzer konnte nicht eingeladen werden',
        variant: 'destructive',
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!roleToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleToDelete)

      if (error) throw error

      setRoles(roles.filter((r) => r.id !== roleToDelete))
      setDeleteConfirmOpen(false)
      setRoleToDelete(null)

      toast({
        title: 'Erfolg',
        description: 'Benutzer wurde entfernt',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description:
          error instanceof Error
            ? error.message
            : 'Benutzer konnte nicht entfernt werden',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      assistant: 'Assistent',
      viewer: 'Betrachter',
    }
    return labels[role] || role
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#E5C97B]" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#E6E6E6] mb-2">
            Rollen & Zugänge
          </h1>
          <p className="text-gray-400">
            Verwalten Sie, wer auf Ihre Fahrzeugsammlung zugreifen kann
          </p>
        </div>

        {/* Add Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B89A3C]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Benutzer einladen
          </Button>
        </div>

        {/* Members List */}
        {roles.length === 0 ? (
          <div className="bg-[#2A2D30] rounded-lg p-12 border border-gray-700 flex flex-col items-center justify-center text-center">
            <Users className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400 mb-2">Noch keine Benutzer eingeladen</p>
            <p className="text-sm text-gray-500">
              Laden Sie Benutzer ein, um ihnen Zugriff auf Ihre Garage zu geben
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-[#2A2D30] rounded-lg p-6 border border-gray-700 flex justify-between items-center"
              >
                <div className="flex-1">
                  <p className="text-lg font-semibold text-[#E6E6E6] mb-1">
                    {role.member_email}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[#E5C97B] bg-opacity-20 text-[#E5C97B] rounded text-sm font-medium">
                      {getRoleLabel(role.role as string)}
                    </span>
                    <p className="text-sm text-gray-500">
                      Eingeladen am{' '}
                      {new Date(role.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRoleToDelete(role.id)
                    setDeleteConfirmOpen(true)
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-950 ml-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Role Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#2A2D30] border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#E5C97B]" />
              Benutzer einladen
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Geben Sie die E-Mail-Adresse des Benutzers ein und wählen Sie eine Rolle
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">
                E-Mail-Adresse *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="benutzer@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]"
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-gray-300">
                Rolle
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    role: value as 'assistant' | 'viewer',
                  })
                }
              >
                <SelectTrigger className="bg-[#0A1A2F] border-gray-600 text-[#E6E6E6]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2D30] border-gray-600">
                  <SelectItem value="assistant">
                    Assistent (Lesen & Ändern)
                  </SelectItem>
                  <SelectItem value="viewer">Betrachter (Nur Lesen)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-950 bg-opacity-40 border border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-300">
                Die Einladung wird an die angegebene E-Mail-Adresse gesendet. Der Benutzer kann
                dann annehmen und erhält Zugriff auf Ihre Fahrzeugsammlung.
              </p>
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
              onClick={handleAddRole}
              disabled={isAdding}
              className="bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B89A3C]"
            >
              {isAdding ? 'Wird eingeladen...' : 'Einladen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-[#2A2D30] border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Benutzer entfernen
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Sind Sie sicher, dass Sie diesen Benutzer entfernen möchten? Dieser Benutzer
              kann dann nicht mehr auf Ihre Fahrzeugsammlung zugreifen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-gray-600"
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRole}
              disabled={isDeleting}
            >
              {isDeleting ? 'Wird entfernt...' : 'Entfernen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
