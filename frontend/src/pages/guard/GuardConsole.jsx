import { useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo.jsx'
import CornerBracket from '../../components/CornerBracket.jsx'
import ScannerVisual from '../../components/ScannerVisual.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function GuardConsole() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout().then(() => navigate('/login', { replace: true }))
  }

  return (
    <div className="min-h-screen bg-background flex items-start lg:items-center justify-center py-10 px-4 dot-grid">
      <div className="w-full max-w-sm bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl">
        {/* status bar */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-mono text-xs font-bold tracking-widest">
              <span className="text-primary">GUARD POST</span>
              <span className="text-muted-foreground"> — </span>
              <span className="text-brand-green">GATE 1</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-muted-foreground text-xs hover:text-foreground transition"
            aria-label="Power off"
          >
            ⏻
          </button>
        </div>

        <div className="px-5 pb-3 flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-status-cleared border border-status-cleared/30 bg-status-cleared/10 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-cleared" /> ONLINE
          </span>
          <span className="text-[10px] font-mono text-muted-foreground border border-border rounded-full px-2.5 py-1">
            SHIFT 06:00–14:00
          </span>
        </div>

        {/* scanner */}
        <div className="px-5 mt-2">
          <CornerBracket className="rounded-xl">
            <ScannerVisual size="large" />
            <span className="absolute bottom-3 left-0 right-0 text-center text-[10px] font-mono text-muted-foreground">
              POSITION QR WITHIN FRAME
            </span>
          </CornerBracket>
        </div>

        {/* last scan result */}
        <div className="px-5 mt-4">
          <div className="flex items-center gap-3 bg-secondary border border-border rounded-xl p-4">
            <div className="w-12 h-12 rounded-lg bg-border shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground truncate">
                Marielle A. Sombilon
              </div>
              <div className="text-muted-foreground text-[11px] font-mono">
                BSCS-3B · 22-01147
              </div>
            </div>
            <StatusChip status="Flagged" />
          </div>
        </div>

        {/* quick actions */}
        <div className="px-5 mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate('/guard/violation')}
            className="flex flex-col items-center justify-center gap-1.5 border border-status-flagged/30 bg-status-flagged/10 rounded-xl py-4 hover:bg-status-flagged/20 transition"
          >
            <span className="text-lg">⚠</span>
            <span className="text-[11px] font-mono font-semibold text-status-flagged">
              LOG VIOLATION
            </span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1.5 border border-status-cleared/30 bg-status-cleared/10 rounded-xl py-4 hover:bg-status-cleared/20 transition"
          >
            <span className="text-lg">✓</span>
            <span className="text-[11px] font-mono font-semibold text-status-cleared">
              MARK CLEARED
            </span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1.5 border border-info/30 bg-info/10 rounded-xl py-4 hover:bg-info/20 transition"
          >
            <span className="text-lg">◷</span>
            <span className="text-[11px] font-mono font-semibold text-info">TIME-IN / OUT</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1.5 border border-border bg-secondary rounded-xl py-4 hover:border-primary transition"
          >
            <span className="text-lg">▤</span>
            <span className="text-[11px] font-mono font-semibold text-muted-foreground">
              COMPLIANCE
            </span>
          </button>
        </div>

        {/* big scan button */}
        <div className="px-5 mt-6 mb-6">
          <button
            type="button"
            onClick={() => navigate('/guard/violation')}
            className="pulse w-full bg-primary text-primary-foreground font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/80 hover:text-text dark:hover:bg-white dark:hover:text-text transition"
          >
            <span className="text-lg">▣</span> TAP TO SCAN
          </button>
        </div>

        {/* bottom tab bar */}
        <div className="border-t border-border px-5 py-3 flex items-center justify-around text-[10px] font-mono">
          <span className="flex flex-col items-center gap-1 text-primary">
            <span>▣</span>SCAN
          </span>
          <button
            type="button"
            onClick={() => navigate('/guard/dashboard')}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition"
          >
            <span>▤</span>LOGS
          </button>
          <button
            type="button"
            onClick={() => navigate('/visitor/register')}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition"
          >
            <span>+</span>VISITOR
          </button>
          <span className="flex flex-col items-center gap-1 text-muted-foreground">
            <span>●</span>PROFILE
          </span>
        </div>
      </div>
    </div>
  )
}
