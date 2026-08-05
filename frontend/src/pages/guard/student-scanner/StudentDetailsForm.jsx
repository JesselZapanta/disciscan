import { Input } from '@/components/ui/input'

export default function StudentDetailsForm({ student }) {
  return (
    <form
      className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Full name
        </label>
        <Input
          type="text"
          value={student.name}
          readOnly
          className="h-9 text-sm bg-secondary border-border rounded-md"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          ID number
        </label>
        <Input
          type="text"
          value={student.id_number}
          readOnly
          className="h-9 text-sm bg-secondary border-border rounded-md"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Contact number
        </label>
        <Input
          type="text"
          value={student.contact_no}
          readOnly
          className="h-9 text-sm bg-secondary border-border rounded-md"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Program &amp; year
        </label>
        <Input
          type="text"
          value={student.program_and_year}
          readOnly
          className="h-9 text-sm bg-secondary border-border rounded-md"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Academic year
        </label>
        <Input
          type="text"
          value={
            student.academic_year?.code
              ? `${student.academic_year.code} — ${student.academic_year.description}`
              : '—'
          }
          readOnly
          className="h-9 text-sm bg-secondary border-border rounded-md"
        />
      </div>
    </form>
  )
}
