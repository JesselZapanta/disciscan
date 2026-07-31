import StatusChip from '../../components/StatusChip.jsx'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'

const attendanceLog = [
  { id: 1, student: 'Marcus Rivera', idNumber: 'STU-2024-001', timeIn: '07:45 AM', timeOut: '04:30 PM', date: '2026-07-30', status: 'On Time' },
  { id: 2, student: 'Sofia Chen', idNumber: 'STU-2024-002', timeIn: '08:15 AM', timeOut: '—', date: '2026-07-30', status: 'Late' },
  { id: 3, student: 'James Okonkwo', idNumber: 'STU-2024-003', timeIn: '07:50 AM', timeOut: '04:00 PM', date: '2026-07-30', status: 'On Time' },
  { id: 4, student: 'Priya Sharma', idNumber: 'STU-2024-004', timeIn: '—', timeOut: '—', date: '2026-07-30', status: 'Absent' },
  { id: 5, student: 'Liam O\'Brien', idNumber: 'STU-2024-005', timeIn: '08:30 AM', timeOut: '04:15 PM', date: '2026-07-30', status: 'Late' },
  { id: 6, student: 'Emma Wilson', idNumber: 'STU-2024-006', timeIn: '07:30 AM', timeOut: '05:00 PM', date: '2026-07-30', status: 'On Time' },
  { id: 7, student: 'Noah Kim', idNumber: 'STU-2024-007', timeIn: '07:55 AM', timeOut: '03:45 PM', date: '2026-07-30', status: 'On Time' },
  { id: 8, student: 'Aisha Patel', idNumber: 'STU-2024-008', timeIn: '—', timeOut: '—', date: '2026-07-30', status: 'Absent' },
]

function getStatusConfig(status) {
  switch (status) {
    case 'On Time':
      return { chip: 'Cleared' }
    case 'Late':
      return { chip: 'Pending' }
    case 'Absent':
      return { chip: 'Flagged' }
    default:
      return { chip: 'Pending' }
  }
}

export default function Attendance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-sans">Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">Daily attendance log</p>
      </div>

      <div className="hidden md:block">
        <Card className="ring-0 overflow-hidden">
          <CardContent className="p-0 pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Student
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    ID Number
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Time In
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Time Out
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceLog.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      <div className="text-2xl mb-2 text-info">◷</div>
                      No attendance records for today
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceLog.map((entry) => {
                    const cfg = getStatusConfig(entry.status)
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm font-medium text-foreground">{entry.student}</TableCell>
                        <TableCell className="text-xs font-mono text-info">{entry.idNumber}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{entry.date}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{entry.timeIn}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{entry.timeOut}</TableCell>
                        <TableCell>
                          <StatusChip status={cfg.chip} />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {attendanceLog.length === 0 ? (
          <div className="border border-border bg-background p-6 rounded-lg text-center text-muted-foreground">
            <div className="text-2xl mb-2 text-info">◷</div>
            No attendance records for today
          </div>
        ) : (
          attendanceLog.map((entry) => {
            const cfg = getStatusConfig(entry.status)
            return (
              <div key={entry.id} className="border border-border bg-background p-4 rounded-lg space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-foreground">{entry.student}</p>
                  <StatusChip status={cfg.chip} />
                </div>
                <p className="text-xs font-mono text-info">{entry.idNumber}</p>
                <p className="text-xs font-mono text-muted-foreground">{entry.date}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>In <span className="font-mono">{entry.timeIn}</span></span>
                  <span>Out <span className="font-mono">{entry.timeOut}</span></span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
