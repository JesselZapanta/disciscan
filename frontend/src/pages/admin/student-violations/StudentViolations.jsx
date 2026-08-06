import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import * as studentViolationService from '../../../services/admin/studentViolations'
import * as academicYearService from '../../../services/admin/academicYears'

function initialsOf(student) {
  const initials = [student.firstname, student.middlename, student.lastname]
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
  return initials || 'ST'
}

export default function StudentViolations() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [academicYearsLoaded, setAcademicYearsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [academicYearId, setAcademicYearId] = useState('ALL')
  const [page, setPage] = useState(1)
  const [sortDir, setSortDir] = useState('desc')
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    academicYearService
      .listAcademicYears({ per_page: 100 })
      .then((res) => {
        if (cancelled) return
        const years = res.data || []
        setAcademicYears(years)
        const active = years.find((academicYear) => academicYear.status === 'active')
        setAcademicYearId(active ? String(active.id) : 'ALL')
        setAcademicYearsLoaded(true)
      })
      .catch(() => {
        if (cancelled) return
        setAcademicYears([])
        setAcademicYearId('ALL')
        setAcademicYearsLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!academicYearsLoaded) return
    let cancelled = false
    setLoading(true)
    setError('')

    studentViolationService
      .listStudentViolations({
        search,
        academic_year_id: academicYearId === 'ALL' ? undefined : academicYearId,
        page,
        per_page: 10,
        sort_dir: sortDir,
      })
      .then((res) => {
        if (cancelled) return
        setStudents(res.data || [])
        setTotal(res.meta?.total ?? 0)
        setLastPage(res.meta?.last_page ?? 1)
      })
      .catch(() => {
        if (cancelled) return
        setError('Failed to load students.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [search, academicYearId, page, sortDir, academicYearsLoaded])

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
    <div className="min-h-full">
      <header className="border-b border-border px-6 lg:px-10 py-5">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest">
            <span className="text-primary">Admin</span>
            <span className="text-muted-foreground"> / </span>
            <span className="text-brand-green">Student Violations</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-foreground">Student Violations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View disciplinary violation records for every student, organized by day.
          </p>
        </div>
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
              placeholder="Search by ID number, name, contact, or program"
              className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60 flex-1"
            />
          </div>
          <Select value={academicYearId} onValueChange={(value) => { setAcademicYearId(value); setPage(1) }}>
            <SelectTrigger className="w-fit min-w-[240px] h-auto bg-card border-border rounded px-3 py-2.5 text-xs font-mono text-muted-foreground uppercase">
              <SelectValue>
                {(value) => {
                  const academicYear = academicYears.find((ay) => String(ay.id) === value)
                  return academicYear ? `${academicYear.code} · ${academicYear.description}` : 'ALL ACADEMIC YEARS'
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="uppercase">
                ALL ACADEMIC YEARS
              </SelectItem>
              {academicYears.map((academicYear) => (
                <SelectItem key={academicYear.id} value={String(academicYear.id)} className="uppercase">
                  {academicYear.code} · {academicYear.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* students table */}
        <div className="border border-border bg-card rounded-lg overflow-x-auto">
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
                  ID Number
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Student Name
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Program &amp; Year
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  Contact No.
                </TableHead>
                <TableHead className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground font-mono text-xs">
                    LOADING STUDENTS…
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="text-2xl mb-2 text-info">◉</div>
                    {error || 'No students found'}
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      #{student.id}
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <span className="font-medium text-foreground font-mono">{student.id_number}</span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 shrink-0 rounded bg-secondary border border-border flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                          {initialsOf(student)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate">{student.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-muted-foreground">
                      <span className="font-mono text-xs">{student.program_and_year}</span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {student.contact_no}
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => navigate(`/admin/student-violations/${student.id}`)}
                          className="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"
                          aria-label={`View violations for ${student.name}`}
                          title="View violations"
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
              Showing {from}–{to} of {total} students
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
    </div>
  )
}
