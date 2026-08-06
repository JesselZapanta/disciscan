import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export const DAYS_OPTIONS = [15, 30, 60, 90]

export function labelIndexesFor(length) {
  const every = Math.max(1, Math.ceil(length / 8))
  return Array.from({ length }, (_, i) => i).filter((i) => i % every === 0 || i === length - 1)
}

export function BarsChart({ data, color, name }) {
  const W = 560
  const H = 170
  const PAD = 8
  const top = 24
  const floor = H - 24
  const chartH = floor - top
  const max = Math.max(1, ...data.map((d) => d.value))
  const step = (W - PAD * 2) / data.length
  const barW = Math.min(26, step * 0.55)
  const barX = (i) => PAD + step * i + (step - barW) / 2
  const barY = (v) => floor - (v / max) * chartH
  const labelIndexes = labelIndexesFor(data.length)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44 sm:h-48" role="img" aria-label={`${name} over the selected period`}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={floor - chartH * f} y2={floor - chartH * f} stroke="#2A323D" strokeWidth="1" />
      ))}
      {data.map((d, i) => (
        <rect
          key={`bar-${i}`}
          x={barX(i)}
          y={barY(d.value)}
          width={barW}
          height={Math.max(floor - barY(d.value), d.value > 0 ? 2 : 0)}
          rx={2}
          fill={color}
          opacity={d.value > 0 ? 0.85 : 0.2}
        />
      ))}
      {labelIndexes.map((i) => (
        <text key={`label-${i}`} x={PAD + step * i + step / 2} y={H - 4} textAnchor="middle" fill="#8A94A6" fontSize="9" fontFamily="JetBrains Mono, monospace">
          {data[i].label}
        </text>
      ))}
    </svg>
  )
}

export function LineChart({ data, color, name }) {
  const W = 560
  const H = 170
  const PAD = 8
  const top = 24
  const floor = H - 24
  const chartH = floor - top
  const max = Math.max(1, ...data.map((d) => d.value))
  const step = (W - PAD * 2) / data.length
  const lineX = (i) => PAD + step * i + step / 2
  const lineY = (v) => floor - (Math.max(v, 0.0001) / max) * chartH
  const points = data.map((d, i) => `${lineX(i)},${lineY(d.value)}`).join(' ')
  const areaPoints = `${PAD},${floor} ${points} ${W - PAD},${floor}`
  const labelIndexes = labelIndexesFor(data.length)
  const gradientId = `area-${name.replace(/\W+/g, '-').toLowerCase()}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44 sm:h-48" role="img" aria-label={`${name} over the selected period`}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={floor - chartH * f} y2={floor - chartH * f} stroke="#2A323D" strokeWidth="1" />
      ))}
      <polyline fill="none" stroke={color} strokeWidth="2.5" points={points} />
      <polyline fill={`url(#${gradientId})`} stroke="none" points={areaPoints} />
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {labelIndexes.map((i) => (
        <text key={`label-${i}`} x={lineX(i)} y={H - 4} textAnchor="middle" fill="#8A94A6" fontSize="9" fontFamily="JetBrains Mono, monospace">
          {data[i].label}
        </text>
      ))}
    </svg>
  )
}

export function Donut({ rate }) {
  const pct = Math.min(100, Math.max(0, rate ?? 0))
  return (
    <div
      className="relative mx-auto size-36 sm:size-40 rounded-full"
      style={{ background: `conic-gradient(#16A34A ${pct * 3.6}deg, #DC2626 0deg)` }}
    >
      <div className="absolute inset-3 rounded-full bg-card flex flex-col items-center justify-center border border-border">
        <span className="text-3xl font-extrabold font-mono text-foreground">{pct}%</span>
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
          Resolved
        </span>
      </div>
    </div>
  )
}

export function RangeSelect({ value, onChange }) {
  return (
    <Select value={String(value)} onValueChange={(next) => onChange(Number(next))}>
      <SelectTrigger className="w-fit min-w-[170px] h-11 bg-card border-border rounded-lg px-3 text-xs font-mono font-semibold uppercase gap-2" aria-label="Date range">
        <SelectValue>Last {value} days</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {DAYS_OPTIONS.map((d) => (
          <SelectItem key={d} value={String(d)} label={`Last ${d} days`} className="font-mono text-xs uppercase">
            Last {d} days
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
