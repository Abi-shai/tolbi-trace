import { useState } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Icon, Txt, Badge, Logo } from '../components/ds'
import { QrCode } from '../components/ds/QrCode'
import { color, sem, font, radius, shadow } from '../theme/tokens'
import { useApp } from '../store/app'
import { PRODUCER_TX } from '../data/tolbi'

export default function ProducerHome() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { logout } = useApp()
  const [txSel, setTxSel] = useState<number | null>(null)
  const [qrZoom, setQrZoom] = useState(false)

  const doLogout = () => { logout(); router.replace('/') }

  return (
    <View style={{ flex: 1, backgroundColor: color.brand[800] }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, paddingTop: insets.top + 10 }}>
        <Pressable onPress={doLogout} style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="settings" size={17} color="#fff" />
        </Pressable>
        <View style={{ alignItems: 'center', gap: 1 }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14, color: '#fff', letterSpacing: -0.1 }}>Ma carte producteur</Txt>
          <Txt style={{ fontFamily: font.inter.medium, fontSize: 11, color: color.brand[200] }}>Identité numérique agricole</Txt>
        </View>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* ID card */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 18 }}>
          <LinearGradient
            colors={['#0A7A41', '#066938', '#033A1F']}
            start={{ x: 0.78, y: 0.12 }} end={{ x: 0.1, y: 1 }}
            style={{ borderRadius: 20, padding: 18, gap: 14, ...shadow.lg }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Logo variant="light" height={26} />
              <View style={{ flexDirection: 'row', gap: 5 }}>
                {[1, 0.6, 0.3].map((o, i) => (
                  <View key={i} style={{ width: 7, height: 7, backgroundColor: color.gold, transform: [{ rotate: '45deg' }], borderRadius: 1, opacity: o }} />
                ))}
              </View>
            </View>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 10.5, letterSpacing: 1.8, textTransform: 'uppercase', color: color.gold }}>Carte producteur</Txt>
            <Pressable onPress={() => setQrZoom(true)} style={{ alignSelf: 'center', backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, alignItems: 'center', gap: 9, ...shadow.md }}>
              <QrCode size={170} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="search" size={13} color={color.brand[700]} />
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11.5, color: color.brand[700] }}>Toucher pour agrandir</Txt>
              </View>
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <LinearGradient colors={['#F7D774', '#E0A020', '#C98418']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 34, height: 26, borderRadius: 6 }} />
                <View style={{ gap: 1 }}>
                  <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12, color: '#fff' }}>Ibrahima Diop</Txt>
                  <Txt style={{ fontSize: 10, color: '#B2D1C1' }}>Identité agricole · Ndiaganiao</Txt>
                </View>
              </View>
              <Txt style={{ fontFamily: font.poppins.bold, fontSize: 15, letterSpacing: 1.2, color: color.gold }}>02 850 728</Txt>
            </View>
          </LinearGradient>
        </View>

        {/* operations sheet */}
        <View style={{ flex: 1, backgroundColor: sem.bg.primary, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16, gap: 11, minHeight: 260 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: sem.text.quarterary }}>Opérations validées avec ma carte</Txt>
            <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>Juillet 2026</Txt>
          </View>
          {PRODUCER_TX.map((tx, i) => (
            <Pressable key={i} onPress={() => setTxSel(i)} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: sem.border.tertiary }}>
              <View style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: tx.iconBg, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={tx.icon} size={16} color={tx.iconC} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13 }}>{tx.title}</Txt>
                <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{tx.sub}</Txt>
              </View>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13.5, color: tx.amtC }}>{tx.amt}</Txt>
              <Icon name="chevron-right" size={15} color={sem.fg.quinary} />
            </Pressable>
          ))}
          <Txt style={{ fontSize: 11.5, lineHeight: 17, color: sem.text.quarterary, textAlign: 'center', paddingVertical: 6, paddingBottom: insets.bottom + 10 }}>
            Chaque opération a été validée par le scan de votre carte.{'\n'}Signalez toute opération inconnue à votre coopérative.
          </Txt>
        </View>
      </ScrollView>

      {/* TX DETAIL overlay */}
      {txSel != null && (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: sem.bg.secondary }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 12, paddingTop: insets.top + 12, backgroundColor: sem.bg.primary, borderBottomWidth: 1, borderBottomColor: sem.border.secondary }}>
            <Pressable onPress={() => setTxSel(null)} style={{ width: 32, height: 32, borderRadius: 999, borderWidth: 1, borderColor: sem.border.secondary, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow-left" size={15} color={sem.fg.secondary} />
            </Pressable>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14.5 }}>Détail de la transaction</Txt>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 13 }}>
            <View style={{ alignItems: 'center', gap: 9, backgroundColor: '#fff', borderWidth: 1, borderColor: sem.border.secondary, borderRadius: radius['2xl'], paddingVertical: 22, paddingHorizontal: 16, ...shadow.xs }}>
              <View style={{ width: 48, height: 48, borderRadius: 999, backgroundColor: PRODUCER_TX[txSel].iconBg, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={PRODUCER_TX[txSel].icon} size={22} color={PRODUCER_TX[txSel].iconC} />
              </View>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 15 }}>{PRODUCER_TX[txSel].title}</Txt>
              <Txt style={{ fontFamily: font.poppins.bold, fontSize: 26, letterSpacing: -0.2, color: PRODUCER_TX[txSel].amtC }}>{PRODUCER_TX[txSel].amt}</Txt>
              <Badge label="Validée par scan de votre carte" color="success" dot />
            </View>
            <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: sem.border.secondary, borderRadius: radius['2xl'], overflow: 'hidden', ...shadow.xs }}>
              {PRODUCER_TX[txSel].det.map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: i < PRODUCER_TX[txSel].det.length - 1 ? 1 : 0, borderBottomColor: sem.border.tertiary }}>
                  <Txt style={{ fontSize: 12.5, color: sem.text.quarterary }}>{row[0]}</Txt>
                  <Txt style={{ flex: 1, fontFamily: font.inter.semibold, fontSize: 12.5, textAlign: 'right' }}>{row[1]}</Txt>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: sem.bg.secondarySubtle, borderWidth: 1, borderColor: sem.border.tertiary, borderRadius: radius.xl, padding: 12 }}>
              <Icon name="lock" size={14} color={sem.fg.tertiary} />
              <Txt style={{ flex: 1, fontSize: 12, lineHeight: 18, color: sem.text.tertiary }}>Cette opération est enregistrée dans le registre de votre coopérative et ne peut pas être modifiée.</Txt>
            </View>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: sem.border.secondary, borderRadius: radius.md, paddingVertical: 12, ...shadow.xs }}>
              <Icon name="alert-triangle" size={15} color={sem.text.errorPrimary} />
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: sem.text.errorPrimary }}>Signaler un problème</Txt>
            </Pressable>
          </ScrollView>
        </View>
      )}

      {/* QR ZOOM overlay */}
      {qrZoom && (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: '#fff', alignItems: 'center', paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingTop: insets.top + 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="zap" size={13} color={sem.text.tertiary} />
              <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11.5, color: sem.text.tertiary }}>Luminosité maximale activée</Txt>
            </View>
            <Pressable onPress={() => setQrZoom(false)} style={{ width: 36, height: 36, borderRadius: 999, borderWidth: 1, borderColor: sem.border.secondary, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="x-close" size={16} color={sem.fg.secondary} />
            </Pressable>
          </View>
          <View style={{ flex: 1 }} />
          <QrCode size={280} />
          <View style={{ alignItems: 'center', gap: 4, marginTop: 22 }}>
            <Txt style={{ fontFamily: font.poppins.bold, fontSize: 22, letterSpacing: 2, color: color.brand[800] }}>02 850 728</Txt>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13, color: sem.text.secondary }}>Ibrahima Diop · Ndiaganiao</Txt>
            <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>Si le scan échoue, l’agent peut saisir ce numéro</Txt>
          </View>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => setQrZoom(false)} style={{ width: '100%', backgroundColor: '#fff', borderWidth: 1, borderColor: sem.border.primary, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', marginBottom: insets.bottom + 16, ...shadow.xs }}>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14, color: sem.fg.secondary }}>Fermer</Txt>
          </Pressable>
        </View>
      )}
    </View>
  )
}
