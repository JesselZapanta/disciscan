import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Building2,
  CalendarDays,
  CircleUserRound,
  Clock,
  Hash,
  LogIn,
  LogOut,
  Phone,
  QrCode,
  Target,
  UserRound,
  X,
} from 'lucide-react'

const statusConfig = {
  pending: { label: 'PENDING', chip: 'text-status-pending border-status-pending/40 bg-status-pending/10', dot: 'bg-status-pending' },
  checked_in: { label: 'CHECKED IN', chip: 'text-status-cleared border-status-cleared/40 bg-status-cleared/10', dot: 'bg-status-cleared' },
  checked_out: { label: 'CHECKED OUT', chip: 'text-info border-info/40 bg-info/10', dot: 'bg-info' },
}

const statusFallback = { label: 'UNKNOWN', chip: 'text-muted-foreground border-border bg-secondary/60', dot: 'bg-muted-foreground/50' }

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function Field({ icon: Icon, label, value, mono = false, wide = false }) {
  return (
    <div className={cn(wide && 'sm:col-span-2')}>
      <dt className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <Icon className="size-3 shrink-0" />
        {label}
      </dt>
      <dd className={cn('mt-1 text-sm text-foreground break-words', mono && 'font-mono text-xs')}>{value}</dd>
    </div>
  )
}

export default function VisitorDetailsDialog({ visitor, open, onOpenChange }) {
  const status = statusConfig[visitor?.status] || statusFallback
  const timeLogs = visitor?.time_logs || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger className="hidden" />
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="max-w-lg">
          {/* header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-12 rounded-lg bg-secondary border border-border shrink-0 flex items-center justify-center">
                <CircleUserRound className="size-6 text-primary" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-semibold text-foreground truncate">
                  {visitor?.fullname}
                </DialogTitle>
                <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                  <QrCode className="size-3 shrink-0" />
                  {visitor?.record_no}
                  <span className="text-muted-foreground/50">·</span>
                  {visitor?.type === 'student' ? 'Student' : 'Visitor'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {visitor && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-mono rounded-full px-2.5 py-1 border',
                    status.chip
                  )}
                >
                  <span className={cn('inline-block h-1.5 w-1.5 rounded-full', status.dot)} />
                  {status.label}
                </span>
              )}
              <DialogClose
                render={
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Close details"
                  >
                    <X />
                  </Button>
                }
              />
            </div>
          </div>

          {/* visitor information */}
          <div className="mt-5 rounded-lg border border-border bg-secondary/40 p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <UserRound className="size-3" />
              Visitor Information
            </div>
            <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field icon={UserRound} label="Type" value={visitor?.type === 'student' ? 'Student' : 'Visitor'} />
              <Field icon={Phone} label="Contact number" value={visitor?.contact || '—'} mono />
              <Field icon={CalendarDays} label="Date of visit" value={formatDate(visitor?.visit_date)} mono />
              <Field icon={Target} label="Purpose of visit" value={visitor?.purpose || '—'} wide />
              {visitor?.purpose === 'Other' && (
                <Field icon={Target} label="Specified purpose" value={visitor?.purpose_other || '—'} wide />
              )}
              <Field
                icon={Building2}
                label="Person / office to visit"
                value={visitor?.person_office_to_visit || '—'}
                wide
              />
              <Field icon={Hash} label="Valid ID type" value={visitor?.id_type || '—'} />
              <Field icon={Hash} label="ID number" value={visitor?.id_number || '—'} mono />
              <Field icon={Clock} label="Registered" value={formatDateTime(visitor?.created_at)} wide />
            </dl>
          </div>

          {/* visit log */}
          {timeLogs.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  <Clock className="size-3" />
                  Visit Log
                </div>
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">
                  {timeLogs.length} {timeLogs.length === 1 ? 'ENTRY' : 'ENTRIES'}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {timeLogs.map((log) => {
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
                        <div className="text-xs font-mono font-semibold text-foreground">{formatTime(log.time)}</div>
                        <div className="text-[11px] text-muted-foreground">{formatDate(log.time)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}