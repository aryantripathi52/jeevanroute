export default function StatusBadge({ status }: { status: 'critical' | 'high' | 'moderate' | string }) {
  const colors = {
    critical: 'bg-red-500/30 text-red-100 border-red-400',
    high: 'bg-orange-500/30 text-orange-100 border-orange-400',
    moderate: 'bg-yellow-500/30 text-yellow-100 border-yellow-400',
  }

  const colorClass = colors[status as keyof typeof colors] || colors.moderate

  return (
    <span className={`px-3 py-1 rounded-full text-sm border ${colorClass} font-medium`}>
      {status}
    </span>
  )
}
