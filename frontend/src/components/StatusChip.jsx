import { Badge } from '@/components/ui/badge'

const statusConfig = {
  Cleared: 'bg-status-cleared/15 text-status-cleared',
  Resolved: 'bg-muted-foreground/15 text-muted-foreground',
  Flagged: 'bg-status-flagged/15 text-status-flagged',
  Pending: 'bg-status-pending/15 text-status-pending',
  Logged: 'bg-info/15 text-info',
  'Non-compliant': 'bg-status-flagged/15 text-status-flagged',
}

const dotColors = {
  Cleared: 'bg-status-cleared',
  Resolved: 'bg-muted-foreground',
  Flagged: 'bg-status-flagged',
  Pending: 'bg-status-pending',
  Logged: 'bg-info',
  'Non-compliant': 'bg-status-flagged',
}

export default function StatusChip({ status = 'Pending' }) {
  const config = statusConfig[status] || statusConfig.Pending
  const dot = dotColors[status] || dotColors.Pending

  return (
    <Badge variant="secondary" className={`gap-1.5 rounded-full px-2.5 py-0.5 border-0 ${config}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </Badge>
  )
}
