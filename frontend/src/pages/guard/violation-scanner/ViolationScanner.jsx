import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import {
  CheckCircle2,
  FileWarning,
  GraduationCap,
  Loader2,
  RefreshCcw,
  ScanLine,
  Search,
  TriangleAlert,
  Video,
  X,
} from 'lucide-react'
import CornerBracket from '../../../components/CornerBracket.jsx'
import ScannerVisual from '../../../components/ScannerVisual.jsx'
import StudentDetailsForm from '../student-scanner/StudentDetailsForm.jsx'
import ViolationForm from './ViolationForm.jsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { lookupStudent } from '../../../services/guard/students.js'
import {
  createStudentViolation,
  listViolationTypes,
} from '../../../services/guard/violations.js'
import { playFailure, playSuccess, unlockAudio } from '../../../utils/scannerSounds.js'

function parseIdNumber(text) {
  const match = String(text).match(/IdNumber:([^;]+)/)
  if (match) return match[1].trim()
  const raw = String(text).trim()
  return /^\d+$/.test(raw) ? raw : null
}

export default function ViolationScanner() {
  const scannerRef = useRef(null)
  const modeRef = useRef('idle')
  const lookupTimerRef = useRef(null)
  const lastLookupRef = useRef('')
  const [mode, setMode] = useState('idle')
  const [student, setStudent] = useState(null)
  const [capturedShot, setCapturedShot] = useState(null)
  const [scanError, setScanError] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [violationTypes, setViolationTypes] = useState([])
  const [typesError, setTypesError] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [remarks, setRemarks] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedViolation, setSavedViolation] = useState(null)

  function updateMode(next) {
    modeRef.current = next
    setMode(next)
  }

  useEffect(() => {
    listViolationTypes()
      .then(setViolationTypes)
      .catch(() => setTypesError('Could not load violation types. Check your connection and try again.'))
  }, [])

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
      setSavedViolation(null)
      setScanError('')
      setFormError('')
      setManualInput('')
      setSelectedIds([])
      setRemarks('')
      updateMode('idle')
      startScanner()
    }
  })

  useEffect(() => {
    if (mode !== 'done') return
    const timer = setTimeout(() => restartScannerRef.current(), 2500)
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
    setFormError('')
    try {
      const data = await lookupStudent(idNumber)
      setStudent(data)
      setCapturedShot(shot)
      playSuccess()
      updateMode('form')
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

  function toggleType(id) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id)
      }
      return [...prev, id]
    })
    if (formError) setFormError('')
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!student || saving) return
    if (selectedIds.length === 0) {
      setFormError('Select at least one violation type.')
      return
    }
    setSaving(true)
    setFormError('')
    updateMode('saving')
    try {
      const saved = await createStudentViolation(student.id, {
        violation_type_ids: selectedIds,
        remarks: remarks.trim() || null,
      })
      setSavedViolation(saved)
      playSuccess()
      updateMode('done')
    } catch (err) {
      playFailure()
      setFormError(err.response?.data?.message || 'Could not save the violation. Try again.')
      updateMode('form')
    } finally {
      setSaving(false)
    }
  }

  function resetScan() {
    setStudent(null)
    setSavedViolation(null)
    setCapturedShot(null)
    setScanError('')
    setFormError('')
    setManualInput('')
    setSelectedIds([])
    setRemarks('')
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
    lookupByNumber(value)
  }

  const showForm = (mode === 'form' || mode === 'saving' || mode === 'done') && student

  return (
    <div>
      {/* page header */}
      <div className="border-b border-border px-6 lg:px-10 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest">
            <span className="text-primary">Guard</span>
            <span className="text-muted-foreground"> / </span>
            <span className="text-brand-green">Violation Scanner</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-foreground">Violation scanner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Scan a student QR to open the violation form, then save the record to the student's
            disciplinary log. Students are matched to the active academic year.
          </p>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-6">
        <div className="grid gap-6 lg:grid-cols-5 items-start">
          {/* scanner panel */}
          <div className="lg:col-span-2">
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

                {(mode === 'form' || mode === 'saving' || mode === 'done') && (
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
              {(mode === 'form' || mode === 'saving') && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetScan}
                  className="w-full h-auto! font-mono font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="size-4" /> SCAN ANOTHER
                </Button>
              )}
              {mode === 'done' && (
                <Button
                  type="button"
                  disabled
                  className="w-full h-auto! bg-status-cleared/10 text-status-cleared font-mono font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Loader2 className="size-4 animate-spin" /> NEXT SCAN IN 2.5S…
                </Button>
              )}

              {/* manual lookup — always available, stays mounted so it never loses focus */}
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
                    placeholder="No camera? Type student ID no. (238380)…"
                    className="h-9 pl-9 pr-3 font-mono text-xs bg-secondary border-border rounded-lg"
                    disabled={mode === 'scanning'}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* violation form panel */}
          <div className="lg:col-span-3">
            {showForm ? (
              <div className="border border-border bg-card rounded-xl p-5">
                {mode === 'done' && savedViolation && (
                  <div className="mb-4 flex items-start gap-2 text-[11px] font-mono text-status-cleared bg-status-cleared/10 border border-status-cleared/30 rounded-lg px-3 py-2.5">
                    <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                    <span>
                      Violation recorded for {savedViolation.student?.name ?? 'student'} —{' '}
                      {savedViolation.violation_types?.map((type) => type.name).join(', ') ?? '—'}.
                      Camera restarts for the next student in 2.5 seconds.
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
                  <span className="text-[10px] font-mono text-status-cleared shrink-0">
                    ✓ QR VERIFIED
                  </span>
                </div>

                {/* student details */}
                <StudentDetailsForm student={student} />

                {mode === 'done' ? (
                  <div className="mt-5 flex items-center gap-2 text-[10px] font-mono text-muted-foreground tracking-widest">
                    <Loader2 className="size-3.5 animate-spin" /> SCANNING NEXT IN 2.5S…
                  </div>
                ) : (
                  <ViolationForm
                    violationTypes={violationTypes}
                    typesError={typesError}
                    selectedIds={selectedIds}
                    onToggleType={toggleType}
                    remarks={remarks}
                    onRemarksChange={setRemarks}
                    formError={formError}
                    saving={saving}
                    onSubmit={handleSave}
                    onCancel={resetScan}
                  />
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
                  <FileWarning className="size-7 text-muted-foreground" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-foreground">No student scanned yet</h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  Scan a student QR or enter an ID number to identify the student, then record their
                  violation. Students are matched to the active academic year.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
