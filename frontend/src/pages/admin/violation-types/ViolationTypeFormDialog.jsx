import { useState } from 'react'
import { Activity, ListChecks, Save } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import * as violationTypeService from '../../../services/admin/violationTypes'

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

export default function ViolationTypeFormDialog({ trigger, violationType, onSaved }) {
  const isEdit = Boolean(violationType)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(() => ({
    name: violationType?.name || '',
    description: violationType?.description || '',
    is_active: violationType ? (violationType.is_active ? 'active' : 'inactive') : 'active',
  }))
  const { toast } = useToast()

  function resetForm() {
    setForm({
      name: violationType?.name || '',
      description: violationType?.description || '',
      is_active: violationType ? (violationType.is_active ? 'active' : 'inactive') : 'active',
    })
    setErrors({})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    const payload = {
      name: form.name,
      description: form.description,
      is_active: form.is_active === 'active',
    }

    try {
      if (isEdit) {
        await violationTypeService.updateViolationType(violationType.id, payload)
      } else {
        await violationTypeService.createViolationType(payload)
      }
      setOpen(false)
      onSaved?.(form.name.trim(), isEdit)
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
            <ListChecks className="size-5 text-primary" />
            {isEdit ? 'Edit violation type' : 'Add violation type'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the violation type details and status.'
              : 'Create a new violation type for the records module.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            <Section icon={<ListChecks className="size-3.5" />} title="Details">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Name" htmlFor="vt-name" error={errors.name?.[0]}>
                    <Input
                      id="vt-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Incomplete uniform"
                      required
                      className="bg-secondary border-border"
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Description" htmlFor="vt-description" optional error={errors.description?.[0]}>
                    <Textarea
                      id="vt-description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="What counts as this violation?"
                      rows={3}
                      className="bg-secondary border-border resize-none"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section icon={<Activity className="size-3.5" />} title="Status">
              <Field label="Status" htmlFor="vt-status" error={errors.is_active?.[0]}>
                <Select value={form.is_active} onValueChange={(value) => setForm({ ...form, is_active: value })}>
                  <SelectTrigger
                    id="vt-status"
                    className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground"
                  >
                    <SelectValue className="uppercase" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} className="w-[var(--anchor-width)]">
                    <SelectItem value="active">ACTIVE</SelectItem>
                    <SelectItem value="inactive">INACTIVE</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </Section>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <DialogClose render={<Button type="button" variant="outline">Cancel</Button>} />
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create type'}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}
