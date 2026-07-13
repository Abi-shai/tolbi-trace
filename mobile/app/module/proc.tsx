import { useState } from 'react'
import { View, ScrollView, Pressable, Modal } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Icon, Txt, Badge, Button, ProgressBar } from '../../components/ds'
import { color, sem, font, radius, shadow } from '../../theme/tokens'
import { useApp } from '../../store/app'
import { PROC_PROCESSES, PROC_NODES, PROC_EVENTS } from '../../data/proc'

export default function ProcModule() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { online, pendingSync, doSync } = useApp()
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const canSync = online && pendingSync > 0

  // Sync tile appearance mirrors the prototype's syncIcon/syncIconBg/syncIconC bindings.
  const sync = canSync
    ? { tileBg: sem.bg.brandPrimary, tileFg: sem.fg.brandPrimary, icon: 'refresh-cw' }
    : !online
      ? { tileBg: color.warning[50], tileFg: sem.fg.warningPrimary, icon: 'wifi-off' }
      : { tileBg: sem.bg.successPrimary, tileFg: sem.fg.successPrimary, icon: 'check-circle' }

  const syncTitle =
    pendingSync === 0
      ? 'Tout est synchronisé'
      : `${pendingSync} sac${pendingSync > 1 ? 's' : ''} en attente`

  const syncSub = !online
    ? 'Hors ligne — la synchronisation reprendra au retour du réseau'
    : pendingSync === 0
      ? 'Dernière synchronisation : aujourd’hui 14:36'
      : 'Scans stockés en sécurité sur le téléphone'

  return (
    <View style={{ flex: 1, backgroundColor: sem.bg.secondary }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 12, paddingTop: insets.top + 12, backgroundColor: sem.bg.primary, borderBottomWidth: 1, borderBottomColor: sem.border.secondary }}>
        <RoundBtn icon="arrow-left" onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14.5 }}>Procurement · Maïs</Txt>
          <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>AgriMaïs SA · chaîne d’approvisionnement</Txt>
        </View>
        <RoundBtn icon="settings" onPress={() => {}} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 14 }} showsVerticalScrollIndicator={false}>
        {/* title row */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 18, letterSpacing: -0.36 }}>Procurement</Txt>
          <Txt style={{ fontSize: 12, color: sem.text.quarterary }}>2 processus · 512 sacs suivis</Txt>
        </View>

        {/* sync status */}
        <View style={[cardStyle, { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14 }]}>
          <View style={{ width: 38, height: 38, borderRadius: radius.full, backgroundColor: sync.tileBg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={sync.icon} size={18} color={sync.tileFg} />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13, color: sem.text.primary }}>{syncTitle}</Txt>
            <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>{syncSub}</Txt>
          </View>
          {canSync && (
            <Pressable
              onPress={doSync}
              style={({ pressed }) => [
                { borderWidth: 1, borderColor: sem.border.brand, backgroundColor: pressed ? sem.bg.brandPrimary : color.white, paddingVertical: 8, paddingHorizontal: 13, borderRadius: radius.md },
                shadow.xs,
              ]}
            >
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12, color: color.brand[700] }}>Synchroniser</Txt>
            </Pressable>
          )}
        </View>

        {/* assigned processes */}
        <Label>Processus assignés</Label>
        <View style={{ gap: 10 }}>
          {PROC_PROCESSES.map((pp, i) => (
            <View key={pp.name} style={[cardStyle, { padding: 14, gap: 11 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ flex: 1, gap: 1 }}>
                  <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13.5, color: sem.text.primary }}>{pp.name}</Txt>
                  <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>{pp.sub}</Txt>
                </View>
                <Badge label={pp.badge} color={pp.badgeC} />
              </View>

              <View style={{ gap: 5 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>{pp.count}</Txt>
                  <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>{pp.pct} %</Txt>
                </View>
                <ProgressBar percent={pp.pct} />
              </View>

              <Button
                label={pp.cta}
                variant={pp.primary ? 'primary' : 'secondary'}
                onPress={() => setOpenIdx(i)}
              />
            </View>
          ))}
        </View>

        {/* offline-safe info note */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9, backgroundColor: sem.bg.brandPrimary, borderWidth: 1, borderColor: color.brand[200], borderRadius: radius.xl, paddingVertical: 11, paddingHorizontal: 13 }}>
          <View style={{ marginTop: 1 }}>
            <Icon name="check-circle" size={15} color={sem.fg.brandPrimary} />
          </View>
          <Txt style={{ flex: 1, fontSize: 12, lineHeight: 18, color: color.brand[800] }}>
            Chaque sac scanné est enregistré sur le téléphone au fur et à mesure. Vous pouvez travailler sans réseau.
          </Txt>
        </View>
      </ScrollView>

      {/* chain detail bottom-sheet */}
      <Modal visible={openIdx !== null} transparent animationType="slide" onRequestClose={() => setOpenIdx(null)}>
        <Pressable onPress={() => setOpenIdx(null)} style={{ flex: 1, backgroundColor: 'rgba(16,24,40,0.45)', justifyContent: 'flex-end' }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: color.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '85%' }}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 16 }} showsVerticalScrollIndicator={false}>
              {/* sheet header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 16 }}>Chaîne d’approvisionnement</Txt>
                <RoundBtn icon="x-close" onPress={() => setOpenIdx(null)} />
              </View>

              {/* timeline */}
              <View>
                {PROC_NODES.map((n, i) => {
                  const done = n.st === 'done'
                  const active = n.st === 'active'
                  const isLast = i === PROC_NODES.length - 1
                  const segColor = done ? color.brand[600] : color.gray[200]
                  return (
                    <View key={n.name} style={{ flexDirection: 'row', gap: 12 }}>
                      {/* left rail */}
                      <View style={{ width: 22, alignItems: 'center' }}>
                        <View style={{ width: 22, height: 22, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? color.brand[600] : active ? color.white : sem.bg.tertiary, borderColor: done || active ? color.brand[600] : color.gray[300] }}>
                          {done && <Icon name="check" size={12} color="#fff" strokeWidth={3} />}
                          {active && <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: color.brand[600] }} />}
                        </View>
                        {!isLast && <View style={{ flex: 1, width: 2, marginVertical: 2, backgroundColor: segColor }} />}
                      </View>
                      {/* content */}
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingBottom: isLast ? 0 : 16 }}>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12.5 }}>{n.name}</Txt>
                          <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{n.meta}</Txt>
                        </View>
                        <Badge label={n.tag} color={n.tagC} />
                      </View>
                    </View>
                  )
                })}
              </View>

              {/* recent activity */}
              <Label>Activité récente</Label>
              <View style={{ gap: 12 }}>
                {PROC_EVENTS.map((e, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: e.iconBg, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={e.icon} size={16} color={e.iconC} />
                    </View>
                    <View style={{ flex: 1, gap: 1 }}>
                      <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5 }}>{e.title}</Txt>
                      <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{e.sub}</Txt>
                    </View>
                    <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{e.time}</Txt>
                  </View>
                ))}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
function Label({ children }: { children: string }) {
  return <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: sem.text.quarterary }}>{children}</Txt>
}
