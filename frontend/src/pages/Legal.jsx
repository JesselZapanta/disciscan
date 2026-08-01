import CornerBracket from '../components/CornerBracket.jsx'

const terms = [
  {
    title: 'Acceptance of Terms',
    text: 'By accessing or using DisciScan, you agree to these Terms of Service. If you do not agree, do not use the system.',
  },
  {
    title: 'Accounts and Access',
    text: 'Accounts are issued by authorized administrators only. There is no self-registration. You are responsible for keeping your credentials confidential and for all activity under your account.',
  },
  {
    title: 'Acceptable Use',
    text: 'The system is provided for official school discipline, monitoring, and record-keeping purposes. Unauthorized access, misuse, or tampering with records is prohibited and may result in disciplinary or legal action.',
  },
  {
    title: 'Records and Data',
    text: 'Disciplinary records, attendance logs, and visitor entries are maintained by the school as part of its official records. Records are subject to applicable data privacy laws and school policies.',
  },
  {
    title: 'Limitation of Liability',
    text: 'The system is provided as-is. The school is not liable for damages arising from use of the system beyond its intended purpose or from circumstances outside its reasonable control.',
  },
  {
    title: 'Changes to Terms',
    text: 'These terms may be updated from time to time. Continued use of the system after changes constitutes acceptance of the revised terms.',
  },
]

const privacy = [
  {
    title: 'Information We Collect',
    text: 'We collect account information (name, email, role), disciplinary records, attendance logs, visitor registration details, and QR identifiers used for identification.',
  },
  {
    title: 'How Information Is Used',
    text: 'Information is used solely for school operations: identification at gates, discipline monitoring, attendance, visitor management, and reporting to authorized personnel.',
  },
  {
    title: 'Storage and Security',
    text: 'Records are stored on secure school-managed infrastructure. Access is restricted to authorized Admin and Security Guard accounts, and every session is logged.',
  },
  {
    title: 'Sharing',
    text: 'Records are shared only with authorized school personnel and government agencies as required by law. We do not sell personal data.',
  },
  {
    title: 'Your Rights',
    text: 'Students, parents, and visitors may request access to or correction of their records in accordance with applicable data privacy regulations.',
  },
  {
    title: 'Contact',
    text: 'For privacy concerns, contact the school through the college website at www.gadtc.edu.ph.',
  },
]

export default function Legal() {
  return (
    <div className="px-6 lg:px-10 py-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="inline-flex items-center gap-2 border border-border rounded-full px-3 py-1 text-[11px] font-mono text-muted-foreground mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-status-flagged" />
          LEGAL
        </div>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Terms of Service &amp; Privacy Policy
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
          The rules and data practices that govern the use of DisciScan at Tangub City
          Global College.
        </p>

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <CornerBracket className="border border-border bg-card rounded-lg p-6">
            <span className="font-mono text-[11px] text-primary uppercase tracking-widest">
              01 — TERMS OF SERVICE
            </span>
            <div className="mt-5 space-y-5">
              {terms.map((item, index) => (
                <div key={item.title}>
                  <div className="text-sm font-semibold text-foreground">
                    <span className="text-brand-green font-mono mr-2">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {item.title}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </CornerBracket>

          <CornerBracket className="border border-border bg-card rounded-lg p-6">
            <span className="font-mono text-[11px] text-primary uppercase tracking-widest">
              02 — PRIVACY POLICY
            </span>
            <div className="mt-5 space-y-5">
              {privacy.map((item, index) => (
                <div key={item.title}>
                  <div className="text-sm font-semibold text-foreground">
                    <span className="text-brand-green font-mono mr-2">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {item.title}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </CornerBracket>
        </div>
      </div>
    </div>
  )
}
