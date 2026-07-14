import { View, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Icon, Txt, Badge } from '../../components/ds'
import { QrCode } from '../../components/ds/QrCode'
import { color, sem, font, radius, shadow } from '../../theme/tokens'

export default function ProducerDetail() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  /* Ouverte depuis le scan avec l'identité résolue ; défauts = démo directe. */
  const p = useLocalSearchParams<{ name?: string; init?: string; village?: string; ina?: string; pending?: string }>()
  const name = p.name ?? 'Ibrahima Diop'
  const init = p.init ?? 'ID'
  const village = p.village ?? 'Ndiaganiao'
  const ina = p.ina ?? 'INA-SN-04217'
  const pending = p.pending === '1'

  return (
    <View style={{ flex: 1, backgroundColor: sem.bg.secondary }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 12, paddingTop: insets.top + 12, backgroundColor: sem.bg.primary, borderBottomWidth: 1, borderBottomColor: sem.border.secondary }}>
        <RoundBtn icon="arrow-left" onPress={() => router.back()} />
        <Txt style={{ flex: 1, fontFamily: font.poppins.semibold, fontSize: 14.5 }}>Fiche producteur</Txt>
        <RoundBtn icon="edit" onPress={() => {}} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 13 }} showsVerticalScrollIndicator={false}>
        {/* producer header */}
        <View style={[cardStyle, { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }]}>
          <View style={{ width: 54, height: 54, borderRadius: 999, backgroundColor: sem.bg.brandPrimary, alignItems: 'center', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 18, color: color.brand[700] }}>{init}</Txt>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 16 }}>{name}</Txt>
            <Txt style={{ fontSize: 12, color: sem.text.quarterary }}>{village} · Coop. Kaolack</Txt>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
              <Badge label="Arachide" color="brand" />
              <Badge label="Maïs" color="warning" />
            </View>
          </View>
        </View>

        {/* INA card */}
        <LinearGradient colors={[color.brand[700], color.brand[900]]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 15 }, shadow.xs]}>
          <View style={{ width: 64, height: 64, borderRadius: 10, backgroundColor: color.white, alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={52} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 10.5, letterSpacing: 0.84, textTransform: 'uppercase', color: color.brand[200] }}>Identité numérique agricole</Txt>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 17, color: color.white }}>{ina}</Txt>
            <Txt style={{ fontSize: 11, color: color.brand[200] }}>
              {pending ? 'Émise hors ligne · à synchroniser vers le registre KYF' : 'Scannez pour ouvrir cette fiche sur le terrain'}
            </Txt>
          </View>
        </LinearGradient>

        {/* stat grid */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatCard value="2" label="Parcelles" />
          <StatCard value="3,1" unit="ha" label="Surface totale" />
          <StatCard value="1,3" unit="t/ha" label="Rendement est." />
        </View>

        {/* parcelles */}
        <View style={[cardStyle, { padding: 14, gap: 9 }]}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13 }}>Parcelles</Txt>
          <ParcelleRow tile={['#C9DBB2', '#8FBF7F']} name="Champ Keur Madior" meta="Arachide · 2,4 ha" tag="Floraison" tagC="success" border />
          <ParcelleRow tile={['#DCE4CB', '#B9DCA9']} name="Champ Bas-fond" meta="Maïs · 0,7 ha" tag="Croissance" tagC="brand" />
          <Pressable
            onPress={() => router.push('/module/gps')}
            style={({ pressed }) => [
              { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: pressed ? sem.bg.brandPrimary : color.white, borderWidth: 1, borderColor: sem.border.brand, borderRadius: radius.md, paddingVertical: 10 },
              shadow.xs,
            ]}
          >
            <Icon name="map" size={14} color={color.brand[700]} />
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12.5, color: color.brand[700] }}>M’y guider sur la carte</Txt>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}

/* ── shared bits ──────────────────────────────────────────────────── */
const cardStyle = { backgroundColor: color.white, borderWidth: 1, borderColor: sem.border.secondary, borderRadius: radius['2xl'], ...shadow.xs } as const

function RoundBtn({ icon, onPress }: { icon: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: 32, height: 32, borderRadius: 999, borderWidth: 1, borderColor: sem.border.secondary, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={15} color={sem.fg.secondary} />
    </Pressable>
  )
}

function StatCard({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: color.white, borderWidth: 1, borderColor: sem.border.secondary, borderRadius: 14, padding: 12, gap: 2, ...shadow.xs }}>
      <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 17 }}>
        {value}
        {unit ? <Txt style={{ fontFamily: font.inter.medium, fontSize: 10, color: sem.text.quarterary }}> {unit}</Txt> : null}
      </Txt>
      <Txt style={{ fontSize: 10.5, color: sem.text.quarterary }}>{label}</Txt>
    </View>
  )
}

function ParcelleRow({ tile, name, meta, tag, tagC, border }: { tile: [string, string]; name: string; meta: string; tag: string; tagC: 'success' | 'brand'; border?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 9, borderBottomWidth: border ? 1 : 0, borderBottomColor: sem.border.tertiary }}>
      <LinearGradient colors={tile} start={{ x: 0.1, y: 0.1 }} end={{ x: 0.9, y: 0.9 }} style={{ width: 34, height: 34, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(6,105,56,0.35)' }} />
      <View style={{ flex: 1, gap: 1 }}>
        <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5 }}>{name}</Txt>
        <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{meta}</Txt>
      </View>
      <Badge label={tag} color={tagC} />
    </View>
  )
}
