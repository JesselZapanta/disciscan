import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Mail, Moon, Palette, Save, ShieldCheck, Sun, Trash2, Undo2, UserRound, X, LockKeyhole } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import * as authService from '../services/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STORAGE_URL = 'http://localhost:8000/storage'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [name, setName] = useState(user?.name || '')
  const [profileFile, setProfileFile] = useState(null)
  const [profilePreview, setProfilePreview] = useState(user?.profile ? `${STORAGE_URL}/${user.profile}` : null)
  const [removeProfile, setRemoveProfile] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const initials = (user?.name || '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setProfileFile(file)
    setProfilePreview(URL.createObjectURL(file))
    setRemoveProfile(false)
    setErrors((prev) => ({ ...prev, profile: undefined }))
  }

  function handleRemoveProfile() {
    setProfileFile(null)
    setProfilePreview(null)
    setRemoveProfile(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleUndoRemove() {
    setRemoveProfile(false)
    setProfilePreview(user?.profile ? `${STORAGE_URL}/${user.profile}` : null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setMessage('')
    setSaving(true)

    const payload = new FormData()
    payload.append('name', name)
    if (profileFile) {
      payload.append('profile', profileFile)
    } else if (removeProfile) {
      payload.append('remove_profile', '1')
    }
    if (password) {
      payload.append('current_password', currentPassword)
      payload.append('password', password)
      payload.append('password_confirmation', passwordConfirmation)
    }

    try {
      const res = await authService.updateProfile(payload)
      updateUser(res.data)
      setMessage('Profile updated successfully.')
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirmation('')
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
        setMessage('')
      } else {
        setMessage('Something went wrong. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* page header */}
      <div className="border-b border-border px-6 lg:px-10 py-5">
        <div className="text-[11px] font-mono uppercase tracking-widest">
          <span className="text-primary">Account</span>
          <span className="text-muted-foreground"> / </span>
          <span className="text-brand-green">Profile</span>
        </div>
        <h1 className="text-2xl font-bold mt-1 text-foreground">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your name, photo and password</p>
      </div>

      <div className="px-6 lg:px-10 py-8 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — identity card with photo upload */}
        <Card className="ring-0 h-fit lg:col-span-1 py-0 gap-0">
          <div className="flex items-center gap-2 border-b border-border px-6 pt-6 pb-4">
            <UserRound className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Identity</h2>
          </div>
          <CardContent className="px-6 py-6">
            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  'w-24 h-24 rounded-full border-2 border-border overflow-hidden flex items-center justify-center text-2xl font-bold text-primary font-mono bg-secondary',
                  removeProfile && !profileFile && 'opacity-60'
                )}
              >
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <input
                id="profile-image"
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {!removeProfile && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {user?.profile || profileFile ? 'Change photo' : 'Upload photo'}
                </Button>
              )}

              <div className="mt-3 flex items-center gap-2">
                {removeProfile && (
                  <Button type="button" variant="outline" size="sm" onClick={handleUndoRemove} className="gap-2">
                    <Undo2 className="h-4 w-4" />
                    Undo
                  </Button>
                )}
                {(user?.profile || profileFile) && !removeProfile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveProfile}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>

              {errors.profile && (
                <p className="text-xs text-destructive mt-2">{errors.profile[0]}</p>
              )}
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                JPG, PNG, GIF, WEBP — max 2MB
              </p>

              <div className="mt-5 w-full text-left text-xs font-mono text-muted-foreground border-t border-border pt-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> EMAIL
                  </span>
                  <span className="text-foreground truncate">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> ROLE
                  </span>
                  <span className="text-primary font-semibold">{(user?.role || '').toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <LockKeyhole className="h-3.5 w-3.5" /> STATUS
                  </span>
                  <span className="text-status-cleared">ACTIVE</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right — edit form */}
        <Card className="ring-0 lg:col-span-2 h-fit py-0 gap-0">
          <div className="flex items-center gap-2 border-b border-border px-6 pt-6 pb-4">
            <UserRound className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Edit profile</h2>
          </div>
          <CardContent className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profile-name" className="flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5 text-muted-foreground" /> Full Name
                </Label>
                <Input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email (read-only)
                </Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  disabled
                  className="bg-muted border-border text-muted-foreground"
                />
              </div>

              <div className="border-t border-border pt-6">
                <h2 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4 text-primary" /> Change password
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••"
                      autoComplete="current-password"
                      className="bg-secondary border-border"
                    />
                    {errors.current_password && (
                      <p className="text-xs text-destructive mt-1">{errors.current_password[0]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      className="bg-secondary border-border"
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive mt-1">{errors.password[0]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm new password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
              </div>

              {message && (
                <p className="text-sm text-status-cleared border border-status-cleared/30 bg-status-cleared/10 rounded px-3 py-2 font-mono flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0" /> {message}
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-primary-foreground font-bold text-sm py-3 px-6 rounded hover:bg-primary/80 hover:text-text dark:hover:bg-white dark:hover:text-text transition gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'SAVING…' : 'SAVE CHANGES'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2"
                  onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/guard/dashboard')}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>

        {/* Preferences — appearance */}
        <Card className="ring-0 h-fit py-0 gap-0">
          <div className="flex items-center gap-2 border-b border-border px-6 pt-6 pb-4">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Preferences</h2>
          </div>
          <CardContent className="px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Label className="flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-muted-foreground" /> Appearance
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose between dark and light theme. Dark is the default.
                </p>
              </div>
              <div className="flex items-center gap-1 bg-secondary rounded p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex items-center gap-2 rounded px-4 py-1.5 text-xs font-mono font-medium transition',
                    theme === 'dark'
                      ? 'bg-card text-foreground ring-1 ring-border shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Moon className="h-3.5 w-3.5" />
                  DARK
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex items-center gap-2 rounded px-4 py-1.5 text-xs font-mono font-medium transition',
                    theme === 'light'
                      ? 'bg-card text-foreground ring-1 ring-border shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Sun className="h-3.5 w-3.5" />
                  LIGHT
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
