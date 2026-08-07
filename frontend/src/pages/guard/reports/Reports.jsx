import { useCallback, useEffect, useState } from 'react'
import {
  BarChart3,
  CalendarCheck2,
  Filter,
  Loader2,
  Printer,
  ShieldCheck,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Logo from '@/components/Logo.jsx'
import { MultiLineChart } from '@/components/dashboard/Charts.jsx'
import { listAcademicYears } from '../../../services/guard/academicYears'
import { listViolationTypes } from '../../../services/guard/violations'
import { getReport } from '../../../services/guard/reports'

const REPORT_TYPES = [
  { key: 'summary', label: 'Executive Summary', desc: 'System-wide snapshot', icon: BarChart3 },
  { key: 'violations', label: 'Violations', desc: 'Discipline records', icon: TriangleAlert },
  { key: 'attendance', label: 'Attendance', desc: 'Student time logs', icon: CalendarCheck2 },
  { key: 'visitors', label: 'Visitors', desc: 'Gate visitor log', icon: Users },
  { key: 'compliance', label: 'Compliance', desc: 'Facility inspections', icon: ShieldCheck },
]

const STATUS_OPTIONS = {
  violations: [
    { value: '', label: 'All statuses' },
    { value: 'Non-compliant', label: 'Non-compliant' },
    { value: 'Resolved', label: 'Resolved' },
  ],
  visitors: [
    { value: '', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'checked_in', label: 'Checked in' },
    { value: 'checked_out', label: 'Checked out' },
  ],
  compliance: [
    { value: '', label: 'All statuses' },
    { value: 'Resolved', label: 'Compliant' },
    { value: 'Non-Compliant', label: 'Non-compliant' },
  ],
}

function toApiDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function PrintStatus({ value }) {
  const resolved = value === 'Resolved' || value === 'checked_out'
  const flagged = value === 'Non-compliant' || value === 'Non-Compliant' || value === 'pending'

  return (
    <span className={`text-xs font-bold uppercase ${resolved ? 'text-green-700' : flagged ? 'text-red-700' : 'text-neutral-600'}`}>
      {value === 'pending' ? 'Pending' : value === 'checked_in' ? 'Checked in' : value}
    </span>
  )
}

function ReportDocument({ data }) {
  const { meta, kpis, sections, chart } = data

  const CHART_SERIES = [
    { key: 'ins', label: 'Check-ins', color: '#2563EB' },
    { key: 'outs', label: 'Check-outs', color: '#16A34A' },
  ]

  return (
    <div className="bg-white text-neutral-900 p-6 sm:p-8 print:p-0">
      {/* Letterhead */}
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
        <h2 className="text-xl font-extrabold uppercase tracking-wide">{meta.title}</h2>
        <div className="mt-0.5 text-xs text-neutral-500 font-mono">
          Generated {meta.generated_at} · by {meta.generated_by || 'System'}
        </div>
      </div>

      {/* Filters */}
      {meta.filters.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-5">
          {meta.filters.map((filter) => (
            <span
              key={filter}
              className="rounded border border-neutral-300 px-2 py-1 text-[10px] font-mono text-neutral-600"
            >
              {filter}
            </span>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="border border-neutral-300 rounded-lg p-3 text-center break-inside-avoid">
            <div className="text-2xl font-extrabold">{kpi.value}</div>
            <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-neutral-500">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chart && chart.points && chart.points.length > 0 && (
        <section className="mb-6 break-inside-avoid min-w-0">
          <h3 className="text-xs font-extrabold uppercase tracking-widest border-b-2 border-neutral-900 pb-1 mb-2">
            {chart.title || 'Daily Trend'}
          </h3>
          <div className="border border-neutral-300 rounded-lg p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-4 mb-2 text-[10px] font-mono text-neutral-600">
              {CHART_SERIES.map((s) => (
                <span key={s.key} className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: s.color }} />
                  {s.label}
                </span>
              ))}
            </div>
            <MultiLineChart data={chart.points} series={CHART_SERIES} name={chart.title || 'Daily trend'} />
          </div>
        </section>
      )}

      {/* Sections */}
      {sections.map((section) => (
        <section key={section.title} className="mb-6 min-w-0">
          <h3 className="text-xs font-extrabold uppercase tracking-widest border-b-2 border-neutral-900 pb-1 mb-2">
            {section.title}
          </h3>
          {section.rows.length === 0 ? (
            <p className="text-sm text-neutral-500">No records found for the selected filters.</p>
          ) : (
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr>
                    {section.headers.map((header) => (
                      <th
                        key={header}
                        className="border border-neutral-300 bg-neutral-100 px-2 py-1.5 text-left font-bold uppercase tracking-wide"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="break-inside-avoid">
                      {section.headers.map((header, colIndex) => (
                        <td key={header} className="border border-neutral-300 px-2 py-1.5 align-top">
                          {header === 'Status' || header === 'Type' ? (
                            <PrintStatus value={String(row[colIndex])} />
                          ) : (
                            String(row[colIndex] ?? '')
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}

      {/* Footer */}
      <div className="pt-3 border-t border-neutral-300 mt-8">
        <div className="text-[10px] font-mono text-neutral-500">
          This report was generated through DisciScan and reflects the records captured by the monitoring
          system within the period above. Printed on{' '}
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
        </div>
        <div className="mt-10 flex justify-center">
          <div className="text-center w-64">
            <div className="border-t border-neutral-900 pt-1 text-xs font-semibold">{meta.generated_by || 'Prepared By'}</div>
            <div className="mt-1 text-[10px] uppercase tracking-widest text-neutral-500">Prepared By</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Reports() {
  const [type, setType] = useState('summary')
  const [from, setFrom] = useState(null)
  const [to, setTo] = useState(null)
  const [academicYearId, setAcademicYearId] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')

  const [academicYears, setAcademicYears] = useState([])
  const [violationTypes, setViolationTypes] = useState([])

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listAcademicYears()
      .then((res) => setAcademicYears(res.data || []))
      .catch(() => {})

    listViolationTypes()
      .then((res) => setViolationTypes(res || []))
      .catch(() => {})
  }, [])

  const params = useCallback(() => {
    const query = {}
    if (from) query.from = toApiDate(from)
    if (to) query.to = toApiDate(to)
    if (academicYearId) query.academic_year_id = academicYearId
    if (status) query.status = status
    if (category) query.category = category
    return query
  }, [from, to, academicYearId, status, category])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    getReport(type, params())
      .then((res) => {
        if (cancelled) return
        setData(res)
      })
      .catch(() => {
        if (cancelled) return
        setError('Failed to load the report. Please try again.')
        setData(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [type, params])

  function resetFilters() {
    setFrom(null)
    setTo(null)
    setAcademicYearId('')
    setStatus('')
    setCategory('')
  }

  function handlePrint() {
    if (loading || !data) return
    const previousTitle = document.title
    const reportName = data.meta?.title || 'Report'
    document.title = `${reportName} — ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}`
    window.print()
    setTimeout(() => {
      document.title = previousTitle
    }, 100)
  }

  const showStatus = Boolean(STATUS_OPTIONS[type])
  const showCategory = type === 'violations'

  return (
    <div className="min-w-0">
      {/* App chrome — hidden on print */}
      <div className="print:hidden">
        {/* Header */}
        <header className="border-b border-border px-6 lg:px-10 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                <span className="text-primary">Guard</span> / <span className="text-brand-green">Reports</span>
              </p>
              <h1 className="text-2xl font-bold text-foreground">Reports</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Records you logged — pick a report type, set the filters, then print or save as PDF.
              </p>
            </div>
            <Button
              onClick={handlePrint}
              disabled={loading || !data}
              className="w-full sm:w-auto h-auto bg-primary text-primary-foreground font-bold text-sm px-5 py-3 rounded hover:bg-primary/80 hover:text-text dark:hover:bg-white dark:hover:text-text transition disabled:opacity-60"
            >
              <Printer className="w-4 h-4" /> PRINT / SAVE PDF
            </Button>
          </div>
        </header>

        <div className="px-6 lg:px-10 pt-6">
          {/* Report type selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {REPORT_TYPES.map((report) => {
              const Icon = report.icon
              const active = type === report.key
              return (
                <button
                  key={report.key}
                  type="button"
                  onClick={() => setType(report.key)}
                  className={`flex items-start gap-3 rounded-lg border p-4 text-left transition cursor-pointer min-h-11 ${
                    active
                      ? 'border-primary/60 bg-primary/10 text-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary'
                  }`}
                >
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${active ? 'text-primary' : 'text-brand-green'}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{report.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{report.desc}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Filters */}
          <div className="mt-6 border border-border bg-card rounded-lg p-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                <Filter className="w-3.5 h-3.5" /> FILTERS
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="h-auto rounded px-3 py-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground"
              >
                CLEAR FILTERS
              </Button>
            </div>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr))]">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">From</Label>
                <DatePicker value={from} onChange={setFrom} placeholder="Start date" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">To</Label>
                <DatePicker value={to} onChange={setTo} placeholder="End date" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">Academic year</Label>
                <Select value={academicYearId} onValueChange={setAcademicYearId}>
                  <SelectTrigger className="w-full h-auto bg-secondary border-border rounded px-4 py-3 text-sm data-[size=default]:!h-auto">
                    <SelectValue placeholder="All years">
                      {(value) => {
                        const year = academicYears.find((y) => String(y.id) === String(value ?? ''))
                        return (
                          <span className={!value ? 'text-muted-foreground' : ''}>
                            {year ? year.description || year.code : 'All years'}
                          </span>
                        )
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All years</SelectItem>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={String(year.id)}>
                        {year.code} — {year.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {showStatus && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full h-auto bg-secondary border-border rounded px-4 py-3 text-sm data-[size=default]:!h-auto">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS[type].map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {showCategory && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full h-auto bg-secondary border-border rounded px-4 py-3 text-sm data-[size=default]:!h-auto">
                      <SelectValue placeholder="All categories">
                        {(value) => {
                          const vt = violationTypes.find((t) => String(t.id) === String(value ?? ''))
                          return (
                            <span className={!value ? 'text-muted-foreground' : ''}>
                              {vt ? vt.name : 'All categories'}
                            </span>
                          )
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {violationTypes.map((vt) => (
                        <SelectItem key={vt.id} value={String(vt.id)}>
                          {vt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report document — visible on screen, prints as-is */}
      <div className="px-6 lg:px-10 py-8 print:p-0">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-xs font-mono tracking-widest">GENERATING REPORT…</span>
          </div>
        ) : error ? (
          <div className="border border-status-flagged/40 bg-status-flagged/10 rounded-lg p-8 text-center">
            <p className="text-sm font-mono text-status-flagged">{error}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4 h-auto rounded px-4 py-2 text-xs"
            >
              RETRY
            </Button>
          </div>
        ) : data ? (
          <ReportDocument data={data} />
        ) : null}
      </div>
    </div>
  )
}
