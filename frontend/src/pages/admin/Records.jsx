import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import StatusChip from '../../components/StatusChip.jsx'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'

const records = [
  {
    no: 'VIO-04471',
    date: 'Jul 31 · 08:14',
    name: 'Marielle Sombilon',
    category: 'Violation',
    details: 'Incomplete uniform',
    loggedBy: 'G. Dela Cruz',
    status: 'Flagged',
  },
  {
    no: 'VIS-00219',
    date: 'Jul 31 · 08:11',
    name: 'Jonas Ramos',
    category: 'Visitor Log',
    details: "Entry — Registrar's Office",
    loggedBy: 'R. Ondona',
    status: 'Logged',
  },
  {
    no: 'COMP-00087',
    date: 'Jul 31 · 08:09',
    name: 'Room 204 — Lab',
    category: 'Compliance',
    details: 'Lights left on after class',
    loggedBy: 'G. Dela Cruz',
    status: 'Flagged',
  },
  {
    no: 'ATT-11923',
    date: 'Jul 31 · 08:02',
    name: 'Andrei Cabahug',
    category: 'Attendance',
    details: 'Time-in recorded',
    loggedBy: 'R. Ondona',
    status: 'Cleared',
  },
  {
    no: 'VIO-04466',
    date: 'Jul 30 · 16:40',
    name: 'Kim Alforque',
    category: 'Violation',
    details: 'No ID worn',
    loggedBy: 'G. Dela Cruz',
    status: 'Resolved',
  },
  {
    no: 'VIS-00218',
    date: 'Jul 30 · 15:12',
    name: 'Liza Fernandez',
    category: 'Visitor Log',
    details: 'Exit — main gate',
    loggedBy: 'R. Ondona',
    status: 'Logged',
  },
]

const recordTypes = ['ALL TYPES', 'VIOLATIONS', 'ATTENDANCE', 'VISITOR LOGS', 'COMPLIANCE']
const recordStatuses = ['ALL STATUS', 'FLAGGED', 'CLEARED', 'RESOLVED', 'PENDING']

export default function Records() {
  return (
    <div className="min-h-screen dot-grid">
      <header className="border-b border-border px-6 lg:px-10 py-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/dashboard"
            className="text-muted-foreground hover:text-foreground transition text-sm"
          >
            ← Back
          </Link>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest">
              <span className="text-primary">Admin</span>
              <span className="text-muted-foreground"> / </span>
              <span className="text-brand-green">Records</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-foreground">All records</h1>
          </div>
        </div>
        <Button className="h-auto! px-4 py-2.5 text-xs font-mono font-bold rounded hover:text-text dark:hover:bg-white dark:hover:text-text">
          ↓ EXPORT REPORT
        </Button>
      </header>

      <div className="px-6 lg:px-10 py-8">
        {/* filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center bg-card border border-border rounded px-3 py-2 gap-2 flex-1 min-w-[220px]">
            <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, ID, or record no."
              className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60 flex-1"
            />
          </div>
          <Select defaultValue="ALL TYPES">
            <SelectTrigger className="w-auto h-auto bg-card border-border rounded px-3 py-2.5 text-xs font-mono text-muted-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {recordTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="ALL STATUS">
            <SelectTrigger className="w-auto h-auto bg-card border-border rounded px-3 py-2.5 text-xs font-mono text-muted-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {recordStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="w-auto h-auto bg-card border-border rounded px-3 py-2 text-xs font-mono text-muted-foreground"
          />
        </div>

        {/* records table */}
        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-secondary/60">
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  <input type="checkbox" className="accent-[#F5A623]" />
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Record No.
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Date / Time
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Name
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Category
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Details
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Logged by
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.no}>
                  <TableCell className="px-5 py-3.5">
                    <input type="checkbox" className="accent-[#F5A623]" />
                  </TableCell>
                  <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                    {record.no}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                    {record.date}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 font-medium text-foreground">
                    {record.name}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-muted-foreground">
                    {record.category}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-muted-foreground">
                    {record.details}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                    {record.loggedBy}
                  </TableCell>
                  <TableCell className="px-5 py-3.5">
                    <StatusChip status={record.status} />
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-right text-muted-foreground">···</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-5 py-4 border-t border-border text-xs font-mono text-muted-foreground">
            <span>Showing 1–6 of 4,812 records</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-auto! px-3 py-1.5 rounded text-foreground hover:border-primary hover:text-primary">
                ← PREV
              </Button>
              <Button variant="outline" className="h-auto! px-3 py-1.5 rounded border-primary text-primary">1</Button>
              <Button variant="outline" className="h-auto! px-3 py-1.5 rounded text-foreground hover:border-primary hover:text-primary">
                2
              </Button>
              <Button variant="outline" className="h-auto! px-3 py-1.5 rounded text-foreground hover:border-primary hover:text-primary">
                3
              </Button>
              <Button variant="outline" className="h-auto! px-3 py-1.5 rounded text-foreground hover:border-primary hover:text-primary">
                NEXT →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
