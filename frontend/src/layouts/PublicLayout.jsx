import { Link, Outlet } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { Button } from '@/components/ui/button'

const navLinks = ['System', 'Modules', 'For TCGC', 'Support']

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="max-w-[1400px] mx-auto w-full px-6 lg:px-10 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="font-mono font-bold tracking-widest text-sm">
            <span className="text-primary">DISCI</span>
            <span className="text-brand-green">SCAN</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
          {navLinks.map((link) => (
            <a key={link} href="#" className="hover:text-foreground transition">
              {link}
            </a>
          ))}
        </nav>
        <Link to="/login">
          <Button
            variant="outline"
            className="text-xs font-mono font-semibold border-border px-4 py-2 h-auto rounded hover:border-primary hover:text-primary transition"
          >
            SIGN IN →
          </Button>
        </Link>
      </header>

      <main className="flex-1 dot-grid">
        <div className="mx-auto w-full max-w-[1400px]">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-10 py-8 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground font-mono">
          <span>
            <span className="text-primary">DISCI</span>
            <span className="text-brand-green">SCAN</span> — TANGUB CITY GLOBAL COLLEGE
          </span>
          <span>SDG 16 · PEACE, JUSTICE &amp; STRONG INSTITUTIONS</span>
        </div>
      </footer>
    </div>
  )
}
