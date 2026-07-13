import { View } from 'react-native'
import { Txt } from './Txt'
import { color, font, radius } from '../../theme/tokens'

export type BadgeColor =
  | 'brand' | 'gray' | 'success' | 'warning' | 'error' | 'blue'

const PALETTE: Record<BadgeColor, { bg: string; fg: string; dot: string }> = {
  brand: { bg: color.brand[50], fg: color.brand[700], dot: color.brand[500] },
  gray: { bg: color.gray[100], fg: color.gray[700], dot: color.gray[500] },
  success: { bg: color.success[50], fg: color.success[700], dot: color.success[500] },
  warning: { bg: color.warning[50], fg: color.warning[700], dot: color.warning[500] },
  error: { bg: color.error[50], fg: color.error[700], dot: color.error[500] },
  blue: { bg: '#EFF8FF', fg: '#175CD3', dot: '#2E90FA' },
}

export function Badge({
  label,
  color: c = 'gray',
  dot = false,
  size = 'sm',
}: {
  label: string
  color?: BadgeColor
  dot?: boolean
  size?: 'sm' | 'md'
}) {
  const p = PALETTE[c]
  const fontSize = size === 'sm' ? 11 : 12
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        alignSelf: 'flex-start',
        backgroundColor: p.bg,
        borderRadius: radius.full,
        paddingVertical: size === 'sm' ? 3 : 4,
        paddingHorizontal: size === 'sm' ? 9 : 11,
      }}
    >
      {dot && (
        <View
          style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: p.dot }}
        />
      )}
      <Txt style={{ fontFamily: font.inter.semibold, fontSize, color: p.fg }}>
        {label}
      </Txt>
    </View>
  )
}
