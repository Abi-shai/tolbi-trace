import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import { ArrowLeft, CheckCircle2, Circle, User, AlertTriangle } from 'lucide-react-native'
import { colors, radius, fontSize, fonts } from '../../../lib/tokens'

type StepStatus = 'done' | 'active' | 'upcoming' | 'blocked'

interface ProcessStep {
  id: string
  name: string
  status: StepStatus
  agent: string
  validatedAt?: string
  anomalies?: number
}

const PROCESSES: Record<string, { name: string; campaign: string; steps: ProcessStep[] }> = {
  default: {
    name: 'Réception entrepôt',
    campaign: 'Collecte maïs — Campagne nov. 2025',
    steps: [
      { id: '1', name: 'Collecte chez le producteur',  status: 'done',     agent: 'Ibrahim Sow',     validatedAt: '22 mai · 09h15' },
      { id: '2', name: 'Pesée et contrôle humidité',   status: 'done',     agent: 'Aïssatou Baldé',  validatedAt: '23 mai · 14h32', anomalies: 1 },
      { id: '3', name: 'Réception entrepôt',           status: 'active',   agent: 'Mamadou Diallo' },
      { id: '4', name: 'Contrôle qualité final',       status: 'upcoming', agent: 'Aïssatou Baldé' },
      { id: '5', name: 'Chargement transport',         status: 'upcoming', agent: 'Ousmane Traoré' },
    ],
  },
  m2: {
    name: 'Pesée et contrôle humidité',
    campaign: 'Collecte sorgho — Campagne oct. 2025',
    steps: [
      { id: 'm2-1', name: 'Collecte chez le producteur',  status: 'done',     agent: 'Boubacar Diallo', validatedAt: '20 mai · 08h40' },
      { id: 'm2-2', name: 'Pesée et contrôle humidité',   status: 'active',   agent: 'Mamadou Diallo' },
      { id: 'm2-3', name: 'Chargement transport',         status: 'upcoming', agent: 'Ousmane Traoré' },
      { id: 'm2-4', name: 'Réception entrepôt',           status: 'upcoming', agent: 'Mamadou Diallo' },
      { id: 'm2-5', name: 'Contrôle qualité final',       status: 'upcoming', agent: 'Aïssatou Baldé' },
    ],
  },
}

const ME = 'Mamadou Diallo'

export default function ProcessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const processKey = id?.startsWith('m2-') ? 'm2' : 'default'
  const process = PROCESSES[processKey]

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <ArrowLeft size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>Vue du processus</Text>
          <Text style={s.headerSub}>{process.campaign}</Text>
        </View>
        <View style={s.readOnlyBadge}>
          <Text style={s.readOnlyText}>Lecture seule</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>SÉQUENCE DU WORKFLOW · {process.steps.length} ÉTAPES</Text>

        {process.steps.map((step, idx) => {
          const isLast   = idx === process.steps.length - 1
          const isMe     = step.agent === ME
          const isDone   = step.status === 'done'
          const isActive = step.status === 'active'

          return (
            <View key={step.id} style={s.stepRow}>
              {/* Connector line */}
              <View style={s.connectorCol}>
                <View style={[
                  s.dot,
                  isDone   && s.dotDone,
                  isActive && s.dotActive,
                  step.status === 'blocked' && s.dotBlocked,
                ]} >
                  {isDone
                    ? <CheckCircle2 size={16} color={colors.white} />
                    : isActive
                      ? <View style={s.dotInner} />
                      : <Circle size={16} color={colors.textMuted} />
                  }
                </View>
                {!isLast && <View style={[s.line, isDone && s.lineDone]} />}
              </View>

              {/* Step content */}
              <View style={[s.stepContent, isLast && { paddingBottom: 0 }]}>
                <View style={s.stepTop}>
                  <Text style={[
                    s.stepName,
                    isDone   && s.stepNameDone,
                    !isDone && !isActive && s.stepNameUpcoming,
                  ]}>
                    {step.name}
                  </Text>
                  {isActive && (
                    <View style={s.activeBadge}>
                      <View style={s.activeBadgeDot} />
                      <Text style={s.activeBadgeText}>En cours</Text>
                    </View>
                  )}
                  {step.anomalies ? (
                    <View style={s.anomalyBadge}>
                      <AlertTriangle size={10} color={colors.statusAnomaly} />
                      <Text style={s.anomalyBadgeText}>{step.anomalies}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={s.stepMeta}>
                  <User size={11} color={isMe ? colors.primary : colors.textMuted} />
                  <Text style={[s.agentName, isMe && s.agentNameMe]}>
                    {isMe ? 'Toi' : step.agent}
                  </Text>
                  {step.validatedAt && (
                    <Text style={s.validatedAt}> · {step.validatedAt}</Text>
                  )}
                </View>
              </View>
            </View>
          )
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const DOT = 24

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
  backBtn: { padding: 8 },
  headerTitle: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.white },
  headerSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  readOnlyBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  readOnlyText: { fontFamily: fonts.medium, fontSize: 10, color: 'rgba(255,255,255,0.85)' },

  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

  sectionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.9,
    marginBottom: 20,
  },

  stepRow: {
    flexDirection: 'row',
    gap: 16,
  },

  connectorCol: {
    alignItems: 'center',
    width: DOT,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: colors.statusCompleted,
    borderColor: colors.statusCompleted,
  },
  dotActive: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 2.5,
  },
  dotBlocked: {
    backgroundColor: colors.statusAnomaly,
    borderColor: colors.statusAnomaly,
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 2,
    minHeight: 28,
  },
  lineDone: { backgroundColor: colors.statusCompleted },

  stepContent: {
    flex: 1,
    paddingBottom: 24,
    gap: 5,
  },
  stepTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  stepName: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  stepNameDone: { color: colors.textTertiary },
  stepNameUpcoming: { color: colors.textMuted, fontFamily: fonts.regular },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.primary}12`,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.statusInprogress },
  activeBadgeText: { fontFamily: fonts.semibold, fontSize: 10, color: colors.primary },

  anomalyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${colors.statusAnomaly}14`,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  anomalyBadgeText: { fontFamily: fonts.semibold, fontSize: 10, color: colors.statusAnomaly },

  stepMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  agentName: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  agentNameMe: { fontFamily: fonts.semibold, color: colors.primary },
  validatedAt: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
})
