import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Camera, Check, ClipboardCheck, ImagePlus, Loader2, Save, Search, Trash2, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import CameraCapture from '../../../components/CameraCapture.jsx'
import * as complianceService from '../../../services/admin/compliance'
import * as roomService from '../../../services/admin/rooms'
import * as issueService from '../../../services/admin/issues'
import { cn } from '@/lib/utils'

export default function ComplianceFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [saving, setSaving] = useState(false)
  const [loadingRecord, setLoadingRecord] = useState(isEdit)
  const [errors, setErrors] = useState({})
  const [rooms, setRooms] = useState([])
  const [issues, setIssues] = useState([])
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [roomSearch, setRoomSearch] = useState('')
  const [roomOpen, setRoomOpen] = useState(false)
  const [form, setForm] = useState({
    room_id: null,
    room_label: '',
    issue_names: [],
    remarks: '',
  })
  const [existingPhotos, setExistingPhotos] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [removedPhotoIds, setRemovedPhotoIds] = useState([])
  const [cameraOpen, setCameraOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
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

    if (isEdit) {
      complianceService.getCompliance(id).then((record) => {
        if (cancelled) return
        setForm({
          room_id: record.room?.id || null,
          room_label: record.room
            ? `${record.room.room_name} — ${record.room.building} (${record.room.floor})`
            : '',
          issue_names: record.issues ? record.issues.split(', ') : [],
          remarks: record.remarks || '',
        })
        setExistingPhotos(record.photo_evidences || [])
      }).catch(() => {
        if (cancelled) return
        toast({
          variant: 'error',
          title: 'Load failed',
          description: 'Could not load the compliance record.',
        })
        navigate('/admin/compliance')
      }).finally(() => {
        if (!cancelled) setLoadingRecord(false)
      })
    }

    return () => {
      cancelled = true
    }
  }, [id, isEdit, toast, navigate])

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

  function handleCapture(file) {
    setNewFiles((prev) => [...prev, file])
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

  const keptPhotos = existingPhotos.filter((photo) => !removedPhotoIds.includes(photo.id))

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
    removedPhotoIds.forEach((photoId) => payload.append('remove_photo_ids[]', photoId))

    try {
      if (isEdit) {
        await complianceService.updateCompliance(id, payload)
      } else {
        await complianceService.createCompliance(payload)
      }
      toast({
        variant: 'success',
        title: isEdit ? 'Compliance record updated' : 'Compliance record created',
        description: `Record for ${form.room_label || 'the room'} was ${isEdit ? 'updated' : 'created'} successfully.`,
      })
      navigate('/admin/compliance')
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
    <div className="min-h-full dot-grid">
      <header className="border-b border-border px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/compliance')}
            className="size-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary"
            aria-label="Back to compliance records"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest">
              <span className="text-primary">Admin</span>
              <span className="text-muted-foreground"> / </span>
              <span className="text-brand-green">Compliance</span>
              <span className="text-muted-foreground"> / </span>
              <span className="text-muted-foreground">{isEdit ? 'Edit Record' : 'New Record'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-3xl">
        {loadingRecord ? (
          <div className="border border-border bg-card rounded-lg py-16 flex items-center justify-center gap-2 text-muted-foreground font-mono text-xs">
            <Loader2 className="size-4 animate-spin" />
            LOADING RECORD…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border border-border bg-card rounded-lg p-4 sm:p-6 space-y-6">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Room check</h2>
              </div>

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
                      className="w-full min-w-0 justify-between bg-secondary border-border h-9 px-3 py-1 text-sm text-foreground"
                    >
                      {form.room_label ? (
                        <span className="truncate">{form.room_label}</span>
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
                        className="bg-transparent outline-none text-base sm:text-sm text-foreground placeholder:text-muted-foreground/60 flex-1"
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
                <p className="min-h-[1rem] text-xs text-destructive">{errors.room_id?.[0] ?? ''}</p>
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
                <p className="min-h-[1rem] text-xs text-destructive">{errors.issues?.[0] ?? ''}</p>
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
                  className="bg-secondary border-border text-base sm:text-sm"
                />
                <p className="min-h-[1rem] text-xs text-destructive">{errors.remarks?.[0] ?? ''}</p>
              </div>

              {/* Photo evidence */}
              <div className="space-y-3">
                <Label>
                  Photo evidence{' '}
                  {isEdit ? (
                    <span className="text-muted-foreground font-normal">(at least one required)</span>
                  ) : (
                    <span className="text-destructive font-normal">(required)</span>
                  )}
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
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto justify-center gap-2 bg-secondary border-border"
                    onClick={() => setCameraOpen(true)}
                  >
                    <Camera className="size-4" />
                    CAPTURE PHOTO
                  </Button>
                  <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-input bg-input/20 px-3 py-2 text-sm font-medium transition-colors hover:bg-input/40 cursor-pointer">
                    <ImagePlus className="size-4" />
                    UPLOAD PHOTO
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleFiles}
                    />
                  </label>
                  <p className="text-[11px] font-mono text-muted-foreground sm:ml-1">
                    {newFiles.length + keptPhotos.length} PHOTO{newFiles.length + keptPhotos.length === 1 ? '' : 'S'}
                  </p>
                </div>

                {cameraOpen && (
                  <CameraCapture onCapture={handleCapture} onClose={() => setCameraOpen(false)} />
                )}

                <p className="min-h-[1rem] text-xs text-destructive">
                  {errors['photo_evidences']?.[0] ?? errors['photo_evidences.0']?.[0] ?? ''}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm sm:static sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/compliance')} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="w-full sm:w-auto gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create record'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
