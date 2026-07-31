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
import * as violationTypeService from '../../../services/admin/violationTypes'

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
        <DialogPopup>
          <DialogTitle>{isEdit ? 'Edit violation type' : 'Add violation type'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the violation type details and status.'
              : 'Create a new violation type for the records module.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vt-name">Name</Label>
              <Input
                id="vt-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Incomplete uniform"
                className="bg-secondary border-border"
              />
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.name?.[0] ?? ''}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vt-description">Description</Label>
              <Textarea
                id="vt-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What counts as this violation?"
                rows={3}
                className="bg-secondary border-border resize-none"
              />
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.description?.[0] ?? ''}</p>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.is_active} onValueChange={(value) => setForm({ ...form, is_active: value })}>
                <SelectTrigger className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">ACTIVE</SelectItem>
                  <SelectItem value="inactive">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.is_active?.[0] ?? ''}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
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
