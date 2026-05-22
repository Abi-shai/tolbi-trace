interface SparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
}

export default function Sparkline({ data, color = '#1D9E75', width = 64, height = 24 }: SparklineProps) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 2

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - pad - ((v - min) / range) * (height - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
