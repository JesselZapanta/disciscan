import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, KeyRound } from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import CornerBracket from '../../components/CornerBracket.jsx'
import ScannerVisual from '../../components/ScannerVisual.jsx'
import { forgotPassword } from '../../services/auth.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    setError('')
    setSubmitting(true)

    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send the reset link. Please try again.')
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
          <h1 className="text-3xl font-extrabold mb-2 text-foreground">Reset your password</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Enter the email address linked to your account and we&apos;ll send you a secure link to
            set a new password.
          </p>

          {sent ? (
            <div className="border border-status-cleared/40 bg-status-cleared/10 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-status-cleared" />
                <span className="text-xs font-mono uppercase tracking-wide text-status-cleared">
                  LINK SENT
                </span>
              </div>
              <p className="text-sm text-foreground">
                If <span className="font-semibold text-primary break-all">{email}</span> exists in
                our records, a password reset link is on its way. It expires in 60 minutes.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Check your spam or junk folder if it doesn&apos;t arrive in a few minutes.
              </p>
              <Link
                to="/login"
                className="mt-5 inline-flex items-center gap-2 text-xs font-mono text-primary hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> BACK TO SIGN IN
              </Link>
            </div>
          ) : (
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
                  autoFocus
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
                {submitting ? 'SENDING…' : 'SEND RESET LINK →'}
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
          Password reset links are single-use, expire after 60 minutes, and never reveal whether an
          account exists.
        </p>
      </div>
    </div>
  )
}
