import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CheckSquare, AlertCircle } from 'lucide-react-native'
import { colors, radius, fontSize, fonts } from '../../../lib/tokens'
import { AppHeader } from '../../../components/ui/AppHeader'
import { markTaskDone } from '../../../lib/stepState'

const VALID_CODE = 'AGRO-2025'

export default function CodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = code.trim().length >= 4

  const handleSubmit = () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')

    setTimeout(() => {
      if (code.trim().toUpperCase() === VALID_CODE) {
        markTaskDone(id, 'code')
        router.back()
      } else {
        setError('Code incorrect. Vérifie avec ton responsable.')
        setLoading(false)
      }
    }, 500)
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <AppHeader
        title="Pesée et contrôle humidité"
        subtitle="Collecte sorgho — Campagne oct. 2025"
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.body}>
          <View style={s.iconWrap}>
            <CheckSquare size={32} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={s.title}>Code de validation</Text>
          <Text style={s.sub}>
            Saisis le code fourni par ton responsable pour valider cette étape.
          </Text>

          <View style={s.inputGroup}>
            <TextInput
              style={[s.input, !!error && s.inputError]}
              value={code}
              onChangeText={(v) => { setCode(v); setError('') }}
              placeholder="Ex : AGRO-2025"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            {!!error && (
              <View style={s.errorRow}>
                <AlertCircle size={13} color={colors.statusAnomaly} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[s.submitBtn, (!canSubmit || loading) && s.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={!canSubmit || loading}
          >
            <CheckSquare size={18} color={colors.white} />
            <Text style={s.submitBtnText}>{loading ? 'Vérification…' : 'Valider'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfaceAlt },

  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 0,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },

  inputGroup: { width: '100%', marginBottom: 16, gap: 8 },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    fontFamily: fonts.semibold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 3,
  },
  inputError: { borderColor: colors.statusAnomaly },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'center' },
  errorText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.statusAnomaly },

  submitBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontFamily: fonts.semibold, fontSize: fontSize.md, color: colors.white },
})
