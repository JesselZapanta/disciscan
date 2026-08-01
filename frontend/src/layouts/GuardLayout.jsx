import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, QrCode, FileWarning, UserPlus } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import UserAvatar from '../components/UserAvatar.jsx'
import SignOutButton from '../components/SignOutButton.jsx'
import MobileBottomNav from '../components/MobileBottomNav.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', path: '/guard/dashboard', icon: LayoutDashboard },
  { label: 'Scan Console', path: '/guard', icon: QrCode },
  { label: 'Violation Form', path: '/guard/violation', icon: FileWarning },
  { label: 'Visitor Registration', path: '/visitor/register', icon: UserPlus },
]

export default function GuardLayout() {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <div className="h-dvh bg-background flex overflow-hidden">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card">
        <div className="px-6 py-6 flex items-center gap-2.5 border-b border-border">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-mono font-bold tracking-widest text-sm">
              <span className="text-primary">DISCI</span>
              <span className="text-brand-green">SCAN</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 text-sm overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive =
              item.path === '/guard/dashboard'
                ? location.pathname === '/guard/dashboard'
                : location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded transition',
                  isActive
                    ? 'bg-secondary text-primary font-medium border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-5 border-t border-border space-y-2">
          <Link
            to="/guard/dashboard/profile"
            className="flex items-center gap-3 px-3 py-2 rounded bg-secondary border border-transparent hover:border-border transition"
          >
            <UserAvatar user={user} className="w-8 h-8 rounded" textClassName="text-xs" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">
                {user?.name || 'Guard'}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">
                {(user?.role || 'GUARD').toUpperCase()}
              </div>
            </div>
          </Link>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Mobile-only header */}
        <header className="lg:hidden flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-sm font-semibold font-sans tracking-tight">
              <span className="text-primary">Disci</span>
              <span className="text-brand-green">Scan</span>
            </span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden dot-grid">
          <div className="mx-auto w-full max-w-[1400px] pb-16 lg:pb-0">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav
        items={navItems}
        rootPath="/guard/dashboard"
        renderFooter={(close) => (
          <>
            <Link
              to="/guard/dashboard/profile"
              onClick={close}
              className="flex items-center gap-3 px-3 py-2 rounded bg-secondary border border-transparent hover:border-border transition"
            >
              <UserAvatar user={user} className="w-8 h-8 rounded" textClassName="text-xs" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">
                  {user?.name || 'Guard'}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">
                  {(user?.role || 'GUARD').toUpperCase()}
                </div>
              </div>
            </Link>
            <SignOutButton />
          </>
        )}
      />
    </div>
  )
}
