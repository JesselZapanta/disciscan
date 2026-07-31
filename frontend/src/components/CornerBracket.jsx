export default function CornerBracket({ children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute top-[-1px] left-[-1px] w-5 h-5 border-t-2 border-l-2 border-primary/30 pointer-events-none" />
      <span className="absolute top-[-1px] right-[-1px] w-5 h-5 border-t-2 border-r-2 border-primary/30 pointer-events-none" />
      {children}
      <span className="absolute bottom-[-1px] left-[-1px] w-5 h-5 border-b-2 border-l-2 border-primary/30 pointer-events-none" />
      <span className="absolute bottom-[-1px] right-[-1px] w-5 h-5 border-b-2 border-r-2 border-primary/30 pointer-events-none" />
    </div>
  )
}
