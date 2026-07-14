import { Tabs } from 'expo-router'
import { AppHeader } from '../../components/app/AppHeader'
import { TabBar } from '../../components/app/TabBar'
import { sem } from '../../theme/tokens'

export default function AgentLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        header: () => <AppHeader />,
        sceneStyle: { backgroundColor: sem.bg.secondary },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="producers" />
      <Tabs.Screen name="formation" />
      <Tabs.Screen name="collecte" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}
