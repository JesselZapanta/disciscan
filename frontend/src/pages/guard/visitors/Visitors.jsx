import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Eye, UserPlus } from 'lucide-react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import VisitorDetailsDialog from './VisitorDetailsDialog.jsx'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import * as visitorService from '../../../services/guard/visitors'

const statusOptions = ['ALL STATUSES', 'PENDING', 'CHECKED IN', 'CHECKED OUT']

const statusConfig = {
  pending: { label: 'PENDING', chip: 'text-status-pending border-status-pending/40 bg-status-pending/10', dot: 'bg-status-pending' },
  checked_in: { label: 'CHECKED IN', chip: 'text-status-cleared border-status-cleared/40 bg-status-cleared/10', dot: 'bg-status-cleared' },
  checked_out: { label: 'CHECKED OUT', chip: 'text-info border-info/40 bg-info/10', dot: 'bg-info' },
}

const statusFallback = { label: 'UNKNOWN', chip: 'text-muted-foreground border-border bg-secondary/60', dot: 'bg-muted-foreground/50' }

function VisitorStatusChip({ status }) {
  const config = statusConfig[status] || statusFallback
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-mono rounded-full px-2.5 py-1 border',
        config.chip
      )}
    >
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Visitors() {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL STATUSES')
  const [page, setPage] = useState(1)
  const [sortDir, setSortDir] = useState('desc')
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    visitorService
      .listVisitors({
        search,
        status: status === 'ALL STATUSES' ? undefined : status.toLowerCase(),
        page,
        per_page: 10,
        sort_dir: sortDir,
      })
      .then((res) => {
        if (cancelled) return
        setVisitors(res.data || [])
        setTotal(res.meta?.total ?? 0)
        setLastPage(res.meta?.last_page ?? 1)
      })
      .catch(() => {
        if (cancelled) return
        setError('Failed to load visitor registrations.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [search, status, page, sortDir])

  function handleSortToggle() {
    setSortDir((dir) => (dir === 'desc' ? 'asc' : 'desc'))
    setPage(1)
  }

  const from = total === 0 ? 0 : (page - 1) * 10 + 1
  const to = Math.min(page * 10, total)

  const pageNumbers = (() => {
    if (lastPage <= 5) return Array.from({ length: lastPage }, (_, i) => i + 1)
    const set = new Set([1, page - 1, page, page + 1, lastPage])
    return [...set].filter((p) => p >= 1 && p <= lastPage).sort((a, b) => a - b)
  })()

  return (
    <div className="min-h-full dot-grid">
      <header className="border-b border-border px-6 lg:px-10 py-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest">
            <span className="text-primary">Guard</span>
            <span className="text-muted-foreground"> / </span>
            <span className="text-brand-green">Visitor Logs</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-foreground">Visitor Logs</h1>
        </div>
        <Button
          render={<Link to="/guard/visitor/register" />}
          className="h-auto! px-4 py-2.5 text-xs font-mono font-semibold rounded hover:text-text dark:hover:bg-white dark:hover:text-text"
        >
          <UserPlus className="size-4" />
          ADD VISITOR
        </Button>
      </header>

      <div className="px-6 lg:px-10 py-8">
        {/* filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center bg-card border border-border rounded px-3 py-2 gap-2 flex-1 min-w-[220px]">
            <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or contact number"
              className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60 flex-1"
            />
          </div>
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
            <SelectTrigger className="w-auto h-auto bg-card border-border rounded px-3 py-2.5 text-xs font-mono text-muted-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* visitors table */}
        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-secondary/60">
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSortToggle}
                    className="inline-flex items-center gap-1 h-auto! p-0 hover:text-foreground"
                    title={sortDir === 'desc' ? 'Sorted descending — click for ascending' : 'Sorted ascending — click for descending'}
                  >
                    RECORD NO.
                    {sortDir === 'desc' ? (
                      <ChevronDown className="size-3" />
                    ) : (
                      <ChevronUp className="size-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Name
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Contact
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Purpose
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Visit Date
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Registered
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground font-mono text-xs">
                    LOADING VISITORS…
                  </TableCell>
                </TableRow>
              ) : visitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="text-2xl mb-2 text-info">◉</div>
                    {error || 'No visitors found'}
                  </TableCell>
                </TableRow>
              ) : (
                visitors.map((visitor) => (
                  <TableRow
                    key={visitor.id}
                    onClick={() => setSelected(visitor)}
                    className="cursor-pointer"
                  >
                    <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {visitor.record_no}
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <span className="font-medium text-foreground">{visitor.fullname}</span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {visitor.contact}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-muted-foreground max-w-[16rem]">
                      <span className="line-clamp-2">{visitor.purpose}</span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {formatDate(visitor.visit_date)}
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <VisitorStatusChip status={visitor.status} />
                    </TableCell>
                    <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {formatDate(visitor.created_at)}
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setSelected(visitor)}
                          className="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"
                          aria-label={`View ${visitor.fullname}`}
                        >
                          <Eye className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border text-xs font-mono text-muted-foreground flex-wrap gap-3">
            <span>
              Showing {from}–{to} of {total} visitors
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-auto! px-3 py-1.5 rounded text-foreground hover:border-primary hover:text-primary"
              >
                ← PREV
              </Button>
              {pageNumbers.map((num, idx) => {
                const prev = pageNumbers[idx - 1]
                const isGap = prev && num - prev > 1
                return (
                  <span key={num} className="flex items-center gap-2">
                    {isGap && <span className="text-muted-foreground/60">…</span>}
                    <Button
                      variant="outline"
                      onClick={() => setPage(num)}
                      className={
                        num === page
                          ? 'h-auto! px-3 py-1.5 rounded border-primary text-primary'
                          : 'h-auto! px-3 py-1.5 rounded text-foreground hover:border-primary hover:text-primary'
                      }
                    >
                      {num}
                    </Button>
                  </span>
                )
              })}
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page >= lastPage}
                className="h-auto! px-3 py-1.5 rounded text-foreground hover:border-primary hover:text-primary"
              >
                NEXT →
              </Button>
            </div>
          </div>
        </div>
      </div>

      <VisitorDetailsDialog
        visitor={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </div>
  )
}
