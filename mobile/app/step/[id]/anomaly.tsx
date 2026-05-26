import { useState } from 'react'
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, AlertTriangle, CheckSquare } from 'lucide-react-native'
import { colors, radius, fontSize, fonts } from '../../../lib/tokens'
import { setPendingAnomaly } from '../../../lib/anomalyQueue'

interface Category {
  id: string
  label: string
  emoji: string
}

const CATEGORIES: Category[] = [
  { id: 'humidity',   label: 'Humidité excessive',    emoji: '💧' },
  { id: 'damaged',    label: 'Sac endommagé',          emoji: '📦' },
  { id: 'weight',     label: 'Poids insuffisant',      emoji: '⚖️' },
  { id: 'infestation',label: 'Infestation détectée',   emoji: '🐛' },
  { id: 'label',      label: 'Étiquette illisible',    emoji: '🏷️' },
  { id: 'other',      label: 'Autre',                  emoji: '…'  },
]

export default function AnomalyScreen() {
  const { id, bagId, bagCode } = useLocalSearchParams<{
    id: string
    bagId: string
    bagCode: string
  }>()
  const router = useRouter()

  const [category, setCategory] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const canSubmit = category !== null

  const handleSubmit = () => {
    if (!canSubmit) return
    const cat = CATEGORIES.find((c) => c.id === category)!
    setPendingAnomaly({
      bagId,
      category,
      categoryLabel: cat.label,
      note: note.trim(),
    })
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
          <Text style={s.headerTitle}>Signaler une anomalie</Text>
          <Text style={s.headerSub} numberOfLines={1}>{bagCode}</Text>
        </View>
        <View style={s.headerBadge}>
          <AlertTriangle size={14} color={colors.statusAnomaly} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Bag context */}
          <View style={s.bagCard}>
            <View style={s.bagCodeRow}>
              <View style={s.bagDot} />
              <Text style={s.bagCodeText}>{bagCode}</Text>
            </View>
            <Text style={s.bagHint}>
              Le sac sera marqué comme anomalie. Cette information sera visible par le responsable.
            </Text>
          </View>

          {/* Category picker */}
          <Text style={s.sectionLabel}>TYPE D'ANOMALIE</Text>
          <View style={s.grid}>
            {CATEGORIES.map((cat) => {
              const selected = category === cat.id
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[s.catCard, selected && s.catCardSelected]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.75}
                >
                  <Text style={s.catEmoji}>{cat.emoji}</Text>
                  <Text style={[s.catLabel, selected && s.catLabelSelected]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Optional note */}
          <Text style={[s.sectionLabel, { marginTop: 20 }]}>DÉTAILS <Text style={s.optional}>(optionnel)</Text></Text>
          <TextInput
            style={s.textarea}
            value={note}
            onChangeText={setNote}
            placeholder="Décrivez l'anomalie observée…"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Footer */}
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <CheckSquare size={18} color={colors.white} />
            <Text style={s.submitBtnText}>Confirmer l'anomalie</Text>
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
  headerBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: `${colors.statusAnomaly}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  bagCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: `${colors.statusAnomaly}35`,
    padding: 14,
    marginBottom: 20,
    gap: 6,
  },
  bagCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bagDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.statusAnomaly,
  },
  bagCodeText: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.textPrimary },
  bagHint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, lineHeight: 18 },

  sectionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.9,
    marginBottom: 10,
  },
  optional: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: 'flex-start',
    gap: 8,
  },
  catCardSelected: {
    borderColor: colors.statusAnomaly,
    backgroundColor: `${colors.statusAnomaly}08`,
  },
  catEmoji: { fontSize: 22 },
  catLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  catLabelSelected: { color: colors.statusAnomaly },

  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 90,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  submitBtn: {
    backgroundColor: colors.statusAnomaly,
    borderRadius: radius.xl,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: { opacity: 0.35 },
  submitBtnText: { fontFamily: fonts.semibold, fontSize: fontSize.md, color: colors.white },
})
