import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CornerBracket from '../../components/CornerBracket.jsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const violationTypes = ['Incomplete uniform', 'No ID worn', 'Late arrival', 'Other']

export default function ViolationForm() {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState('Incomplete uniform')

  return (
    <div className="min-h-screen dot-grid flex items-center justify-center py-14 px-4">
      <div className="w-full max-w-lg">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/guard')}
          className="h-auto! p-0 text-muted-foreground hover:text-foreground text-sm mb-5"
        >
          ← Back to console
        </Button>
        <CornerBracket className="border border-border bg-card rounded-lg p-7">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-[11px] text-brand-green uppercase tracking-widest">
              New Record
            </span>
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-status-flagged/15 text-status-flagged border border-status-flagged/30">
              VIOLATION
            </span>
          </div>

          {/* scanned identity */}
          <div className="flex items-center gap-3.5 bg-secondary border border-border rounded-lg p-4 mb-6">
            <div className="w-14 h-14 rounded bg-border shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground">Marielle A. Sombilon</div>
              <div className="text-muted-foreground text-xs font-mono mt-0.5">
                BSCS-3B · ID 22-01147
              </div>
            </div>
            <span className="text-[10px] font-mono text-status-cleared shrink-0">
              ✓ QR VERIFIED
            </span>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide">
                Violation type
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {violationTypes.map((type) => (
                  <label
                    key={type}
                    className={cn(
                      'flex items-center gap-2 border rounded px-3 py-2.5 text-sm cursor-pointer transition',
                      selectedType === type
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border hover:border-muted-foreground'
                    )}
                  >
                    <input
                      type="radio"
                      name="vtype"
                      value={type}
                      checked={selectedType === type}
                      onChange={() => setSelectedType(type)}
                      className="accent-[#F5A623]"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide">
                Location
              </label>
              <Input
                type="text"
                placeholder="Main gate"
                className="h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide">
                Remarks (optional)
              </label>
              <textarea
                rows="3"
                placeholder="Add any additional notes for this record…"
                className="w-full bg-secondary border border-input focus:border-ring outline-none rounded px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition resize-none"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-t border-border pt-4">
              <span>Date / Time</span>
              <span className="text-foreground">Jul 31, 2026 · 08:14:02</span>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/guard')}
                className="flex-1 h-auto border-border rounded py-3.5 text-sm font-semibold hover:border-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={() => navigate('/guard')}
                className="flex-1 h-auto bg-primary text-primary-foreground rounded py-3.5 text-sm font-bold hover:bg-primary/80 hover:text-text dark:hover:bg-white dark:hover:text-text transition"
              >
                Save Record
              </Button>
            </div>
          </form>
        </CornerBracket>
      </div>
    </div>
  )
}
