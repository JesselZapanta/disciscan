import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../../components/Logo.jsx'
import CornerBracket from '../../components/CornerBracket.jsx'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

const qrPattern = [
  [1, 0, 1, 1, 0, 1],
  [0, 1, 0, 1, 1, 0],
  [1, 0, 1, 0, 1, 1],
  [1, 1, 0, 1, 0, 0],
  [0, 1, 1, 0, 1, 1],
  [1, 0, 1, 1, 0, 1],
]

const visitPurposes = [
  'Meeting with faculty/staff',
  'Parent / guardian visit',
  'Delivery',
  'Event attendance',
  'Other',
]

export default function VisitorRegistration() {
  const [qrRevealed, setQrRevealed] = useState(false)

  return (
    <div className="min-h-screen dot-grid flex items-center justify-center py-14 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <Logo size={28} />
              <span className="font-mono font-bold tracking-widest text-sm">
                <span className="text-primary">DISCI</span>
                <span className="text-brand-green">SCAN</span>
              </span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Visitor registration</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Complete this form to generate your entry QR code. Show it at the gate.
          </p>
        </div>

        <CornerBracket className="border border-border bg-card rounded-lg p-7">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
                  Full name
                </label>
                <Input
                  type="text"
                  placeholder="Juan Dela Cruz"
                  className="h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
                  Contact number
                </label>
                <Input
                  type="text"
                  placeholder="09XX XXX XXXX"
                  className="h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
                Purpose of visit
              </label>
              <Select defaultValue="">
                <SelectTrigger className="w-full h-auto bg-secondary border-border rounded px-4 py-3 text-sm text-muted-foreground">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {visitPurposes.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
                Person / office to visit
              </label>
              <Input
                type="text"
                placeholder="e.g. Registrar's Office"
                className="h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
                Valid ID type
              </label>
              <Input
                type="text"
                placeholder="e.g. Driver's License"
                className="h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60"
              />
            </div>

            {!qrRevealed && (
              <button
                type="button"
                onClick={() => setQrRevealed(true)}
                className="w-full bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded hover:bg-primary/80 hover:text-text dark:hover:bg-white dark:hover:text-text transition"
              >
                Generate My QR Code →
              </button>
            )}
          </form>

          {/* QR reveal state */}
          {qrRevealed && (
            <div className="mt-6 pt-6 border-t border-border text-center">
              <span className="text-[11px] font-mono text-status-cleared uppercase tracking-widest">
                ✓ Registration complete
              </span>
              <div className="mt-4 mx-auto w-40 h-40 bg-background border border-border rounded-lg grid grid-cols-6 grid-rows-6 gap-0.5 p-3">
                {qrPattern.flat().map((cell, i) => (
                  <div key={i} className={cell ? 'bg-foreground' : ''} />
                ))}
              </div>
              <p className="text-muted-foreground text-xs font-mono mt-4">
                VIS-00220 · Valid for today only
              </p>
              <button className="mt-4 text-xs font-mono border border-border px-4 py-2 rounded text-foreground hover:border-primary hover:text-primary transition">
                ↓ SAVE TO PHONE
              </button>
            </div>
          )}
        </CornerBracket>
      </div>
    </div>
  )
}
