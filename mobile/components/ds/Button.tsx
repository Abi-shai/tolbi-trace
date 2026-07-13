import { ReactNode } from 'react'
import { Pressable, View, ViewStyle } from 'react-native'
import { Txt } from './Txt'
import { Icon } from './Icon'
import { sem, color, font, radius, shadow } from '../../theme/tokens'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const V: Record<Variant, { bg: string; border: string; fg: string }> = {
  primary: { bg: sem.bg.brandSolid, border: sem.border.brandSolid, fg: color.white },
  secondary: { bg: color.white, border: sem.border.primary, fg: sem.fg.secondary },
  ghost: { bg: 'transparent', border: 'transparent', fg: sem.text.brandSecondary },
  danger: { bg: color.white, border: sem.border.secondary, fg: sem.text.errorPrimary },
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
  size = 'md',
}: {
  label: string
  onPress?: () => void
  variant?: Variant
  icon?: string
  disabled?: boolean
  style?: ViewStyle
  size?: 'sm' | 'md'
}) {
  const v = V[variant]
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: v.bg,
          borderWidth: 1,
          borderColor: v.border,
          borderRadius: radius.md,
          paddingVertical: size === 'sm' ? 10 : 13,
          paddingHorizontal: 16,
          opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
        },
        variant !== 'ghost' && shadow.xs,
        style,
      ]}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} color={v.fg} />}
      <Txt
        style={{
          fontFamily: font.poppins.semibold,
          fontSize: size === 'sm' ? 13.5 : 15,
          color: v.fg,
        }}
      >
        {label}
      </Txt>
    </Pressable>
  )
}

/** Small utility for the many "row card" pressables in the design. */
export function CardButton({
  children,
  onPress,
  style,
}: {
  children: ReactNode
  onPress?: () => void
  style?: ViewStyle
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: color.white,
          borderWidth: 1,
          borderColor: sem.border.secondary,
          borderRadius: radius['2xl'],
          opacity: pressed ? 0.96 : 1,
        },
        shadow.xs,
        style,
      ]}
    >
      {children as any}
    </Pressable>
  )
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          backgroundColor: color.white,
          borderWidth: 1,
          borderColor: sem.border.secondary,
          borderRadius: radius['2xl'],
        },
        shadow.xs,
        style,
      ]}
    >
      {children}
    </View>
  )
}
