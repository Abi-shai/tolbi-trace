import { useState } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Icon, Txt } from '../components/ds'
import { color, sem, font, radius } from '../theme/tokens'
import { ORGS } from '../data/tolbi'

export default function Orgs() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [sel, setSel] = useState(0)
  return (
    <View style={{ flex: 1, backgroundColor: sem.bg.secondary }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, paddingTop: insets.top + 12, backgroundColor: sem.bg.primary, borderBottomWidth: 1, borderBottomColor: sem.border.secondary }}>
        <View>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 16 }}>Organisations</Txt>
          <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>Basculez entre vos organisations</Txt>
        </View>
        <Pressable onPress={() => router.back()} style={{ width: 34, height: 34, borderRadius: 999, borderWidth: 1, borderColor: sem.border.secondary, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x-close" size={16} color={sem.fg.secondary} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        {ORGS.map((o, i) => (
          <Pressable key={o.name} onPress={() => { setSel(i); router.back() }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: i === sel ? sem.border.brand : sem.border.secondary, borderRadius: radius['2xl'], padding: 13 }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: o.tile, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: '#fff' }}>{o.init}</Txt>
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13.5 }}>{o.name}</Txt>
              <Txt style={{ fontSize: 11.5, lineHeight: 16, color: sem.text.quarterary }}>{o.sub}</Txt>
            </View>
            {i === sel && <Icon name="check-circle" size={20} color={color.brand[600]} />}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
