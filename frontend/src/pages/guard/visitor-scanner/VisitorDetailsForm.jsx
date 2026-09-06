import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

const visitPurposes = [
  'Meeting with faculty/staff',
  'Parent / guardian visit',
  'Enrollment / records',
  'Library visit',
  'Job interview',
  'OJT / internship',
  'Delivery',
  'Event attendance',
  'Maintenance / repair',
  'Other',
]

const validIdTypes = [
  "Driver's License",
  'Passport',
  'National ID',
  'UMID (SSS)',
  'GSIS eCard',
  'PRC License',
  'Postal ID',
  'PhilHealth ID',
  'TIN ID',
  "Voter's ID",
  'Senior Citizen ID',
  'PWD ID',
  'School ID',
  'Company / Employee ID',
  'Barangay ID',
]

export default function VisitorDetailsForm({ form, formErrors, onFieldChange }) {
  return (
    <form className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Full name
        </label>
        <Input
          type="text"
          value={form.fullname}
          onChange={(e) => onFieldChange('fullname')(e.target.value)}
          className="h-9 text-sm bg-secondary border-border rounded-md"
        />
        <p className="min-h-[0.9rem] text-[11px] text-status-flagged">{formErrors.fullname?.[0] ?? ''}</p>
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Contact number
        </label>
        <Input
          type="tel"
          inputMode="numeric"
          value={form.contact}
          maxLength={11}
          placeholder="09123456789"
          onChange={(e) => onFieldChange('contact')(e.target.value.replace(/\D/g, '').slice(0, 11))}
          className="h-9 text-sm bg-secondary border-border rounded-md"
        />
        <div className="flex justify-between min-h-[0.9rem] mt-1">
          <p className="text-[11px] text-status-flagged">{formErrors.contact?.[0] ?? ''}</p>
          <span className="text-[10px] font-mono text-muted-foreground">{String(form.contact).replace(/\D/g, '').length}/11</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Purpose of visit
        </label>
        <Select value={form.purpose} onValueChange={onFieldChange('purpose')}>
          <SelectTrigger className="w-full h-9 bg-secondary border-border rounded-md text-sm text-muted-foreground">
            <SelectValue placeholder="Select purpose" />
          </SelectTrigger>
          <SelectContent>
            {visitPurposes.map((purpose) => (
              <SelectItem key={purpose} value={purpose}>
                {purpose}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="min-h-[0.9rem] text-[11px] text-status-flagged">{formErrors.purpose?.[0] ?? ''}</p>
      </div>
      {form.purpose === 'Other' && (
        <div className="space-y-1.5">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Specify purpose
          </label>
          <Input
            type="text"
            value={form.purpose_other}
            onChange={(e) => onFieldChange('purpose_other')(e.target.value)}
            className="h-9 text-sm bg-secondary border-border rounded-md"
          />
          <p className="min-h-[0.9rem] text-[11px] text-status-flagged">{formErrors.purpose_other?.[0] ?? ''}</p>
        </div>
      )}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Person / office to visit
        </label>
        <Input
          type="text"
          value={form.person_office_to_visit}
          onChange={(e) => onFieldChange('person_office_to_visit')(e.target.value)}
          className="h-9 text-sm bg-secondary border-border rounded-md"
        />
        <p className="min-h-[0.9rem] text-[11px] text-status-flagged">{formErrors.person_office_to_visit?.[0] ?? ''}</p>
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Valid ID type
        </label>
        <Select value={form.id_type} onValueChange={onFieldChange('id_type')}>
          <SelectTrigger className="w-full h-9 bg-secondary border-border rounded-md text-sm text-muted-foreground">
            <SelectValue placeholder="Select ID type" />
          </SelectTrigger>
          <SelectContent>
            {validIdTypes.map((idType) => (
              <SelectItem key={idType} value={idType}>
                {idType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="min-h-[0.9rem] text-[11px] text-status-flagged">{formErrors.id_type?.[0] ?? ''}</p>
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          ID number
        </label>
        <Input
          type="text"
          value={form.id_number}
          onChange={(e) => onFieldChange('id_number')(e.target.value)}
          className="h-9 text-sm bg-secondary border-border rounded-md"
        />
        <p className="min-h-[0.9rem] text-[11px] text-status-flagged">{formErrors.id_number?.[0] ?? ''}</p>
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Date of visit
        </label>
        <DatePicker value={form.visit_date} onChange={onFieldChange('visit_date')} />
        <p className="min-h-[0.9rem] text-[11px] text-status-flagged">{formErrors.visit_date?.[0] ?? ''}</p>
      </div>
    </form>
  )
}
