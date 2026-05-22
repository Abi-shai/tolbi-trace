import { type LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
}

export default function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <div className="bg-white border border-border rounded-lg px-4 py-3 flex items-start gap-2 flex-1 min-w-0">
      <div className="flex items-center justify-center w-8 h-8 shrink-0">
        <Icon size={16} className="text-text-tertiary" />
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-lg font-normal text-text-secondary leading-7 whitespace-nowrap">{label}</p>
        <p className="text-[30px] font-bold text-primary leading-[38px]">{value}</p>
      </div>
    </div>
  )
}
