import { useRef, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { CheckCircle2, Circle, ChevronRight, AlertTriangle, User } from 'lucide-react-native'
import { colors, radius, fontSize, fonts } from '../../lib/tokens'
import { ConnectivityPill } from '../../components/ui/ConnectivityPill'
import { PressableScale } from '../../components/ui/PressableScale'
import { useConnectivity } from '../../context/ConnectivityContext'

const ME = 'Mamadou Diallo'

type StepStatus = 'done' | 'active' | 'upcoming'

interface WorkflowStep {
  id: string
  name: string
  status: StepStatus
  agent: string
  itemsCount?: number
  itemsLabel?: string
  anomalies?: number
  validatedAt?: string
}

interface Mission {
  id: string
  name: string
  season: string
  client: string
  steps: WorkflowStep[]
}

const MISSIONS: Mission[] = [
  {
    id: 'm1',
    name: 'Collecte maïs',
    season: 'Campagne nov. 2025',
    client: 'AgroSénégal SA',
    steps: [
      {
        id: '1',
        name: 'Collecte chez le producteur',
        status: 'done',
        agent: 'Ibrahim Sow',
        itemsCount: 20,
        itemsLabel: 'sacs collectés',
        validatedAt: '22 mai · 09h15',
      },
      {
        id: '2',
        name: 'Pesée et contrôle humidité',
        status: 'done',
        agent: 'Aïssatou Baldé',
        itemsCount: 20,
        itemsLabel: 'sacs pesés',
        anomalies: 1,
        validatedAt: '23 mai · 14h32',
      },
      {
        id: '3',
        name: 'Réception entrepôt',
        status: 'active',
        agent: ME,
        itemsCount: 12,
        itemsLabel: 'sacs attendus',
      },
      { id: '4', name: 'Contrôle qualité final', status: 'upcoming', agent: 'Aïssatou Baldé' },
      { id: '5', name: 'Chargement transport',   status: 'upcoming', agent: 'Ousmane Traoré' },
    ],
  },
  {
    id: 'm2',
    name: 'Collecte sorgho',
    season: 'Campagne oct. 2025',
    client: 'AgroSénégal SA',
    steps: [
      {
        id: 'm2-1',
        name: 'Collecte chez le producteur',
        status: 'done',
        agent: 'Boubacar Diallo',
        itemsCount: 18,
        itemsLabel: 'sacs collectés',
        validatedAt: '20 mai · 08h40',
      },
      {
        id: 'm2-2',
        name: 'Pesée et contrôle humidité',
        status: 'active',
        agent: ME,
        itemsCount: 18,
        itemsLabel: 'sacs à peser',
      },
      { id: 'm2-3', name: 'Chargement transport',    status: 'upcoming', agent: 'Ousmane Traoré' },
      { id: 'm2-4', name: 'Réception entrepôt',      status: 'upcoming', agent: ME },
      { id: 'm2-5', name: 'Contrôle qualité final',  status: 'upcoming', agent: 'Aïssatou Baldé' },
    ],
  },
]

function PulseDot() {
  const anim = useRef(new Animated.Value(1)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])
  return <Animated.View style={[s.activeDot, { opacity: anim }]} />
}

export default function MissionScreen() {
  const router = useRouter()
  const { online } = useConnectivity()
  const isMyStep = (step: WorkflowStep) => step.agent === ME
  const activeMissions = MISSIONS.filter((m) => m.steps.some((s) => s.status === 'active'))

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      {/* Global header */}
      <View style={s.topbar}>
        <View style={{ flex: 1 }}>
          <Text style={s.topbarTitle}>Mes missions</Text>
          <Text style={s.topbarSub}>
            {activeMissions.length} mission{activeMissions.length > 1 ? 's' : ''} en cours
          </Text>
        </View>
        <ConnectivityPill online={online} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MISSIONS.map((mission, mIdx) => {
          const activeStep   = mission.steps.find((s) => s.status === 'active')
          const doneSteps    = mission.steps.filter((s) => s.status === 'done')
          const upcomingSteps = mission.steps.filter((s) => s.status === 'upcoming')
          const stepsDone    = doneSteps.length
          const stepsTotal   = mission.steps.length
          const progressPct  = (stepsDone / stepsTotal) * 100

          return (
            <View key={mission.id} style={s.missionBlock}>

              {/* Mission header */}
              <View style={s.missionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={s.missionName}>{mission.name}</Text>
                  <Text style={s.missionSub}>{mission.season} · {mission.client}</Text>
                </View>
                <View style={s.progressPill}>
                  <Text style={s.progressText}>{stepsDone}/{stepsTotal}</Text>
                  <Text style={s.progressLabel}>étapes</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${progressPct}%` as any }]} />
              </View>

              {/* Active step */}
              {activeStep && (
                <View style={s.section}>
                  <Text style={s.sectionLabel}>MAINTENANT</Text>
                  <PressableScale
                    style={s.activeCard}
                    onPress={() => router.push(`/step/${activeStep.id}`)}
                  >
                    <View style={s.activeCardTop}>
                      <PulseDot />
                      <Text style={s.activeStepName}>{activeStep.name}</Text>
                    </View>
                    <Text style={s.activeStepMeta}>
                      {activeStep.itemsCount} {activeStep.itemsLabel}
                    </Text>
                    <View style={s.activeCardFooter}>
                      {isMyStep(activeStep) && (
                        <View style={s.myStepBadge}>
                          <User size={10} color={colors.primary} />
                          <Text style={s.myStepBadgeText}>Assignée à toi</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }} />
                      <Text style={s.startBtn}>Commencer</Text>
                      <ChevronRight size={16} color={colors.primary} />
                    </View>
                  </PressableScale>
                </View>
              )}

              {/* Done steps */}
              {doneSteps.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionLabel}>COMPLÉTÉES</Text>
                  {doneSteps.map((step) => (
                    <View key={step.id} style={s.doneRow}>
                      <CheckCircle2 size={18} color={colors.statusCompleted} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.doneStepName}>{step.name}</Text>
                        <Text style={s.doneStepMeta}>
                          {step.validatedAt}
                          {step.itemsCount ? ` · ${step.itemsCount} ${step.itemsLabel}` : ''}
                        </Text>
                        <View style={s.agentRow}>
                          <User size={10} color={isMyStep(step) ? colors.primary : colors.textMuted} />
                          <Text style={[s.agentName, isMyStep(step) && s.agentNameMine]}>
                            {isMyStep(step) ? 'Toi' : step.agent}
                          </Text>
                        </View>
                      </View>
                      {step.anomalies ? (
                        <View style={s.anomalyBadge}>
                          <AlertTriangle size={11} color={colors.statusAnomaly} />
                          <Text style={s.anomalyBadgeText}>{step.anomalies}</Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}

              {/* Upcoming steps */}
              {upcomingSteps.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionLabel}>À VENIR</Text>
                  {upcomingSteps.map((step) => (
                    <View key={step.id} style={[s.doneRow, s.upcomingRow]}>
                      <Circle size={18} color={colors.textMuted} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.upcomingStepName}>{step.name}</Text>
                        <View style={s.agentRow}>
                          <User size={10} color={isMyStep(step) ? colors.primary : colors.textMuted} />
                          <Text style={[s.agentName, isMyStep(step) && s.agentNameMine]}>
                            {isMyStep(step) ? 'Toi' : step.agent}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View style={{ height: 14 }} />
            </View>
          )
        })}

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  topbar: {
    backgroundColor: colors.topbar,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topbarTitle: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.white },
  topbarSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 14,
  },

  missionBlock: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  missionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 12,
  },
  missionName: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.textPrimary },
  missionSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 },
  progressPill: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  progressText: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.textPrimary },
  progressLabel: { fontFamily: fonts.regular, fontSize: 9, color: colors.textMuted, marginTop: -1 },

  progressTrack: {
    height: 3,
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  section: { paddingHorizontal: 16, paddingTop: 14, marginBottom: 2 },
  sectionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.9,
    marginBottom: 10,
  },

  activeCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  activeCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.statusInprogress },
  activeStepName: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.textPrimary, flex: 1 },
  activeStepMeta: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginBottom: 12, marginLeft: 16 },
  activeCardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, gap: 6 },
  myStepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.primary}12`,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  myStepBadgeText: { fontFamily: fonts.semibold, fontSize: 10, color: colors.primary },
  startBtn: { fontFamily: fonts.semibold, fontSize: fontSize.xs, color: colors.primary },

  doneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  doneStepName: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  doneStepMeta: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  agentName: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  agentNameMine: { fontFamily: fonts.semibold, color: colors.primary },
  anomalyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${colors.statusAnomaly}14`,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 2,
  },
  anomalyBadgeText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.statusAnomaly },

  upcomingRow: { opacity: 0.5 },
  upcomingStepName: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textTertiary },
})
