export default function StatusBadge({ status }: { status: 'critical' | 'high' | 'moderate' | string }) {
  const getBadgeClass = (s: string) => {
    const lower = s.toLowerCase()
    if (lower.includes('critical') || lower.includes('danger') || lower.includes('declined')) return 'badge badge-danger'
    if (lower.includes('warning') || lower.includes('high') || lower.includes('pending') || lower.includes('moderate')) return 'badge badge-warning'
    if (lower.includes('success') || lower.includes('accepted') || lower.includes('arrived')) return 'badge badge-success'
    if (lower.includes('preparing') || lower.includes('info')) return 'badge badge-info'
    return 'badge badge-warning'
  }

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      {status}
    </span>
  )
}
