import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Wifi, WifiOff, LogOut, ChevronRight } from 'lucide-react-native'
import { colors, radius, fontSize, fonts } from '../../lib/tokens'
import { ConnectivityPill } from '../../components/ui/ConnectivityPill'
import { useConnectivity } from '../../context/ConnectivityContext'
import { useAuth } from '../../context/AuthContext'

const AGENT = {
  initials: 'MD',
  name: 'Mamadou Diallo',
  role: 'Agent terrain',
  org: 'AgroSénégal SA',
}

export default function MenuScreen() {
  const { online, setOnline, pendingSync } = useConnectivity()
  const { logout } = useAuth()

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.headerTitle}>Menu</Text>
          <ConnectivityPill online={online} />
        </View>
      </View>

      <View style={s.body}>
        {/* Agent card */}
        <View style={s.agentCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{AGENT.initials}</Text>
          </View>
          <View>
            <Text style={s.agentName}>{AGENT.name}</Text>
            <Text style={s.agentRole}>{AGENT.role} · {AGENT.org}</Text>
          </View>
        </View>

        {/* Sync status — tap to toggle for demo */}
        <TouchableOpacity
          style={[s.syncCard, !online && s.syncCardOffline]}
          onPress={() => setOnline(!online)}
          activeOpacity={0.85}
        >
          <View style={s.syncRow}>
            {online
              ? <Wifi size={16} color={colors.statusCompleted} />
              : <WifiOff size={16} color='#ea580c' />
            }
            <Text style={[s.syncStatus, { color: online ? colors.statusCompleted : '#ea580c' }]}>
              {online ? 'Connecté' : 'Hors ligne'}
            </Text>
          </View>
          <Text style={s.syncDetail}>
            {pendingSync > 0
              ? `${pendingSync} validation${pendingSync > 1 ? 's' : ''} en attente de sync`
              : "Dernière sync : Aujourd'hui · 11h42"
            }
          </Text>
        </TouchableOpacity>

        {/* Menu items */}
        <View style={s.menuSection}>
          <TouchableOpacity style={s.menuRow} activeOpacity={0.7}>
            <Text style={s.menuLabel}>Mes informations</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.menuRow, { borderBottomWidth: 0 }]} activeOpacity={0.7}>
            <Text style={s.menuLabel}>Aide & support</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.logoutBtn} activeOpacity={0.8} onPress={logout}>
          <LogOut size={16} color={colors.statusAnomaly} />
          <Text style={s.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.topbar,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontFamily: fonts.semibold, fontSize: fontSize.xl, color: colors.white },

  body: { flex: 1, paddingHorizontal: 16, paddingTop: 20, gap: 12 },

  agentCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 48, height: 48, borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 18, color: colors.textSecondary },
  agentName: { fontFamily: fonts.semibold, fontSize: fontSize.md, color: colors.textPrimary },
  agentRole: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 },

  syncCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 4,
  },
  syncCardOffline: {
    borderColor: 'rgba(234, 88, 12, 0.3)',
    backgroundColor: 'rgba(234, 88, 12, 0.04)',
  },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  syncStatus: { fontFamily: fonts.semibold, fontSize: fontSize.sm },
  syncDetail: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textMuted },

  menuSection: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textPrimary },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: `${colors.statusAnomaly}30`,
    backgroundColor: `${colors.statusAnomaly}08`,
  },
  logoutText: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.statusAnomaly },
})
