import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CheckCircle2, AlertTriangle, House } from 'lucide-react-native'
import { colors, radius, fontSize, fonts } from '../../../lib/tokens'

export default function SuccessScreen() {
  const { validated, anomalies } = useLocalSearchParams<{ validated: string; anomalies: string }>()
  const router = useRouter()
  const v = parseInt(validated ?? '0')
  const a = parseInt(anomalies ?? '0')

  return (
    <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
      <View style={s.body}>
        <View style={s.iconWrap}>
          <CheckCircle2 size={56} color={colors.statusCompleted} strokeWidth={1.5} />
        </View>
        <Text style={s.title}>Étape validée</Text>
        <Text style={s.sub}>Réception entrepôt{'\n'}Collecte maïs — Campagne nov. 2025</Text>

        <View style={s.stats}>
          <View style={s.stat}>
            <Text style={s.statValue}>{v}</Text>
            <Text style={s.statLabel}>sacs validés</Text>
          </View>
          {a > 0 && (
            <View style={[s.stat, s.statAnomaly]}>
              <View style={s.statRow}>
                <AlertTriangle size={14} color={colors.statusAnomaly} />
                <Text style={[s.statValue, { color: colors.statusAnomaly }]}>{a}</Text>
              </View>
              <Text style={[s.statLabel, { color: colors.statusAnomaly }]}>
                anomalie{a > 1 ? 's' : ''} signalée{a > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        <Text style={s.note}>
          Les données ont été enregistrées et seront synchronisées dès la prochaine connexion réseau.
        </Text>
      </View>

      <View style={s.footer}>
        <TouchableOpacity style={s.homeBtn} onPress={() => router.replace('/')} activeOpacity={0.8}>
          <House size={18} color={colors.white} />
          <Text style={s.homeBtnText}>Retour à mes tâches</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconWrap: {
    width: 96, height: 96, borderRadius: radius.full,
    backgroundColor: `${colors.statusCompleted}14`,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.textPrimary, marginBottom: 8 },
  sub: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textTertiary, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  stats: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  stat: {
    flex: 1, backgroundColor: colors.white, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    padding: 16, alignItems: 'center',
  },
  statAnomaly: { borderColor: `${colors.statusAnomaly}40` },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontFamily: fonts.bold, fontSize: 28, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 },
  note: {
    fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textMuted,
    textAlign: 'center', lineHeight: 18,
    backgroundColor: colors.surfaceAlt, borderRadius: radius.lg,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  footer: { paddingHorizontal: 16, paddingBottom: 16 },
  homeBtn: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    paddingVertical: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  homeBtnText: { fontFamily: fonts.semibold, fontSize: fontSize.md, color: colors.white },
})
