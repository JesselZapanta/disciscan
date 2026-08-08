import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ChevronRight, Cpu, Landmark, LayoutDashboard, LogIn, Menu, QrCode, Scale, X } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'

const navLinks = [
  { label: 'System', path: '/system', icon: Cpu },
  { label: 'For TCGC', path: '/tcgc', icon: Landmark },
  { label: 'Legal', path: '/legal', icon: Scale },
  { label: 'Visitor Registration', path: '/visitor-registration', icon: QrCode },
]

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { user, loading } = useAuth()
  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/guard/dashboard'

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

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
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                cn('transition hover:text-foreground', isActive && 'text-primary font-semibold')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
            <DialogTrigger
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden h-auto! p-2 text-muted-foreground hover:text-foreground rounded flex items-center justify-center"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </DialogTrigger>
            <DialogPortal>
              <DialogBackdrop />
              <DialogPopup
                wrapperClassName="items-end justify-end p-0 data-open:animate-in data-open:slide-in-from-bottom-10 data-open:duration-300 data-closed:animate-out data-closed:slide-out-to-bottom-10 data-closed:duration-200"
                className="w-full max-w-none rounded-none rounded-t-xl p-0 pb-[env(safe-area-inset-bottom)]"
              >
                <div className="flex items-center justify-between px-5 pt-5 pb-4">
                  <div>
                    <DialogTitle className="text-sm font-semibold text-foreground">
                      Menu
                    </DialogTitle>
                    <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
                      All navigation
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                    className="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="flex flex-col gap-1 px-3 pb-3">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition',
                          isActive
                            ? 'text-primary bg-secondary ring-1 ring-border'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        )
                      }
                    >
                      <span className="size-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
                        <link.icon className="h-4 w-4" />
                      </span>
                      {link.label}
                      <ChevronRight className="h-4 w-4 ml-auto shrink-0 text-muted-foreground" />
                    </NavLink>
                  ))}
                </div>

                <div className="border-t border-border p-3 space-y-2">
                  <Link
                    to={user ? dashboardPath : '/login'}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition hover:text-foreground hover:bg-secondary"
                  >
                    <span className="size-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
                      {user ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                    </span>
                    {user ? 'DASHBOARD' : 'SIGN IN'}
                    <ChevronRight className="h-4 w-4 ml-auto shrink-0 text-muted-foreground" />
                  </Link>
                </div>
              </DialogPopup>
            </DialogPortal>
          </Dialog>
          {loading ? (
            <span
              className="hidden md:inline-block h-9 w-28 animate-pulse rounded bg-secondary border border-border"
              aria-hidden="true"
            />
          ) : (
            <Link to={user ? dashboardPath : '/login'} className="hidden md:block">
              <Button
                variant="outline"
                className="text-xs font-mono font-semibold rounded hover:border-primary hover:text-primary transition"
              >
                {user ? 'DASHBOARD →' : 'SIGN IN →'}
              </Button>
            </Link>
          )}
        </div>
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
