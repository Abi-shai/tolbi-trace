import { View, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Icon, Txt } from '../components/ds'
import { color, sem, font, radius } from '../theme/tokens'
import { NOTIFS } from '../data/tolbi'

export default function Notifications() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  return (
    <View style={{ flex: 1, backgroundColor: sem.bg.secondary }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, paddingTop: insets.top + 12, backgroundColor: sem.bg.primary, borderBottomWidth: 1, borderBottomColor: sem.border.secondary }}>
        <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 16 }}>Notifications</Txt>
        <Pressable onPress={() => router.back()} style={{ width: 34, height: 34, borderRadius: 999, borderWidth: 1, borderColor: sem.border.secondary, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x-close" size={16} color={sem.fg.secondary} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        {NOTIFS.map((n, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: n.unread ? sem.border.brand : sem.border.secondary, borderRadius: radius['2xl'], padding: 13 }}>
            <View style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: n.iconBg, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={n.icon} size={18} color={n.iconC} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13 }}>{n.title}</Txt>
                <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{n.time}</Txt>
              </View>
              <Txt style={{ fontSize: 12, lineHeight: 18, color: sem.text.tertiary }}>{n.body}</Txt>
            </View>
            {n.unread && <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: color.brand[500], marginTop: 4 }} />}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
