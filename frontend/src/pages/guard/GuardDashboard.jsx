import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  FileWarning,
  Loader2,
  RotateCw,
  ScanLine,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import CornerBracket from '../../components/CornerBracket.jsx'
import { BarsChart, LineChart, Donut, RangeSelect } from '../../components/dashboard/Charts.jsx'
import { Button } from '@/components/ui/button'
import { getDashboard } from '../../services/guard/dashboard'

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString('en-US')
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function trendOf(current, prev) {
  if (prev <= 0) return current > 0 ? { label: '▲ NEW', up: true } : { label: '—', up: null }
  const diff = current - prev
  const pct = Math.abs(Math.round((diff / prev) * 100))
  return diff > 0 ? { label: `▲ ${pct}%`, up: true } : diff < 0 ? { label: `▼ ${pct}%`, up: false } : { label: '— steady', up: null }
}

export default function GuardDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [days, setDays] = useState(15)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getDashboard(days)
      .then((res) => setData(res))
      .catch(() => setError('Failed to load the dashboard.'))
      .finally(() => setLoading(false))
  }, [days])

  useEffect(() => {
    load()
  }, [load])

  const kpis = data?.kpis
  const series = data?.series || []

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    []
  )

  const statCards = useMemo(() => {
    if (!kpis) return []
    return [
      {
        label: 'Scans Today',
        value: formatNumber(kpis.scans_today),
        icon: ScanLine,
        accent: 'text-primary',
        to: '/guard/student/scan',
        trend: trendOf(kpis.scans_today, kpis.scans_yesterday),
      },
      {
        label: 'Visitors Today',
        value: formatNumber(kpis.visitors_today),
        icon: Users,
        accent: 'text-info',
        to: '/guard/visitor/scan',
        trend: trendOf(kpis.visitors_today, kpis.visitors_yesterday),
      },
      {
        label: 'Violations Flagged',
        value: formatNumber(kpis.violations_today),
        icon: FileWarning,
        accent: 'text-status-flagged',
        to: '/guard/violation/scan',
        trend: trendOf(kpis.violations_today, kpis.violations_yesterday),
      },
      {
        label: 'Pending Violations',
        value: formatNumber(kpis.pending_violations),
        icon: TriangleAlert,
        accent: 'text-status-flagged',
        to: '/guard/violation/scan',
        trend: null,
      },
    ]
  }, [kpis])

  return (
    <div>
      {/* page header */}
      <div className="border-b border-border px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest">
            <span className="text-primary">Guard</span>
            <span className="text-muted-foreground"> / </span>
            <span className="text-brand-green">Overview</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-foreground">
            {greeting()}, {user?.name?.split(' ')[0] || 'Guard'}.
          </h1>
          <p className="mt-0.5 text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            <CalendarDays className="size-3" /> {todayLabel}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <RangeSelect value={days} onChange={setDays} />
          <Button
            variant="outline"
            onClick={load}
            disabled={loading}
            className="h-auto! px-4 py-2.5 text-xs font-mono rounded hover:border-primary hover:text-primary gap-2"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            REFRESH
          </Button>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        {loading && !data ? (
          <div className="border border-border bg-card rounded-lg p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-6 text-brand-green animate-spin" />
            <span className="text-[11px] font-mono text-muted-foreground tracking-widest">
              LOADING DASHBOARD…
            </span>
          </div>
        ) : error || !data ? (
          <div className="border border-status-flagged/30 bg-status-flagged/5 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <TriangleAlert className="size-7 text-status-flagged" />
            <h2 className="mt-4 text-base font-semibold text-status-flagged">Load failed</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">{error}</p>
            <Button type="button" onClick={load} className="mt-5 text-xs font-mono font-bold rounded-xl">
              RETRY
            </Button>
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 mb-6">
              {statCards.map((stat) => (
                <CornerBracket key={stat.label} className="border border-border bg-card rounded-lg p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </span>
                    <stat.icon className={`size-4 shrink-0 ${stat.accent}`} />
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
                      {stat.value}
                    </span>
                    {stat.trend ? (
                      <span
                        className={`text-xs font-mono mb-1 ${
                          stat.trend.up === null
                            ? 'text-muted-foreground'
                            : stat.trend.up
                              ? 'text-status-cleared'
                              : 'text-status-flagged'
                        }`}
                      >
                        {stat.trend.label}
                      </span>
                    ) : (
                      <Link
                        to={stat.to}
                        className="text-[10px] font-mono text-primary hover:underline mb-1"
                      >
                        VIEW →
                      </Link>
                    )}
                  </div>
                </CornerBracket>
              ))}
            </div>

            {/* charts grid */}
            <div className="grid lg:grid-cols-2 gap-3 sm:gap-6 mb-6">
              <div className="border border-border bg-card rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <h2 className="font-semibold text-sm text-foreground">Check-ins — last {days} days</h2>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                    <span className="inline-block h-0.5 w-4 rounded bg-blue-500" /> CHECK-INS
                  </span>
                </div>
                <LineChart
                  data={series.map((s) => ({ label: s.label, value: s.checkins }))}
                  color="#3B82F6"
                  name="Check-ins"
                />
              </div>

              <div className="border border-border bg-card rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <h2 className="font-semibold text-sm text-foreground">Violations — last {days} days</h2>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                    <span className="inline-block h-0.5 w-4 rounded bg-status-flagged" /> VIOLATIONS
                  </span>
                </div>
                <LineChart
                  data={series.map((s) => ({ label: s.label, value: s.violations }))}
                  color="#DC2626"
                  name="Violations"
                />
              </div>

              <div className="border border-border bg-card rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <h2 className="font-semibold text-sm text-foreground">Visitor traffic — last {days} days</h2>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
                    <Link to="/guard/visitor/scan" className="text-primary hover:underline">
                      OPEN SCANNER →
                    </Link>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-sm bg-status-cleared/85" /> VISITORS
                    </span>
                  </div>
                </div>
                <BarsChart
                  data={series.map((s) => ({ label: s.label, value: s.visitors }))}
                  color="#16A34A"
                  name="Visitors"
                />
              </div>

              <div className="border border-border bg-card rounded-lg p-4 sm:p-6">
                <h2 className="font-semibold text-sm mb-4 text-foreground">Violation resolution</h2>
                <Donut rate={kpis.resolution_rate} />
                <div className="mt-5 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="inline-block h-2 w-2 rounded-full bg-status-cleared" /> Resolved
                    </span>
                    <span className="text-foreground font-semibold">{formatNumber(kpis.resolved_violations)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="inline-block h-2 w-2 rounded-full bg-status-flagged" /> Non-compliant
                    </span>
                    <span className="text-foreground font-semibold">{formatNumber(kpis.pending_violations)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2.5">
                    <span className="text-muted-foreground">Total recorded</span>
                    <span className="text-foreground font-semibold">{formatNumber(kpis.total_violations)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
