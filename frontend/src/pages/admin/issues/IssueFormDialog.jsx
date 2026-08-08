import { useState } from 'react'
import { Activity, Save, TriangleAlert } from 'lucide-react'
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
import * as issueService from '../../../services/admin/issues'

const statuses = ['Active', 'Inactive']

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

export default function IssueFormDialog({ trigger, issue, onSaved }) {
  const isEdit = Boolean(issue)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(() => ({
    name: issue?.name || '',
    description: issue?.description || '',
    status: issue?.status || 'Active',
  }))
  const { toast } = useToast()

  function resetForm() {
    setForm({
      name: issue?.name || '',
      description: issue?.description || '',
      status: issue?.status || 'Active',
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
      status: form.status,
    }

    try {
      if (isEdit) {
        await issueService.updateIssue(issue.id, payload)
      } else {
        await issueService.createIssue(payload)
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
            <TriangleAlert className="size-5 text-primary" />
            {isEdit ? 'Edit issue' : 'Add issue'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the issue details and status.'
              : 'Create a new issue for the facilities module.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            <Section icon={<TriangleAlert className="size-3.5" />} title="Details">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Name" htmlFor="issue-name" error={errors.name?.[0]}>
                    <Input
                      id="issue-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Lights left on"
                      required
                      className="bg-secondary border-border"
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Description" htmlFor="issue-description" optional error={errors.description?.[0]}>
                    <Textarea
                      id="issue-description"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe the issue…"
                      className="bg-secondary border-border"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section icon={<Activity className="size-3.5" />} title="Status">
              <Field label="Status" htmlFor="issue-status" error={errors.status?.[0]}>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger
                    id="issue-status"
                    className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground"
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
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create issue'}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}
