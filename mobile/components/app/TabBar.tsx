import { View, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Icon, Txt } from '../ds'
import { color, sem, font } from '../../theme/tokens'

const TABS: Record<string, { label: string; icon: string }> = {
  index: { label: 'Accueil', icon: 'home' },
  producers: { label: 'Producteurs', icon: 'users' },
  formation: { label: 'Formation', icon: 'book-open' },
  collecte: { label: 'Collecte', icon: 'edit' },
  profile: { label: 'Profil', icon: 'user' },
}
const ORDER = ['index', 'producers', 'formation', 'collecte', 'profile']

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const activeName = state.routes[state.index]?.name

  return (
    <View
      style={{
        flexDirection: 'row', backgroundColor: sem.bg.primary,
        borderTopWidth: 1, borderTopColor: sem.border.secondary,
        paddingTop: 6, paddingHorizontal: 8, paddingBottom: Math.max(8, insets.bottom),
      }}
    >
      {ORDER.map((name) => {
        const tab = TABS[name]
        if (!tab) return null
        const focused = activeName === name
        const tint = focused ? color.brand[700] : color.gray[500]
        const route = state.routes.find((r) => r.name === name)
        return (
          <Pressable
            key={name}
            onPress={() => {
              if (!route) return
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
              if (!focused && !event.defaultPrevented) navigation.navigate(name as never)
            }}
            style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 5 }}
          >
            <Icon name={tab.icon} size={21} color={tint} strokeWidth={focused ? 2.4 : 2} />
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 10, color: tint }}>{tab.label}</Txt>
          </Pressable>
        )
      })}
    </View>
  )
}
