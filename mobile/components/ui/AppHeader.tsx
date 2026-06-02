import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { ArrowLeft } from 'lucide-react-native'
import { colors, fontSize, fonts, spacing } from '../../lib/tokens'

interface AppHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: React.ReactNode
}

export function AppHeader({ title, subtitle, onBack, right }: AppHeaderProps) {
  return (
    <View style={s.header}>
      <View style={s.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={s.backBtn} hitSlop={8}>
            <ArrowLeft size={22} color={colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
        )}
        <View style={s.titles}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
      </View>
      {right && <View style={s.right}>{right}</View>}
    </View>
  )
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 0,
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: 1,
  },
  right: {
    marginLeft: spacing.lg,
    flexShrink: 0,
  },
})
