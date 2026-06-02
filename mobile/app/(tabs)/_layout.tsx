import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Tabs } from 'expo-router'
import { LayoutList, Clock, MoreHorizontal, RefreshCw } from 'lucide-react-native'
import { colors, radius, fontSize, fonts, shadows } from '../../lib/tokens'
import { ConnectivityProvider } from '../../context/ConnectivityContext'
import { SyncBanner } from '../../components/ui/SyncBanner'
import { useExploration, PERSONA_META } from '../../context/ExplorationContext'

function PersonaPill() {
  const { explorationEnabled, personaIndex, cyclePersona } = useExploration()
  if (!explorationEnabled) return null
  const persona = PERSONA_META[personaIndex]

  return (
    <View style={s.personaWrap} pointerEvents="box-none">
      <TouchableOpacity style={s.personaPill} onPress={cyclePersona} activeOpacity={0.8}>
        <RefreshCw size={11} color={`${colors.white}90`} />
        <Text style={s.personaName}>{persona.name}</Text>
        <View style={s.personaHintPill}>
          <Text style={s.personaHint}>{persona.hint}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <ConnectivityProvider>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
              backgroundColor: colors.white,
              borderTopColor: colors.border,
              borderTopWidth: 1,
            },
            tabBarLabelStyle: {
              fontFamily: 'Poppins_500Medium',
              fontSize: 11,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Missions',
              tabBarIcon: ({ color, size }) => <LayoutList size={size} color={color as string} />,
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'Historique',
              tabBarIcon: ({ color, size }) => <Clock size={size} color={color as string} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: '···',
              tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color as string} />,
            }}
          />
        </Tabs>

        {/* Sync feedback banner — overlay above all tab content */}
        <SyncBanner />
        <PersonaPill />
      </View>
    </ConnectivityProvider>
  )
}

const s = StyleSheet.create({
  personaWrap: {
    position: 'absolute',
    bottom: 72,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  personaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 9,
    ...shadows.lg,
  },
  personaName: { fontFamily: fonts.semibold, fontSize: fontSize.xs, color: colors.white },
  personaHintPill: {
    backgroundColor: `${colors.white}18`,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  personaHint: { fontFamily: fonts.regular, fontSize: 10, color: `${colors.white}80` },
})
