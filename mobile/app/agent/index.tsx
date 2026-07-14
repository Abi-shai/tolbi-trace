import { ScrollView, View, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Icon, ModuleIcon, Txt, Badge, Card } from '../../components/ds'
import { color, sem, font, radius, shadow } from '../../theme/tokens'
import { useApp } from '../../store/app'
import { HOME_MODULES, HOME_TASKS, HOME_PROJECTS, ORGS, type ModuleTarget } from '../../data/tolbi'

export default function HomeTab() {
  const router = useRouter()
  const { pendingSync } = useApp()
  const org = ORGS[0]

  const go = (t: ModuleTarget) => {
    if (t.kind === 'overlay') router.push(`/module/${t.name}` as never)
    else if (t.kind === 'locked') router.push('/module/locked')
    else if (t.kind === 'tab') router.push(`/agent/${t.name}` as never)
  }

  const tasks = HOME_TASKS.agent

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: sem.bg.secondary }}
      contentContainerStyle={{ padding: 16, paddingTop: 18, gap: 18 }}
      showsVerticalScrollIndicator={false}
    >
      {/* greeting + org switcher */}
      <View style={{ gap: 4 }}>
        <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 20, letterSpacing: -0.4 }}>Bonjour Amadou</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Txt style={{ fontSize: 12.5, color: sem.text.tertiary }}>Mardi 7 juillet</Txt>
          <Pressable
            onPress={() => router.push('/orgs')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: sem.border.secondary, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 9 }}
          >
            <View style={{ width: 16, height: 16, borderRadius: 5, backgroundColor: org.tile, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 8.5, color: '#fff' }}>{org.init}</Txt>
            </View>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11.5, color: sem.text.secondary }}>{org.name}</Txt>
            <Icon name="chevron-down" size={12} color={sem.text.secondary} />
          </Pressable>
        </View>
      </View>

      {/* module row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }} style={{ marginHorizontal: -16 }} contentInset={{ left: 16 }}>
        <View style={{ width: 16 }} />
        {HOME_MODULES.map((m) => (
          <Pressable key={m.label} onPress={() => go(m.target)} style={{ alignItems: 'center', gap: 7, width: 62 }}>
            <View style={[{ width: 58, height: 58, borderRadius: 18, backgroundColor: m.locked ? '#fff' : sem.bg.brandPrimary, borderWidth: 1, borderColor: sem.border.secondary, alignItems: 'center', justifyContent: 'center' }, shadow.xs]}>
              {m.moduleIcon && !m.locked ? (
                <ModuleIcon module={m.moduleIcon} size={44} background={false} />
              ) : (
                <Icon name={m.icon} size={26} color={m.locked ? sem.fg.quinary : color.brand[600]} strokeWidth={1.9} />
              )}
              {m.locked && (
                <View style={{ position: 'absolute', right: -4, top: -4, width: 21, height: 21, borderRadius: 999, backgroundColor: sem.fg.tertiary, borderWidth: 2, borderColor: sem.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="lock" size={10} color="#fff" />
                </View>
              )}
            </View>
            <Txt numberOfLines={2} style={{ fontFamily: font.inter.semibold, fontSize: 10.5, textAlign: 'center', lineHeight: 12, color: m.locked ? sem.text.quarterary : sem.text.secondary }}>{m.label}</Txt>
          </Pressable>
        ))}
        <View style={{ width: 8 }} />
      </ScrollView>

      {/* Aujourd'hui */}
      <View style={{ gap: 10 }}>
        <SectionLabel>Aujourd’hui</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={() => go(tasks[0].target)} style={{ flex: 1 }}>
            <Card style={{ flex: 1, padding: 14, gap: 8 }}>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 24, color: sem.text.primary }}>{tasks[0].n}</Txt>
              <Txt style={{ fontFamily: font.inter.medium, fontSize: 12, color: sem.text.tertiary, lineHeight: 17 }}>{tasks[0].label}</Txt>
            </Card>
          </Pressable>
          <Pressable onPress={() => go(tasks[1].target)} style={{ flex: 1 }}>
            <Card style={{ flex: 1, padding: 14, gap: 8 }}>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 24, color: sem.text.primary }}>{pendingSync || tasks[1].n}</Txt>
              <Txt style={{ fontFamily: font.inter.medium, fontSize: 12, color: sem.text.tertiary, lineHeight: 17 }}>{tasks[1].label}</Txt>
            </Card>
          </Pressable>
        </View>
      </View>

      {/* Projets en cours */}
      <View style={{ gap: 10 }}>
        <SectionLabel>Projets en cours</SectionLabel>
        {HOME_PROJECTS.map((pr) => (
          <Pressable key={pr.name} onPress={() => go(pr.target)}>
            <Card style={{ padding: 14, gap: 11 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: sem.bg.brandPrimary, alignItems: 'center', justifyContent: 'center' }}>
                  {pr.moduleIcon ? (
                    <ModuleIcon module={pr.moduleIcon} size={24} background={false} />
                  ) : (
                    <Icon name={pr.icon} size={17} color={color.brand[600]} strokeWidth={1.9} />
                  )}
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Txt style={{ fontFamily: font.inter.semibold, fontSize: 9.5, letterSpacing: 0.6, textTransform: 'uppercase', color: sem.text.brandTertiary }}>{pr.module}</Txt>
                  <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13.5, color: sem.text.primary }}>{pr.name}</Txt>
                </View>
                <Badge label={pr.badge} color={pr.badgeC} dot />
              </View>
              <View style={{ flexDirection: 'row', gap: 18 }}>
                <Metric m={pr.m1} u={pr.u1} l={pr.l1} />
                <Metric m={pr.m2} u={pr.u2} l={pr.l2} />
                <Metric m={pr.m3} u="" l={pr.l3} color={pr.m3c} />
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
      <View style={{ height: 8 }} />
    </ScrollView>
  )
}

function SectionLabel({ children }: { children: string }) {
  return <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: sem.text.quarterary }}>{children}</Txt>
}

function Metric({ m, u, l, color: c }: { m: string; u: string; l: string; color?: string }) {
  return (
    <View style={{ gap: 1 }}>
      <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 15, color: c ?? sem.text.primary }}>
        {m}
        {u ? <Txt style={{ fontFamily: font.inter.medium, fontSize: 10, color: sem.text.quarterary }}> {u}</Txt> : null}
      </Txt>
      <Txt style={{ fontSize: 10.5, color: sem.text.quarterary }}>{l}</Txt>
    </View>
  )
}
