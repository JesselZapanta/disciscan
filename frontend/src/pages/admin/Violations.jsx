import StatusChip from '../../components/StatusChip.jsx'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'

const violations = [
  { id: 'VIO-2026-0421', student: 'Marcus Rivera', type: 'Uniform', status: 'Flagged', date: '2026-07-30', guard: 'G. Reyes' },
  { id: 'VIO-2026-0420', student: 'Sofia Chen', type: 'Lateness', status: 'Cleared', date: '2026-07-30', guard: 'A. Cruz' },
  { id: 'VIO-2026-0419', student: 'James Okonkwo', type: 'Behavior', status: 'Pending', date: '2026-07-30', guard: 'G. Reyes' },
  { id: 'VIO-2026-0418', student: 'Priya Sharma', type: 'ID', status: 'Cleared', date: '2026-07-29', guard: 'M. Torres' },
  { id: 'VIO-2026-0417', student: 'Liam O\'Brien', type: 'Trespassing', status: 'Flagged', date: '2026-07-29', guard: 'A. Cruz' },
  { id: 'VIO-2026-0416', student: 'Emma Wilson', type: 'Behavior', status: 'Resolved', date: '2026-07-28', guard: 'G. Reyes' },
  { id: 'VIO-2026-0415', student: 'Noah Kim', type: 'Uniform', status: 'Pending', date: '2026-07-28', guard: 'M. Torres' },
  { id: 'VIO-2026-0414', student: 'Aisha Patel', type: 'Lateness', status: 'Cleared', date: '2026-07-27', guard: 'A. Cruz' },
]

export default function Violations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-sans">Violations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Disciplinary records log</p>
      </div>

      <div className="hidden md:block">
        <Card className="ring-0 overflow-hidden">
          <CardContent className="p-0 pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    ID
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Student
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Guard
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      <div className="text-2xl mb-2 text-info">◈</div>
                      No violations recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  violations.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="text-xs font-mono text-info">{v.id}</TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{v.student}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{v.type}</TableCell>
                      <TableCell>
                        <StatusChip status={v.status} />
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{v.date}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{v.guard}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {violations.length === 0 ? (
          <div className="border border-border bg-background p-6 rounded-lg text-center text-muted-foreground">
            <div className="text-2xl mb-2 text-info">◈</div>
            No violations recorded yet
          </div>
        ) : (
          violations.map((v) => (
            <div key={v.id} className="border border-border bg-background p-4 rounded-lg space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono text-info">{v.id}</span>
                <StatusChip status={v.status} />
              </div>
              <p className="text-sm font-bold text-foreground">{v.student}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{v.type}</span>
                <span className="font-mono text-muted-foreground">{v.guard}</span>
              </div>
              <p className="text-xs font-mono text-muted-foreground">{v.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
