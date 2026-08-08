import { useEffect, useState } from 'react'
import { CheckCircle2, Save } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import * as complianceService from '../../../services/admin/compliance'

const STATUS_OPTIONS = ['Non-Compliant', 'Resolved']

function Section({ icon, title, children }) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  )
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      {children}
      <p className="min-h-[1rem] text-xs text-destructive">{error ?? ''}</p>
    </div>
  )
}

export default function ComplianceStatusDialog({ trigger, compliance, onSaved }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(compliance?.status || 'Resolved')
  const { toast } = useToast()

  useEffect(() => {
    if (open && compliance) setStatus(compliance.status || 'Resolved')
  }, [open, compliance])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      await complianceService.updateCompliance(compliance.id, {
        room_id: compliance.room?.id,
        status,
      })
      setOpen(false)
      onSaved?.(`${compliance.room?.room_name || 'Record'} status`)
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        toast({
          variant: 'error',
          title: 'Update failed',
          description: 'Something went wrong. Please try again.',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="w-full max-w-sm">
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />
            Change compliance status
          </DialogTitle>
          <DialogDescription>
            Update the resolution status for {compliance?.room?.room_name || 'this room'}.
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <Section icon={<CheckCircle2 className="size-3.5" />} title="Resolution status">
              <Field label="Status" htmlFor="compliance-status" error={errors.status?.[0]}>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger
                    id="compliance-status"
                    className="w-full bg-secondary border-border text-sm text-foreground"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} className="w-[var(--anchor-width)]">
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Section>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <DialogClose render={<Button type="button" variant="outline">Cancel</Button>} />
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save status'}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}
