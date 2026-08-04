import { useState } from 'react'
import { Save } from 'lucide-react'
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
        <DialogPopup>
          <DialogTitle>{isEdit ? 'Edit issue' : 'Add issue'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the issue details and status.'
              : 'Create a new issue for the facilities module.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issue-name">Name</Label>
              <Input
                id="issue-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Lights left on"
                className="bg-secondary border-border"
              />
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.name?.[0] ?? ''}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-description">Description</Label>
              <Textarea
                id="issue-description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue…"
                className="bg-secondary border-border"
              />
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.description?.[0] ?? ''}</p>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                <SelectTrigger className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
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
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create issue'}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}