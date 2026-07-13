import { ScrollView, View, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Icon, Txt, Badge, Button, Card, ProgressBar } from '../../components/ds'
import { color, sem, font, radius, shadow } from '../../theme/tokens'
import { useApp } from '../../store/app'
import { COLLECTE_PROJECTS } from '../../data/tolbi'

export default function CollecteTab() {
  const router = useRouter()
  const { online, pendingSync, doSync } = useApp()

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
      : `${pendingSync} collecte${pendingSync > 1 ? 's' : ''} en attente`

  const syncSub = !online
    ? 'Hors ligne — la synchronisation reprendra au retour du réseau'
    : pendingSync === 0
      ? 'Dernière synchronisation : aujourd’hui 14:36'
      : 'Données stockées en sécurité sur le téléphone'

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: sem.bg.secondary }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
      showsVerticalScrollIndicator={false}
    >
      {/* title row */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 18, letterSpacing: -0.36 }}>Collecte</Txt>
        <Txt style={{ fontSize: 12, color: sem.text.quarterary }}>12 terminées · 8 restantes</Txt>
      </View>

      {/* sync status */}
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14 }}>
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
              {
                borderWidth: 1,
                borderColor: sem.border.brand,
                backgroundColor: pressed ? sem.bg.brandPrimary : color.white,
                paddingVertical: 8,
                paddingHorizontal: 13,
                borderRadius: radius.md,
              },
              shadow.xs,
            ]}
          >
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12, color: color.brand[700] }}>Synchroniser</Txt>
          </Pressable>
        )}
      </Card>

      {/* assigned projects */}
      <SectionLabel>Projets assignés</SectionLabel>
      <View style={{ gap: 10 }}>
        {COLLECTE_PROJECTS.map((p) => {
          const percent = Math.round((p.done / p.total) * 100)
          return (
            <Card key={p.name} style={{ padding: 14, gap: 11 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ flex: 1, gap: 1 }}>
                  <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13.5, color: sem.text.primary }}>{p.name}</Txt>
                  <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>{p.sub}</Txt>
                </View>
                <Badge label={p.badge} color={p.badgeC} />
              </View>

              <View style={{ gap: 5 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>{p.done} / {p.total} collectes</Txt>
                  <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>{percent} %</Txt>
                </View>
                <ProgressBar percent={(p.done / p.total) * 100} />
              </View>

              <Button
                label={p.cta}
                variant={p.primary ? 'primary' : 'secondary'}
                onPress={() => router.push('/module/collecte-form')}
              />
            </Card>
          )
        })}
      </View>

      {/* offline-safe info note */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 9,
          backgroundColor: sem.bg.brandPrimary,
          borderWidth: 1,
          borderColor: color.brand[200],
          borderRadius: radius.xl,
          paddingVertical: 11,
          paddingHorizontal: 13,
        }}
      >
        <View style={{ marginTop: 1 }}>
          <Icon name="check-circle" size={15} color={sem.fg.brandPrimary} />
        </View>
        <Txt style={{ flex: 1, fontSize: 12, lineHeight: 18, color: color.brand[800] }}>
          Chaque champ est sauvegardé sur le téléphone au fur et à mesure. Vous pouvez travailler sans réseau.
        </Txt>
      </View>
    </ScrollView>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: sem.text.quarterary }}>
      {children}
    </Txt>
  )
}
