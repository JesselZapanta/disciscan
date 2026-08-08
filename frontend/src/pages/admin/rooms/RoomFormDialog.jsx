import { useState } from 'react'
import { DoorOpen, MapPin, Save, Tag } from 'lucide-react'
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
import * as roomService from '../../../services/admin/rooms'

const buildings = ['Main Building', 'Asenso Building', 'Annex Building']
const floors = ['1st', '2nd', '3rd']
const types = ['Lecture Room', 'Laboratory', 'Office']
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

export default function RoomFormDialog({ trigger, room, onSaved }) {
  const isEdit = Boolean(room)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(() => ({
    room_name: room?.room_name || '',
    building: room?.building || '',
    floor: room?.floor || '',
    type: room?.type || '',
    status: room?.status || 'Active',
  }))
  const { toast } = useToast()

  function resetForm() {
    setForm({
      room_name: room?.room_name || '',
      building: room?.building || '',
      floor: room?.floor || '',
      type: room?.type || '',
      status: room?.status || 'Active',
    })
    setErrors({})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    const payload = {
      room_name: form.room_name,
      building: form.building,
      floor: form.floor,
      type: form.type,
      status: form.status,
    }

    try {
      if (isEdit) {
        await roomService.updateRoom(room.id, payload)
      } else {
        await roomService.createRoom(payload)
      }
      setOpen(false)
      onSaved?.(form.room_name.trim(), isEdit)
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
            <DoorOpen className="size-5 text-primary" />
            {isEdit ? 'Edit room' : 'Add room'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the room details and status.'
              : 'Create a new room for the facilities module.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            <Section icon={<Tag className="size-3.5" />} title="Room">
              <Field label="Room number / name" htmlFor="room-name" error={errors.room_name?.[0]}>
                <Input
                  id="room-name"
                  type="text"
                  value={form.room_name}
                  onChange={(e) => setForm({ ...form, room_name: e.target.value })}
                  placeholder="e.g. MB-212, Computer Laboratory 1"
                  required
                  className="bg-secondary border-border"
                />
              </Field>
            </Section>

            <Section icon={<MapPin className="size-3.5" />} title="Location & Status">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Building" htmlFor="room-building" error={errors.building?.[0]}>
                  <Select value={form.building} onValueChange={(value) => setForm({ ...form, building: value })}>
                    <SelectTrigger
                      id="room-building"
                      className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground"
                    >
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map((building) => (
                        <SelectItem key={building} value={building}>
                          {building}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Floor" htmlFor="room-floor" error={errors.floor?.[0]}>
                  <Select value={form.floor} onValueChange={(value) => setForm({ ...form, floor: value })}>
                    <SelectTrigger
                      id="room-floor"
                      className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground"
                    >
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {floors.map((floor) => (
                        <SelectItem key={floor} value={floor}>
                          {floor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Type" htmlFor="room-type" error={errors.type?.[0]}>
                  <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                    <SelectTrigger
                      id="room-type"
                      className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground"
                    >
                      <SelectValue className="uppercase" placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} className="w-[var(--anchor-width)]">
                      {types.map((type) => (
                        <SelectItem key={type} value={type} className="uppercase">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Status" htmlFor="room-status" error={errors.status?.[0]}>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                    <SelectTrigger
                      id="room-status"
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
              </div>
            </Section>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <DialogClose render={<Button type="button" variant="outline">Cancel</Button>} />
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create room'}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}
