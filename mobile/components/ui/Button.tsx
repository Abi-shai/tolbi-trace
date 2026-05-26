import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { colors, radius, fonts } from '../../lib/tokens'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps {
  variant?:   Variant
  icon?:      LucideIcon
  iconRight?: LucideIcon
  fullWidth?: boolean
  loading?:   boolean
  disabled?:  boolean
  onPress?:   () => void
  children:   React.ReactNode
}

const VARIANT_STYLES = {
  primary:   { bg: colors.primary,       text: colors.white,       border: colors.primary,       icon: colors.white       },
  secondary: { bg: colors.white,         text: colors.textPrimary,  border: colors.borderStrong,  icon: colors.textPrimary  },
  ghost:     { bg: 'transparent',        text: colors.textPrimary,  border: 'transparent',        icon: colors.textPrimary  },
  danger:    { bg: colors.statusAnomaly, text: colors.white,       border: colors.statusAnomaly, icon: colors.white       },
}

export default function Button({
  variant = 'primary', icon: Icon, iconRight: IconRight,
  fullWidth, loading, disabled, onPress, children,
}: ButtonProps) {
  const v = VARIANT_STYLES[variant]
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        s.base,
        { backgroundColor: v.bg as string, borderColor: v.border as string },
        fullWidth && s.fullWidth,
        isDisabled && s.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <View style={s.inner}>
          {Icon && <Icon size={18} color={v.icon} />}
          <Text style={[s.label, { color: v.text }]}>{children}</Text>
          {IconRight && <IconRight size={18} color={v.icon} />}
        </View>
      )}
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    minHeight: 48,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
})
