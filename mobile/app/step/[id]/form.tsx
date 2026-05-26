import { useState } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, CheckSquare, AlertCircle } from 'lucide-react-native'
import { colors, radius, fontSize, fonts } from '../../../lib/tokens'
import { markTaskDone } from '../../../lib/stepState'

type FieldType = 'number' | 'text' | 'textarea' | 'select'

interface Field {
  id: string
  label: string
  type: FieldType
  required: boolean
  unit?: string
  options?: string[]
  placeholder?: string
}

const FIELDS: Field[] = [
  {
    id: 'bags_received',
    label: 'Nombre de sacs reçus',
    type: 'number',
    required: true,
    unit: 'sacs',
    placeholder: '0',
  },
  {
    id: 'humidity',
    label: "Taux d'humidité moyen",
    type: 'number',
    required: true,
    unit: '%',
    placeholder: '0.0',
  },
  {
    id: 'condition',
    label: 'État général des sacs',
    type: 'select',
    required: true,
    options: ['Bon', 'Acceptable', 'Mauvais'],
  },
  {
    id: 'transporter',
    label: 'Nom du transporteur',
    type: 'text',
    required: false,
    placeholder: 'Ex : Moussa Kouyaté',
  },
  {
    id: 'notes',
    label: 'Observations',
    type: 'textarea',
    required: false,
    placeholder: 'Remarques sur la réception, les sacs, les conditions…',
  },
]

export default function FormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const set = (fieldId: string, value: string) =>
    setValues((v) => ({ ...v, [fieldId]: value }))

  const touch = (fieldId: string) =>
    setTouched((t) => ({ ...t, [fieldId]: true }))

  const isComplete = FIELDS.filter((f) => f.required).every(
    (f) => values[f.id]?.trim().length > 0
  )

  const missingRequired = (field: Field) =>
    field.required && touched[field.id] && !values[field.id]?.trim()

  const handleSubmit = () => {
    // Mark all required fields as touched to show validation
    const allTouched = FIELDS.reduce((acc, f) => ({ ...acc, [f.id]: true }), {})
    setTouched(allTouched)
    if (!isComplete) return
    markTaskDone(id, 'form')
    router.back()
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <ArrowLeft size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>Réception entrepôt</Text>
          <Text style={s.headerSub}>Collecte maïs — Campagne nov. 2025</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {FIELDS.map((field) => {
            const hasError = missingRequired(field)
            const value = values[field.id] ?? ''

            return (
              <View key={field.id} style={s.fieldCard}>
                <View style={s.fieldLabelRow}>
                  <Text style={s.fieldLabel}>{field.label}</Text>
                  {field.required
                    ? <Text style={s.required}>Requis</Text>
                    : <Text style={s.optional}>Optionnel</Text>
                  }
                </View>

                {/* Number / Text */}
                {(field.type === 'number' || field.type === 'text') && (
                  <View style={[s.inputWrap, hasError && s.inputWrapError]}>
                    <TextInput
                      style={s.input}
                      value={value}
                      onChangeText={(v) => set(field.id, v)}
                      onBlur={() => touch(field.id)}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.textMuted}
                      keyboardType={field.type === 'number' ? 'decimal-pad' : 'default'}
                      returnKeyType="done"
                    />
                    {field.unit && (
                      <Text style={s.unit}>{field.unit}</Text>
                    )}
                  </View>
                )}

                {/* Textarea */}
                {field.type === 'textarea' && (
                  <TextInput
                    style={[s.textarea, hasError && s.inputWrapError]}
                    value={value}
                    onChangeText={(v) => set(field.id, v)}
                    onBlur={() => touch(field.id)}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                )}

                {/* Select */}
                {field.type === 'select' && field.options && (
                  <View style={s.optionsRow}>
                    {field.options.map((opt) => {
                      const selected = value === opt
                      return (
                        <TouchableOpacity
                          key={opt}
                          style={[s.option, selected && s.optionSelected]}
                          onPress={() => { set(field.id, opt); touch(field.id) }}
                          activeOpacity={0.75}
                        >
                          <Text style={[s.optionText, selected && s.optionTextSelected]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                )}

                {hasError && (
                  <View style={s.errorRow}>
                    <AlertCircle size={12} color={colors.statusAnomaly} />
                    <Text style={s.errorText}>Ce champ est requis</Text>
                  </View>
                )}
              </View>
            )
          })}

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Submit */}
        <View style={s.footer}>
          {!isComplete && (
            <Text style={s.footerHint}>
              {FIELDS.filter((f) => f.required && !values[f.id]?.trim()).length} champ
              {FIELDS.filter((f) => f.required && !values[f.id]?.trim()).length > 1 ? 's' : ''} requis manquant
              {FIELDS.filter((f) => f.required && !values[f.id]?.trim()).length > 1 ? 's' : ''}
            </Text>
          )}
          <TouchableOpacity
            style={[s.submitBtn, !isComplete && s.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <CheckSquare size={18} color={colors.white} />
            <Text style={s.submitBtnText}>Valider l'étape</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  header: {
    backgroundColor: colors.topbar,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.white },
  headerSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 1 },

  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  fieldCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fieldLabel: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  required: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.primary,
    backgroundColor: `${colors.primary}12`,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  optional: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textMuted,
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    height: 44,
  },
  inputWrapError: {
    borderColor: colors.statusAnomaly,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  unit: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginLeft: 6,
  },

  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 90,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },

  optionsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  optionText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.primary,
  },

  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  errorText: { fontFamily: fonts.regular, fontSize: 11, color: colors.statusAnomaly },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: 8,
  },
  footerHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontFamily: fonts.semibold, fontSize: fontSize.md, color: colors.white },
})
