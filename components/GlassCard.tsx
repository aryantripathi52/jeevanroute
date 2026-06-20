export default function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  )
}
