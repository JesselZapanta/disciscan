import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, LogIn } from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import CornerBracket from '../../components/CornerBracket.jsx'
import ScannerVisual from '../../components/ScannerVisual.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const demoAccounts = [
  { role: 'Admin', email: 'kenley.bronola@example.com' },
  { role: 'Guard', email: 'kimberly.magsayo@example.com' },
  { role: 'Guard', email: 'yasser.rowaon@example.com' },
  { role: 'Guard', email: 'romel.ondona@example.com' },
]

export default function Login() {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('auth_expired') === '1') {
      sessionStorage.removeItem('auth_expired')
      toast({
        variant: 'error',
        title: 'Session expired',
        description: 'Your session has expired. Please sign in again.',
      })
    }
  }, [toast])

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/guard/dashboard', { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    setErrors({ email: '', password: '' })
    setSubmitting(true)

    try {
      await login(email, password)
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      setErrors({
        email: apiErrors?.email?.[0] ?? '',
        password: apiErrors?.password?.[0] ?? (err.response?.data?.message || 'Unable to sign in. Check your credentials.'),
      })
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
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> RESTRICTED ACCESS
          </div>
          <h1 className="text-3xl font-extrabold mb-2 text-foreground">Sign in to your post</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Admin and Security Guard accounts only. Students and visitors are identified by QR
            code, not login.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="mb-2 text-xs font-mono text-muted-foreground uppercase tracking-wide"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors((prev) => ({ ...prev, email: '' }))
                }}
                placeholder="guard.delacruz@tcgc.edu.ph"
                className={`h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60 ${errors.email ? 'border-status-flagged' : ''}`}
                autoComplete="email"
              />
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.email ?? ''}</p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="mb-2 text-xs font-mono text-muted-foreground uppercase tracking-wide"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrors((prev) => ({ ...prev, password: '' }))
                }}
                placeholder="••••••••••"
                className={`h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60 ${errors.password ? 'border-status-flagged' : ''}`}
                autoComplete="current-password"
              />
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.password ?? ''}</p>
            </div>

            <div className="flex items-center justify-between text-xs">
              <Label className="flex items-center gap-2 text-muted-foreground font-normal"></Label>
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-auto bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded hover:bg-primary/80 hover:text-text dark:hover:bg-white dark:hover:text-text transition disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              {submitting ? 'AUTHENTICATING…' : 'AUTHENTICATE'}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
            <span className="h-px bg-border flex-1" /> DEMO ACCOUNTS{' '}
            <span className="h-px bg-border flex-1" />
          </div>
          <div className="mt-4 space-y-2">
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                type="button"
                variant="outline"
                onClick={() => {
                  setEmail(account.email)
                  setPassword('password')
                  setErrors({ email: '', password: '' })
                }}
                className="w-full h-auto! flex items-center justify-between rounded px-3 py-2 hover:border-primary/50 hover:bg-secondary cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-foreground">{account.role}</span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {account.email} / password
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* right: visual */}
      <div className="hidden lg:flex relative bg-secondary dot-grid items-center justify-center p-14 border-l border-border overflow-hidden">
        <CornerBracket className="border border-border bg-card rounded-lg p-7 w-full max-w-md">
          <div className="flex items-center justify-between mb-5">
            <span className="font-mono text-[11px] uppercase tracking-widest">
              <span className="text-primary">Scanner</span>
              <span className="text-muted-foreground"> — </span>
              <span className="text-brand-green">Main Gate</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-status-cleared">
              <span className="w-1.5 h-1.5 rounded-full bg-status-cleared scan-blink" />
              ACTIVE
            </span>
          </div>
          <ScannerVisual size="large" />
        </CornerBracket>
        <p className="absolute bottom-10 left-14 right-14 text-muted-foreground text-xs font-mono">
          Access is limited to authorized Admin and Security Guard accounts. Every session is
          logged.
        </p>
      </div>
    </div>
  )
}
