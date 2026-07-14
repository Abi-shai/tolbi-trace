import { useState } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Icon, Txt, Badge } from '../../components/ds'
import { color, sem, font, radius, shadow } from '../../theme/tokens'
import { DMRV, D_PRODS } from '../../data/dmrv'

export default function DmrvModule() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [prod, setProd] = useState<number | null>(null)

  const headSub =
    prod != null
      ? `${D_PRODS[prod].name} · Verra VM0047`
      : 'Ndiaganiao AFR100 · Verra VM0047'

  const back = () => {
    if (prod != null) setProd(null)
    else router.back()
  }

  return (
    <View style={{ flex: 1, backgroundColor: sem.bg.secondary }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 12, paddingTop: insets.top + 12, backgroundColor: sem.bg.primary, borderBottomWidth: 1, borderBottomColor: sem.border.secondary }}>
        <RoundBtn icon="arrow-left" onPress={back} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14.5 }}>dMRV · Projet carbone</Txt>
          <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{headSub}</Txt>
        </View>
        <RoundBtn icon="download" onPress={() => {}} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 13 }} showsVerticalScrollIndicator={false}>
        {prod == null ? (
          <ProducerList onOpen={setProd} />
        ) : (
          <ProducerDetail prod={prod} />
        )}
      </ScrollView>
    </View>
  )
}

/* ── Producers list ───────────────────────────────────────────────── */
function ProducerList({ onOpen }: { onOpen: (i: number) => void }) {
  return (
    <>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatCard value="12 480" unit="tCO2eq" label="Stock carbone total" />
        <StatCard value="76" unit="%" label="Couverture forestière" />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: sem.border.primary, borderRadius: radius.md, backgroundColor: '#fff', paddingVertical: 9, paddingHorizontal: 12, ...shadow.xs }}>
          <Icon name="search" size={15} color={sem.text.placeholder} />
          <Txt style={{ fontSize: 13, color: sem.text.placeholder }}>Rechercher un producteur…</Txt>
        </View>
        <Pressable style={{ width: 40, height: 40, borderRadius: radius.md, borderWidth: 1, borderColor: sem.border.brand, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow.xs }}>
          <Icon name="grid" size={18} color={color.brand[700]} />
        </Pressable>
      </View>
      <Label>Producteurs du projet</Label>
      {D_PRODS.map((dp, i) => (
        <Pressable key={dp.name} onPress={() => onOpen(i)} style={[cardStyle, { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }]}>
          <Avatar init={dp.init} size={38} />
          <View style={{ flex: 1, gap: 1 }}>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13 }}>{dp.name}</Txt>
            <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{dp.meta}</Txt>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14 }}>{dp.stock}<Txt style={{ fontFamily: font.inter.medium, fontSize: 10, color: sem.text.quarterary }}> tCO2eq</Txt></Txt>
            <Txt style={{ fontFamily: font.inter.medium, fontSize: 10.5, color: sem.text.quarterary }}>Couverture {dp.cover}</Txt>
          </View>
          <Icon name="chevron-right" size={15} color={sem.fg.quinary} />
        </Pressable>
      ))}
    </>
  )
}

/* ── Producer detail ──────────────────────────────────────────────── */
function ProducerDetail({ prod }: { prod: number }) {
  const router = useRouter()
  const dp = D_PRODS[prod]
  const [mode, setMode] = useState<'monitoring' | 'baseline'>('monitoring')
  const [metric, setMetric] = useState(0)
  const isMon = mode === 'monitoring'
  const active = DMRV[metric]

  return (
    <>
      {/* producer */}
      <View style={[cardStyle, { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 11 }]}>
        <Avatar init={dp.init} size={36} />
        <View style={{ flex: 1, gap: 1 }}>
          <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13 }}>{dp.name}</Txt>
          <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{dp.meta}</Txt>
        </View>
      </View>

      {/* segmented control */}
      <View style={{ flexDirection: 'row', backgroundColor: sem.bg.tertiary, borderRadius: 10, padding: 3, gap: 3 }}>
        {(['monitoring', 'baseline'] as const).map((m) => {
          const on = mode === m
          return (
            <Pressable key={m} onPress={() => setMode(m)} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, backgroundColor: on ? '#fff' : 'transparent', ...(on ? shadow.xs : null) }}>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12.5, color: on ? sem.text.primary : sem.text.quarterary }}>{m === 'monitoring' ? 'Monitoring' : 'Baseline'}</Txt>
            </Pressable>
          )
        })}
      </View>
      <Txt style={{ fontSize: 11.5, color: sem.text.quarterary, marginTop: -6 }}>
        {isMon
          ? 'Valeurs mesurées en 2026, comparées à la baseline 2020.'
          : 'Référence 2020 — point de départ du projet carbone.'}
      </Txt>

      {/* metric rows */}
      <View style={[cardStyle, { overflow: 'hidden' }]}>
        {DMRV.map((m, i) => {
          const sel = metric === i
          const good = (m.name === 'Taux de déforestation' ? !m.up : m.up)
          return (
            <Pressable key={m.name} onPress={() => setMetric(i)} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: sem.border.tertiary, backgroundColor: sel ? sem.bg.brandPrimary : 'transparent' }}>
              <View style={{ flex: 1, gap: 1 }}>
                <Txt style={{ fontFamily: sel ? font.inter.semibold : font.inter.medium, fontSize: 12.5, color: sem.text.primary }}>{m.name}</Txt>
                <Txt style={{ fontSize: 10.5, color: sem.text.quarterary }}>{m.sub}</Txt>
              </View>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 15 }}>{isMon ? dp.vals[i] : dp.base[i]}<Txt style={{ fontFamily: font.inter.medium, fontSize: 10.5, color: sem.text.quarterary }}> {m.unit}</Txt></Txt>
              {isMon && <Badge label={m.delta} color={good ? 'success' : 'warning'} />}
            </Pressable>
          )
        })}
      </View>

      {/* evolution chart */}
      <View style={[cardStyle, { padding: 14, gap: 11 }]}>
        <View style={rowBetween}>
          <Txt style={h3}>Évolution · {active.name}</Txt>
          <Txt style={{ fontSize: 10.5, color: sem.text.quarterary }}>{active.unit}</Txt>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 7, height: 88 }}>
          {active.bars.map((b, i) => (
            <View key={i} style={{ flex: 1, justifyContent: 'flex-end', height: '100%' }}>
              <View style={{ height: isMon ? b : Math.round(b * 0.55), borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: i === active.bars.length - 1 ? color.brand[700] : color.brand[300] }} />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {active.bars.map((_, i) => (
            <Txt key={i} style={{ flex: 1, textAlign: 'center', fontFamily: font.inter.medium, fontSize: 9.5, color: sem.text.quarterary }}>{`'${19 + i}`}</Txt>
          ))}
        </View>
        <View style={{ backgroundColor: sem.bg.secondarySubtle, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11 }}>
          <Txt style={{ fontSize: 11.5, lineHeight: 17, color: sem.text.tertiary }}>{active.insight}</Txt>
        </View>
      </View>

      {/* forest cover map */}
      <View style={{ height: 150, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: sem.border.secondary, ...shadow.xs }}>
        <LinearGradient colors={['#0A5C33', '#1F8A5B', '#C7DCC2', '#0B6237', '#8FC49B']} start={{ x: 0.05, y: 0 }} end={{ x: 0.95, y: 0.4 }} style={{ position: 'absolute', inset: 0 }} />
        <View style={{ position: 'absolute', left: 12, top: 12, backgroundColor: 'rgba(16,24,40,0.65)', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 }}>
          <Txt style={{ fontFamily: font.inter.semibold, fontSize: 10.5, color: '#fff' }}>Couverture forestière · 2026</Txt>
        </View>
        <Pressable onPress={() => router.push('/module/gps')} style={{ position: 'absolute', right: 12, bottom: 12, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 12, ...shadow.md }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12, color: color.brand[700] }}>Carte terrain</Txt>
        </Pressable>
      </View>

      {/* deforestation alert */}
      <Pressable onPress={() => router.push('/notifications')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: color.warning[50], borderWidth: 1, borderColor: color.warning[200], borderRadius: 12, paddingVertical: 11, paddingHorizontal: 13 }}>
        <Icon name="alert-triangle" size={16} color={color.warning[600]} />
        <Txt style={{ flex: 1, fontSize: 12.5, lineHeight: 18, color: color.warning[700] }}><Txt style={{ fontFamily: font.inter.semibold }}>Alerte déforestation</Txt> — 3,2 ha détectés · secteur Est · S28</Txt>
        <Icon name="chevron-right" size={16} color={color.warning[600]} />
      </Pressable>

      {/* certification report */}
      <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: sem.border.brand, borderRadius: radius.md, paddingVertical: 12, ...shadow.xs }}>
        <Icon name="file" size={15} color={color.brand[700]} />
        <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: color.brand[700] }}>Rapport de certification (PDF)</Txt>
      </Pressable>
    </>
  )
}

/* ── shared bits ──────────────────────────────────────────────────── */
const cardStyle = { backgroundColor: color.white, borderWidth: 1, borderColor: sem.border.secondary, borderRadius: radius['2xl'], ...shadow.xs } as const
const rowBetween = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } as const
const h3 = { fontFamily: font.poppins.semibold, fontSize: 13 } as const

function RoundBtn({ icon, onPress }: { icon: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: 32, height: 32, borderRadius: 999, borderWidth: 1, borderColor: sem.border.secondary, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={15} color={sem.fg.secondary} />
    </Pressable>
  )
}
function Avatar({ init, size = 38 }: { init: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 999, backgroundColor: sem.bg.brandPrimary, alignItems: 'center', justifyContent: 'center' }}>
      <Txt style={{ fontFamily: font.poppins.semibold, fontSize: size / 3, color: color.brand[700] }}>{init}</Txt>
    </View>
  )
}
function Label({ children }: { children: string }) {
  return <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: sem.text.quarterary }}>{children}</Txt>
}
function StatCard({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: sem.border.secondary, borderRadius: 14, padding: 12, gap: 2, ...shadow.xs }}>
      <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 16 }}>{value}<Txt style={{ fontFamily: font.inter.medium, fontSize: 10, color: sem.text.quarterary }}> {unit}</Txt></Txt>
      <Txt style={{ fontSize: 10.5, color: sem.text.quarterary }}>{label}</Txt>
    </View>
  )
}
