import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo.jsx'
import CornerBracket from '../../components/CornerBracket.jsx'
import ScannerVisual from '../../components/ScannerVisual.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const demoAccounts = [
  { role: 'Admin', email: 'kenley.bronola@example.com' },
  { role: 'Guard', email: 'romel.ondona@example.com' },
]

export default function Login() {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/guard/dashboard', { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    setError('')
    setSubmitting(true)

    try {
      await login(email, password)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Check your credentials.')
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guard.delacruz@tcgc.edu.ph"
                className="h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60"
                autoComplete="email"
              />
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="border border-status-flagged/40 bg-status-flagged/10 rounded px-3 py-2.5 text-xs font-mono text-status-flagged">
                ✕ {error}
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <Label className="flex items-center gap-2 text-muted-foreground font-normal"></Label>
              <a href="#" className="text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-auto bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded hover:bg-primary/80 hover:text-text dark:hover:bg-white dark:hover:text-text transition disabled:opacity-60"
            >
              {submitting ? 'AUTHENTICATING…' : 'AUTHENTICATE →'}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
            <span className="h-px bg-border flex-1" /> DEMO ACCOUNTS{' '}
            <span className="h-px bg-border flex-1" />
          </div>
          <div className="mt-4 space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => {
                  setEmail(account.email)
                  setPassword('password')
                  setError('')
                }}
                className="w-full flex items-center justify-between border border-border rounded px-3 py-2 hover:border-primary/50 hover:bg-secondary transition cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-foreground">{account.role}</span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {account.email} / password
                </span>
              </button>
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
