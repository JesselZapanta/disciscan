import { useState } from 'react'
import { Activity, CalendarDays, Save, Tag } from 'lucide-react'
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

function Field({ label, htmlFor, optional, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
        {label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {children}
      <p className="min-h-[1rem] text-xs text-destructive">{error ?? ''}</p>
    </div>
  )
}

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
        <DialogPopup className="w-full max-w-xl">
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            {isEdit ? 'Edit academic year' : 'Add academic year'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the academic year details and status.'
              : 'Create a new academic year.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            <Section icon={<Tag className="size-3.5" />} title="Details">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Code" htmlFor="academic-year-code" error={errors.code?.[0]}>
                  <Input
                    id="academic-year-code"
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. 261"
                    required
                    className="bg-secondary border-border"
                  />
                </Field>

                <Field label="Description" htmlFor="academic-year-description" error={errors.description?.[0]}>
                  <Input
                    id="academic-year-description"
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. 1ST SEM AY 2026-2027"
                    required
                    className="bg-secondary border-border"
                  />
                </Field>
              </div>
            </Section>

            <Section icon={<Activity className="size-3.5" />} title="Status">
              <Field label="Status" htmlFor="academic-year-status" error={errors.status?.[0]}>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger
                    id="academic-year-status"
                    className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground uppercase"
                  >
                    <SelectValue className="uppercase" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} className="w-[var(--anchor-width)]">
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status} className="uppercase">
                        {status}
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
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create academic year'}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}
