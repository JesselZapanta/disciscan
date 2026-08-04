import { useEffect, useState } from 'react'
import { Camera, Check, Save, Search, Trash2, X } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import * as complianceService from '../../../services/guard/compliance'
import * as roomService from '../../../services/guard/rooms'
import * as issueService from '../../../services/guard/issues'
import { cn } from '@/lib/utils'

export default function ComplianceFormDialog({ trigger, compliance, onSaved }) {
  const isEdit = Boolean(compliance)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [rooms, setRooms] = useState([])
  const [issues, setIssues] = useState([])
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [roomSearch, setRoomSearch] = useState('')
  const [roomOpen, setRoomOpen] = useState(false)
  const [form, setForm] = useState(() => ({
    room_id: compliance?.room?.id || null,
    room_label: compliance?.room
      ? `${compliance.room.room_name} — ${compliance.room.building} (${compliance.room.floor})`
      : '',
    issue_names: compliance?.issues ? compliance.issues.split(', ') : [],
    remarks: compliance?.remarks || '',
  }))
  const [newFiles, setNewFiles] = useState([])
  const [removedPhotoIds, setRemovedPhotoIds] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setIssuesLoading(true)

    roomService.listRooms({ per_page: 100, status: 'Active' }).then((res) => {
      if (!cancelled) setRooms(res.data || [])
    }).catch(() => {})

    issueService.listIssues({ per_page: 100 }).then((res) => {
      if (!cancelled) setIssues(res.data || [])
    }).catch(() => {}).finally(() => {
      if (!cancelled) setIssuesLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [open])

  function resetForm() {
    setForm({
      room_id: compliance?.room?.id || null,
      room_label: compliance?.room
        ? `${compliance.room.room_name} — ${compliance.room.building} (${compliance.room.floor})`
        : '',
      issue_names: compliance?.issues ? compliance.issues.split(', ') : [],
      remarks: compliance?.remarks || '',
    })
    setNewFiles([])
    setRemovedPhotoIds([])
    setRoomSearch('')
    setErrors({})
  }

  function toggleIssue(name) {
    setForm((prev) => ({
      ...prev,
      issue_names: prev.issue_names.includes(name)
        ? prev.issue_names.filter((n) => n !== name)
        : [...prev.issue_names, name],
    }))
  }

  function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    setNewFiles((prev) => [...prev, ...files])
    e.target.value = ''
  }

  function removeNewFile(index) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function removeExistingPhoto(photo) {
    setRemovedPhotoIds((prev) => [...prev, photo.id])
  }

  const filteredRooms = rooms.filter((room) =>
    `${room.room_name} ${room.building} ${room.floor} ${room.type}`.toLowerCase().includes(roomSearch.toLowerCase())
  )

  const keptPhotos = (compliance?.photo_evidences || []).filter(
    (photo) => !removedPhotoIds.includes(photo.id)
  )

  const sortedIssues = [...issues].sort((a, b) => a.name.localeCompare(b.name))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    const payload = new FormData()
    payload.append('room_id', form.room_id ?? '')
    payload.append('issues', form.issue_names.join(', '))
    payload.append('remarks', form.remarks || '')
    newFiles.forEach((file) => payload.append('photo_evidences[]', file))
    removedPhotoIds.forEach((id) => payload.append('remove_photo_ids[]', id))

    try {
      if (isEdit) {
        await complianceService.updateCompliance(compliance.id, payload)
      } else {
        await complianceService.createCompliance(payload)
      }
      setOpen(false)
      onSaved?.(form.room_label || form.issue_names.join(', '), isEdit)
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
          <DialogTitle>{isEdit ? 'Edit compliance record' : 'Add compliance record'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the room check details, issues, and evidence photos.'
              : 'Record a room compliance check with photo evidence.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* Room */}
            <div className="space-y-2">
              <Label>Room</Label>
              <Popover open={roomOpen} onOpenChange={setRoomOpen}>
                <PopoverTrigger render={
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={roomOpen}
                    className="w-full justify-between bg-secondary border-border h-9 px-3 py-1 text-sm text-foreground"
                  >
                    {form.room_label ? (
                      <span>{form.room_label}</span>
                    ) : (
                      <span className="text-muted-foreground">Search and select a room…</span>
                    )}
                    <Search className="size-3.5 opacity-50" />
                  </Button>
                } />
                <PopoverContent align="start" className="w-[var(--popover-anchor-width)] p-0">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                    <Search className="size-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={roomSearch}
                      onChange={(e) => setRoomSearch(e.target.value)}
                      placeholder="Search room, building, floor…"
                      className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60 flex-1"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1">
                    {filteredRooms.length === 0 ? (
                      <p className="px-3 py-6 text-center text-xs text-muted-foreground">No rooms found</p>
                    ) : (
                      filteredRooms.map((room) => {
                        const isSelected = form.room_id === room.id
                        return (
                          <button
                            type="button"
                            key={room.id}
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                room_id: room.id,
                                room_label: `${room.room_name} — ${room.building} (${room.floor})`,
                              }))
                              setRoomOpen(false)
                              setRoomSearch('')
                            }}
                            className={cn(
                              'w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-secondary',
                              isSelected && 'bg-secondary text-primary font-medium'
                            )}
                          >
                            <span className="font-medium text-foreground">{room.room_name}</span>
                            <span className="text-muted-foreground font-mono">
                              {room.building} · {room.floor}
                            </span>
                          </button>
                        )
                      })
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.room_id?.[0] ?? ''}</p>
            </div>

            {/* Issues */}
            <div className="space-y-2">
              <Label>Issues</Label>
              <div className="border border-border rounded-lg bg-secondary/40 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {issuesLoading && issues.length === 0 ? (
                  <div className="col-span-full py-6 text-center text-xs font-mono text-muted-foreground">
                    LOADING ISSUES…
                  </div>
                ) : (
                  sortedIssues.map((issue) => {
                    const checked = form.issue_names.includes(issue.name)
                    return (
                      <label
                        key={issue.id}
                        className={cn(
                          'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs cursor-pointer border transition',
                          checked
                            ? 'border-primary/50 bg-primary/10 text-foreground'
                            : 'border-transparent hover:bg-secondary text-muted-foreground'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleIssue(issue.name)}
                          className="size-4 accent-primary"
                        />
                        <span className="flex-1 min-w-0 truncate">{issue.name}</span>
                        {checked && <Check className="size-3.5 text-primary shrink-0" />}
                      </label>
                    )
                  })
                )}
              </div>
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.issues?.[0] ?? ''}</p>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="compliance-remarks">Remarks</Label>
              <Textarea
                id="compliance-remarks"
                rows={3}
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                placeholder="Additional remarks (optional)…"
                className="bg-secondary border-border"
              />
              <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.remarks?.[0] ?? ''}</p>
            </div>

            {/* Photo evidences */}
            <div className="space-y-2">
              <Label>
                Photo evidence {isEdit ? <span className="text-muted-foreground font-normal">(at least one required on create)</span> : <span className="text-destructive font-normal">(required)</span>}
              </Label>
              <div className="flex flex-wrap gap-2">
                {keptPhotos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.url}
                      alt="Evidence"
                      className="h-20 w-24 object-cover rounded-md border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(photo)}
                      className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
                      aria-label="Remove photo"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {removedPhotoIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setRemovedPhotoIds([])}
                    className="h-20 px-3 rounded-md border border-dashed border-border text-[10px] font-mono text-muted-foreground hover:text-primary hover:border-primary flex items-center justify-center gap-1"
                  >
                    <Trash2 className="size-3.5" />
                    UNDO
                    <br />
                    REMOVED
                  </button>
                )}
                {newFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-20 w-24 object-cover rounded-md border border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
                      aria-label="Remove photo"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                <label className="h-20 w-24 rounded-md border border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary hover:border-primary cursor-pointer">
                  <Camera className="size-4" />
                  <span className="text-[10px] font-mono">ADD PHOTO</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleFiles}
                  />
                </label>
              </div>
              <p className="min-h-[1rem] text-xs text-destructive mt-1">
                {errors['photo_evidences']?.[0] ?? errors['photo_evidences.0']?.[0] ?? ''}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create record'}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}