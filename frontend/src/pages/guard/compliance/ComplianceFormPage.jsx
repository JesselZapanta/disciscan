import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Camera, Check, ClipboardCheck, ImagePlus, Loader2, Save, Search, StickyNote, Trash2, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import CameraCapture from '../../../components/CameraCapture.jsx'
import CornerBracket from '../../../components/CornerBracket.jsx'
import * as complianceService from '../../../services/guard/compliance'
import * as roomService from '../../../services/guard/rooms'
import * as issueService from '../../../services/guard/issues'
import { cn } from '@/lib/utils'

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

function Field({ label, htmlFor, optional, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
        {label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      <p className="min-h-[1rem] text-xs text-destructive">{error ?? ''}</p>
    </div>
  )
}

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
  const fileInputRef = useRef(null)
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
        navigate('/guard/compliance')
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
    setErrors((prev) => {
      const next = { ...prev }
      delete next.issues
      return next
    })
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
    setErrors({})

    if (form.issue_names.length === 0) {
      setErrors({ issues: ['Select at least one issue'] })
      return
    }

    setSaving(true)

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
      navigate('/guard/compliance')
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
            onClick={() => navigate('/guard/compliance')}
            className="size-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary"
            aria-label="Back to compliance records"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest">
              <span className="text-primary">Guard</span>
              <span className="text-muted-foreground"> / </span>
              <span className="text-brand-green">Compliance</span>
              <span className="text-muted-foreground"> / </span>
              <span className="text-muted-foreground">{isEdit ? 'Edit Record' : 'New Record'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-3xl mx-auto">
        {loadingRecord ? (
          <div className="border border-border bg-card rounded-lg py-16 flex items-center justify-center gap-2 text-muted-foreground font-mono text-xs">
            <Loader2 className="size-4 animate-spin" />
            LOADING RECORD…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <CornerBracket className="border border-border bg-card rounded-lg p-4 sm:p-6 space-y-6">
              <Section icon={<ClipboardCheck className="size-3.5" />} title="Room check">
                <Field label="Room" htmlFor="compliance-room" error={errors.room_id?.[0]}>
                  <Popover open={roomOpen} onOpenChange={setRoomOpen}>
                    <PopoverTrigger render={
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={roomOpen}
                        className="w-full min-w-0 justify-between bg-secondary border-border text-xs font-mono text-muted-foreground"
                      >
                        {form.room_label ? (
                          <span className="truncate text-foreground">{form.room_label}</span>
                        ) : (
                          <span className="text-muted-foreground">SEARCH AND SELECT A ROOM…</span>
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
                </Field>
              </Section>

              <Section icon={<Check className="size-3.5" />} title="Findings">
                <Field label="Issues" required error={errors.issues?.[0]}>
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
                </Field>
              </Section>

              <Section icon={<StickyNote className="size-3.5" />} title="Remarks">
                <Field label="Remarks" htmlFor="compliance-remarks" optional error={errors.remarks?.[0]}>
                  <Textarea
                    id="compliance-remarks"
                    rows={3}
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    placeholder="Additional remarks (optional)…"
                    className="bg-secondary border-border text-base sm:text-sm"
                  />
                </Field>
              </Section>

              <Section icon={<ImagePlus className="size-3.5" />} title="Photo evidence">
                <Field
                  label="Photo evidence"
                  error={errors['photo_evidences']?.[0] ?? errors['photo_evidences.0']?.[0] ?? ''}
                >
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

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 bg-secondary border-border"
                      onClick={() => setCameraOpen(true)}
                    >
                      <Camera className="size-4" />
                      CAPTURE PHOTO
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 bg-secondary border-border"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus className="size-4" />
                      UPLOAD PHOTO
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleFiles}
                  />
                  <p className="mt-2 text-[11px] font-mono text-muted-foreground">
                    {newFiles.length + keptPhotos.length} PHOTO{newFiles.length + keptPhotos.length === 1 ? '' : 'S'} — JPG, PNG or WEBP
                  </p>

                  {cameraOpen && (
                    <CameraCapture onCapture={handleCapture} onClose={() => setCameraOpen(false)} />
                  )}
                </Field>
              </Section>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/guard/compliance')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create record'}
                </Button>
              </div>
            </CornerBracket>
          </form>
        )}
      </div>
    </div>
  )
}
