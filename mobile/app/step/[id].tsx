import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, QrCode, FileText } from 'lucide-react-native'
import { colors, radius, fontSize, fonts } from '../../lib/tokens'
import Button from '../../components/ui/Button'

export default function StepScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router  = useRouter()

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <ArrowLeft size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.headerTitle} numberOfLines={1}>Réception entrepôt</Text>
          <Text style={s.headerSub}>Collecte maïs — Campagne nov. 2025</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.infoCard}>
          <Text style={s.cardLabel}>Détails de l'étape</Text>
          <View style={s.row}>
            <Text style={s.rowKey}>Items attendus</Text>
            <Text style={s.rowValue}>12 sacs</Text>
          </View>
          <View style={[s.row, { marginBottom: 0 }]}>
            <Text style={s.rowKey}>Type de validation</Text>
            <Text style={s.rowValue}>Formulaire</Text>
          </View>
        </View>

        <View style={s.actions}>
          <Button icon={QrCode} onPress={() => router.push(`/step/${id}/scan`)} fullWidth>
            Scanner les QR codes
          </Button>
          <Button variant="secondary" icon={FileText} onPress={() => router.push(`/step/${id}/form`)} fullWidth>
            Remplir le formulaire
          </Button>
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.md,
    color: colors.white,
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  cardLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowKey: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  rowValue: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
})
