import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '../context/AuthContext'
import { colors, radius, fontSize, fonts } from '../lib/tokens'

export default function LoginScreen() {
  const router = useRouter()
  const { login } = useAuth()

  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = phone.trim().length >= 6 && pin.length === 4

  const handleLogin = () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')

    // Simulate brief network delay for realism
    setTimeout(() => {
      const ok = login(phone.trim(), pin)
      if (ok) {
        router.replace('/')
      } else {
        setError('Numéro ou code PIN incorrect.')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>

      {/* Hero */}
      <View style={s.hero}>
        <View style={s.logoWrap}>
          <Text style={s.logoT}>Tolbi</Text>
          <View style={s.logoBadge}>
            <Text style={s.logoBadgeText}>Trace</Text>
          </View>
        </View>
        <Text style={s.tagline}>Traçabilité supply chain agricole</Text>
      </View>

      {/* Form card */}
      <KeyboardAvoidingView
        style={s.cardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.card}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.formTitle}>Connexion</Text>
          <Text style={s.formSub}>Accède à tes missions du jour</Text>

          {/* Phone */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Numéro de téléphone</Text>
            <View style={[s.inputWrap, error && s.inputWrapError]}>
              <Text style={s.prefix}>+221</Text>
              <View style={s.separator} />
              <TextInput
                style={s.input}
                value={phone}
                onChangeText={(v) => { setPhone(v); setError('') }}
                placeholder="77 123 45 67"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                returnKeyType="next"
                autoComplete="tel"
              />
            </View>
          </View>

          {/* PIN */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Code PIN</Text>
            <TextInput
              style={[s.inputSingle, error && s.inputWrapError]}
              value={pin}
              onChangeText={(v) => { setPin(v.replace(/\D/g, '').slice(0, 4)); setError('') }}
              placeholder="• • • •"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {/* Error */}
          {!!error && <Text style={s.errorText}>{error}</Text>}

          {/* Submit */}
          <TouchableOpacity
            style={[s.submitBtn, (!canSubmit || loading) && s.submitBtnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={!canSubmit || loading}
          >
            <Text style={s.submitBtnText}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </Text>
          </TouchableOpacity>

          {/* Demo hint */}
          <View style={s.demoHint}>
            <Text style={s.demoHintText}>Demo : 77 123 45 67 · PIN 1234</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.topbar },

  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  logoT: {
    fontFamily: fonts.bold,
    fontSize: 36,
    color: colors.white,
    letterSpacing: -0.5,
  },
  logoBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logoBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.white,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },

  cardWrap: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  card: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 0,
  },
  formTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  formSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginBottom: 28,
  },

  fieldGroup: { marginBottom: 16 },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 6,
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    height: 48,
    paddingLeft: 14,
  },
  inputWrapError: { borderColor: colors.statusAnomaly },
  prefix: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    paddingRight: 14,
  },
  inputSingle: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    height: 48,
    paddingHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    letterSpacing: 6,
  },

  errorText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.statusAnomaly,
    marginBottom: 12,
    marginTop: -4,
  },

  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.md,
    color: colors.white,
  },

  demoHint: {
    alignItems: 'center',
    marginTop: 20,
  },
  demoHintText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
})
