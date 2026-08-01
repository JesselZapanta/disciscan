import CornerBracket from '../components/CornerBracket.jsx'
import { MapPin, Phone, Mail, Globe } from 'lucide-react'

const timeline = [
  {
    year: '1984',
    title: 'Tangub City College (TCC)',
    text: 'Founded by virtue of City Ordinance No. 15 under the late Mayor Alfonso D. Tan. Opened on June 1, 1984 to more than 200 pioneering students.',
  },
  {
    year: '1992',
    title: 'Gov. Alfonso D. Tan Memorial College (GADTMC)',
    text: 'Renamed under Gov. Philip T. Tan, who vowed to improve facilities and raise the standards of the school.',
  },
  {
    year: '2003',
    title: 'Alfonso D. Tan College (ADTC)',
    text: 'Renamed under the governance of Mayor Jennifer Wee-Tan.',
  },
  {
    year: '2007',
    title: 'Gov. Alfonso D. Tan College (GADTC)',
    text: 'The college bears this name today — Tangub City Global College (TCGC) — stamped in its green flag of excellence and pride.',
  },
]

const institutes = [
  {
    name: 'Institute of Business and Financial Services',
    programs: ['BSBA Human Resource Management', 'BSBA Marketing Management', 'BS Office Administration'],
  },
  {
    name: 'Institute of Teacher Education',
    programs: ['B Elementary Education', 'BSED English', 'BSED Filipino', 'BSED Math', 'BSED Social Studies'],
  },
  {
    name: 'Institute of Criminal Justice Education',
    programs: ['BS Criminology', 'BS Industrial Security Management'],
  },
  {
    name: 'Institute of Computer Studies',
    programs: ['BS Computer Science'],
  },
  {
    name: 'Institute of Arts and Sciences',
    programs: ['AB Communication', 'AB English Language', 'AB Political Science'],
  },
  {
    name: 'Institute of Midwifery',
    programs: ['Diploma in Midwifery'],
  },
]

export default function TCGC() {
  return (
    <div className="px-6 lg:px-10 py-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="inline-flex items-center gap-2 border border-border rounded-full px-3 py-1 text-[11px] font-mono text-muted-foreground mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
          FOR TCGC — TANGUB CITY GLOBAL COLLEGE
        </div>
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 shrink-0 border border-border bg-card rounded-xl flex items-center justify-center overflow-hidden">
            <img
              src="/tcgc.png"
              alt="Tangub City Global College logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Tangub City Global College
            </h1>
            <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
              Gov. Alfonso D. Tan College (GADTC) — known today as TCGC — shaping
              God-centered citizens and leaders in Northwestern Mindanao.
            </p>
          </div>
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <CornerBracket className="border border-border bg-card rounded-lg p-6">
            <span className="font-mono text-[11px] text-primary uppercase tracking-widest">
              01 — HISTORY
            </span>
            <h2 className="text-xl font-bold mt-2 mb-5 text-foreground">From a city college to TCGC</h2>
            <div className="space-y-5">
              {timeline.map((entry) => (
                <div key={entry.year} className="flex gap-4">
                  <div className="w-14 shrink-0 text-sm font-mono font-bold text-brand-green pt-0.5">
                    {entry.year}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{entry.title}</div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CornerBracket>

          <div className="space-y-6">
            <CornerBracket className="border border-border bg-card rounded-lg p-6">
              <span className="font-mono text-[11px] text-primary uppercase tracking-widest">
                02 — VISION
              </span>
              <p className="mt-3 text-foreground leading-relaxed">
                TCGC is the leading Higher Education Institution in Northwestern Mindanao
                providing quality education and producing God-centered citizens committed
                to be{' '}
                <span className="text-brand-green font-semibold">THE LIGHT OF THE WORLD</span>.
              </p>
            </CornerBracket>

            <CornerBracket className="border border-border bg-card rounded-lg p-6">
              <span className="font-mono text-[11px] text-primary uppercase tracking-widest">
                03 — MISSION
              </span>
              <ul className="mt-3 space-y-2.5 text-muted-foreground text-sm leading-relaxed list-disc pl-4">
                <li>Equip faculty and staff through continuing professional development to produce globally competitive graduates.</li>
                <li>Nurture academic excellence through quality instruction.</li>
                <li>Establish research and community extension programs that transfer knowledge and skills.</li>
                <li>Foster leadership and promote self-reliance among the people.</li>
              </ul>
            </CornerBracket>

            <CornerBracket className="border border-border bg-card rounded-lg p-6">
              <span className="font-mono text-[11px] text-primary uppercase tracking-widest">
                04 — ACCREDITATION
              </span>
              <p className="mt-3 text-foreground text-sm leading-relaxed">
                Level 3 ALCUCOA Accredited — Association of Local Colleges and Universities
                Commission on Accreditation. Motto:{' '}
                <span className="text-brand-green font-semibold">&ldquo;Be the Light of the World.&rdquo;</span>
              </p>
            </CornerBracket>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <CornerBracket className="border border-border bg-card rounded-lg p-6">
            <span className="font-mono text-[11px] text-primary uppercase tracking-widest">
              05 — ACADEMIC INSTITUTES
            </span>
            <h2 className="text-xl font-bold mt-2 mb-5 text-foreground">Degree programs</h2>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
              {institutes.map((institute) => (
                <div key={institute.name}>
                  <div className="text-sm font-semibold text-foreground">{institute.name}</div>
                  <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                    {institute.programs.map((program) => (
                      <li key={program} className="flex gap-1.5">
                        <span className="text-brand-green">+</span>
                        {program}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CornerBracket>

          <CornerBracket className="border border-border bg-card rounded-lg p-6">
            <span className="font-mono text-[11px] text-primary uppercase tracking-widest">
              06 — CONTACT
            </span>
            <h2 className="text-xl font-bold mt-2 mb-5 text-foreground">Visit or reach the college</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  Registrar&apos;s Office — 1st Floor, J. Luna St., Maloro, Tangub City,
                  7214 Misamis Occidental, Philippines
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-brand-green shrink-0" />
                <span className="text-muted-foreground">+63-919-004-6780 · (088)-545-2793</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brand-green shrink-0" />
                <span className="text-muted-foreground">registrar@gadtc.edu.ph</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-brand-green shrink-0" />
                <a
                  href="http://www.gadtc.edu.ph/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  www.gadtc.edu.ph
                </a>
              </div>
              <div className="border-t border-border pt-4 text-xs text-muted-foreground font-mono">
                OFFICE HOURS — MON–FRI · 8:00AM–12:00NN · 1:30PM–5:00PM
              </div>
            </div>
          </CornerBracket>
        </div>
      </div>
    </div>
  )
}
