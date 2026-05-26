import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { colors, radius, fonts } from '../../lib/tokens'

interface InputProps extends TextInputProps {
  label?:     string
  error?:     string
  icon?:      LucideIcon
  containerStyle?: object
}

export default function Input({ label, error, icon: Icon, containerStyle, ...props }: InputProps) {
  return (
    <View style={[s.container, containerStyle]}>
      {label && (
        <Text style={s.label}>{label}</Text>
      )}

      <View style={[s.inputRow, error ? s.inputError : s.inputNormal]}>
        {Icon && (
          <Icon size={18} color={error ? colors.statusAnomaly : colors.textMuted} />
        )}
        <TextInput
          style={s.input}
          placeholderTextColor={colors.textPlaceholder}
          {...props}
        />
      </View>

      {error && (
        <Text style={s.errorText}>{error}</Text>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inputNormal: {
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.statusAnomaly,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.statusAnomaly,
  },
})
