import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

const TOAST_DURATION = 4000

const variantIcon = {
  success: CheckCircle2,
  error: AlertCircle,
  default: null,
}

const variantIconClass = {
  success: 'text-status-cleared',
  error: 'text-status-flagged',
  default: 'text-primary',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, variant = 'default' }) => {
      const id = ++idRef.current
      setToasts((current) => [...current, { id, title, description, variant }])
      setTimeout(() => dismiss(id), TOAST_DURATION)
    },
    [dismiss]
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((item) => {
          const Icon = variantIcon[item.variant] || variantIcon.default
          return (
            <div
              key={item.id}
              role="status"
              className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-2xl animate-in slide-in-from-top-2 fade-in duration-200"
            >
              {Icon && <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', variantIconClass[item.variant])} />}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                {item.description && (
                  <div className="mt-0.5 text-xs text-muted-foreground break-words">{item.description}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
