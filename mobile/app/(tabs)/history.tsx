import { useState, useMemo } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CheckCircle2, AlertTriangle, QrCode, FileText } from 'lucide-react-native'
import { colors, radius, fontSize, fonts } from '../../lib/tokens'
import { ConnectivityPill } from '../../components/ui/ConnectivityPill'
import { AppHeader } from '../../components/ui/AppHeader'
import { useConnectivity } from '../../context/ConnectivityContext'

type EntryStatus = 'validated' | 'anomaly'
type EntryType   = 'scan' | 'form'

interface HistoryEntry {
  id: string
  type: EntryType
  stepName: string
  campaign: string
  dateLabel: string
  daysAgo: number
  timeLabel: string
  status: EntryStatus
  itemsCount: number
  itemsLabel: string
  anomalies?: number
}

const HISTORY: HistoryEntry[] = [
  { id: '1', type: 'form', stepName: 'Pesée et contrôle humidité',   campaign: 'Collecte maïs — nov. 2025',   dateLabel: "Aujourd'hui", daysAgo: 0, timeLabel: '14h32', status: 'anomaly',   itemsCount: 20, itemsLabel: 'sacs traités',  anomalies: 1 },
  { id: '2', type: 'scan', stepName: 'Pesée et contrôle humidité',   campaign: 'Collecte maïs — nov. 2025',   dateLabel: "Aujourd'hui", daysAgo: 0, timeLabel: '13h55', status: 'validated', itemsCount: 20, itemsLabel: 'sacs scannés' },
  { id: '3', type: 'form', stepName: 'Collecte chez le producteur',  campaign: 'Collecte maïs — nov. 2025',   dateLabel: '22 mai',      daysAgo: 4, timeLabel: '09h15', status: 'validated', itemsCount: 20, itemsLabel: 'sacs collectés' },
  { id: '4', type: 'scan', stepName: 'Collecte chez le producteur',  campaign: 'Collecte maïs — nov. 2025',   dateLabel: '22 mai',      daysAgo: 4, timeLabel: '08h50', status: 'validated', itemsCount: 20, itemsLabel: 'sacs scannés' },
  { id: '5', type: 'form', stepName: 'Réception entrepôt',           campaign: 'Collecte sorgho — oct. 2025', dateLabel: '18 mai',      daysAgo: 8, timeLabel: '16h20', status: 'validated', itemsCount: 35, itemsLabel: 'sacs reçus' },
]

const PERIOD_FILTERS = [
  { key: 'all',   label: 'Toutes dates',    maxDays: Infinity },
  { key: 'today', label: "Aujourd'hui",     maxDays: 0 },
  { key: 'week',  label: '7 derniers jours', maxDays: 7 },
]

export default function HistoryScreen() {
  const { online } = useConnectivity()
  const [period, setPeriod] = useState('all')

  const filtered = useMemo(() => {
    const maxDays = PERIOD_FILTERS.find((p) => p.key === period)?.maxDays ?? Infinity
    return HISTORY.filter((e) => e.daysAgo <= maxDays)
  }, [period])

  const grouped = useMemo(() =>
    filtered.reduce<Record<string, HistoryEntry[]>>((acc, e) => {
      if (!acc[e.dateLabel]) acc[e.dateLabel] = []
      acc[e.dateLabel].push(e)
      return acc
    }, {})
  , [filtered])

  const groupedKeys = Object.keys(grouped)
  const totalValidated = filtered.filter((e) => e.status === 'validated').length
  const totalAnomaly   = filtered.filter((e) => e.status === 'anomaly').length

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <AppHeader
        title="Historique"
        subtitle="Mes saisies et validations"
        right={<ConnectivityPill online={online} />}
      />

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>

        {/* Sticky filter bar */}
        <View style={s.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
            {PERIOD_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[s.chip, period === f.key && s.chipActive]}
                onPress={() => setPeriod(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[s.chipText, period === f.key && s.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats strip */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{totalValidated}</Text>
            <Text style={s.statLabel}>Validées</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statCard}>
            <Text style={[s.statValue, totalAnomaly > 0 && s.statValueAnomaly]}>{totalAnomaly}</Text>
            <Text style={s.statLabel}>Anomalies</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statCard}>
            <Text style={s.statValue}>{filtered.length}</Text>
            <Text style={s.statLabel}>Total</Text>
          </View>
        </View>

        {/* Empty state */}
        {groupedKeys.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>Aucune validation pour ces filtres</Text>
          </View>
        )}

        {/* Grouped entries */}
        {groupedKeys.map((dateLabel) => (
          <View key={dateLabel} style={s.group}>
            <Text style={s.groupLabel}>{dateLabel.toUpperCase()}</Text>
            {grouped[dateLabel].map((entry, idx) => {
              const isLast = idx === grouped[dateLabel].length - 1
              const isOk   = entry.status === 'validated'
              const Icon   = entry.type === 'scan' ? QrCode : FileText

              return (
                <View key={entry.id} style={[s.entryRow, !isLast && s.entryRowBorder]}>
                  <View style={s.typeIconWrap}>
                    <Icon size={14} color={colors.textTertiary} />
                  </View>
                  <View style={s.entryContent}>
                    <View style={s.entryTop}>
                      <Text style={s.entryStep} numberOfLines={1}>{entry.stepName}</Text>
                      {isOk ? (
                        <View style={s.badgeOk}>
                          <CheckCircle2 size={11} color={colors.statusCompleted} />
                          <Text style={s.badgeOkText}>Validé</Text>
                        </View>
                      ) : (
                        <View style={s.badgeAnomaly}>
                          <AlertTriangle size={11} color={colors.statusAnomaly} />
                          <Text style={s.badgeAnomalyText}>{entry.anomalies} anomalie{entry.anomalies !== 1 ? 's' : ''}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.entryCampaign}>{entry.campaign}</Text>
                    <Text style={s.entryMeta}>{entry.timeLabel} · {entry.itemsCount} {entry.itemsLabel}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfaceAlt },

  scroll: { flex: 1 },

  filterBar: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  filterRow: { paddingHorizontal: 14, gap: 8, flexDirection: 'row', alignItems: 'center' },
  chip: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
  chipText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.primary },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 14,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  statValue: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.textPrimary },
  statValueAnomaly: { color: colors.statusAnomaly },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },

  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textMuted },

  group: { paddingHorizontal: 16, paddingTop: 20 },
  groupLabel: { fontFamily: fonts.semibold, fontSize: 10, color: colors.textTertiary, letterSpacing: 0.9, marginBottom: 10 },

  entryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12, backgroundColor: colors.white, paddingHorizontal: 14 },
  entryRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  typeIconWrap: { width: 28, height: 28, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  entryContent: { flex: 1, gap: 3 },
  entryTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entryStep: { flex: 1, fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.textPrimary },
  entryCampaign: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary },
  entryMeta: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },

  badgeOk: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: `${colors.statusCompleted}14`, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  badgeOkText: { fontFamily: fonts.medium, fontSize: 10, color: colors.statusCompleted },
  badgeAnomaly: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: `${colors.statusAnomaly}14`, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  badgeAnomalyText: { fontFamily: fonts.medium, fontSize: 10, color: colors.statusAnomaly },
})
