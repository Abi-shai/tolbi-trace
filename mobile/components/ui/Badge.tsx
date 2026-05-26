import { View, Text, StyleSheet } from 'react-native'
import { colors, radius, fonts } from '../../lib/tokens'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps {
  variant?:  Variant
  children:  React.ReactNode
  style?:    object
}

const VARIANTS: Record<Variant, { bg: string; border: string; text: string }> = {
  default: { bg: colors.surface,     border: colors.border,       text: colors.textSecondary    },
  success: { bg: '#f0fdf4',          border: '#bbf7d0',           text: colors.statusCompleted  },
  warning: { bg: '#fff7ed',          border: '#fed7aa',           text: colors.statusInprogress },
  danger:  { bg: '#fef2f2',          border: '#fecaca',           text: colors.statusAnomaly    },
  info:    { bg: '#eff6ff',          border: '#bfdbfe',           text: '#2563eb'               },
}

export default function Badge({ variant = 'default', children, style }: BadgeProps) {
  const v = VARIANTS[variant]
  return (
    <View style={[s.base, { backgroundColor: v.bg, borderColor: v.border }, style]}>
      <Text style={[s.label, { color: v.text }]}>{children}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
})
