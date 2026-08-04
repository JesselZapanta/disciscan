import { useEffect, useState } from 'react'
import { GraduationCap, Save } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import * as studentService from '../../../services/admin/students'
import * as academicYearService from '../../../services/admin/academicYears'

export default function StudentFormDialog({ trigger, student, onSaved }) {
  const isEdit = Boolean(student)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [academicYears, setAcademicYears] = useState([])
  const [form, setForm] = useState(() => ({
    id_number: student?.id_number || '',
    firstname: student?.firstname || '',
    middlename: student?.middlename || '',
    lastname: student?.lastname || '',
    contact_no: student?.contact_no || '',
    program_and_year: student?.program_and_year || '',
    academic_year_id: student?.academic_year_id ? String(student.academic_year_id) : '',
  }))
  const { toast } = useToast()

  useEffect(() => {
    if (!open) return
    let cancelled = false

    academicYearService
      .listAcademicYears({ per_page: 100 })
      .then((res) => {
        if (cancelled) return
        const years = res.data || []
        setAcademicYears(years)
        if (!isEdit) {
          const fallback = years.find((ay) => ay.status === 'active') || years[0] || null
          setForm((prev) => ({ ...prev, academic_year_id: fallback ? String(fallback.id) : '' }))
        }
      })
      .catch(() => {
        if (!cancelled) setAcademicYears([])
      })

    return () => {
      cancelled = true
    }
  }, [open, isEdit])

  function resetForm() {
    setForm({
      id_number: student?.id_number || '',
      firstname: student?.firstname || '',
      middlename: student?.middlename || '',
      lastname: student?.lastname || '',
      contact_no: student?.contact_no || '',
      program_and_year: student?.program_and_year || '',
      academic_year_id: student?.academic_year_id ? String(student.academic_year_id) : '',
    })
    setErrors({})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    const payload = {
      id_number: form.id_number,
      firstname: form.firstname,
      middlename: form.middlename || null,
      lastname: form.lastname,
      contact_no: form.contact_no,
      program_and_year: form.program_and_year,
      academic_year_id: form.academic_year_id ? Number(form.academic_year_id) : null,
    }

    try {
      if (isEdit) {
        await studentService.updateStudent(student.id, payload)
      } else {
        await studentService.createStudent(payload)
      }
      setOpen(false)
      onSaved?.(form.id_number.trim(), isEdit)
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        toast({
          variant: 'error',
          title: 'Save failed',
          description: 'Something went wrong. Please try again.',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const selectedAcademicYear = academicYears.find((ay) => String(ay.id) === form.academic_year_id)
  const academicYearLabel = selectedAcademicYear
    ? `${selectedAcademicYear.code} — ${selectedAcademicYear.description}`
    : 'NO ACTIVE ACADEMIC YEAR'

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) resetForm()
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="w-full max-w-lg">
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            {isEdit ? 'Edit student' : 'Add student'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the student details and academic year.' : 'Create a new student record.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-id-number">ID Number</Label>
                <Input
                  id="student-id-number"
                  type="text"
                  value={form.id_number}
                  onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                  placeholder="e.g. 2610001"
                  className="bg-secondary border-border"
                />
                <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.id_number?.[0] ?? ''}</p>
              </div>

              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Input
                  type="text"
                  value={academicYearLabel}
                  readOnly
                  className="bg-secondary border-border text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-firstname">First Name</Label>
                <Input
                  id="student-firstname"
                  type="text"
                  value={form.firstname}
                  onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                  placeholder="e.g. Juan"
                  className="bg-secondary border-border"
                />
                <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.firstname?.[0] ?? ''}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-middlename">Middle Name</Label>
                <Input
                  id="student-middlename"
                  type="text"
                  value={form.middlename}
                  onChange={(e) => setForm({ ...form, middlename: e.target.value })}
                  placeholder="e.g. Dela Cruz"
                  className="bg-secondary border-border"
                />
                <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.middlename?.[0] ?? ''}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-lastname">Last Name</Label>
                <Input
                  id="student-lastname"
                  type="text"
                  value={form.lastname}
                  onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                  placeholder="e.g. Santos"
                  className="bg-secondary border-border"
                />
                <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.lastname?.[0] ?? ''}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-program">Program and Year</Label>
                <Input
                  id="student-program"
                  type="text"
                  value={form.program_and_year}
                  onChange={(e) => setForm({ ...form, program_and_year: e.target.value })}
                  placeholder="e.g. BSIT 1A"
                  className="bg-secondary border-border"
                />
                <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.program_and_year?.[0] ?? ''}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-contact">Contact No.</Label>
                <Input
                  id="student-contact"
                  type="text"
                  value={form.contact_no}
                  onChange={(e) => setForm({ ...form, contact_no: e.target.value })}
                  placeholder="e.g. 09171234567"
                  className="bg-secondary border-border"
                />
                <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.contact_no?.[0] ?? ''}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add student'}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}