import { useEffect, useState } from 'react'
import { Fingerprint, GraduationCap, Save, School, UserRound } from 'lucide-react'
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import * as studentService from '../../../services/admin/students'
import * as academicYearService from '../../../services/admin/academicYears'

function Section({ icon, title, children }) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  )
}

function Field({ label, htmlFor, optional, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
        {label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {children}
      <p className="min-h-[1rem] text-xs text-destructive">{error ?? ''}</p>
    </div>
  )
}

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
    extension: student?.extension || '',
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
      extension: student?.extension || '',
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
      extension: form.extension || null,
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
        <DialogPopup className="w-full max-w-xl">
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            {isEdit ? 'Edit student' : 'Add student'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the student details and academic year.' : 'Create a new student record.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            <Section icon={<Fingerprint className="size-3.5" />} title="Identity">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="ID Number" htmlFor="student-id-number" error={errors.id_number?.[0]}>
                  <Input
                    id="student-id-number"
                    type="text"
                    value={form.id_number}
                    onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                    placeholder="e.g. 2610001"
                    required
                    className="bg-secondary border-border"
                  />
                </Field>

                <Field
                  label="Academic Year"
                  htmlFor="student-academic-year"
                  optional
                  error={errors.academic_year_id?.[0]}
                >
                  <Select
                    value={form.academic_year_id}
                    onValueChange={(value) => setForm({ ...form, academic_year_id: value })}
                  >
                    <SelectTrigger
                      id="student-academic-year"
                      className="w-full bg-secondary border-border text-xs font-mono text-muted-foreground"
                    >
                      <SelectValue>
                        {(value) => {
                          const ay = academicYears.find((y) => String(y.id) === value)
                          return ay ? `${ay.code} — ${ay.description}` : 'SELECT ACADEMIC YEAR'
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent align="start">
                      {academicYears.map((ay) => (
                        <SelectItem key={ay.id} value={String(ay.id)}>
                          {ay.code} — {ay.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Section>

            <Section icon={<UserRound className="size-3.5" />} title="Full name">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <Field label="First Name" htmlFor="student-firstname" error={errors.firstname?.[0]}>
                    <Input
                      id="student-firstname"
                      type="text"
                      value={form.firstname}
                      onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                      placeholder="e.g. Juan"
                      required
                      className="bg-secondary border-border"
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Last Name" htmlFor="student-lastname" error={errors.lastname?.[0]}>
                    <Input
                      id="student-lastname"
                      type="text"
                      value={form.lastname}
                      onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                      placeholder="e.g. Santos"
                      required
                      className="bg-secondary border-border"
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Middle Name" htmlFor="student-middlename" optional error={errors.middlename?.[0]}>
                    <Input
                      id="student-middlename"
                      type="text"
                      value={form.middlename}
                      onChange={(e) => setForm({ ...form, middlename: e.target.value })}
                      placeholder="e.g. Dela Cruz"
                      className="bg-secondary border-border"
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Extension" htmlFor="student-extension" optional error={errors.extension?.[0]}>
                    <Input
                      id="student-extension"
                      type="text"
                      value={form.extension}
                      onChange={(e) => setForm({ ...form, extension: e.target.value })}
                      placeholder="e.g. Jr."
                      className="bg-secondary border-border"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section icon={<School className="size-3.5" />} title="School details">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Program and Year" htmlFor="student-program" error={errors.program_and_year?.[0]}>
                  <Input
                    id="student-program"
                    type="text"
                    value={form.program_and_year}
                    onChange={(e) => setForm({ ...form, program_and_year: e.target.value })}
                    placeholder="e.g. BSIT 1A"
                    required
                    className="bg-secondary border-border"
                  />
                </Field>

                <Field label="Contact No." htmlFor="student-contact" error={errors.contact_no?.[0]}>
                  <Input
                    id="student-contact"
                    type="text"
                    value={form.contact_no}
                    onChange={(e) => setForm({ ...form, contact_no: e.target.value })}
                    placeholder="e.g. 09171234567"
                    required
                    className="bg-secondary border-border"
                  />
                </Field>
              </div>
            </Section>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <DialogClose render={<Button type="button" variant="outline">Cancel</Button>} />
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
