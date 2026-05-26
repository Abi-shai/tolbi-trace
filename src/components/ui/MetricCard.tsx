import { type LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
}

export default function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <div className="bg-white border border-border rounded-lg px-4 py-3 flex items-center gap-3 flex-1 min-w-0">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface shrink-0">
        <Icon size={16} className="text-text-tertiary" />
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-xs text-text-tertiary truncate">{label}</p>
        <p className="text-2xl font-bold text-text-primary leading-8">{value}</p>
      </div>
    </div>
  )
}
