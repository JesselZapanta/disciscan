import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  FileWarning,
  GraduationCap,
  Loader2,
  RotateCw,
  TriangleAlert,
  UserCheck,
  Users,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import CornerBracket from '../../components/CornerBracket.jsx'
import { BarsChart, LineChart, Donut, RangeSelect } from '../../components/dashboard/Charts.jsx'
import { Button } from '@/components/ui/button'
import { getDashboard } from '../../services/admin/dashboard'

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

export default function Dashboard() {
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
  const topViolationTypes = data?.top_violation_types || []
  const topOffenders = data?.top_offenders || []

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
        label: 'Students Enrolled',
        value: formatNumber(kpis.total_students),
        icon: GraduationCap,
        accent: 'text-primary',
        to: '/admin/students',
        trend: null,
      },
      {
        label: 'Present Today',
        value: formatNumber(kpis.present_today),
        icon: UserCheck,
        accent: 'text-status-cleared',
        to: '/admin/student-logs',
        trend: trendOf(kpis.present_today, kpis.present_yesterday),
      },
      {
        label: 'Pending Violations',
        value: formatNumber(kpis.pending_violations),
        icon: FileWarning,
        accent: 'text-status-flagged',
        to: '/admin/student-violations',
        trend: null,
      },
      {
        label: 'Visitors Today',
        value: formatNumber(kpis.visitors_today),
        icon: Users,
        accent: 'text-info',
        to: '/admin/visitors',
        trend: trendOf(kpis.visitors_today, kpis.visitors_yesterday),
      },
    ]
  }, [kpis])

  const offendersMax = Math.max(1, ...topOffenders.map((o) => o.count))

  return (
    <div>
      {/* page header */}
      <div className="border-b border-border px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest">
            <span className="text-primary">Admin</span>
            <span className="text-muted-foreground"> / </span>
            <span className="text-brand-green">Overview</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-foreground">
            {greeting()}, {(user?.name || 'Admin').split(' ')[0]}.
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
                    <Link to="/admin/visitors" className="text-primary hover:underline">
                      VIEW LOGS →
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

            {/* top types + top offenders */}
            <div className="grid lg:grid-cols-3 gap-3 sm:gap-6 mb-6">
              <div className="lg:col-span-2 border border-border bg-card rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-sm text-foreground">Top violation types</h2>
                  <Link to="/admin/violation-types" className="text-[10px] font-mono text-primary hover:underline">
                    MANAGE TYPES →
                  </Link>
                </div>
                {topViolationTypes.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-mono text-xs">No violations recorded yet.</p>
                ) : (
                  <div className="space-y-4 font-mono text-xs">
                    {topViolationTypes.map((v) => (
                      <div key={v.name}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-foreground truncate mr-3">{v.name}</span>
                          <span className="text-muted-foreground shrink-0">
                            {formatNumber(v.count)} · {v.pct}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, v.pct)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-border bg-card rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-sm text-foreground">Top offenders</h2>
                  <Link to="/admin/student-violations" className="text-[10px] font-mono text-primary hover:underline">
                    ALL →
                  </Link>
                </div>
                {topOffenders.length === 0 ? (
                  <p className="text-xs font-mono text-muted-foreground">No pending violations. Clear record!</p>
                ) : (
                  <ol className="space-y-3">
                    {topOffenders.map((student, index) => (
                      <li key={student.id} className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/60 font-mono text-[10px] font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/admin/student-violations/${student.id}`}
                            className="block text-xs font-semibold text-foreground truncate hover:text-primary"
                          >
                            {student.name}
                          </Link>
                          <div className="text-[10px] font-mono text-muted-foreground truncate">
                            {student.id_number} · {student.program_and_year}
                          </div>
                          <div className="mt-1 h-1 bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-status-flagged/70 rounded-full"
                              style={{ width: `${Math.max(4, (student.count / offendersMax) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="shrink-0 text-xs font-mono font-bold text-status-flagged">
                          {student.count}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
