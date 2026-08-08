import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import IssueFormDialog from './IssueFormDialog.jsx'
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import * as issueService from '../../../services/admin/issues'

const statusOptions = ['ALL STATUS', 'Active', 'Inactive']

const statusStyles = {
  Active: { text: 'text-status-cleared', border: 'border-status-cleared/40', bg: 'bg-status-cleared/10', dot: 'bg-status-cleared' },
  Inactive: { text: 'text-muted-foreground', border: 'border-border', bg: 'bg-secondary/60', dot: 'bg-muted-foreground/50' },
}

function StatusChip({ status }) {
  const style = statusStyles[status] || statusStyles.Inactive
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono rounded-full px-2.5 py-1 border ${style.text} ${style.border} ${style.bg}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status.toUpperCase()}
    </span>
  )
}

export default function Issues() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL STATUS')
  const [page, setPage] = useState(1)
  const [sortDir, setSortDir] = useState('desc')
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [deleting, setDeleting] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { toast } = useToast()

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

    issueService
      .listIssues({
        search,
        status: status === 'ALL STATUS' ? undefined : status,
        page,
        per_page: 10,
        sort_dir: sortDir,
      })
      .then((res) => {
        if (cancelled) return
        setIssues(res.data || [])
        setTotal(res.meta?.total ?? 0)
        setLastPage(res.meta?.last_page ?? 1)
      })
      .catch(() => {
        if (cancelled) return
        setError('Failed to load issues.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [search, status, page, sortDir, refreshKey])

  function handleSortToggle() {
    setSortDir((dir) => (dir === 'desc' ? 'asc' : 'desc'))
    setPage(1)
  }

  function handleSaved(name, isEdit) {
    setRefreshKey((k) => k + 1)
    toast({
      variant: 'success',
      title: isEdit ? 'Issue updated' : 'Issue created',
      description: `${name} was ${isEdit ? 'updated' : 'created'} successfully.`,
    })
  }

  function handleDeleteRequest(issue) {
    setDeleting(issue)
    setDeleteOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      await issueService.deleteIssue(deleting.id)
      toast({
        variant: 'success',
        title: 'Issue deleted',
        description: `${deleting.name} was removed.`,
      })
      setDeleteOpen(false)
      setDeleting(null)
      if (issues.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        setRefreshKey((k) => k + 1)
      }
    } catch (err) {
      const serverMessage = err.response?.data?.errors?.status?.[0]
      toast({
        variant: 'error',
        title: 'Delete failed',
        description: serverMessage || `Could not delete ${deleting.name}. Please try again.`,
      })
    } finally {
      setDeleteBusy(false)
    }
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
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest">
              <span className="text-primary">Admin</span>
              <span className="text-muted-foreground"> / </span>
              <span className="text-brand-green">Issues</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-foreground">Issues</h1>
          </div>
        </div>
        <IssueFormDialog
          trigger={
            <Button className="text-xs font-mono bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded hover:bg-primary/80 hover:text-text dark:hover:bg-white dark:hover:text-text transition gap-2">
              <Plus className="h-4 w-4" />
              ADD ISSUE
            </Button>
          }
          onSaved={handleSaved}
        />
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
              placeholder="Search by name or description"
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

        {/* issues table */}
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
                    ID
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
                  Description
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground font-mono text-xs">
                    LOADING ISSUES…
                  </TableCell>
                </TableRow>
              ) : issues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    <div className="text-2xl mb-2 text-info">◉</div>
                    {error || 'No issues found'}
                  </TableCell>
                </TableRow>
              ) : (
                issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      #{issue.id}
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <span className="font-medium text-foreground">{issue.name}</span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-muted-foreground max-w-[420px]">
                      <span className="line-clamp-2">{issue.description}</span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <StatusChip status={issue.status} />
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <IssueFormDialog
                          issue={issue}
                          onSaved={handleSaved}
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              className="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"
                              aria-label={`Edit ${issue.name}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleDeleteRequest(issue)}
                          className="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          aria-label={`Delete ${issue.name}`}
                        >
                          <Trash2 className="size-4" />
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
              Showing {from}–{to} of {total} issues
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

      {/* delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger className="hidden" />
        <DialogPortal>
          <DialogBackdrop />
          <DialogPopup>
            <DialogTitle className="text-base font-semibold text-foreground">Delete issue?</DialogTitle>
            <DialogDescription className="mt-1">
              This will permanently remove {deleting?.name || 'this issue'}. This action cannot be
              undone.
            </DialogDescription>
            <div className="mt-6 flex justify-end gap-2">
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteBusy} className="gap-2">
                <Trash2 className="h-4 w-4" />
                {deleteBusy ? 'DELETING…' : 'DELETE'}
              </Button>
            </div>
          </DialogPopup>
        </DialogPortal>
      </Dialog>
    </div>
  )
}