export default function ScannerVisual({ className = '', size = 'default' }) {
  const gridClass = size === 'large' ? 'w-36 h-36' : 'w-32 h-32'
  return (
    <div
      className={`relative bg-background border border-border rounded flex items-center justify-center overflow-hidden ${size === 'large' ? 'h-72' : 'h-56'} ${className}`}
    >
      <div className={`${gridClass} border border-muted-foreground/30 grid grid-cols-4 grid-rows-4 gap-1 p-2 opacity-60`}>
        {/* QR-like pattern */}
        <div className="bg-foreground/80" /><div /><div className="bg-foreground/80" /><div />
        <div /><div className="bg-foreground/80" /><div /><div className="bg-foreground/80" />
        <div className="bg-foreground/80" /><div /><div className="bg-foreground/80" /><div />
        <div /><div className="bg-foreground/80" /><div /><div className="bg-foreground/80" />
      </div>
      <div className="scanline" />
    </div>
  )
}
