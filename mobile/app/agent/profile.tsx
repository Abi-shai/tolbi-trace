import { ReactNode } from 'react'
import { ScrollView, View, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Icon, Txt, Badge, Card, Toggle } from '../../components/ds'
import { color, sem, font, radius, shadow } from '../../theme/tokens'
import { useApp } from '../../store/app'
import { ROLE_LABELS, ORGS } from '../../data/tolbi'

export default function ProfileTab() {
  const router = useRouter()
  const { online, toggleOffline, pendingSync, lang, setLang, logout } = useApp()

  const langPill = (code: 'fr' | 'en' | 'wo', label: string) => {
    const active = lang === code
    return (
      <Pressable
        key={code}
        onPress={() => setLang(code)}
        style={{
          borderWidth: 1,
          borderColor: active ? sem.border.brand : sem.border.primary,
          backgroundColor: active ? sem.bg.brandPrimary : color.white,
          paddingVertical: 4,
          paddingHorizontal: 9,
          borderRadius: radius.full,
        }}
      >
        <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11, color: active ? color.brand[700] : sem.text.tertiary }}>{label}</Txt>
      </Pressable>
    )
  }

  const chevron = <Icon name="chevron-right" size={16} color={sem.fg.quinary} />

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: sem.bg.secondary }}
      contentContainerStyle={{ padding: 16, gap: 13 }}
      showsVerticalScrollIndicator={false}
    >
      <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 18, letterSpacing: -0.36 }}>Profil</Txt>

      {/* user card */}
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 }}>
        <View style={{ width: 48, height: 48, borderRadius: radius.full, backgroundColor: sem.bg.brandPrimary, alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 16, color: color.brand[700] }}>AB</Txt>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14.5, color: sem.text.primary }}>Amadou Ba</Txt>
          <Txt style={{ fontSize: 12, color: sem.text.quarterary }}>Coop. Kaolack · +221 77 123 45 67</Txt>
        </View>
        <Badge label={ROLE_LABELS.agent} color="brand" />
      </Card>

      {/* grouped settings */}
      <Card style={{ overflow: 'hidden' }}>
        <Row
          icon="users"
          title="Organisation"
          sub={`${ORGS[0].name} · ${ORGS.length} organisations`}
          right={chevron}
          onPress={() => router.push('/orgs')}
        />
        <Row
          icon="settings"
          title="Langue"
          right={
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {langPill('fr', 'FR')}
              {langPill('en', 'EN')}
              {langPill('wo', 'WO')}
            </View>
          }
        />
        <Row
          icon="zap"
          title="Mode hors ligne"
          sub="Simuler une coupure réseau"
          right={<Toggle checked={!online} onChange={toggleOffline} />}
        />
        <Row
          icon="download"
          title="Données locales"
          sub={`${pendingSync} collecte${pendingSync > 1 ? 's' : ''} en attente · fonds de carte téléchargés`}
          right={chevron}
        />
        <Row
          icon="alert-circle"
          title="Compatibilité de l’appareil"
          sub="Galaxy A14 · Android 13"
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Badge label="2 limites" color="warning" />
              {chevron}
            </View>
          }
        />
        <Row
          icon="book-open"
          title="Tutoriels vidéo"
          right={<Badge label="FR · Wolof" color="gray" />}
        />
        <Row
          icon="eye"
          title="Revoir l’introduction"
          right={chevron}
          onPress={() => router.replace('/')}
          last
        />
      </Card>

      {/* logout */}
      <Pressable
        onPress={() => {
          logout()
          router.replace('/')
        }}
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: pressed ? color.error[50] : color.white,
            borderWidth: 1,
            borderColor: sem.border.secondary,
            borderRadius: radius.md,
            paddingVertical: 12,
          },
          shadow.xs,
        ]}
      >
        <Icon name="log-out" size={15} color={sem.text.errorPrimary} />
        <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: sem.text.errorPrimary }}>Se déconnecter</Txt>
      </Pressable>
    </ScrollView>
  )
}

function Row({
  icon,
  title,
  sub,
  right,
  onPress,
  last,
}: {
  icon: string
  title: string
  sub?: string
  right?: ReactNode
  onPress?: () => void
  last?: boolean
}) {
  const inner = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: sem.border.tertiary,
      }}
    >
      <Icon name={icon} size={17} color={sem.fg.tertiary} />
      <View style={{ flex: 1, gap: sub ? 1 : 0 }}>
        <Txt style={{ fontFamily: font.inter.medium, fontSize: 13, color: sem.text.primary }}>{title}</Txt>
        {sub ? <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{sub}</Txt> : null}
      </View>
      {right}
    </View>
  )
  if (!onPress) return inner
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ backgroundColor: pressed ? sem.bg.primaryHover : color.white })}>
      {inner}
    </Pressable>
  )
}
