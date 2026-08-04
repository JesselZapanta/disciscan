import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileSpreadsheet, Upload, ArrowLeft, RotateCcw, CircleCheck, CircleX, SkipForward, ListOrdered, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import * as studentService from '../../../services/admin/students'

const typeStyles = {
  duplicate: { text: 'text-status-flagged', border: 'border-status-flagged/40', bg: 'bg-status-flagged/10' },
  invalid: { text: 'text-destructive', border: 'border-destructive/40', bg: 'bg-destructive/10' },
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="border border-border bg-card rounded-lg px-4 py-4 flex items-center gap-3">
      <div className={`size-9 rounded flex items-center justify-center ${accent.bg} ${accent.text}`}>
        <Icon className="size-4" />
      </div>
      <div>
        <div className="text-xl font-bold text-foreground leading-none">{value}</div>
        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
      </div>
    </div>
  )
}

export default function StudentImport() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const [importError, setImportError] = useState('')
  const [report, setReport] = useState(null)
  const { toast } = useToast()

  async function handleDownloadTemplate() {
    setDownloadingTemplate(true)
    try {
      const blob = await studentService.downloadStudentTemplate()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'DISCISCAN-student-import-template.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast({
        variant: 'error',
        title: 'Download failed',
        description: 'Could not download the template. Please try again.',
      })
    } finally {
      setDownloadingTemplate(false)
    }
  }

  function handleFileChange(e) {
    const selected = e.target.files?.[0] || null
    setFile(selected)
    setImportError('')
    setReport(null)
  }

  async function handleImport() {
    if (!file) return
    setImporting(true)
    setImportError('')

    try {
      const res = await studentService.importStudents(file)
      setReport(res.report)
      toast({
        variant: 'success',
        title: 'Import completed',
        description: `${res.report.imported} of ${res.report.total} students imported.`,
      })
    } catch (err) {
      if (err.response?.status === 422) {
        setImportError(err.response.data.errors?.file?.[0] || 'The file could not be processed.')
      } else {
        toast({
          variant: 'error',
          title: 'Import failed',
          description: 'Something went wrong. Please try again.',
        })
      }
    } finally {
      setImporting(false)
    }
  }

  function resetAll() {
    setFile(null)
    setReport(null)
    setImportError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const problemRows = report?.rows || []

  return (
    <div className="min-h-full dot-grid">
      <header className="border-b border-border px-6 lg:px-10 py-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest">
              <span className="text-primary">Admin</span>
              <span className="text-muted-foreground"> / </span>
              <span className="text-brand-green">Students</span>
              <span className="text-muted-foreground"> / </span>
              <span className="text-brand-green">Import</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-foreground">Import Students</h1>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/students')}
          className="gap-2 text-xs font-mono uppercase text-foreground hover:border-primary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Button>
      </header>

      <div className="px-6 lg:px-10 py-8 max-w-4xl">
        {!report ? (
          <div className="border border-border bg-card rounded-lg p-6">
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Upload Excel file</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadTemplate}
                disabled={downloadingTemplate}
                className="gap-2 text-xs font-mono uppercase text-foreground hover:border-primary hover:text-primary"
              >
                <FileDown className="h-4 w-4" />
                {downloadingTemplate ? 'Downloading…' : 'Download Template'}
              </Button>
            </div>

            <label
              htmlFor="student-import-file"
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg px-6 py-10 text-center cursor-pointer transition ${
                file
                  ? 'border-primary/50 bg-primary/5 hover:bg-primary/10'
                  : 'border-border bg-secondary/30 hover:bg-secondary/60'
              }`}
            >
              <Upload className="size-8 text-muted-foreground" />
              <div className="text-sm text-foreground font-medium">
                {file ? file.name : 'Click to choose an Excel file'}
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                {file ? `${formatBytes(file.size)} — ready to import` : '.xlsx only · header must match template'}
              </div>
              <input
                id="student-import-file"
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <p className="min-h-[1rem] text-xs text-destructive mt-3">{importError || ''}</p>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetAll}
                disabled={!file || importing}
                className="gap-2 text-foreground hover:border-primary hover:text-primary"
              >
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
              <Button
                type="button"
                onClick={handleImport}
                disabled={!file || importing}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {importing ? 'IMPORTING…' : 'IMPORT'}
              </Button>
            </div>

            <div className="mt-6 text-xs text-muted-foreground font-mono leading-relaxed">
              <div className="uppercase tracking-widest text-[10px] mb-2 text-muted-foreground/70">Expected columns</div>
              <div className="bg-secondary/50 border border-border rounded px-3 py-2 text-muted-foreground">
                id_number · firstname · middlename · lastname · contact_no · program_and_year · academic_year_id
              </div>
              <ul className="mt-3 space-y-1">
                <li>· Rows with duplicate <span className="text-foreground">ID numbers in the same academic year</span> are skipped.</li>
                <li>· The same ID number in a different academic year is <span className="text-foreground">allowed</span>.</li>
                <li>· Invalid rows are skipped and listed in the report.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                icon={ListOrdered}
                label="Total Rows"
                value={report.total}
                accent={{ bg: 'bg-secondary', text: 'text-muted-foreground' }}
              />
              <StatCard
                icon={CircleCheck}
                label="Imported"
                value={report.imported}
                accent={{ bg: 'bg-status-cleared/10', text: 'text-status-cleared' }}
              />
              <StatCard
                icon={SkipForward}
                label="Skipped Duplicates"
                value={report.skipped_duplicates}
                accent={{ bg: 'bg-status-flagged/10', text: 'text-status-flagged' }}
              />
              <StatCard
                icon={CircleX}
                label="Failed"
                value={report.failed}
                accent={{ bg: 'bg-destructive/10', text: 'text-destructive' }}
              />
            </div>

            {/* problem rows */}
            <div className="border border-border bg-card rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Skipped or failed rows</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {problemRows.length === 0
                    ? 'All rows were imported successfully.'
                    : 'These rows were not imported. Fix them in the file and import again.'}
                </p>
              </div>

              {problemRows.length === 0 ? (
                <div className="px-5 py-10 text-center text-muted-foreground">
                  <div className="text-2xl mb-2 text-status-cleared">◉</div>
                  <span className="font-mono text-xs">NO PROBLEM ROWS</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary/60 text-left">
                        <th className="px-5 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">Excel Row</th>
                        <th className="px-5 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">ID Number</th>
                        <th className="px-5 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">Name</th>
                        <th className="px-5 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">Type</th>
                        <th className="px-5 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problemRows.map((row, idx) => {
                        const style = typeStyles[row.type] || typeStyles.invalid
                        return (
                          <tr key={`${row.row}-${idx}`} className="border-t border-border">
                            <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{row.row}</td>
                            <td className="px-5 py-2.5 font-mono text-xs text-foreground">{row.id_number || '—'}</td>
                            <td className="px-5 py-2.5 text-muted-foreground">{row.name || '—'}</td>
                            <td className="px-5 py-2.5">
                              <span
                                className={`inline-flex items-center text-[10px] font-mono uppercase rounded-full px-2 py-0.5 border ${style.text} ${style.border} ${style.bg}`}
                              >
                                {row.type}
                              </span>
                            </td>
                            <td className="px-5 py-2.5 text-xs text-muted-foreground">{row.reason}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetAll} className="gap-2 text-foreground hover:border-primary hover:text-primary">
                <RotateCcw className="h-4 w-4" />
                Import Another File
              </Button>
              <Button onClick={() => navigate('/admin/students')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Students
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}