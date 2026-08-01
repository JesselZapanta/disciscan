import { Link } from 'react-router-dom'
import CornerBracket from '../../components/CornerBracket.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'

const statCards = [
  { label: 'Scans Today', value: '212', trend: '▲ 9%', trendClass: 'text-status-cleared' },
  { label: 'Visitors Logged', value: '36', trend: '— steady', trendClass: 'text-info' },
  { label: 'Violations Flagged', value: '8', trend: '▲ 2', trendClass: 'text-status-flagged' },
  { label: 'Clearances Issued', value: '41', trend: '▲ 5%', trendClass: 'text-status-cleared' },
]

const topActivity = [
  { label: 'Time-in scans', pct: 58 },
  { label: 'Visitor entries', pct: 24 },
  { label: 'Violation flags', pct: 11 },
  { label: 'Clearances', pct: 7 },
]

const recentScans = [
  {
    time: '08:14:02',
    name: 'Marielle Sombilon',
    id: '22-01147',
    type: 'Time-in recorded',
    loggedBy: 'Gate 1',
    status: 'Cleared',
  },
  {
    time: '08:11:47',
    name: 'Visitor — J. Ramos',
    id: 'VIS-0219',
    type: 'Visitor entry logged',
    loggedBy: 'Gate 1',
    status: 'Logged',
  },
  {
    time: '08:09:15',
    name: 'Andrei Cabahug',
    id: '21-00932',
    type: 'Incomplete uniform',
    loggedBy: 'Gate 1',
    status: 'Flagged',
  },
  {
    time: '08:02:33',
    name: 'Kimberly Magsayo',
    id: 'STAFF-014',
    type: 'Time-in recorded',
    loggedBy: 'Gate 1',
    status: 'Cleared',
  },
]

export default function GuardDashboard() {
  const { user } = useAuth()

  return (
    <div>
      {/* page header */}
      <div className="border-b border-border px-6 lg:px-10 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest">
            <span className="text-primary">Guard</span>
            <span className="text-muted-foreground"> / </span>
            <span className="text-brand-green">Overview</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-foreground">
            Good morning, {user?.name?.split(' ')[0] || 'Guard'}.
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-mono text-status-cleared border border-status-cleared/30 bg-status-cleared/10 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-cleared" /> GATE 1 ONLINE
          </span>
          <Link
            to="/guard/visitor/scan"
            className="text-xs font-mono border border-border px-4 py-2 rounded text-foreground hover:border-primary hover:text-primary transition"
          >
            OPEN SCANNER →
          </Link>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-8">
        {/* stat cards */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat) => (
            <CornerBracket key={stat.label} className="border border-border bg-card rounded-lg p-5">
              <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </span>
              <div className="flex items-end justify-between mt-3">
                <span className="text-3xl font-extrabold font-mono text-foreground">{stat.value}</span>
                <span className={`text-xs font-mono mb-1 ${stat.trendClass}`}>{stat.trend}</span>
              </div>
            </CornerBracket>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* chart */}
          <div className="lg:col-span-2 border border-border bg-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-sm text-foreground">
                Scans by hour — today
              </h2>
              <span className="text-[11px] font-mono text-muted-foreground">06:00 – 18:00</span>
            </div>
            <svg viewBox="0 0 560 180" className="w-full h-44">
              <line x1="0" y1="150" x2="560" y2="150" stroke="#2A323D" strokeWidth="1" />
              <line x1="0" y1="100" x2="560" y2="100" stroke="#2A323D" strokeWidth="1" />
              <line x1="0" y1="50" x2="560" y2="50" stroke="#2A323D" strokeWidth="1" />
              <polyline
                fill="none"
                stroke="#F5A623"
                strokeWidth="2.5"
                points="0,140 47,110 94,60 140,40 187,75 234,95 280,55 327,30 374,65 420,100 467,120 560,105"
              />
              <polyline
                fill="url(#g1)"
                stroke="none"
                points="0,140 47,110 94,60 140,40 187,75 234,95 280,55 327,30 374,65 420,100 467,120 560,105 560,180 0,180"
              />
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5A623" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-2">
              <span>06</span>
              <span>08</span>
              <span>10</span>
              <span>12</span>
              <span>14</span>
              <span>16</span>
              <span>18</span>
            </div>
          </div>

          {/* top activity */}
          <div className="border border-border bg-card rounded-lg p-6">
            <h2 className="font-semibold text-sm mb-5 text-foreground">Activity breakdown</h2>
            <div className="space-y-4 font-mono text-xs">
              {topActivity.map((v) => (
                <div key={v.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-foreground">{v.label}</span>
                    <span className="text-muted-foreground">{v.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${v.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* recent scans table */}
        <div className="mt-6 border border-border bg-card rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-sm text-foreground">Recent scans</h2>
            <Link to="/guard/visitor/scan" className="text-[11px] font-mono text-primary hover:underline">
              OPEN SCANNER →
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide px-6">
                  Time
                </TableHead>
                <TableHead className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide px-6">
                  Name / ID
                </TableHead>
                <TableHead className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide px-6">
                  Type
                </TableHead>
                <TableHead className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide px-6">
                  Gate
                </TableHead>
                <TableHead className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide px-6">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentScans.map((row) => (
                <TableRow key={row.time}>
                  <TableCell className="px-6 py-3.5 font-mono text-muted-foreground text-xs">
                    {row.time}
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="font-medium text-foreground">{row.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{row.id}</div>
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-muted-foreground">{row.type}</TableCell>
                  <TableCell className="px-6 py-3.5 text-muted-foreground font-mono text-xs">
                    {row.loggedBy}
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <StatusChip status={row.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
