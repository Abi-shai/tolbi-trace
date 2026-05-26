import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CheckCircle2, AlertTriangle } from 'lucide-react-native'
import { colors, radius, fontSize, fonts } from '../../lib/tokens'

const HISTORY = [
  { id: '1', stepName: 'Pesée et contrôle humidité',    processName: 'Collecte maïs', date: '23 mai 2026 · 14h32', status: 'validated' as const, itemsCount: 20 },
  { id: '2', stepName: 'Collecte chez le producteur',   processName: 'Collecte maïs', date: '22 mai 2026 · 09h15', status: 'anomaly'   as const, itemsCount: 3  },
  { id: '3', stepName: 'Collecte chez le producteur',   processName: 'Collecte maïs', date: '21 mai 2026 · 11h00', status: 'validated' as const, itemsCount: 15 },
]

export default function HistoryScreen() {
  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Historique</Text>
        <Text style={s.headerSub}>Mes validations passées</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {HISTORY.map((item) => {
          const isOk = item.status === 'validated'
          return (
            <View key={item.id} style={s.card}>
              <View style={[s.iconCircle, { backgroundColor: isOk ? `${colors.statusCompleted}18` : `${colors.statusAnomaly}18` }]}>
                {isOk
                  ? <CheckCircle2 size={18} color={colors.statusCompleted} />
                  : <AlertTriangle size={18} color={colors.statusAnomaly} />
                }
              </View>
              <View style={s.cardContent}>
                <Text style={s.stepName}>{item.stepName}</Text>
                <Text style={s.processName}>{item.processName}</Text>
                <Text style={s.date}>{item.date} · {item.itemsCount} sacs</Text>
              </View>
            </View>
          )
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.topbar,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  stepName: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  processName: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
})
