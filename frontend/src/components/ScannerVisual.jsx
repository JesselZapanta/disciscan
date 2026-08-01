import Logo from './Logo.jsx'

export default function ScannerVisual({ className = '', size = 'default' }) {
  const gridClass = size === 'large' ? 'w-36 h-36' : 'w-32 h-32'
  return (
    <div
      className={`relative bg-background border border-border rounded flex items-center justify-center overflow-hidden ${size === 'large' ? 'h-72' : 'h-56'} ${className}`}
    >
      {/* QR-like pattern */}
      <div className={`${gridClass} border border-muted-foreground/30 grid grid-cols-4 grid-rows-4 gap-1 p-2 opacity-60`}>
        <div className="bg-foreground/80" /><div /><div className="bg-foreground/80" /><div />
        <div /><div className="bg-foreground/80" /><div /><div className="bg-foreground/80" />
        <div className="bg-foreground/80" /><div /><div className="bg-foreground/80" /><div />
        <div /><div className="bg-foreground/80" /><div /><div className="bg-foreground/80" />
      </div>

      {/* logo lock-on target */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <span className="scan-ring absolute w-16 h-16 rounded-full border border-primary/50" />
          <span
            className="scan-ring absolute w-16 h-16 rounded-full border border-brand-green/50"
            style={{ animationDelay: '1.1s' }}
          />
          <div className="relative bg-background/85 border border-border rounded-full p-2.5">
            <Logo size={40} />
          </div>
        </div>
      </div>

      <div className="scanline" />

      {/* scanning status */}
      <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-brand-green">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-green scan-blink" />
        Scanning
        <span className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-brand-green scan-dot" />
          <span className="w-1 h-1 rounded-full bg-brand-green scan-dot" style={{ animationDelay: '0.2s' }} />
          <span className="w-1 h-1 rounded-full bg-brand-green scan-dot" style={{ animationDelay: '0.4s' }} />
        </span>
      </div>
    </div>
  )
}
