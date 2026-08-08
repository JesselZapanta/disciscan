import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"

function Dialog(props) {
  return <DialogPrimitive.Root {...props} />
}

function DialogTrigger(props) {
  return <DialogPrimitive.Trigger {...props} />
}

function DialogPortal(props) {
  return <DialogPrimitive.Portal {...props} />
}

function DialogBackdrop({ className, ...props }) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-200",
        className
      )}
      {...props}
    />
  );
}

function DialogPopup({ className, wrapperClassName, children, ...props }) {
  return (
    <DialogPrimitive.Popup
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6",
        wrapperClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "relative w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-2xl",
          className
        )}
      >
        {/* orange corner brackets — same design as dashboard KPI cards */}
        <span className="pointer-events-none absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary/30" />
        <span className="pointer-events-none absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary/30" />
        <span className="pointer-events-none absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary/30" />
        <span className="pointer-events-none absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary/30" />
        {children}
      </div>
    </DialogPrimitive.Popup>
  );
}

function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      className={cn("mt-1 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function DialogClose(props) {
  return <DialogPrimitive.Close {...props} />
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
}
