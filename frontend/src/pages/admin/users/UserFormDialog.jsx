import { useRef, useState } from 'react'
import { Camera, Save, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import * as userService from '../../../services/admin/users'

const STORAGE_URL = 'http://localhost:8000/storage'

function initialsOf(name) {
  return (name || '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function UserFormDialog({ trigger, user, onSaved }) {
  const isEdit = Boolean(user)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'guard',
    password: '',
    password_confirmation: '',
  }))
  const [profileFile, setProfileFile] = useState(null)
  const [removeProfile, setRemoveProfile] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setProfileFile(file)
    setRemoveProfile(false)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleRemoveProfile() {
    setProfileFile(null)
    setRemoveProfile(true)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    const payload = new FormData()
    payload.append('name', form.name)
    payload.append('email', form.email)
    payload.append('role', form.role)
    if (profileFile) {
      payload.append('profile', profileFile)
    } else if (isEdit && removeProfile) {
      payload.append('remove_profile', '1')
    }
    if (form.password) {
      payload.append('password', form.password)
      payload.append('password_confirmation', form.password_confirmation)
    }

    try {
      if (isEdit) {
        await userService.updateUser(user.id, payload)
      } else {
        await userService.createUser(payload)
      }
      setOpen(false)
      onSaved?.(form.name.trim(), isEdit)
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        toast({
          variant: 'error',
          title: 'Save failed',
          description: 'Something went wrong. Please try again.',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const existingProfileUrl = isEdit && user?.profile && !removeProfile ? `${STORAGE_URL}/${user.profile}` : null
  const showPreview = previewUrl || existingProfileUrl

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setForm({
            name: user?.name || '',
            email: user?.email || '',
            role: user?.role || 'guard',
            password: '',
            password_confirmation: '',
          })
          setErrors({})
          setProfileFile(null)
          setRemoveProfile(false)
          setPreviewUrl(null)
        }
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <DialogTitle>{isEdit ? 'Edit user' : 'Add user'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update account details. Leave password blank to keep the current one.'
              : 'Create a new admin or guard account.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-full bg-border overflow-hidden flex items-center justify-center font-bold text-primary font-mono text-sm shrink-0">
                {showPreview ? (
                  <img src={showPreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  initialsOf(form.name || user?.name)
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    {profileFile ? 'Change photo' : isEdit && existingProfileUrl ? 'Change photo' : 'Upload photo'}
                  </Button>
                  {(profileFile || (isEdit && user?.profile && !removeProfile)) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={handleRemoveProfile}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">JPG, PNG or WEBP. Max 2MB.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.profile?.[0] ?? ''}</p>

            <div className="space-y-2">
              <Label htmlFor="user-name">Full name</Label>
              <Input
                id="user-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Juan Dela Cruz"
                className="bg-secondary border-border"
              />
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.name?.[0] ?? ''}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="juan@example.com"
                className="bg-secondary border-border"
              />
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.email?.[0] ?? ''}</p>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                <SelectTrigger className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">ADMIN</SelectItem>
                  <SelectItem value="guard">GUARD</SelectItem>
                </SelectContent>
              </Select>
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.role?.[0] ?? ''}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-password">
                Password {isEdit && <span className="text-muted-foreground font-normal">(optional)</span>}
              </Label>
              <Input
                id="user-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={isEdit ? 'Leave blank to keep current' : 'Minimum 8 characters'}
                autoComplete="new-password"
                className="bg-secondary border-border"
              />
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.password?.[0] ?? ''}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-password-confirmation">Confirm password</Label>
              <Input
                id="user-password-confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                placeholder="Repeat password"
                autoComplete="new-password"
                className="bg-secondary border-border"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}
