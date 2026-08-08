import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CheckCheck,
  FileWarning,
  GraduationCap,
  Loader2,
  RotateCcw,
  TriangleAlert,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import StatusChip from '@/components/StatusChip'
import { useToast } from '@/components/ui/toast'
import { getStudentViolations, resolveAllViolations, resolveViolation, unresolveAllViolations } from '../../../services/admin/studentViolations'

function toApiDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDay(dateString) {
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function initialsOf(student) {
  const initials = [student.firstname, student.middlename, student.lastname]
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
  return initials || 'ST'
}

function performersOf(day) {
  return [...new Set(day.violations.map((violation) => violation.recorded_by?.name).filter(Boolean))].join(', ')
}

function ViolationEntry({ violation, index, isLast, onResolve, resolving }) {
  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-status-flagged/40 bg-status-flagged/10 font-mono text-[10px] font-bold text-status-flagged">
          {index + 1}
        </span>
        {!isLast && <span className="mt-1.5 w-px flex-1 bg-border" />}
      </div>
      <div className="min-w-0 flex-1 rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
        <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
          <div className="min-w-0 space-y-0.5">
            {violation.violation_types.length === 0 ? (
              <span className="text-xs font-mono text-muted-foreground/60">—</span>
            ) : (
              violation.violation_types.map((name, idx) => (
                <div key={`${name}-${idx}`} className="flex items-start gap-1.5 text-xs font-mono font-semibold text-foreground">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                  <span className="min-w-0 break-words">{name}</span>
                </div>
              ))
            )}
          </div>
          <span className="shrink-0 text-[10px] font-mono text-muted-foreground">
            {formatTime(violation.created_at)}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <StatusChip status={violation.status} />
          {violation.status !== 'Resolved' && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onResolve(violation)}
              disabled={resolving}
              className="h-7 px-2 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider gap-1.5 text-muted-foreground hover:text-status-cleared hover:bg-status-cleared/10"
            >
              <CheckCheck className="size-3.5" />
              {resolving ? 'Resolving…' : 'Resolve'}
            </Button>
          )}
        </div>
        {violation.remarks && (
          <p className="mt-2 border-t border-border/60 pt-1.5 text-[11px] text-muted-foreground break-words">
            {violation.remarks}
          </p>
        )}
      </div>
    </div>
  )
}

export default function StudentViolationDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [month, setMonth] = useState('ALL')
  const [filterDate, setFilterDate] = useState(null)
  const [resolvingId, setResolvingId] = useState(null)
  const [resolvingAll, setResolvingAll] = useState(false)
  const [undoIds, setUndoIds] = useState([])
  const [undoing, setUndoing] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setUndoIds([])
    getStudentViolations(id, filterDate ? { date: toApiDate(filterDate) } : {})
      .then((res) => {
        if (cancelled) return
        setData(res)
        setMonth('ALL')
      })
      .catch(() => {
        if (cancelled) return
        setError('Failed to load the student violations.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, filterDate])

  const student = data?.student
  const days = useMemo(() => data?.days || [], [data])

  const pendingCount = useMemo(
    () => days.reduce((sum, day) => sum + day.violations.filter((v) => v.status !== 'Resolved').length, 0),
    [days]
  )

  const revertCount = useMemo(() => {
    if (undoIds.length > 0) return undoIds.length
    return days.reduce((sum, day) => sum + day.violations.filter((v) => v.status === 'Resolved').length, 0)
  }, [days, undoIds])

  const monthOptions = useMemo(() => {
    const seen = new Set()
    const options = [{ value: 'ALL', label: 'ALL' }]
    for (const day of days) {
      const key = day.date.slice(0, 7)
      if (seen.has(key)) continue
      seen.add(key)
      const [year, monthNum] = key.split('-').map(Number)
      const label = new Date(year, monthNum - 1, 1)
        .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        .toUpperCase()
      options.push({ value: key, label })
    }
    return options
  }, [days])

  const filteredDays = useMemo(
    () => (month === 'ALL' ? days : days.filter((day) => day.date.startsWith(month))),
    [days, month]
  )

  const stats = useMemo(() => {
    let nonCompliant = 0
    let total = 0
    for (const day of filteredDays) {
      total += day.total || 0
      for (const violation of day.violations) {
        if (violation.status === 'Non-compliant') nonCompliant++
      }
    }
    return { days: filteredDays.length, nonCompliant, total }
  }, [filteredDays])

  const statTiles = [
    { label: 'Days with records', value: stats.days, icon: CalendarDays, accent: 'text-primary' },
    { label: 'Non-compliant', value: stats.nonCompliant, icon: FileWarning, accent: 'text-status-flagged' },
    { label: 'Total violations', value: stats.total, icon: TriangleAlert, accent: 'text-foreground' },
  ]

  function updateViolationStatus(violationId, status) {
    setData((prev) => ({
      ...prev,
      days: prev.days.map((day) => ({
        ...day,
        violations: day.violations.map((v) => (v.id === violationId ? { ...v, status } : v)),
      })),
    }))
  }

  function handleResolve(violation) {
    setResolvingId(violation.id)
    resolveViolation(violation.id)
      .then(() => {
        updateViolationStatus(violation.id, 'Resolved')
        toast({
          variant: 'success',
          title: 'Violation resolved',
          description: 'The violation has been marked as Resolved.',
        })
      })
      .catch(() => {
        toast({
          variant: 'error',
          title: 'Resolve failed',
          description: 'Something went wrong. Please try again.',
        })
      })
      .finally(() => setResolvingId(null))
  }

  function handleResolveAll() {
    setResolvingAll(true)
    const pendingViolationIds = days.flatMap((day) =>
      day.violations.filter((v) => v.status !== 'Resolved').map((v) => v.id)
    )
    resolveAllViolations(id)
      .then((res) => {
        if ((res?.resolved ?? 0) === 0) {
          toast({
            variant: 'success',
            title: 'All violations are already resolved',
            description: 'No changes were made.',
          })
          return
        }
        setUndoIds(pendingViolationIds)
        setData((prev) => ({
          ...prev,
          days: prev.days.map((day) => ({
            ...day,
            violations: day.violations.map((v) => ({ ...v, status: 'Resolved' })),
          })),
        }))
        const resolved = res.resolved ?? 0
        toast({
          variant: 'success',
          title: 'All violations resolved',
          description: `${resolved} violation${resolved === 1 ? '' : 's'} marked as Resolved.`,
        })
      })
      .catch(() => {
        toast({
          variant: 'error',
          title: 'Resolve failed',
          description: 'Something went wrong. Please try again.',
        })
      })
      .finally(() => setResolvingAll(false))
  }

  function handleUndoResolveAll() {
    const targetIds =
      undoIds.length > 0
        ? undoIds
        : days.flatMap((day) => day.violations.filter((v) => v.status === 'Resolved').map((v) => v.id))
    if (targetIds.length === 0) return
    setUndoing(true)
    unresolveAllViolations(id, targetIds)
      .then((res) => {
        if ((res?.unresolved ?? 0) === 0) {
          toast({
            variant: 'success',
            title: 'Nothing to undo',
            description: 'No resolved violations were found to revert.',
          })
          setUndoIds([])
          return
        }
        const ids = new Set(targetIds)
        setData((prev) => ({
          ...prev,
          days: prev.days.map((day) => ({
            ...day,
            violations: day.violations.map((v) =>
              ids.has(v.id) ? { ...v, status: 'Non-compliant' } : v
            ),
          })),
        }))
        setUndoIds([])
        toast({
          variant: 'success',
          title: 'Resolve-all undone',
          description: `${res.unresolved} violation${res.unresolved === 1 ? '' : 's'} reverted to Non-compliant.`,
        })
      })
      .catch(() => {
        toast({
          variant: 'error',
          title: 'Undo failed',
          description: 'Something went wrong. Please try again.',
        })
      })
      .finally(() => setUndoing(false))
  }

  function handleConfirmAction() {
    if (!confirmTarget) return
    if (confirmTarget.type === 'single') {
      handleResolve(confirmTarget.violation)
    } else if (confirmTarget.type === 'all') {
      handleResolveAll()
    } else if (confirmTarget.type === 'undo') {
      handleUndoResolveAll()
    }
    setConfirmTarget(null)
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-border px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest">
            <span className="text-primary">Admin</span>
            <span className="text-muted-foreground"> / </span>
            <span className="text-brand-green">Student Violations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-foreground">Student violation details</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/student-violations')}
          className="text-xs font-mono font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded gap-2 text-foreground hover:border-primary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>BACK</span>
        </Button>
      </header>

      <div className="px-4 sm:px-6 lg:px-10 py-5 sm:py-8">
        {loading ? (
          <div className="border border-border bg-card rounded-lg p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-6 text-brand-green animate-spin" />
            <span className="text-[11px] font-mono text-muted-foreground tracking-widest">
              LOADING VIOLATIONS…
            </span>
          </div>
        ) : error || !student ? (
          <div className="border border-status-flagged/30 bg-status-flagged/5 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="size-14 rounded-2xl bg-status-flagged/10 flex items-center justify-center">
              <TriangleAlert className="size-7 text-status-flagged" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-status-flagged">Load failed</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">{error || 'Student not found.'}</p>
            <Button
              type="button"
              onClick={() => navigate('/admin/student-violations')}
              className="mt-5 text-xs font-mono font-bold rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" /> BACK
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* student card — full-width header on top */}
            <div className="border border-border bg-card rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="size-12 sm:size-16 rounded-xl bg-secondary border border-border shrink-0 flex items-center justify-center text-sm sm:text-lg font-mono font-bold text-muted-foreground">
                  {initialsOf(student)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-lg sm:text-2xl text-foreground truncate">
                    {student.name}
                  </div>
                  <div className="text-[11px] sm:text-xs font-mono text-muted-foreground mt-0.5">
                    {student.id_number}
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-border pt-4 grid grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-4">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <GraduationCap className="size-3 shrink-0" />
                    Program &amp; year
                  </div>
                  <div className="mt-1 text-sm font-mono text-foreground truncate">
                    {student.program_and_year}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Contact no.
                  </div>
                  <div className="mt-1 text-sm font-mono text-foreground">{student.contact_no}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Academic year
                  </div>
                  <div className="mt-1 inline-flex max-w-full items-center gap-1.5 text-xs font-mono rounded-full px-2.5 py-1 border border-border bg-secondary/60 text-muted-foreground">
                    <GraduationCap className="size-3 shrink-0" />
                    <span className="truncate">{student.academic_year?.description ?? '—'}</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Days with records
                  </div>
                  <div className="mt-1 text-lg font-bold text-foreground">{days.length}</div>
                </div>
                <div className="min-w-0 col-span-2 lg:col-span-1">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Total violations
                  </div>
                  <div className="mt-1 text-lg font-bold text-foreground">
                    {days.reduce((sum, day) => sum + (day.total || 0), 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* violations section */}
            <div className="space-y-4">
              {/* date & month filters */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <DatePicker
                    value={filterDate}
                    onChange={setFilterDate}
                    placeholder="Filter by date"
                    className="w-full sm:w-[240px] rounded-lg px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider"
                  />
                  {filterDate && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFilterDate(null)}
                      className="h-auto! px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      <X className="size-3.5" /> CLEAR
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {monthOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant="outline"
                      onClick={() => setMonth(option.value)}
                      className={cn(
                        'h-auto! px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase',
                        month === option.value
                          ? 'border-primary text-primary'
                          : 'text-muted-foreground hover:border-primary hover:text-primary'
                      )}
                    >
                      {option.label}
                    </Button>
                  ))}
                  <span className="hidden sm:inline h-4 w-px bg-border mx-1" />
                  {undoIds.length > 0 || (days.length > 0 && pendingCount === 0) ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmTarget({ type: 'undo' })}
                      disabled={undoing}
                      className="h-auto! px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase gap-1.5 text-muted-foreground hover:border-status-pending/40 hover:text-status-pending"
                    >
                      <RotateCcw className="size-3.5" />
                      {undoing ? 'Undoing…' : 'Undo'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmTarget({ type: 'all' })}
                      disabled={resolvingAll || pendingCount === 0}
                      className="h-auto! px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase gap-1.5 border-status-cleared/40 text-status-cleared hover:border-status-cleared hover:text-status-cleared"
                    >
                      <CheckCheck className="size-3.5" />
                      {resolvingAll ? 'Resolving…' : 'Resolve all'}
                    </Button>
                  )}
                </div>
              </div>

              {days.length === 0 ? (
                <div className="border border-border bg-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
                  <div className="size-14 rounded-2xl bg-secondary flex items-center justify-center">
                    <FileWarning className="size-7 text-muted-foreground" />
                  </div>
                  {filterDate ? (
                    <>
                      <h2 className="mt-4 text-base font-semibold text-foreground">No violations on this date</h2>
                      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                        There are no violation records for {formatDay(toApiDate(filterDate))}.
                        Clear the date filter to see all violations.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="mt-4 text-base font-semibold text-foreground">No violations yet</h2>
                      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                        This student has no recorded violations. Violations are created when a guard
                        records an offense while scanning the student QR at the gate.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* summary stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {statTiles.map((tile) => (
                      <div key={tile.label} className="border border-border bg-card rounded-xl p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
                        <div
                          className={cn(
                            'flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/60',
                            tile.accent
                          )}
                        >
                          <tile.icon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-lg font-bold leading-tight text-foreground">{tile.value}</div>
                          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground truncate">
                            {tile.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredDays.length === 0 ? (
                    <div className="border border-border bg-card rounded-xl p-10 flex flex-col items-center justify-center text-center">
                      <FileWarning className="size-6 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">No violations in this period.</p>
                    </div>
                  ) : (
                    /* day cards — each violation recorded that day */
                    <div className="grid gap-3 xl:grid-cols-2 items-start">
                      {filteredDays.map((day) => {
                        const performers = performersOf(day)
                        return (
                          <div key={day.date} className="border border-border bg-card rounded-xl p-4 sm:p-5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                <CalendarDays className="size-3.5 text-primary" />
                                {formatDay(day.date)}
                              </div>
                              <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">
                                {day.total} {day.total === 1 ? 'VIOLATION' : 'VIOLATIONS'}
                              </span>
                            </div>

                            <div className="mt-3 space-y-2">
                              {day.violations.map((violation, index) => (
                                <ViolationEntry
                                  key={violation.id}
                                  violation={violation}
                                  index={index}
                                  isLast={index === day.violations.length - 1}
                                  onResolve={(violation) => setConfirmTarget({ type: 'single', violation })}
                                  resolving={resolvingId === violation.id}
                                />
                              ))}
                            </div>

                            {performers && (
                              <div className="mt-3 border-t border-border pt-2.5 text-[11px] text-muted-foreground">
                                by {performers}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* resolve confirmation */}
      <Dialog open={confirmTarget !== null} onOpenChange={(open) => { if (!open) setConfirmTarget(null) }}>
        <DialogPortal>
          <DialogBackdrop />
          <DialogPopup>
            <DialogTitle className="text-base font-semibold text-foreground">
              {confirmTarget?.type === 'all'
                ? 'Resolve all violations?'
                : confirmTarget?.type === 'undo'
                  ? 'Undo resolve all?'
                  : 'Resolve violation?'}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {confirmTarget?.type === 'all' ? (
                <>
                  {pendingCount} violation{pendingCount === 1 ? '' : 's'} will be marked as Resolved.
                </>
              ) : confirmTarget?.type === 'undo' ? (
                <>
                  {revertCount} violation{revertCount === 1 ? '' : 's'} will be reverted to Non-compliant.
                </>
              ) : (
                <>
                  <span className="font-mono font-semibold text-foreground">
                    {confirmTarget?.violation?.violation_types.join(', ') || 'This violation'}
                  </span>{' '}
                  will be marked as Resolved.
                </>
              )}
            </DialogDescription>
            <div className="mt-6 flex justify-end gap-2">
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button
                type="button"
                variant="outline"
                onClick={handleConfirmAction}
                className={
                  confirmTarget?.type === 'undo'
                    ? 'gap-2 text-muted-foreground hover:border-status-pending/40 hover:text-status-pending'
                    : 'gap-2 border-status-cleared/40 text-status-cleared hover:border-status-cleared hover:text-status-cleared'
                }
              >
                {confirmTarget?.type === 'undo' ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <CheckCheck className="h-4 w-4" />
                )}
                {confirmTarget?.type === 'undo' ? 'Undo' : 'Resolve'}
              </Button>
            </div>
          </DialogPopup>
        </DialogPortal>
      </Dialog>
    </div>
  )
}
