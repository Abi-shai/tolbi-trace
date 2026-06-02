import { useState, useCallback, useRef, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { QrCode, FileText, CheckCircle2, Circle, CheckSquare, LayoutList } from 'lucide-react-native'
import { colors, radius, fontSize, fonts } from '../../../lib/tokens'
import { AppHeader } from '../../../components/ui/AppHeader'
import { isTaskDone, getStepMeta } from '../../../lib/stepState'
import { PressableScale } from '../../../components/ui/PressableScale'

interface Task {
  id: string
  icon: typeof QrCode
  label: string
  description: string
  route: string
}

const TASKS_FORM: Task[] = [
  {
    id: 'scan',
    icon: QrCode,
    label: 'Scanner les sacs',
    description: 'Scanne les 12 sacs avec les QR codes',
    route: 'scan',
  },
  {
    id: 'form',
    icon: FileText,
    label: 'Remplir le formulaire',
    description: 'Poids, humidité, état des sacs et infos transport',
    route: 'form',
  },
]

const TASKS_CODE: Task[] = [
  {
    id: 'scan',
    icon: QrCode,
    label: 'Scanner les sacs',
    description: 'Scanne les 18 sacs avec les QR codes',
    route: 'scan',
  },
  {
    id: 'code',
    icon: CheckSquare,
    label: 'Saisir le code de validation',
    description: 'Obtiens le code auprès de ton responsable',
    route: 'code',
  },
]

export default function StepScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [tasksDone, setTasksDone] = useState<Record<string, boolean>>({})

  const TASKS = id?.startsWith('m2-') ? TASKS_CODE : TASKS_FORM

  useFocusEffect(
    useCallback(() => {
      const done: Record<string, boolean> = {}
      TASKS.forEach((t) => { done[t.id] = isTaskDone(id, t.id) })
      setTasksDone(done)
    }, [id])
  )

  const doneTasks = TASKS.filter((t) => tasksDone[t.id]).length
  const allDone = doneTasks === TASKS.length

  const progressAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: doneTasks / TASKS.length,
      useNativeDriver: false,
      speed: 12,
      bounciness: 0,
    }).start()
  }, [doneTasks])

  const handleValidate = () => {
    const meta = getStepMeta(id)
    router.push(`/step/${id}/success?validated=${meta.validated ?? 0}&anomalies=${meta.anomalies ?? 0}`)
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <AppHeader
        title="Réception entrepôt"
        subtitle="Collecte maïs — Campagne nov. 2025"
        onBack={() => router.back()}
      />

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Progress summary */}
        <View style={[s.progressCard, allDone && s.progressCardDone]}>
          <Text style={s.progressLabel}>
            {doneTasks}/{TASKS.length} tâches effectuées
          </Text>
          <View style={s.progressTrack}>
            <Animated.View style={[
              s.progressFill,
              allDone && s.progressFillDone,
              { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
            ]} />
          </View>
        </View>

        {/* Process link */}
        <TouchableOpacity style={s.processLink} onPress={() => router.push(`/step/${id}/process`)} activeOpacity={0.7}>
          <LayoutList size={14} color={colors.primary} />
          <Text style={s.processLinkText}>Voir le processus complet</Text>
        </TouchableOpacity>

        {/* Task checklist */}
        <Text style={s.sectionLabel}>POUR VALIDER CETTE ÉTAPE</Text>

        {TASKS.map((task, index) => {
          const done = tasksDone[task.id] ?? false
          const Icon = task.icon
          const isLocked = index > 0 && !(tasksDone[TASKS[index - 1].id] ?? false)

          return (
            <TouchableOpacity
              key={task.id}
              style={[s.taskCard, done && s.taskCardDone, isLocked && s.taskCardLocked]}
              activeOpacity={isLocked ? 1 : 0.8}
              onPress={() => {
                if (!isLocked) router.push(`/step/${id}/${task.route}`)
              }}
            >
              <View style={[s.taskIconWrap, done && s.taskIconWrapDone]}>
                {done
                  ? <CheckCircle2 size={20} color={colors.statusCompleted} />
                  : <Icon size={20} color={isLocked ? colors.textMuted : colors.primary} />
                }
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[s.taskLabel, done && s.taskLabelDone, isLocked && s.taskLabelLocked]}>
                  {task.label}
                </Text>
                <Text style={[s.taskDesc, isLocked && s.taskDescLocked]}>
                  {task.description}
                </Text>
              </View>

              <View style={s.taskRight}>
                {done
                  ? <Text style={s.doneText}>Fait</Text>
                  : isLocked
                    ? <Circle size={16} color={colors.textMuted} />
                    : <Text style={s.startText}>Commencer</Text>
                }
              </View>
            </TouchableOpacity>
          )
        })}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Final validation CTA — appears only when all tasks done */}
      {allDone && (
        <View style={s.footer}>
          <PressableScale style={s.validateBtn} onPress={handleValidate}>
            <CheckSquare size={18} color={colors.white} />
            <Text style={s.validateBtnText}>Valider l'étape</Text>
          </PressableScale>
        </View>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfaceAlt },

  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },

  progressCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  progressCardDone: {
    borderColor: `${colors.statusCompleted}40`,
    backgroundColor: `${colors.statusCompleted}06`,
  },
  progressLabel: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressFillDone: {
    backgroundColor: colors.statusCompleted,
  },

  processLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 4,
  },
  processLinkText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
    textDecorationLine: 'underline',
  },

  sectionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.9,
    marginBottom: 10,
  },

  taskCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  taskCardDone: {
    borderColor: `${colors.statusCompleted}40`,
    backgroundColor: `${colors.statusCompleted}06`,
  },
  taskCardLocked: {
    opacity: 0.5,
  },
  taskIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIconWrapDone: {
    backgroundColor: `${colors.statusCompleted}14`,
  },
  taskLabel: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  taskLabelDone: { color: colors.textTertiary },
  taskLabelLocked: { color: colors.textMuted },
  taskDesc: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  taskDescLocked: { color: colors.textMuted },
  taskRight: { alignItems: 'flex-end' },
  startText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  doneText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.xs,
    color: colors.statusCompleted,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: `${colors.statusCompleted}30`,
    backgroundColor: colors.white,
  },
  validateBtn: {
    backgroundColor: colors.statusCompleted,
    borderRadius: radius.xl,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  validateBtnText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.md,
    color: colors.white,
  },
})
