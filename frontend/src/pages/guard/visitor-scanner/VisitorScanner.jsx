import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Html5Qrcode } from 'html5-qrcode'
import {
  BadgeCheck,
  CheckCircle2,
  CircleUserRound,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  RefreshCcw,
  Save,
  ScanLine,
  Search,
  TriangleAlert,
  UserPlus,
  Video,
  X,
} from 'lucide-react'
import CornerBracket from '../../../components/CornerBracket.jsx'
import ScannerVisual from '../../../components/ScannerVisual.jsx'
import VisitorDetailsForm from './VisitorDetailsForm.jsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  checkInVisitor,
  checkOutVisitor,
  lookupVisitor,
  updateVisitor,
} from '../../../services/guard/visitors.js'
import { playFailure, playSuccess, unlockAudio } from '../../../utils/scannerSounds.js'

const statusConfig = {
  pending: { label: 'PENDING', chip: 'text-status-pending border-status-pending/40 bg-status-pending/10', dot: 'bg-status-pending' },
  checked_in: { label: 'CHECKED IN', chip: 'text-status-cleared border-status-cleared/40 bg-status-cleared/10', dot: 'bg-status-cleared' },
  checked_out: { label: 'CHECKED OUT', chip: 'text-info border-info/40 bg-info/10', dot: 'bg-info' },
}

const statusFallback = { label: 'UNKNOWN', chip: 'text-muted-foreground border-border bg-secondary/60', dot: 'bg-muted-foreground/50' }

function formatTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function todayString() {
  return format(new Date(), 'yyyy-MM-dd')
}

function parseDecodedText(text) {
  try {
    const data = JSON.parse(text)
    if (data && typeof data.record_no === 'string') {
      return data.record_no.trim()
    }
  } catch {
    // fall through to raw text
  }
  const raw = String(text).trim()
  return /^(VIS-\d+|\d+)$/i.test(raw) ? raw : null
}

function prefillForm(visitor) {
  return {
    fullname: visitor.fullname || '',
    contact: visitor.contact || '',
    purpose: visitor.purpose || '',
    purpose_other: visitor.purpose_other || '',
    person_office_to_visit: visitor.person_office_to_visit || '',
    id_type: visitor.id_type || '',
    id_number: visitor.id_number || '',
    visit_date: visitor.visit_date ? new Date(`${visitor.visit_date}T00:00:00`) : null,
  }
}

export default function VisitorScanner() {
  const navigate = useNavigate()
  const location = useLocation()

  const scannerRef = useRef(null)
  const modeRef = useRef('idle')
  const lookupTimerRef = useRef(null)
  const lastLookupRef = useRef('')
  const prefilledRecordRef = useRef('')
  const [mode, setMode] = useState('idle')
  const [scanType, setScanType] = useState('in')
  const [visitor, setVisitor] = useState(null)
  const [capturedShot, setCapturedShot] = useState(null)
  const [scanError, setScanError] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [form, setForm] = useState(prefillForm({}))
  const [formErrors, setFormErrors] = useState({})

  const visitDateValue = form.visit_date ? format(form.visit_date, 'yyyy-MM-dd') : null
  const isVisitDateToday = visitDateValue === todayString()

  function updateMode(next) {
    modeRef.current = next
    setMode(next)
  }

  useEffect(() => {
    return () => {
      clearTimeout(lookupTimerRef.current)
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    const recordNo = location.state?.recordNo
    if (!recordNo || prefilledRecordRef.current === recordNo) return
    prefilledRecordRef.current = recordNo
    setManualInput(recordNo)
    lookupByRecord(recordNo)
  }, [location.state])

  async function startScanner() {
    unlockAudio()
    setScanError('')
    updateMode('scanning')
    requestAnimationFrame(async () => {
      if (modeRef.current !== 'scanning') return
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader')
      }
      if (scannerRef.current.isScanning) return
      try {
        await scannerRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          handleDecoded,
          () => {}
        )
      } catch {
        if (modeRef.current === 'scanning') {
          updateMode('idle')
          setScanError('Camera unavailable. Allow camera access or enter the record number manually.')
        }
      }
    })
  }

  async function stopScanner() {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop()
      } catch {
        // ignore stop errors
      }
    }
  }

  async function cancelScan() {
    await stopScanner()
    if (modeRef.current === 'scanning') {
      updateMode('idle')
    }
  }

  function captureFrame() {
    try {
      const video =
        scannerRef.current?.getVideoElement?.() || document.querySelector('#qr-reader video')
      if (!video || !video.videoWidth) return null
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0)
      return canvas.toDataURL('image/jpeg', 0.8)
    } catch {
      return null
    }
  }

  async function handleDecoded(decodedText) {
    const shot = captureFrame()
    await stopScanner()
    const recordNo = parseDecodedText(decodedText)
    if (!recordNo) {
      playFailure()
      updateMode('idle')
      setScanError('Unrecognized QR. Please scan a DisciScan entry pass.')
      return
    }
    await lookupByRecord(recordNo, shot)
  }

  async function lookupByRecord(recordNo, shot = null) {
    updateMode('processing')
    setScanError('')
    try {
      const data = await lookupVisitor(recordNo)
      setVisitor(data)
      setCapturedShot(shot)
      setForm(prefillForm(data))
      setFormErrors({})
      setScanType(data.status === 'checked_in' ? 'out' : 'in')
      playSuccess()
      updateMode('result')
    } catch (err) {
      playFailure()
      setCapturedShot(null)
      const status = err.response?.status
      if (status === 404) {
        setScanError('No visitor record found for this QR.')
      } else if (status === 422) {
        setScanError('Invalid record number.')
      } else {
        setScanError('Lookup failed. Check your connection and try again.')
      }
      updateMode('idle')
    }
  }

  const update = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function isDirty() {
    const current = prefillForm(visitor)
    const visitDate = form.visit_date ? format(form.visit_date, 'yyyy-MM-dd') : null
    const currentDate = current.visit_date ? format(current.visit_date, 'yyyy-MM-dd') : null
    return (
      form.fullname !== current.fullname ||
      form.contact !== current.contact ||
      form.purpose !== current.purpose ||
      form.purpose_other !== current.purpose_other ||
      form.person_office_to_visit !== current.person_office_to_visit ||
      form.id_type !== current.id_type ||
      form.id_number !== current.id_number ||
      visitDate !== currentDate
    )
  }

  function buildPayload() {
    return {
      fullname: form.fullname,
      contact: form.contact.replace(/[\s()-]/g, ''),
      purpose: form.purpose,
      purpose_other: form.purpose === 'Other' ? form.purpose_other : null,
      person_office_to_visit: form.person_office_to_visit,
      id_type: form.id_type,
      id_number: form.id_number,
      visit_date: form.visit_date ? format(form.visit_date, 'yyyy-MM-dd') : null,
    }
  }

  async function handleCheckIn() {
    if (!visitor || !isVisitDateToday) return
    setActionLoading(true)
    setScanError('')
    try {
      let current = visitor
      if (isDirty()) {
        current = await updateVisitor(visitor.id, buildPayload())
      }
      const updated = await checkInVisitor(current.id)
      setVisitor(updated)
      setForm(prefillForm(updated))
      playSuccess()
    } catch (err) {
      playFailure()
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors || {})
        setScanError('Some details are invalid. Fix them and try again.')
      } else {
        setScanError(err.response?.data?.message || 'Check-in failed. Try again.')
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCheckOut() {
    if (!visitor || !isVisitDateToday) return
    setActionLoading(true)
    setScanError('')
    try {
      let current = visitor
      if (isDirty()) {
        current = await updateVisitor(visitor.id, buildPayload())
      }
      const updated = await checkOutVisitor(current.id)
      setVisitor(updated)
      setForm(prefillForm(updated))
      playSuccess()
    } catch (err) {
      playFailure()
      setScanError(err.response?.data?.message || 'Check-out failed. Try again.')
    } finally {
      setActionLoading(false)
    }
  }

  function resetScan() {
    setVisitor(null)
    setCapturedShot(null)
    setScanError('')
    setFormErrors({})
    updateMode('idle')
    setManualInput('')
  }

  function handleManualChange(e) {
    const value = e.target.value
    setManualInput(value)
    clearTimeout(lookupTimerRef.current)
    const trimmed = value.trim()
    if (!trimmed) {
      setScanError('')
      lastLookupRef.current = ''
      return
    }
    lookupTimerRef.current = setTimeout(() => {
      if (trimmed === lastLookupRef.current || modeRef.current !== 'idle') return
      lastLookupRef.current = trimmed
      lookupByRecord(trimmed)
    }, 600)
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    const value = manualInput.trim()
    if (!value) return
    lastLookupRef.current = value
    lookupByRecord(value)
  }

  const status = visitor ? statusConfig[visitor.status] || statusFallback : null

  return (
    <div>
      {/* page header */}
      <div className="border-b border-border px-6 lg:px-10 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest">
            <span className="text-primary">Guard</span>
            <span className="text-muted-foreground"> / </span>
            <span className="text-brand-green">Visitor Scanner</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-foreground">Visitor scanner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pick scan type, scan an entry pass, then record the visitor&apos;s time in or out.
          </p>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-6">
        <div className="grid gap-6 lg:grid-cols-5 items-start">
          {/* scanner panel */}
          <div className="lg:col-span-2">
            {/* scan type selector */}
            <div className="grid grid-cols-2 gap-1.5 border border-border bg-secondary/50 rounded-xl p-1.5 mb-4">
              <button
                type="button"
                onClick={() => setScanType('in')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-mono font-bold transition',
                  scanType === 'in'
                    ? 'bg-status-cleared text-white'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LogIn className="size-4" /> CHECK IN
              </button>
              <button
                type="button"
                onClick={() => setScanType('out')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-mono font-bold transition',
                  scanType === 'out'
                    ? 'bg-info text-white'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LogOut className="size-4" /> CHECK OUT
              </button>
            </div>

            <CornerBracket className="rounded-xl overflow-hidden">
              <div className="relative w-full h-80 lg:h-[420px] overflow-hidden rounded-xl bg-black">
                {mode === 'idle' && (
                  <div className="absolute inset-0 flex items-center justify-center p-1.5 bg-background">
                    <ScannerVisual size="fill" className="w-full h-full" />
                  </div>
                )}

                {mode === 'scanning' && (
                  <>
                    <div
                      id="qr-reader"
                      className="absolute inset-0 w-full h-full overflow-hidden rounded-xl bg-black [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_video]:object-center"
                    />
                    <div aria-hidden="true" className="scanner-scanline" />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={cancelScan}
                      aria-label="Cancel scan"
                      className="absolute top-2 right-2 z-10 size-8 p-0 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-foreground hover:bg-background"
                    >
                      <X className="size-4" />
                    </Button>
                  </>
                )}

                {mode === 'processing' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm">
                    <Loader2 className="size-7 text-brand-green animate-spin" />
                    <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
                      LOOKING UP VISITOR…
                    </span>
                  </div>
                )}

                {mode === 'result' && visitor && (
                  capturedShot ? (
                    <img
                      src={capturedShot}
                      alt="Captured scan frame"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 backdrop-blur-sm">
                      <CheckCircle2 className="size-7 text-status-cleared" />
                      <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
                        SCAN COMPLETE
                      </span>
                    </div>
                  )
                )}
              </div>
              <span className="absolute bottom-3 left-0 right-0 text-center text-[10px] font-mono text-muted-foreground">
                {mode === 'scanning' ? 'HOLD STILL — SCANNING' : 'POSITION QR WITHIN FRAME'}
              </span>
            </CornerBracket>

            {/* scan button + manual lookup alternative */}
            <div className="mt-4 space-y-3">
              {mode === 'idle' && (
                <Button
                  type="button"
                  onClick={startScanner}
                  className="pulse w-full h-auto! bg-primary text-primary-foreground font-mono font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/80 hover:text-text dark:hover:bg-white dark:hover:text-text"
                >
                  <ScanLine className="size-4" /> TAP TO SCAN
                </Button>
              )}
              {mode === 'scanning' && (
                <Button
                  type="button"
                  onClick={cancelScan}
                  className="w-full h-auto! bg-secondary text-foreground font-mono font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/80"
                >
                  <Video className="size-4" /> STOP SCANNING
                </Button>
              )}
              {mode === 'processing' && (
                <Button
                  type="button"
                  disabled
                  className="w-full h-auto! bg-secondary text-muted-foreground font-mono font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Loader2 className="size-4 animate-spin" /> LOOKING UP…
                </Button>
              )}
              {mode === 'result' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetScan}
                  className="w-full h-auto! font-mono font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="size-4" /> SCAN ANOTHER
                </Button>
              )}

              {/* manual lookup — alternative when camera is unavailable */}
              {mode !== 'result' && (
                <>
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <span className="flex-1 h-px bg-border" />
                    OR
                    <span className="flex-1 h-px bg-border" />
                  </div>
                  <form onSubmit={handleManualSubmit}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        type="text"
                        value={manualInput}
                        onChange={handleManualChange}
                        placeholder="No camera? Enter record no. (VIS-00001)…"
                        className="h-9 pl-9 pr-3 font-mono text-xs bg-secondary border-border rounded-lg"
                        disabled={mode === 'scanning'}
                      />
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* quick actions */}
            <div className="mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/guard/visitor/register')}
                className="w-full h-auto! flex flex-col items-center justify-center gap-1.5 border border-border bg-secondary rounded-xl py-4 hover:border-primary"
              >
                <UserPlus className="size-4 text-muted-foreground" />
                <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                  REGISTER VISITOR
                </span>
              </Button>
            </div>
          </div>

          {/* result panel */}
          <div className="lg:col-span-3">
            {mode === 'result' && visitor ? (
              <div className="border border-border bg-card rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-lg bg-border shrink-0 flex items-center justify-center">
                    <CircleUserRound className="size-7 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-foreground truncate">
                      {visitor.fullname}
                    </div>
                    <div className="text-muted-foreground text-[11px] font-mono">
                      {visitor.record_no} · {visitor.type === 'student' ? 'STUDENT' : 'VISITOR'} ·{' '}
                      <span className={scanType === 'in' ? 'text-status-cleared' : 'text-info'}>
                        {scanType === 'in' ? 'CHECK IN' : 'CHECK OUT'}
                      </span>
                    </div>
                  </div>
                  {status && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-[10px] font-mono rounded-full px-2.5 py-1 border shrink-0',
                        status.chip
                      )}
                    >
                      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', status.dot)} />
                      {status.label}
                    </span>
                  )}
                </div>

                {/* verification hint */}
                <div className="mt-4 flex items-start gap-2 text-[11px] font-mono text-muted-foreground bg-secondary/60 border border-border rounded-lg px-3 py-2.5">
                  <BadgeCheck className="size-4 shrink-0 mt-0.5 text-status-cleared" />
                  <span>
                    Check these details against the visitor&apos;s physical ID. Edit any mismatched
                    information, then save and record the time.
                  </span>
                </div>

                {/* date of visit mismatch */}
                {!isVisitDateToday && (
                  <div className="mt-3 flex items-start gap-2 text-[11px] font-mono text-status-flagged bg-status-flagged/5 border border-status-flagged/30 rounded-lg px-3 py-2.5">
                    <TriangleAlert className="size-4 shrink-0 mt-0.5" />
                    <span>
                      Date of visit is set to {formatDate(form.visit_date)}. This does not match
                      today&apos;s date ({formatDate(new Date())}) — you cannot check in or check
                      out unless the date of visit is edited to today.
                    </span>
                  </div>
                )}

                <VisitorDetailsForm form={form} formErrors={formErrors} onFieldChange={update} />

                {/* actions */}
                <div className="mt-5 flex flex-col gap-3 sm:grid sm:grid-cols-2">
                  {scanType === 'in' && visitor.status !== 'checked_in' && (
                    <Button
                      type="button"
                      onClick={handleCheckIn}
                      disabled={actionLoading || !isVisitDateToday}
                      className="w-full h-auto! min-h-11 min-w-0 whitespace-normal text-center leading-tight break-words bg-status-cleared text-white font-mono font-bold text-xs py-3 rounded-xl hover:bg-status-cleared/85"
                    >
                      {actionLoading ? <Loader2 className="size-4 animate-spin" /> : isDirty() ? <Save className="size-4" /> : <LogIn className="size-4" />}
                      <span className="min-w-0 break-words">{isDirty() ? 'SAVE CHANGES & CHECK IN' : 'NO CHANGES — CHECK IN'}</span>
                    </Button>
                  )}
                  {scanType === 'out' && visitor.status === 'checked_in' && (
                    <Button
                      type="button"
                      onClick={handleCheckOut}
                      disabled={actionLoading || !isVisitDateToday}
                      className="w-full h-auto! min-h-11 min-w-0 whitespace-normal text-center leading-tight break-words bg-info text-white font-mono font-bold text-xs py-3 rounded-xl hover:bg-info/85"
                    >
                      {actionLoading ? <Loader2 className="size-4 animate-spin" /> : isDirty() ? <Save className="size-4" /> : <LogOut className="size-4" />}
                      <span className="min-w-0 break-words">{isDirty() ? 'SAVE CHANGES & CHECK OUT' : 'NO CHANGES — CHECK OUT'}</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetScan}
                    className="w-full h-auto! min-h-11 min-w-0 whitespace-normal text-center leading-tight break-words font-mono font-bold text-xs py-3 rounded-xl"
                  >
                    <RefreshCcw className="size-4" />
                    <span className="min-w-0 break-words">NEW SCAN</span>
                  </Button>
                </div>

                {/* visit log */}
                {visitor.time_logs?.length > 0 && (
                  <div className="mt-5 border-t border-border pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <Clock className="size-3" /> VISIT LOG
                      </div>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">
                        {visitor.time_logs.length} {visitor.time_logs.length === 1 ? 'ENTRY' : 'ENTRIES'}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {visitor.time_logs.map((log) => {
                        const isIn = log.type === 'in'
                        return (
                          <div
                            key={log.id}
                            className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/40 px-3 py-2"
                          >
                            <span
                              className={cn(
                                'flex size-7 shrink-0 items-center justify-center rounded-md',
                                isIn ? 'bg-status-cleared/15 text-status-cleared' : 'bg-info/15 text-info'
                              )}
                            >
                              {isIn ? <LogIn className="size-3.5" /> : <LogOut className="size-3.5" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div
                                className={cn(
                                  'text-xs font-mono font-bold leading-tight',
                                  isIn ? 'text-status-cleared' : 'text-info'
                                )}
                              >
                                {isIn ? 'CHECK IN' : 'CHECK OUT'}
                              </div>
                              {log.performed_by && (
                                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                  by {log.performed_by.name}
                                </div>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-xs font-mono font-semibold text-foreground">
                                {formatTime(log.time)}
                              </div>
                              <div className="text-[11px] text-muted-foreground">{formatDate(log.time)}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : scanError ? (
              <div className="border border-status-flagged/30 bg-status-flagged/5 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="size-14 rounded-2xl bg-status-flagged/10 flex items-center justify-center">
                  <TriangleAlert className="size-7 text-status-flagged" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-status-flagged">Scan failed</h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">{scanError}</p>
              </div>
            ) : (
              <div className="border border-border bg-card rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="size-14 rounded-2xl bg-secondary flex items-center justify-center">
                  <ScanLine className="size-7 text-muted-foreground" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-foreground">No visitor scanned yet</h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  Pick <span className={scanType === 'in' ? 'text-status-cleared' : 'text-info'}>{scanType === 'in' ? 'CHECK IN' : 'CHECK OUT'}</span>,
                  then scan an entry pass or enter a record number to identify the visitor, review or edit
                  their details, and record the time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
