import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, MoreHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'

export default function MobileBottomNav({ items, rootPath, renderFooter }) {
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    setMoreOpen(false)
  }, [location.pathname])

  const isActive = (path) =>
    path === rootPath ? location.pathname === rootPath : location.pathname.startsWith(path)

  const visible = items.slice(0, 3)
  const more = items.slice(3)
  const moreActive = more.some((item) => isActive(item.path))

  return (
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4">
        {visible.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 text-[10px] font-mono font-medium transition',
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}

        <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
          <DialogTrigger
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 text-[10px] font-mono font-medium transition',
              moreActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            More
          </DialogTrigger>
          <DialogPortal>
            <DialogBackdrop />
            <DialogPopup className="left-0 right-0 bottom-0 top-auto w-full max-w-none translate-x-0 translate-y-0 rounded-none rounded-t-xl p-0 pb-[env(safe-area-inset-bottom)] data-open:animate-in data-open:slide-in-from-bottom-10 data-open:duration-300 data-closed:animate-out data-closed:slide-out-to-bottom-10 data-closed:duration-200">
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <div>
                  <DialogTitle className="text-sm font-semibold text-foreground">
                    More
                  </DialogTitle>
                  <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
                    All navigation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  aria-label="Close more menu"
                  className="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-1 px-3 pb-3">
                {more.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition',
                      isActive(item.path)
                        ? 'text-primary bg-secondary ring-1 ring-border'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                  >
                    <span className="size-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4" />
                    </span>
                    {item.label}
                    <ChevronRight className="h-4 w-4 ml-auto shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>

              {renderFooter && (
                <div className="border-t border-border p-3 space-y-2">
                  {renderFooter(() => setMoreOpen(false))}
                </div>
              )}
            </DialogPopup>
          </DialogPortal>
        </Dialog>
      </div>
    </nav>
  )
}
