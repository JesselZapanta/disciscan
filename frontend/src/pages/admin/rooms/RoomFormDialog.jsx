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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import * as roomService from '../../../services/admin/rooms'

const buildings = ['Main Building', 'Asenso Building', 'Annex Building']
const floors = ['1st', '2nd', '3rd']
const types = ['Lecture Room', 'Laboratory', 'Office']
const statuses = ['Active', 'Inactive']

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
        <DialogPopup>
          <DialogTitle>{isEdit ? 'Edit room' : 'Add room'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the room details and status.'
              : 'Create a new room for the facilities module.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">Room number / name</Label>
              <Input
                id="room-name"
                type="text"
                value={form.room_name}
                onChange={(e) => setForm({ ...form, room_name: e.target.value })}
                placeholder="e.g. MB-212, Computer Laboratory 1"
                className="bg-secondary border-border"
              />
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.room_name?.[0] ?? ''}</p>
            </div>

            <div className="space-y-2">
              <Label>Building</Label>
              <Select value={form.building} onValueChange={(value) => setForm({ ...form, building: value })}>
                <SelectTrigger className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground">
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
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.building?.[0] ?? ''}</p>
            </div>

            <div className="space-y-2">
              <Label>Floor</Label>
              <Select value={form.floor} onValueChange={(value) => setForm({ ...form, floor: value })}>
                <SelectTrigger className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground">
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
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.floor?.[0] ?? ''}</p>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                <SelectTrigger className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.type?.[0] ?? ''}</p>
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
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create room'}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}