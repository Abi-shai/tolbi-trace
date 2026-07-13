import { View, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Icon, Txt, Logo } from '../ds'
import { color, sem, font } from '../../theme/tokens'
import { useApp } from '../../store/app'

/** Shared agent-app header: logo · connectivity pill · notifications.
 *  Renders the offline banner beneath itself when offline. */
export function AppHeader() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { online, toggleOffline, pendingSync } = useApp()

  const conn = online
    ? { label: 'En ligne', dot: color.success[500], bg: color.success[50], border: color.success[200], text: color.success[700] }
    : { label: 'Hors ligne', dot: color.warning[500], bg: color.warning[50], border: color.warning[200], text: color.warning[700] }

  return (
    <View>
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 16, paddingBottom: 10, paddingTop: insets.top + 10,
          backgroundColor: sem.bg.primary, borderBottomWidth: 1, borderBottomColor: sem.border.secondary,
        }}
      >
        <Logo height={22} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={toggleOffline}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: conn.border, backgroundColor: conn.bg, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 }}
          >
            <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: conn.dot }} />
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11.5, color: conn.text }}>{conn.label}</Txt>
          </Pressable>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={{ width: 34, height: 34, borderRadius: 999, borderWidth: 1, borderColor: sem.border.secondary, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="bell" size={17} color={sem.fg.secondary} />
            <View style={{ position: 'absolute', top: 6, right: 7, width: 7, height: 7, borderRadius: 999, backgroundColor: color.error[500], borderWidth: 1.5, borderColor: '#fff' }} />
          </Pressable>
        </View>
      </View>

      {!online && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: color.warning[50], borderBottomWidth: 1, borderBottomColor: color.warning[200], paddingVertical: 7, paddingHorizontal: 16 }}>
          <Icon name="alert-triangle" size={13} color={color.warning[700]} />
          <Txt style={{ fontFamily: font.inter.medium, fontSize: 11.5, color: color.warning[700] }}>
            Mode hors ligne — {pendingSync} collecte{pendingSync > 1 ? 's' : ''} en attente de synchronisation
          </Txt>
        </View>
      )}
    </View>
  )
}
