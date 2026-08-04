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
      onSaved?.(`${compliance.room?.room_name || 'Record'} status`, true)
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
        <DialogPopup className="w-full max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />
            Change compliance status
          </DialogTitle>
          <DialogDescription>
            Update the resolution status for {compliance?.room?.room_name || 'this room'}.
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full bg-secondary border-border h-9 px-3 py-1 text-sm text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.status?.[0] ?? ''}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
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
