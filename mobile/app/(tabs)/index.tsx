import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { CheckCircle2, Clock, AlertCircle, ChevronRight } from 'lucide-react-native'
import { colors, radius, fontSize, fonts } from '../../lib/tokens'
import Badge from '../../components/ui/Badge'

const TASKS = [
  {
    id: '1',
    stepName: 'Réception entrepôt',
    processName: 'Collecte maïs — Campagne nov. 2025',
    status: 'pending' as const,
    itemsCount: 12,
  },
  {
    id: '2',
    stepName: 'Contrôle qualité final',
    processName: 'Collecte maïs — Campagne nov. 2025',
    status: 'in_progress' as const,
    itemsCount: 8,
  },
  {
    id: '3',
    stepName: 'Pesée et contrôle humidité',
    processName: 'Collecte maïs — Campagne nov. 2025',
    status: 'done' as const,
    itemsCount: 20,
  },
]

const STATUS_CONFIG = {
  pending:     { label: 'En attente', color: colors.statusPending,    icon: Clock        },
  in_progress: { label: 'En cours',   color: colors.statusInprogress, icon: AlertCircle  },
  done:        { label: 'Terminée',   color: colors.statusCompleted,  icon: CheckCircle2 },
}

export default function TasksScreen() {
  const router = useRouter()

  const pending     = TASKS.filter((t) => t.status === 'pending')
  const in_progress = TASKS.filter((t) => t.status === 'in_progress')
  const done        = TASKS.filter((t) => t.status === 'done')

  function renderTask(task: typeof TASKS[0]) {
    const cfg  = STATUS_CONFIG[task.status]
    const Icon = cfg.icon
    return (
      <TouchableOpacity
        key={task.id}
        onPress={() => router.push(`/step/${task.id}`)}
        activeOpacity={0.7}
        style={s.card}
      >
        <View style={[s.iconCircle, { backgroundColor: `${cfg.color}18` }]}>
          <Icon size={20} color={cfg.color} />
        </View>

        <View style={s.cardContent}>
          <Text style={s.stepName} numberOfLines={1}>{task.stepName}</Text>
          <Text style={s.processName} numberOfLines={1}>{task.processName}</Text>
          <View style={s.cardMeta}>
            <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}>
              {cfg.label}
            </Badge>
            <Text style={s.itemCount}>{task.itemsCount} sac{task.itemsCount > 1 ? 's' : ''}</Text>
          </View>
        </View>

        {task.status !== 'done' && (
          <ChevronRight size={18} color={colors.textMuted} />
        )}
      </TouchableOpacity>
    )
  }

  function renderSection(title: string, tasks: typeof TASKS) {
    if (!tasks.length) return null
    return (
      <View style={s.section}>
        <Text style={s.sectionTitle}>{title.toUpperCase()} ({tasks.length})</Text>
        {tasks.map(renderTask)}
      </View>
    )
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerGreeting}>Bonjour,</Text>
        <Text style={s.headerName}>Mamadou Diallo</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {renderSection('En cours', in_progress)}
        {renderSection('En attente', pending)}
        {renderSection('Terminées', done)}
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
  headerGreeting: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
  },
  headerName: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 12,
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
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
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
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  itemCount: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
})
