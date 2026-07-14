import { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { Txt } from './Txt'
import { sem, color, font, radius } from '../../theme/tokens'

/** Rounded pill / chip used for filters, tags, the org switcher, language. */
export function Pill({
  label,
  active = false,
  onPress,
  left,
  right,
  bg,
  borderColor,
  textColor,
}: {
  label: string
  active?: boolean
  onPress?: () => void
  left?: ReactNode
  right?: ReactNode
  bg?: string
  borderColor?: string
  textColor?: string
}) {
  const resolvedBg = bg ?? (active ? color.brand[600] : color.white)
  const resolvedBorder =
    borderColor ?? (active ? sem.border.brandSolid : sem.border.primary)
  const resolvedText = textColor ?? (active ? color.white : sem.text.tertiary)
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: resolvedBg,
        borderWidth: 1,
        borderColor: resolvedBorder,
        borderRadius: radius.full,
        paddingVertical: 5,
        paddingHorizontal: 11,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {left}
      <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11.5, color: resolvedText }}>
        {label}
      </Txt>
      {right}
    </Pressable>
  )
}

export function ProgressBar({
  percent,
  fill = color.brand[600],
  track = sem.bg.tertiary,
  height = 7,
}: {
  percent: number
  fill?: string
  track?: string
  height?: number
}) {
  return (
    <View
      style={{
        height,
        borderRadius: radius.full,
        backgroundColor: track,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${Math.max(0, Math.min(100, percent))}%`,
          height: '100%',
          borderRadius: radius.full,
          backgroundColor: fill,
        }}
      />
    </View>
  )
}
