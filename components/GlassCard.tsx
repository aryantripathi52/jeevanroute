export default function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-card p-10 ${className}`}>
      {children}
    </div>
  )
}
