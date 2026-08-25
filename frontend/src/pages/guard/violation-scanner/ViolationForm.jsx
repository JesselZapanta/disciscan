import { Loader2, Send, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function ViolationForm({
  violationTypes,
  typesError,
  selectedIds,
  onToggleType,
  remarks,
  onRemarksChange,
  formError,
  saving,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="mt-5 space-y-5 border-t border-border pt-4" onSubmit={onSubmit}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">
            Violation type(s)
          </label>
          <span className="text-[10px] font-mono text-muted-foreground">
            {selectedIds.length} SELECTED
          </span>
        </div>

        {typesError ? (
          <div className="flex items-start gap-2 text-[11px] font-mono text-status-flagged bg-status-flagged/5 border border-status-flagged/30 rounded-lg px-3 py-2.5">
            <TriangleAlert className="size-4 shrink-0 mt-0.5" />
            <span>{typesError}</span>
          </div>
        ) : violationTypes.length === 0 ? (
          <div className="flex items-start gap-2 text-[11px] font-mono text-muted-foreground bg-secondary/60 border border-border rounded-lg px-3 py-2.5">
            <TriangleAlert className="size-4 shrink-0 mt-0.5" />
            <span>No active violation types are configured. Ask an admin to add some.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {violationTypes.map((type) => {
              const checked = selectedIds.includes(type.id)
              return (
                <label
                  key={type.id}
                  className={cn(
                    'flex items-start gap-2.5 border rounded-lg px-3 py-3 text-sm cursor-pointer transition',
                    checked
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border hover:border-muted-foreground'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleType(type.id)}
                    className="mt-0.5 size-4 shrink-0 accent-[#F5A623]"
                  />
                  <span className="min-w-0">
                    <span className="block font-medium leading-snug">{type.name}</span>
                    {type.description && (
                      <span className="block mt-0.5 text-[11px] text-muted-foreground leading-snug">
                        {type.description}
                      </span>
                    )}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide">
          Remarks (optional)
        </label>
        <textarea
          rows="3"
          value={remarks}
          onChange={(e) => onRemarksChange(e.target.value)}
          placeholder="Add any additional notes for this record…"
          className="w-full bg-secondary border border-input focus:border-ring outline-none rounded px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition resize-none"
        />
      </div>

      {formError && (
        <div className="flex items-start gap-2 text-[11px] font-mono text-status-flagged bg-status-flagged/5 border border-status-flagged/30 rounded-lg px-3 py-2.5">
          <TriangleAlert className="size-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 h-auto! border-border rounded py-3.5 text-sm font-semibold hover:border-muted-foreground"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="flex-1 h-auto! bg-primary text-primary-foreground rounded py-3.5 text-sm font-bold hover:bg-primary/80 hover:text-text dark:hover:bg-white dark:hover:text-text transition"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {saving ? 'Saving…' : 'Save Record'}
        </Button>
      </div>
    </form>
  )
}
