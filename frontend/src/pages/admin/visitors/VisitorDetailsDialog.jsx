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

function Field({ label, value, mono = false, wide = false }) {
  return (
    <div className={cn(wide && 'sm:col-span-2')}>
      <dt className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className={cn('mt-1 text-sm text-foreground break-words', mono && 'font-mono text-xs')}>{value}</dd>
    </div>
  )
}

export default function VisitorDetailsDialog({ visitor, open, onOpenChange }) {
  const status = statusConfig[visitor?.status] || statusFallback

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger className="hidden" />
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="max-w-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                {visitor?.fullname}
              </DialogTitle>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                {visitor?.record_no}
              </p>
            </div>
            {visitor && (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-mono rounded-full px-2.5 py-1 border shrink-0',
                  status.chip
                )}
              >
                <span className={cn('inline-block h-1.5 w-1.5 rounded-full', status.dot)} />
                {status.label}
              </span>
            )}
          </div>

          <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Contact number" value={visitor?.contact || '—'} mono />
            <Field label="Date of visit" value={formatDate(visitor?.visit_date)} mono />
            <Field label="Purpose of visit" value={visitor?.purpose || '—'} wide />
            {visitor?.purpose === 'Other' && (
              <Field label="Specified purpose" value={visitor?.purpose_other || '—'} wide />
            )}
            <Field label="Person / office to visit" value={visitor?.person_office_to_visit || '—'} wide />
            <Field label="Valid ID type" value={visitor?.id_type || '—'} />
            <Field label="ID number" value={visitor?.id_number || '—'} mono />
            <Field label="Registered" value={formatDateTime(visitor?.created_at)} wide />
          </dl>

          <div className="mt-6 flex justify-end">
            <DialogClose render={<Button variant="outline">Close</Button>} />
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}
