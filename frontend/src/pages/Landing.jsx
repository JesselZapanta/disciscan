import { useNavigate } from 'react-router-dom'
import CornerBracket from '../components/CornerBracket.jsx'
import ScannerVisual from '../components/ScannerVisual.jsx'
import { Button } from '@/components/ui/button'

const stats = [
  { value: '150+', label: 'Violations logged / day' },
  { value: '4', label: 'User roles served' },
  { value: '<2s', label: 'Scan to ID retrieval' },
]

const features = [
  {
    code: '01 — ADMIN',
    title: 'Full oversight',
    description: 'Manage accounts, review every record, generate reports.',
  },
  {
    code: '02 — GUARD',
    title: 'Field recording',
    description: 'Scan, log violations, track attendance and compliance.',
  },
  {
    code: '03 — STUDENT',
    title: 'Badge identity',
    description: 'Identified instantly by QR — no manual entry needed.',
  },
  {
    code: '04 — VISITOR',
    title: 'Self-registration',
    description: 'Registers online, gets a unique QR for entry and exit.',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col">
      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-16 pb-24 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-border rounded-full px-3 py-1 text-[11px] font-mono text-muted-foreground mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-status-cleared" />
              LIVE MONITORING — TANGUB CITY GLOBAL COLLEGE
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-foreground">
              Every gate.
              <br />
              Every ID.
              <br />
              <span className="text-primary">One scan away.</span>
            </h1>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-lg">
              DisciScan replaces the logbook with a QR-driven record system —
              student violations, visitor entry and exit, attendance, and office
              compliance, tracked in real time from the gate to the admin desk.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button
                onClick={() => navigate('/guard')}
                className="h-auto bg-primary text-primary-foreground font-bold text-sm px-6 py-3.5 rounded hover:bg-primary/80 hover:text-text dark:hover:bg-white dark:hover:text-text transition"
              >
                Open Guard Console
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="h-auto border-border text-foreground font-semibold text-sm px-6 py-3.5 rounded hover:border-muted-foreground transition"
              >
                View Admin Dashboard
              </Button>
            </div>
            <div className="mt-14 grid grid-cols-3 gap-8 max-w-md font-mono">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* hero visual: mock scan panel */}
          <div className="relative">
            <CornerBracket className="border border-border bg-card rounded-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[11px] uppercase tracking-widest">
                  <span className="text-primary">Scanner</span>
                  <span className="text-muted-foreground"> — </span>
                  <span className="text-brand-green">Main Gate</span>
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-status-cleared">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-cleared" />
                  ACTIVE
                </span>
              </div>
              <ScannerVisual />
            </CornerBracket>
          </div>
        </div>
      </section>

      {/* feature band */}
      <section className="border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-foreground">Four roles. One record system.</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Every scan, entry, and observation lands in the same database — nothing lives in a
              paper log again.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {features.map((feature) => (
              <CornerBracket key={feature.code} className="border border-border bg-card rounded-lg p-5">
                <span className="font-mono text-[11px] text-primary">{feature.code}</span>
                <h3 className="font-semibold mt-2.5 mb-1.5 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CornerBracket>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
