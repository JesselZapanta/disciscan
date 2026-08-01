import CornerBracket from '../components/CornerBracket.jsx'
import { QrCode, ShieldCheck, ClipboardList, UserCheck } from 'lucide-react'

const roles = [
  {
    icon: ShieldCheck,
    code: 'ADMIN',
    title: 'Admin',
    text: 'Manages accounts, reviews every record, configures violation types, and generates reports.',
  },
  {
    icon: QrCode,
    code: 'SECURITY GUARD',
    title: 'Security Guard',
    text: 'Scans IDs at the gate, logs violations, and records attendance and visitor movement.',
  },
  {
    icon: ClipboardList,
    code: 'STUDENT',
    title: 'Student',
    text: 'Identified instantly by QR badge — no manual entry, no logbook.',
  },
  {
    icon: UserCheck,
    code: 'VISITOR',
    title: 'Visitor',
    text: 'Registers at the gate and receives a QR for entry and exit tracking.',
  },
]

const modules = [
  'Records',
  'Violation Types',
  'User Accounts',
  'Attendance',
  'Compliance',
  'Visitor Logs',
  'Reports',
]

export default function SystemInfo() {
  return (
    <div className="px-6 lg:px-10 py-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="inline-flex items-center gap-2 border border-border rounded-full px-3 py-1 text-[11px] font-mono text-muted-foreground mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          SYSTEM INFORMATION
        </div>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          DisciScan
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
          A QR-code-based disciplinary records and monitoring system for schools —
          replacing the paper logbook from the gate to the admin desk.
        </p>

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <CornerBracket className="border border-border bg-card rounded-lg p-6">
            <span className="font-mono text-[11px] text-primary uppercase tracking-widest">
              01 — WHAT IT IS
            </span>
            <h2 className="text-xl font-bold mt-2 mb-4 text-foreground">One record system</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every scan, entry, and observation lands in the same database. Student
              violations, visitor entry and exit, attendance, and office compliance are
              tracked from the gate to the admin desk — nothing lives in a paper log again.
            </p>
          </CornerBracket>

          <CornerBracket className="border border-border bg-card rounded-lg p-6">
            <span className="font-mono text-[11px] text-primary uppercase tracking-widest">
              02 — HOW IT WORKS
            </span>
            <h2 className="text-xl font-bold mt-2 mb-4 text-foreground">Scan, identify, record</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-brand-green font-mono font-bold">1.</span>
                A student or visitor presents their QR code at the gate.
              </li>
              <li className="flex gap-3">
                <span className="text-brand-green font-mono font-bold">2.</span>
                The guard scans it and the identity is retrieved instantly.
              </li>
              <li className="flex gap-3">
                <span className="text-brand-green font-mono font-bold">3.</span>
                Violations, attendance, or visitor entries are logged in one record.
              </li>
              <li className="flex gap-3">
                <span className="text-brand-green font-mono font-bold">4.</span>
                Admins review, manage, and report on everything from the dashboard.
              </li>
            </ol>
          </CornerBracket>
        </div>

        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((role) => (
            <CornerBracket key={role.code} className="border border-border bg-card rounded-lg p-5">
              <div className="flex items-center justify-between">
                <role.icon className="h-5 w-5 text-primary" />
                <span className="font-mono text-[10px] text-brand-green">{role.code}</span>
              </div>
              <h3 className="font-semibold mt-3 mb-1.5 text-foreground">{role.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{role.text}</p>
            </CornerBracket>
          ))}
        </div>

        <CornerBracket className="mt-6 border border-border bg-card rounded-lg p-6">
          <span className="font-mono text-[11px] text-primary uppercase tracking-widest">
            03 — MODULES
          </span>
          <div className="mt-4 flex flex-wrap gap-2">
            {modules.map((module) => (
              <span
                key={module}
                className="border border-border rounded-full px-3 py-1.5 text-xs font-mono text-muted-foreground"
              >
                {module.toUpperCase()}
              </span>
            ))}
          </div>
        </CornerBracket>

        <div className="mt-6 border border-border bg-card rounded-lg px-6 py-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-mono text-muted-foreground">
            A THESIS FOR THE DEGREE OF{' '}
            <span className="text-foreground font-semibold">BACHELOR OF SCIENCE IN COMPUTER SCIENCE</span>
          </span>
          <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground font-semibold">
            <span>Kenley C. Broñola</span>
            <span>Kimberly Magsayo</span>
            <span>Romel G. Ondona</span>
            <span>Yasser Rowaon</span>
          </span>
        </div>
      </div>
    </div>
  )
}
