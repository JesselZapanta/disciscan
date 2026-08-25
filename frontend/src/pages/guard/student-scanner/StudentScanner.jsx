import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import {
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  LogIn,
  LogOut,
  RefreshCcw,
  ScanLine,
  Search,
  TriangleAlert,
  Video,
  X,
} from 'lucide-react'
import CornerBracket from '../../../components/CornerBracket.jsx'
import ScannerVisual from '../../../components/ScannerVisual.jsx'
import StudentDetailsForm from './StudentDetailsForm.jsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  checkInStudent,
  checkOutStudent,
  lookupStudent,
} from '../../../services/guard/students.js'
import { playFailure, playSuccess, unlockAudio } from '../../../utils/scannerSounds.js'

const statusConfig = {
  in: { label: 'CHECKED IN', chip: 'text-status-cleared border-status-cleared/40 bg-status-cleared/10', dot: 'bg-status-cleared' },
  out: { label: 'CHECKED OUT', chip: 'text-info border-info/40 bg-info/10', dot: 'bg-info' },
}

const statusFallback = { label: 'NOT SCANNED', chip: 'text-muted-foreground border-border bg-secondary/60', dot: 'bg-muted-foreground/50' }

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

function parseIdNumber(text) {
  const match = String(text).match(/IdNumber:([^;]+)/)
  if (match) return match[1].trim()
  const raw = String(text).trim()
  return /^\d+$/.test(raw) ? raw : null
}

export default function StudentScanner() {
  const scannerRef = useRef(null)
  const modeRef = useRef('idle')
  const lookupTimerRef = useRef(null)
  const lastLookupRef = useRef('')
  const [mode, setMode] = useState('idle')
  const [scanType, setScanType] = useState('in')
  const scanTypeRef = useRef('in')
  const [student, setStudent] = useState(null)
  const [capturedShot, setCapturedShot] = useState(null)
  const [scanError, setScanError] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [savedLog, setSavedLog] = useState(null)

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

  const restartScannerRef = useRef(() => {})
  useEffect(() => {
    restartScannerRef.current = () => {
      setStudent(null)
      setSavedLog(null)
      setScanError('')
      setManualInput('')
      updateMode('idle')
      startScanner()
    }
  })

  useEffect(() => {
    if (mode !== 'done') return
    const timer = setTimeout(() => restartScannerRef.current(), 2000)
    return () => clearTimeout(timer)
  }, [mode])

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
          setScanError('Camera unavailable. Allow camera access or enter the ID number manually.')
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
    const idNumber = parseIdNumber(decodedText)
    if (!idNumber) {
      playFailure()
      updateMode('idle')
      setScanError('Unrecognized QR. Please scan a DisciScan student QR.')
      return
    }
    await lookupByNumber(idNumber, shot)
  }

  async function lookupByNumber(idNumber, shot = null) {
    updateMode('processing')
    setScanError('')
    setSavedLog(null)
    try {
      const data = await lookupStudent(idNumber)
      setStudent(data)
      setCapturedShot(shot)
      await autoSave(data)
    } catch (err) {
      playFailure()
      setCapturedShot(null)
      const status = err.response?.status
      if (status === 404) {
        setScanError(err.response?.data?.message || 'Student not found for the active academic year.')
      } else if (status === 422) {
        setScanError('Invalid student ID number.')
      } else {
        setScanError('Lookup failed. Check your connection and try again.')
      }
      updateMode('idle')
    }
  }

  async function autoSave(data) {
    try {
      const updated =
        scanTypeRef.current === 'out'
          ? await checkOutStudent(data.id)
          : await checkInStudent(data.id)
      setStudent(updated)
      setSavedLog(updated.time_logs?.[0] ?? null)
      playSuccess()
      updateMode('done')
    } catch (err) {
      playFailure()
      setScanError(err.response?.data?.message || 'Could not record the time automatically. Try again.')
      updateMode('result')
    }
  }

  async function handleRetrySave() {
    if (!student || actionLoading) return
    setActionLoading(true)
    setScanError('')
    try {
      const updated =
        scanTypeRef.current === 'out'
          ? await checkOutStudent(student.id)
          : await checkInStudent(student.id)
      setStudent(updated)
      setSavedLog(updated.time_logs?.[0] ?? null)
      updateMode('done')
    } catch (err) {
      setScanError(err.response?.data?.message || 'Action failed. Try again.')
    } finally {
      setActionLoading(false)
    }
  }

  function resetScan() {
    setStudent(null)
    setSavedLog(null)
    setCapturedShot(null)
    setScanError('')
    setManualInput('')
    updateMode('idle')
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
      lookupByNumber(trimmed)
    }, 600)
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    const value = manualInput.trim()
    if (!value) return
    lastLookupRef.current = value
    lookupByNumber(value)
  }

  const status = student ? statusConfig[student.status] || statusFallback : null
  const isCheckOut = scanType === 'out'

  return (
    <div>
      {/* page header */}
      <div className="border-b border-border px-6 lg:px-10 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest">
            <span className="text-primary">Guard</span>
            <span className="text-muted-foreground"> / </span>
            <span className="text-brand-green">Student Scanner</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-foreground">Student scanner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Scan a student QR to record time in or out. Students are matched to the active
            academic year.
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
                onClick={() => {
                  scanTypeRef.current = 'in'
                  setScanType('in')
                }}
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
                onClick={() => {
                  scanTypeRef.current = 'out'
                  setScanType('out')
                }}
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

            <CornerBracket className="rounded-xl">
              <div className="relative w-full h-80 lg:h-[420px]">
                {mode === 'idle' && (
                  <div className="absolute inset-0 flex items-center justify-center p-1.5">
                    <ScannerVisual size="fill" className="w-full h-full" />
                  </div>
                )}

                {mode === 'scanning' && (
                  <>
                    <div id="qr-reader" className="absolute inset-0 w-full h-full overflow-hidden bg-black" />
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
                      LOOKING UP STUDENT…
                    </span>
                  </div>
                )}

                {(mode === 'result' || mode === 'saving' || mode === 'done') && (
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
              {mode === 'saving' && (
                <Button
                  type="button"
                  disabled
                  className="w-full h-auto! bg-secondary text-muted-foreground font-mono font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Loader2 className="size-4 animate-spin" /> SAVING…
                </Button>
              )}
              {mode === 'done' && (
                <Button
                  type="button"
                  disabled
                  className="w-full h-auto! bg-status-cleared/10 text-status-cleared font-mono font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Loader2 className="size-4 animate-spin" /> NEXT SCAN IN 2S…
                </Button>
              )}

              {/* manual lookup — alternative when camera is unavailable */}
              {mode !== 'result' && mode !== 'saving' && mode !== 'done' && (
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
                        placeholder="No camera? Enter student ID no. (238380)…"
                        className="h-9 pl-9 pr-3 font-mono text-xs bg-secondary border-border rounded-lg"
                        disabled={mode === 'scanning'}
                      />
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* result panel */}
          <div className="lg:col-span-3">
            {(mode === 'result' || mode === 'done') && student ? (
              <div className="border border-border bg-card rounded-xl p-5">
                {mode === 'done' && savedLog && (
                  <div className="mb-4 flex items-start gap-2 text-[11px] font-mono text-status-cleared bg-status-cleared/10 border border-status-cleared/30 rounded-lg px-3 py-2.5">
                    <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                    <span>
                      {savedLog.type === 'out' ? 'CHECKED OUT' : 'CHECKED IN'} at{' '}
                      {formatTime(savedLog.time)} — saved automatically. Camera restarts for the
                      next student in 2 seconds.
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-lg bg-border shrink-0 flex items-center justify-center">
                    <GraduationCap className="size-7 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-foreground truncate">
                      {student.name}
                    </div>
                    <div className="text-muted-foreground text-[11px] font-mono truncate">
                      {student.id_number} · {student.program_and_year} ·{' '}
                      {student.academic_year?.code ?? '—'}
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

                {/* student details form */}
                <StudentDetailsForm student={student} />

                {mode === 'result' && (
                  <div className="mt-4 flex items-start gap-2 text-[11px] font-mono text-muted-foreground bg-secondary/60 border border-border rounded-lg px-3 py-2.5">
                    <LogIn className="size-4 shrink-0 mt-0.5 text-status-cleared" />
                    <span>
                      {isCheckOut
                        ? 'CHECK OUT selected — the time out saves automatically when a student is found.'
                        : 'CHECK IN selected — the time in saves automatically when a student is found.'}
                    </span>
                  </div>
                )}

                {scanError && mode === 'result' && (
                  <div className="mt-3 flex items-start gap-2 text-[11px] font-mono text-status-flagged bg-status-flagged/5 border border-status-flagged/30 rounded-lg px-3 py-2.5">
                    <TriangleAlert className="size-4 shrink-0 mt-0.5" />
                    <span>{scanError}</span>
                  </div>
                )}

                {/* actions */}
                {mode === 'result' && (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      onClick={handleRetrySave}
                      disabled={actionLoading}
                      className={cn(
                        'w-full h-auto! font-mono font-bold text-xs py-3 rounded-xl',
                        isCheckOut
                          ? 'bg-info text-white hover:bg-info/85'
                          : 'bg-status-cleared text-white hover:bg-status-cleared/85'
                      )}
                    >
                      {actionLoading ? <Loader2 className="size-4 animate-spin" /> : isCheckOut ? <LogOut className="size-4" /> : <LogIn className="size-4" />}
                      {isCheckOut ? 'RETRY CHECK OUT' : 'RETRY CHECK IN'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetScan}
                      className="w-full h-auto! font-mono font-bold text-xs py-3 rounded-xl"
                    >
                      <RefreshCcw className="size-4" />
                      NEW SCAN
                    </Button>
                  </div>
                )}

                {mode === 'done' && (
                  <div className="mt-5 flex items-center gap-2 text-[10px] font-mono text-muted-foreground tracking-widest">
                    <Loader2 className="size-3.5 animate-spin" /> SCANNING NEXT IN 2S…
                  </div>
                )}

                {/* time log */}
                {student.time_logs?.length > 0 && (
                  <div className="mt-5 border-t border-border pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <Clock className="size-3" /> TIME LOG
                      </div>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">
                        {student.time_logs.length} {student.time_logs.length === 1 ? 'ENTRY' : 'ENTRIES'}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {student.time_logs.map((log) => {
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
            ) : scanError && mode === 'idle' ? (
              <div className="border border-status-flagged/30 bg-status-flagged/5 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="size-14 rounded-2xl bg-status-flagged/10 flex items-center justify-center">
                  <TriangleAlert className="size-7 text-status-flagged" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-status-flagged">Scan failed</h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">{scanError}</p>
                <Button
                  type="button"
                  onClick={startScanner}
                  className="mt-5 w-full h-auto! font-mono font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <ScanLine className="size-4" /> SCAN AGAIN
                </Button>
              </div>
            ) : (
              <div className="border border-border bg-card rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="size-14 rounded-2xl bg-secondary flex items-center justify-center">
                  <ScanLine className="size-7 text-muted-foreground" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-foreground">No student scanned yet</h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  Scan a student QR or enter an ID number to identify the student, then record their
                  time in or out. Students are matched to the active academic year.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
