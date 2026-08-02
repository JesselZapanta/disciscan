import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import QRCode from 'qrcode'
import CornerBracket from '../../../components/CornerBracket.jsx'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { registerVisitor } from '../../../services/visitors.js'
import { generateEntryPass } from '../../../utils/visitorPass.js'

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

const initialForm = {
  fullname: '',
  contact: '',
  purpose: '',
  purpose_other: '',
  person_office_to_visit: '',
  id_type: '',
  id_number: '',
  visit_date: null,
  website: '',
}

export default function VisitorRegistration() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [registered, setRegistered] = useState(null)
  const [passDataUrl, setPassDataUrl] = useState('')

  const update = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setSubmitting(true)

    try {
      const record = await registerVisitor({
        fullname: form.fullname,
        contact: form.contact.replace(/[\s()-]/g, ''),
        purpose: form.purpose,
        purpose_other: form.purpose === 'Other' ? form.purpose_other : null,
        person_office_to_visit: form.person_office_to_visit,
        id_type: form.id_type,
        id_number: form.id_number,
        visit_date: form.visit_date ? format(form.visit_date, 'yyyy-MM-dd') : null,
        website: form.website,
      })

      const qrText = JSON.stringify({
        id: record.id,
        record_no: record.record_no,
        fullname: record.fullname,
        visit_date: record.visit_date,
      })

      const qrDataUrl = await QRCode.toDataURL(qrText, { width: 400, margin: 2 })
      const visitDateLabel = format(new Date(`${record.visit_date}T00:00:00`), 'MMMM d, yyyy')

      setRegistered(record)
      setPassDataUrl(await generateEntryPass(record, qrDataUrl, visitDateLabel))
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else if (err.response?.status === 429) {
        setError('Too many registration attempts. Please try again later.')
      } else {
        setError('Registration failed. Please check your details and try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-full dot-grid">
      <header className="border-b border-border px-6 lg:px-10 py-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest">
            <span className="text-primary">Guard</span>
            <span className="text-muted-foreground"> / </span>
            <span className="text-brand-green">Visitor Registration</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-foreground">Visitor Registration</h1>
        </div>
      </header>

      <div className="px-6 lg:px-10 py-8 flex justify-center">
        <div className="w-full max-w-lg">
          <div className="text-center mb-7">
            <p className="text-muted-foreground text-sm">
              Complete this form to generate the visitor's entry QR code. Show it at the gate.
            </p>
          </div>

          <CornerBracket className="border border-border bg-card rounded-lg p-7">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(e) => update('website')(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
                    Full name
                  </label>
                  <Input
                    type="text"
                    placeholder="Juan Dela Cruz"
                    value={form.fullname}
                    onChange={(e) => update('fullname')(e.target.value)}
                    className="h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60"
                  />
                  <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.fullname?.[0] ?? ''}</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
                    Contact number
                  </label>
                  <Input
                    type="text"
                    placeholder="09XX XXX XXXX"
                    value={form.contact}
                    onChange={(e) => update('contact')(e.target.value)}
                    className="h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60"
                  />
                  <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.contact?.[0] ?? ''}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
                  Purpose of visit
                </label>
                <Select value={form.purpose} onValueChange={update('purpose')}>
                  <SelectTrigger className="w-full h-auto! bg-secondary border-border rounded px-4 py-3 text-sm text-muted-foreground">
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
                <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.purpose?.[0] ?? ''}</p>
              </div>
              {form.purpose === 'Other' && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
                    Specify purpose
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Internship interview"
                    value={form.purpose_other}
                    onChange={(e) => update('purpose_other')(e.target.value)}
                    className="h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60"
                  />
                  <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.purpose_other?.[0] ?? ''}</p>
                </div>
              )}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
                  Person / office to visit
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Registrar's Office"
                  value={form.person_office_to_visit}
                  onChange={(e) => update('person_office_to_visit')(e.target.value)}
                  className="h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60"
                />
                <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.person_office_to_visit?.[0] ?? ''}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
                    Valid ID type
                  </label>
                  <Select value={form.id_type} onValueChange={update('id_type')}>
                    <SelectTrigger className="w-full h-auto! bg-secondary border-border rounded px-4 py-3 text-sm text-muted-foreground">
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
                  <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.id_type?.[0] ?? ''}</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
                    ID number
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. D01-234567"
                    value={form.id_number}
                    onChange={(e) => update('id_number')(e.target.value)}
                    className="h-auto bg-secondary border-border rounded px-4 py-3 placeholder:text-muted-foreground/60"
                  />
                  <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.id_number?.[0] ?? ''}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
                  Date of visit
                </label>
                <DatePicker
                  value={form.visit_date}
                  onChange={update('visit_date')}
                  placeholder="Select visit date"
                />
                <p className="min-h-[1rem] text-xs text-destructive mt-1">{errors.visit_date?.[0] ?? ''}</p>
              </div>

              {error && (
                <p className="text-xs font-mono text-status-flagged text-center">
                  ✗ {error}
                </p>
              )}

              {!registered && (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-auto! py-3.5 font-bold text-sm rounded hover:text-text dark:hover:bg-white dark:hover:text-text"
                >
                  {submitting ? 'REGISTERING…' : 'Register Visitor →'}
                </Button>
              )}
            </form>

            {registered && passDataUrl && (
              <div className="mt-6 pt-6 border-t border-border text-center">
                <span className="text-[11px] font-mono text-status-cleared uppercase tracking-widest">
                  ✓ Registration complete
                </span>
                <div className="mt-4 mx-auto w-80 rounded-lg overflow-hidden border border-border">
                  <img src={passDataUrl} alt="Entry pass" className="w-full h-auto" />
                </div>
                <p className="text-muted-foreground text-xs font-mono mt-4">
                  {registered.record_no} · Visit date {registered.visit_date}
                </p>
                <Button
                  type="button"
                  onClick={() => navigate('/guard/visitor/scan', { state: { recordNo: registered.record_no } })}
                  className="mt-4 w-full h-auto! py-3.5 font-bold text-sm rounded hover:text-text dark:hover:bg-white dark:hover:text-text"
                >
                  PROCEED TO SCANNER →
                </Button>
                <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    render={<a href={passDataUrl} download={`${registered.record_no}-entry-pass.png`} />}
                    className="h-auto! px-4 py-2 text-xs font-mono rounded hover:border-primary hover:text-primary"
                  >
                    ↓ DOWNLOAD QR
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForm(initialForm)
                      setRegistered(null)
                      setPassDataUrl('')
                    }}
                    className="h-auto! px-4 py-2 text-xs font-mono rounded hover:border-primary hover:text-primary"
                  >
                    REGISTER ANOTHER
                  </Button>
                </div>
              </div>
            )}
          </CornerBracket>
        </div>
      </div>
    </div>
  )
}
