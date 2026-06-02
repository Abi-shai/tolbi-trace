import { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation, UIManager, Platform, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import {
  Settings,
  CheckCircle2, Circle, AlertTriangle, User,
} from 'lucide-react-native'
import { colors, radius, fontSize, fonts, spacing } from '../../lib/tokens'
import { ConnectivityPill } from '../../components/ui/ConnectivityPill'
import { PressableScale } from '../../components/ui/PressableScale'
import { useConnectivity } from '../../context/ConnectivityContext'
import { useExploration } from '../../context/ExplorationContext'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

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
  started?: boolean
}

interface Mission {
  id: string
  name: string
  client: string
  steps: WorkflowStep[]
}

interface Persona {
  name: string
  initials: string
  hint: string
  missions: Mission[]
}

const PERSONAS: Persona[] = [
  {
    name: 'Mamadou Diallo',
    initials: 'MD',
    hint: 'Agent · Étape 2+',
    missions: [
      {
        id: 'm1',
        name: 'Collecte maïs',
        client: 'AgroSénégal SA',
        steps: [
          { id: '1',  name: 'Collecte chez le producteur',  status: 'done',     agent: 'Ibrahim Sow',     itemsCount: 20, validatedAt: '22 mai · 09h15' },
          { id: '2',  name: 'Pesée et contrôle humidité',   status: 'done',     agent: 'Aïssatou Baldé',  itemsCount: 20, anomalies: 1, validatedAt: '23 mai · 14h32' },
          { id: '3',  name: 'Réception entrepôt',           status: 'active',   agent: 'Mamadou Diallo',  itemsCount: 12 },
          { id: '4',  name: 'Contrôle qualité final',       status: 'upcoming', agent: 'Aïssatou Baldé' },
          { id: '5',  name: 'Chargement transport',         status: 'upcoming', agent: 'Ousmane Traoré' },
        ],
      },
      {
        id: 'm2',
        name: 'Collecte sorgho',
        client: 'AgroSénégal SA',
        steps: [
          { id: 'm2-1', name: 'Collecte chez le producteur',  status: 'done',     agent: 'Boubacar Diallo', itemsCount: 18, validatedAt: '20 mai · 08h40' },
          { id: 'm2-2', name: 'Pesée et contrôle humidité',   status: 'active',   agent: 'Mamadou Diallo',  itemsCount: 18, started: true },
          { id: 'm2-3', name: 'Chargement transport',         status: 'upcoming', agent: 'Ousmane Traoré' },
          { id: 'm2-4', name: 'Réception entrepôt',           status: 'upcoming', agent: 'Mamadou Diallo' },
          { id: 'm2-5', name: 'Contrôle qualité final',       status: 'upcoming', agent: 'Aïssatou Baldé' },
        ],
      },
    ],
  },
  {
    name: 'Ibrahim Sow',
    initials: 'IS',
    hint: 'Agent · Étape 1',
    missions: [
      {
        id: 'm3',
        name: 'Collecte arachide',
        client: 'AgroSénégal SA',
        steps: [
          { id: 'm3-1', name: 'Collecte chez le producteur',  status: 'active',   agent: 'Ibrahim Sow' },
          { id: 'm3-2', name: 'Pesée et contrôle humidité',   status: 'upcoming', agent: 'Aïssatou Baldé' },
          { id: 'm3-3', name: 'Chargement transport',         status: 'upcoming', agent: 'Ousmane Traoré' },
          { id: 'm3-4', name: 'Réception entrepôt',           status: 'upcoming', agent: 'Mamadou Diallo' },
          { id: 'm3-5', name: 'Contrôle qualité final',       status: 'upcoming', agent: 'Aïssatou Baldé' },
        ],
      },
    ],
  },
]

export default function MissionScreen() {
  const router = useRouter()
  const { online } = useConnectivity()
  const { personaIndex } = useExploration()
  const persona = PERSONAS[personaIndex]
  const ME = persona.name
  const missions = persona.missions

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(missions.map((m) => m.id)))

  const allMissionIds = PERSONAS.flatMap((p) => p.missions.map((m) => m.id))
  const expandAnims = useRef<Record<string, Animated.Value>>(
    Object.fromEntries(allMissionIds.map((id) => [id, new Animated.Value(1)]))
  ).current

  useEffect(() => {
    setExpandedIds(new Set(PERSONAS[personaIndex].missions.map((m) => m.id)))
  }, [personaIndex])

  const toggleExpand = (id: string) => {
    const isExpanding = !expandedIds.has(id)

    LayoutAnimation.configureNext({
      duration: 380,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    })

    Animated.timing(expandAnims[id], {
      toValue: isExpanding ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start()

    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const uniteesATraiter = missions.reduce((acc, m) => {
    const myStep = m.steps.find((s) => s.status === 'active' && s.agent === ME)
    return acc + (myStep?.itemsCount ?? 0)
  }, 0)

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.avatarRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{persona.initials}</Text>
            </View>
            <View>
              <Text style={s.greeting}>Bonjour</Text>
              <Text style={s.userName}>{ME.split(' ')[0]}</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <ConnectivityPill online={online} />
            <Settings size={22} color={colors.textSecondary} strokeWidth={1.8} />
          </View>
        </View>

        {/* Stats card — masqué si aucune quantité connue (étape 1) */}
        {uniteesATraiter > 0 && (
          <View style={s.statsCard}>
            <Text style={s.statsNumber}>{uniteesATraiter}</Text>
            <Text style={s.statsLabel}>Unités à traiter</Text>
          </View>
        )}

        {/* Projects section */}
        <Text style={s.sectionTitle}>Missions</Text>

        {missions.map((mission) => {
          const expanded = expandedIds.has(mission.id)
          const activeStep = mission.steps.find((s) => s.status === 'active')

          return (
            <View key={mission.id} style={s.projectCard}>

              {/* Project info */}
              <View style={s.projectInfo}>
                <View style={s.projectIcon}>
                  <Text style={s.projectIconEmoji}>📦</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.projectNameRow}>
                    <Text style={[s.projectName, { flex: 1 }]}>{mission.name}</Text>
                  </View>
                  <Text style={s.projectMeta}>
                    {mission.steps.length} étapes · {mission.client}
                  </Text>
                </View>
              </View>

              {/* CTA */}
              {activeStep && (
                <PressableScale
                  style={s.ctaButton}
                  onPress={() => router.push(`/step/${activeStep.id}`)}
                >
                  <Text style={s.ctaText}>
                    {activeStep.started ? 'Continuer mon étape' : 'Démarrer mon étape'}
                  </Text>
                </PressableScale>
              )}

              {/* Expand toggle */}
              {mission.steps.length > 0 && (
                <TouchableOpacity
                  style={s.expandToggle}
                  onPress={() => toggleExpand(mission.id)}
                  activeOpacity={0.7}
                >
                  <View style={s.expandToggleLabelWrap}>
                    {/* Spacer invisible pour fixer la largeur sur le texte le plus long */}
                    <Text style={[s.expandToggleText, { opacity: 0 }]} aria-hidden>
                      {`Voir toutes les étapes (${mission.steps.length})`}
                    </Text>
                    <Animated.Text style={[s.expandToggleText, s.expandToggleLabelAbs, {
                      opacity: expandAnims[mission.id].interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                    }]}>
                      {`Voir toutes les étapes (${mission.steps.length})`}
                    </Animated.Text>
                    <Animated.Text style={[s.expandToggleText, s.expandToggleLabelAbs, {
                      opacity: expandAnims[mission.id],
                    }]}>
                      Masquer les étapes
                    </Animated.Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Expanded — process timeline */}
              {expanded && (
                <View style={s.stepList}>
                  {mission.steps.map((step, idx) => {
                    const isLast   = idx === mission.steps.length - 1
                    const isMe     = step.agent === ME
                    const isDone   = step.status === 'done'
                    const isActive = step.status === 'active'

                    return (
                      <View key={step.id} style={s.timelineRow}>
                        <View style={s.timelineConnector}>
                          <View style={[
                            s.timelineDot,
                            isDone   && s.timelineDotDone,
                            isActive && s.timelineDotActive,
                          ]}>
                            {isDone
                              ? <CheckCircle2 size={13} color={colors.white} />
                              : isActive
                                ? <View style={s.timelineDotInner} />
                                : <Circle size={13} color={colors.textMuted} />
                            }
                          </View>
                          {!isLast && <View style={[s.timelineLine, isDone && s.timelineLineDone]} />}
                        </View>

                        <View style={[s.timelineContent, isLast && { paddingBottom: 0 }]}>
                          <View style={s.timelineTop}>
                            <Text style={[
                              s.timelineStepName,
                              isDone   && s.timelineStepNameDone,
                              !isDone && !isActive && s.timelineStepNameUpcoming,
                            ]}>
                              {step.name}
                            </Text>
                            {isActive && (
                              <View style={s.timelineActiveBadge}>
                                <View style={s.timelineActiveDot} />
                                <Text style={s.timelineActiveBadgeText}>En cours</Text>
                              </View>
                            )}
                            {step.anomalies ? (
                              <View style={s.timelineAnomalyBadge}>
                                <AlertTriangle size={9} color={colors.statusAnomaly} />
                                <Text style={s.timelineAnomalyText}>{step.anomalies}</Text>
                              </View>
                            ) : null}
                          </View>

                          <View style={s.timelineMeta}>
                            {isMe ? (
                              <View style={s.timelineMeBadge}>
                                <User size={10} color={colors.primary} />
                                <Text style={s.timelineMeBadgeText}>Toi</Text>
                              </View>
                            ) : (
                              <>
                                <User size={10} color={colors.textMuted} />
                                <Text style={s.timelineAgent}>{step.agent}</Text>
                              </>
                            )}
                            {step.validatedAt && (
                              <Text style={s.timelineValidatedAt}> · {step.validatedAt}</Text>
                            )}
                          </View>
                        </View>
                      </View>
                    )
                  })}
                </View>
              )}

            </View>
          )
        })}

      </ScrollView>

    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfaceAlt },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 40,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  greeting: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textTertiary, lineHeight: 20 },
  userName: { fontFamily: fonts.bold, fontSize: 22, color: colors.textPrimary, lineHeight: 28, letterSpacing: -0.3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },

  // ── Stats card ──────────────────────────────────────────────────────────────
  statsCard: {
    backgroundColor: colors.brand50,
    borderRadius: radius.xl,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  statsNumber: {
    fontFamily: fonts.bold,
    fontSize: 64,
    lineHeight: 80,
    color: colors.primary,
    letterSpacing: -1.5,
  },
  statsLabel: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: 6,
    letterSpacing: 0.2,
  },

  // ── Section title ────────────────────────────────────────────────────────────
  sectionTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.lg,
  },

  // ── Project card ─────────────────────────────────────────────────────────────
  projectCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  projectIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectIconEmoji: { fontSize: 26 },
  projectNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: 2 },
  projectName: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.textPrimary },
  projectMeta: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 },

  // ── CTA button ───────────────────────────────────────────────────────────────
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  ctaText: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.white },

  // ── Expand toggle ────────────────────────────────────────────────────────────
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
  },
  expandToggleLabelWrap: {
    position: 'relative',
    alignItems: 'center',
  },
  expandToggleLabelAbs: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  expandToggleText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // ── Timeline (expanded) ─────────────────────────────────────────────────────
  stepList: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineConnector: { alignItems: 'center', width: 22 },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: { backgroundColor: colors.statusCompleted, borderColor: colors.statusCompleted },
  timelineDotActive: { backgroundColor: colors.white, borderColor: colors.primary, borderWidth: 2 },
  timelineDotInner: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.primary },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 2,
    minHeight: 24,
  },
  timelineLineDone: { backgroundColor: colors.statusCompleted },

  timelineContent: { flex: 1, paddingBottom: 18, gap: 4 },
  timelineTop: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  timelineStepName: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  timelineStepNameDone: { color: colors.textTertiary },
  timelineStepNameUpcoming: { color: colors.textMuted, fontFamily: fonts.regular },

  timelineActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.statusInprogress}14`,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  timelineActiveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.statusInprogress },
  timelineActiveBadgeText: { fontFamily: fonts.semibold, fontSize: 10, color: colors.statusInprogress },

  timelineAnomalyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${colors.statusAnomaly}14`,
    borderRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  timelineAnomalyText: { fontFamily: fonts.semibold, fontSize: 10, color: colors.statusAnomaly },

  timelineMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timelineAgent: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  timelineMeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.primary}12`,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  timelineMeBadgeText: { fontFamily: fonts.semibold, fontSize: 10, color: colors.primary },
  timelineValidatedAt: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
})
