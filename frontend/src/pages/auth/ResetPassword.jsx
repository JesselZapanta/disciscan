import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import CornerBracket from '../../components/CornerBracket.jsx'
import ScannerVisual from '../../components/ScannerVisual.jsx'
import { resetPassword } from '../../services/auth.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    setError('')
    setSubmitting(true)

    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset your password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left: form */}
      <div className="flex items-center justify-center px-6 py-16 bg-background">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <Logo size={28} />
            <span className="font-mono font-bold tracking-widest text-sm">
              <span className="text-primary">DISCI</span>
              <span className="text-brand-green">SCAN</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-2 border border-border rounded-full px-3 py-1 text-[11px] font-mono text-muted-foreground mb-6">
            <KeyRound className="w-3 h-3" /> PASSWORD RECOVERY
          </div>
          <h1 className="text-3xl font-extrabold mb-2 text-foreground">Set a new password</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Choose a strong password for{' '}
            <span className="text-primary break-all font-mono text-xs">{email || 'your account'}</span>
            . It must be at least 8 characters.
          </p>

          {!token || !email ? (
            <div className="border border-status-flagged/40 bg-status-flagged/10 rounded-lg p-5">
              <p className="text-sm text-foreground">
                This password reset link is invalid or incomplete. Please request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="mt-4 inline-flex items-center gap-2 text-xs font-mono text-primary hover:underline"
              >
                REQUEST A NEW LINK
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="mb-2 text-xs font-mono text-muted-foreground uppercase tracking-wide"
                >
                  New password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-auto bg-secondary border-border rounded px-4 py-3 pr-11 placeholder:text-muted-foreground/60"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password_confirmation"
                  className="mb-2 text-xs font-mono text-muted-foreground uppercase tracking-wide"
                >
                  Confirm new password
                </Label>
                <Input
                  id="password_confirmation"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Repeat your new password"
                  className="h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              {error && (
                <div className="border border-status-flagged/40 bg-status-flagged/10 rounded px-3 py-2.5 text-xs font-mono text-status-flagged">
                  ✕ {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-auto bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded hover:bg-primary/80 hover:text-text dark:hover:bg-white dark:hover:text-text transition disabled:opacity-60"
              >
                {submitting ? 'RESETTING…' : 'RESET PASSWORD →'}
              </Button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> BACK TO SIGN IN
              </Link>
            </form>
          )}
        </div>
      </div>

      {/* right: visual */}
      <div className="hidden lg:flex relative bg-secondary dot-grid items-center justify-center p-14 border-l border-border overflow-hidden">
        <CornerBracket className="border border-border bg-card rounded-lg p-7 w-full max-w-md">
          <div className="flex items-center justify-between mb-5">
            <span className="font-mono text-[11px] uppercase tracking-widest">
              <span className="text-primary">Account</span>
              <span className="text-muted-foreground"> — </span>
              <span className="text-brand-green">Recovery</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-status-cleared">
              <span className="w-1.5 h-1.5 rounded-full bg-status-cleared scan-blink" />
              SECURE
            </span>
          </div>
          <ScannerVisual size="large" />
        </CornerBracket>
        <p className="absolute bottom-10 left-14 right-14 text-muted-foreground text-xs font-mono">
          Your new password takes effect immediately. You&apos;ll need to sign in again with it.
        </p>
      </div>
    </div>
  )
}
