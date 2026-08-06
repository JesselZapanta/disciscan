import { UserRound } from 'lucide-react'

function Field({ label, value }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 text-sm font-semibold text-foreground break-words leading-snug">
        {value || '—'}
      </div>
    </div>
  )
}

export default function StudentDetailsForm({ student }) {
  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <UserRound className="size-3" /> Student details
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Field label="Full name" value={student.name} />
        <Field label="ID number" value={student.id_number} />
        <Field label="Contact number" value={student.contact_no} />
        <Field label="Program &amp; year" value={student.program_and_year} />
        <Field
          label="Academic year"
          value={
            student.academic_year?.code
              ? `${student.academic_year.code} — ${student.academic_year.description}`
              : '—'
          }
        />
      </div>
    </div>
  )
}
