import { useState } from 'react'
import { CalendarDays, Save } from 'lucide-react'
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
import * as academicYearService from '../../../services/admin/academicYears'

const statuses = ['active', 'inactive']

export default function AcademicYearFormDialog({ trigger, academicYear, onSaved }) {
  const isEdit = Boolean(academicYear)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(() => ({
    code: academicYear?.code || '',
    description: academicYear?.description || '',
    status: academicYear?.status || 'inactive',
  }))
  const { toast } = useToast()

  function resetForm() {
    setForm({
      code: academicYear?.code || '',
      description: academicYear?.description || '',
      status: academicYear?.status || 'inactive',
    })
    setErrors({})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    const payload = {
      code: form.code,
      description: form.description,
      status: form.status,
    }

    try {
      if (isEdit) {
        await academicYearService.updateAcademicYear(academicYear.id, payload)
      } else {
        await academicYearService.createAcademicYear(payload)
      }
      setOpen(false)
      onSaved?.(form.code.trim(), isEdit)
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

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) resetForm()
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="w-full max-w-lg">
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            {isEdit ? 'Edit academic year' : 'Add academic year'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the academic year details and status.'
              : 'Create a new academic year.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label htmlFor="academic-year-code">Code</Label>
              <Input
                id="academic-year-code"
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. 261"
                className="bg-secondary border-border"
              />
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.code?.[0] ?? ''}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="academic-year-description">Description</Label>
              <Input
                id="academic-year-description"
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. 1ST SEM AY 2026-2027"
                className="bg-secondary border-border"
              />
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.description?.[0] ?? ''}</p>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                <SelectTrigger className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status}
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
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create academic year'}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}