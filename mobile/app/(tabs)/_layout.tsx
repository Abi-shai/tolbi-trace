import { View } from 'react-native'
import { Tabs } from 'expo-router'
import { LayoutList, Clock, MoreHorizontal } from 'lucide-react-native'
import { colors } from '../../lib/tokens'
import { ConnectivityProvider } from '../../context/ConnectivityContext'
import { SyncBanner } from '../../components/ui/SyncBanner'

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
      </View>
    </ConnectivityProvider>
  )
}
