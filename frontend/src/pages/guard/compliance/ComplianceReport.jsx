import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo.jsx'
import * as complianceService from '../../../services/guard/compliance'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function StatusChip({ status }) {
  const styles = {
    'Non-Compliant': 'text-red-700 border-red-700/40 bg-red-700/10',
    Resolved: 'text-green-700 border-green-700/40 bg-green-700/10',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 border ${
        styles[status] || 'text-neutral-600 border-neutral-400/40 bg-neutral-100'
      }`}
    >
      {status.toUpperCase()}
    </span>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-3 py-1.5 border-b border-neutral-200 last:border-b-0">
      <span className="w-32 shrink-0 text-[10px] font-bold uppercase tracking-widest text-neutral-500 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-neutral-900">{value || '—'}</span>
    </div>
  )
}

function ReportView({ record }) {
  const photos = record.photo_evidences || []

  return (
    <div className="bg-white text-neutral-900 p-6 sm:p-8 print:p-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b-2 border-neutral-900">
        <img src="/tcgc.png" alt="TCGC logo" className="w-14 h-14 object-contain" />
        <div className="text-center">
          <div className="text-lg font-extrabold uppercase tracking-tight">Tangub City Global College</div>
          <div className="text-sm font-semibold tracking-widest text-neutral-600">Tangub City</div>
        </div>
        <Logo size={56} />
      </div>

      {/* Title */}
      <div className="mt-5 mb-4 text-center">
        <h2 className="text-xl font-extrabold uppercase tracking-wide">Safety and Security Monitoring Slip</h2>
        <div className="mt-0.5 text-xs text-neutral-500 font-mono">
          Record No. #{record.id} · Generated {formatDate(record.created_at)}
        </div>
      </div>

      {/* Details */}
      <div className="border border-neutral-300 rounded-lg px-4 py-2 mb-4">
        <InfoRow label="Room" value={`${record.room?.room_name || '—'} (${record.room?.type || ''} · ${record.room?.building || ''} · Floor ${record.room?.floor || '—'})`} />
        <InfoRow label="Recorded By" value={record.recorded_by} />
        <InfoRow label="Status" value={<StatusChip status={record.status} />} />
        <InfoRow label="Created At" value={formatDate(record.created_at)} />
      </div>

      {/* Issues */}
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Issues Found</div>
        <p className="mt-1 text-sm leading-relaxed text-neutral-900">{record.issues || 'None — room passed compliance.'}</p>
      </div>

      {/* Remarks */}
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Remarks</div>
        <p className="mt-1 text-sm leading-relaxed text-neutral-900">{record.remarks || '—'}</p>
      </div>

      {/* Evidence */}
      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          Photo Evidence ({photos.length})
        </div>
        {photos.length === 0 ? (
          <p className="mt-1 text-sm text-neutral-500">No photo evidence attached.</p>
        ) : (
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="border border-neutral-300 rounded-md overflow-hidden">
                <img
                  src={photo.url}
                  alt="Evidence"
                  className="w-full h-28 object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-neutral-300">
        <div className="text-[10px] font-mono text-neutral-500">
          This report was generated through DisciScan and reflects the room compliance check recorded by the
          school personnel above. Printed on {formatDate(new Date())}.
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          <div className="text-center">
            <div className="border-t border-neutral-900 pt-1 text-xs font-semibold">{record.recorded_by || 'Recorder'}</div>
            <div className="mt-1 text-[10px] uppercase tracking-widest text-neutral-500">Recorded By</div>
          </div>
          <div className="text-center">
            <div className="border-t border-neutral-900 pt-1 text-xs font-semibold">{record.noted_by || 'Security Office'}</div>
            <div className="mt-1 text-[10px] uppercase tracking-widest text-neutral-500">Noted By</div>
          </div>
          <div className="text-center">
            <div className="border-t border-neutral-900 pt-1 text-xs font-semibold">&nbsp;</div>
            <div className="mt-1 text-[10px] uppercase tracking-widest text-neutral-500">Conforme</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ComplianceReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    complianceService
      .getCompliance(id)
      .then((data) => {
        if (!cancelled) setRecord(data)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load the compliance record.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="min-h-dvh dot-grid">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6">
        {/* action bar */}
        <div className="flex items-center justify-between gap-3 mb-5 print:hidden">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2 text-xs font-mono"
          >
            <ArrowLeft className="size-4" />
            BACK
          </Button>
          <Button
            onClick={() => window.print()}
            className="gap-2 text-xs font-mono"
          >
            <Printer className="size-4" />
            PRINT / SAVE PDF
          </Button>
        </div>

        {loading ? (
          <div className="border border-border bg-card rounded-lg p-12 text-center text-muted-foreground font-mono text-xs">
            LOADING REPORT…
          </div>
        ) : error || !record ? (
          <div className="border border-border bg-card rounded-lg p-12 text-center">
            <div className="text-2xl mb-2 text-info">◉</div>
            <p className="text-muted-foreground text-sm">{error || 'Record not found.'}</p>
            <Button
              variant="outline"
              className="mt-4 text-xs font-mono"
              onClick={() => navigate(-1)}
            >
              GO BACK
            </Button>
          </div>
        ) : (
          <ReportView record={record} />
        )}
      </div>
    </div>
  )
}