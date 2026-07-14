import { useState, type ReactNode } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Icon, ModuleIcon, Txt, Badge, Button, PinInput } from '../../components/ds'
import { QrCode } from '../../components/ds/QrCode'
import { color, sem, font, radius, shadow } from '../../theme/tokens'
import { INA_STATS, INA_CANDS, INA_RECENT, INA_OTP, INA_NEW_NUMBER } from '../../data/ina'

const ORG = 'Coop. Kaolack'

export default function InaModule() {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [view, setView] = useState<'hub' | 'emit'>('hub')
  const [inaStep, setInaStep] = useState(0)
  const [inaSel, setInaSel] = useState<number | null>(null)
  const [inaCard, setInaCard] = useState<string | null>(null)
  const [otp, setOtp] = useState('')

  const resetWizard = () => {
    setInaStep(0)
    setInaSel(null)
    setInaCard(null)
    setOtp('')
  }

  /* ── HUB ──────────────────────────────────────────────────────────── */
  if (view === 'hub') {
    return (
      <View style={{ flex: 1, backgroundColor: sem.bg.secondary }}>
        {/* header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 12, paddingTop: insets.top + 12, backgroundColor: sem.bg.primary, borderBottomWidth: 1, borderBottomColor: sem.border.secondary }}>
          <RoundBtn icon="arrow-left" onPress={() => router.back()} />
          <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: sem.bg.brandPrimary, alignItems: 'center', justifyContent: 'center' }}>
            <ModuleIcon module="ID" size={24} background={false} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14.5 }}>ID · Identité numérique agricole</Txt>
            <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{ORG}</Txt>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 14, paddingBottom: insets.bottom + 24, gap: 13 }} showsVerticalScrollIndicator={false}>
          {/* stat cards */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard value={String(INA_STATS.members)} label="Membres" />
            <StatCard value={String(INA_STATS.withIna)} label="Avec INA" valueColor={color.brand[700]} />
            <StatCard value={String(INA_STATS.withoutIna)} label="Sans INA" valueColor={color.warning[600]} />
          </View>

          {/* coverage */}
          <View style={{ gap: 5 }}>
            <View style={rowBetween}>
              <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>Couverture INA</Txt>
              <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>{INA_STATS.coverage} %</Txt>
            </View>
            <View style={{ height: 7, borderRadius: 999, backgroundColor: sem.bg.tertiary, overflow: 'hidden' }}>
              <View style={{ width: `${INA_STATS.coverage}%`, height: '100%', borderRadius: 999, backgroundColor: sem.bg.brandSolid }} />
            </View>
          </View>

          {/* action cards */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable style={{ flex: 1 }} onPress={() => { resetWizard(); setView('emit') }}>
              <LinearGradient colors={[color.brand[600], color.brand[800]]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={[{ borderRadius: 16, padding: 14, gap: 8 }, shadow.xs]}>
                <Icon name="plus-circle" size={22} color="#fff" />
                <View style={{ gap: 2 }}>
                  <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: '#fff' }}>Émettre une INA</Txt>
                  <Txt style={{ fontFamily: font.inter.medium, fontSize: 11, color: color.brand[200] }}>Validation OTP du producteur</Txt>
                </View>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => router.push('/module/ina-scan')} style={[cardStyle, { flex: 1, borderRadius: 16, padding: 14, gap: 8 }]}>
              <Icon name="grid" size={22} color={color.brand[700]} />
              <View style={{ gap: 2 }}>
                <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13 }}>Scanner une INA</Txt>
                <Txt style={{ fontFamily: font.inter.medium, fontSize: 11, color: sem.text.quarterary }}>Ouvre la fiche du membre</Txt>
              </View>
            </Pressable>
          </View>

          {/* recent */}
          <Label>Émissions récentes</Label>
          <View style={[cardStyle, { borderRadius: 16, overflow: 'hidden' }]}>
            {INA_RECENT.map((r, i) => (
              <View key={r.num} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: i < INA_RECENT.length - 1 ? 1 : 0, borderBottomColor: sem.border.tertiary }}>
                <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: sem.bg.brandPrimary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="grid" size={15} color={color.brand[700]} />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5 }}>{r.num}</Txt>
                  <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{r.who}</Txt>
                </View>
                <Badge label={r.status} color={r.statusColor} size="sm" />
              </View>
            ))}
          </View>

          <Note icon="download" tone="subtle">
            Hors ligne, les numéros sont réservés dans la plage attribuée à {ORG} puis synchronisés vers le registre KYF.
          </Note>
        </ScrollView>
      </View>
    )
  }

  /* ── EMIT WIZARD ──────────────────────────────────────────────────── */
  const name = inaSel != null ? INA_CANDS[inaSel].name : ''
  const nextEnabled =
    inaStep === 0 ? inaSel != null
    : inaStep === 1 ? inaCard != null
    : inaStep === 2 ? otp.length >= 4
    : true
  const nextLabel = inaStep === 2 ? 'Valider et émettre' : inaStep === 3 ? 'Terminer' : 'Continuer'
  const onNext = () => {
    if (inaStep < 3) setInaStep(inaStep + 1)
    else { setView('hub'); resetWizard() }
  }

  return (
    <View style={{ flex: 1, backgroundColor: sem.bg.secondary }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 12, paddingTop: insets.top + 12, backgroundColor: sem.bg.primary, borderBottomWidth: 1, borderBottomColor: sem.border.secondary }}>
        <RoundBtn icon="x-close" onPress={() => setView('hub')} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14.5 }}>Émettre une INA</Txt>
          <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>Identité numérique agricole · numéro unique + QR code</Txt>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 20, gap: 12 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* STEP 0 */}
        {inaStep === 0 && (
          <>
            <StepTitle>Pour quel membre ?</StepTitle>
            <StepSub>Membres de {ORG} sans identité INA.</StepSub>
            <View style={{ gap: 8 }}>
              {INA_CANDS.map((ic, i) => {
                const sel = inaSel === i
                return (
                  <Pressable key={ic.name} onPress={() => setInaSel(i)} style={[{ flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 13, borderWidth: 1, backgroundColor: sel ? sem.bg.brandPrimary : color.white, borderColor: sel ? sem.border.brand : sem.border.secondary }, shadow.xs]}>
                    <View style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: sem.bg.brandPrimary, alignItems: 'center', justifyContent: 'center' }}>
                      <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12, color: color.brand[700] }}>{ic.init}</Txt>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13 }}>{ic.name}</Txt>
                      <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{ic.village}</Txt>
                    </View>
                    <Badge label="Sans INA" color="warning" size="sm" />
                    {sel && <Icon name="check-circle" size={18} color={sem.fg.brandPrimary} />}
                  </Pressable>
                )
              })}
            </View>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderStyle: 'dashed', borderColor: sem.border.primary, borderRadius: 12, paddingVertical: 11 }}>
              <Icon name="plus" size={14} color={sem.text.tertiary} />
              <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5, color: sem.text.tertiary }}>Enregistrer un nouveau membre</Txt>
            </Pressable>
            <Note icon="help-circle" tone="brand">
              L’INA est unique, gratuite et valable dans tout l’écosystème TOLBI : elle relie le membre à ses parcelles, collectes et sacs tracés.
            </Note>
          </>
        )}

        {/* STEP 1 */}
        {inaStep === 1 && (
          <>
            <StepTitle>Carte INA à attribuer</StepTitle>
            <StepSub>Scannez le QR de la carte physique remise à {name}, ou saisissez le numéro imprimé dessus. C’est ce numéro qui devient son identité — il n’est pas attribué automatiquement.</StepSub>

            {inaCard == null ? (
              <>
                <Pressable onPress={() => setInaCard(INA_NEW_NUMBER)} style={{ alignItems: 'center', justifyContent: 'center', gap: 9, height: 172, borderWidth: 1.5, borderStyle: 'dashed', borderColor: sem.border.brand, borderRadius: 16, backgroundColor: sem.bg.brandPrimary }}>
                  <View style={[{ width: 46, height: 46, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }, shadow.sm]}>
                    <Icon name="grid" size={24} color={color.brand[700]} />
                  </View>
                  <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13.5, color: color.brand[800] }}>Scanner la carte INA</Txt>
                  <Txt style={{ fontSize: 11.5, color: color.brand[700] }}>Cadrez le QR code au dos de la carte vierge</Txt>
                </Pressable>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: sem.border.secondary }} />
                  <Txt style={{ fontSize: 12, color: sem.text.quarterary }}>ou saisir le numéro</Txt>
                  <View style={{ flex: 1, height: 1, backgroundColor: sem.border.secondary }} />
                </View>

                <View style={{ gap: 6 }}>
                  <Txt style={{ fontFamily: font.inter.medium, fontSize: 13, color: sem.text.secondary }}>Numéro imprimé sur la carte</Txt>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: sem.border.primary, borderRadius: 8, backgroundColor: '#fff', paddingVertical: 11, paddingHorizontal: 14 }, shadow.xs]}>
                      <Txt style={{ fontFamily: font.inter.medium, fontSize: 14, color: sem.text.tertiary, borderRightWidth: 1, borderRightColor: sem.border.secondary, paddingRight: 8 }}>INA-SN-</Txt>
                      <Txt style={{ fontSize: 14, color: sem.text.placeholder }}>04XXX</Txt>
                    </View>
                    <Pressable onPress={() => setInaCard(INA_NEW_NUMBER)} style={[{ justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: sem.border.brand, borderRadius: 8, paddingHorizontal: 16 }, shadow.xs]}>
                      <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12.5, color: color.brand[700] }}>Valider</Txt>
                    </Pressable>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: color.success[200], borderRadius: 16, padding: 15 }, shadow.xs]}>
                  <View style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: color.success[100], alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check-circle" size={22} color={color.success[600]} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 15 }}>{inaCard}</Txt>
                    <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>Scan QR · carte à attribuer à {name}</Txt>
                  </View>
                  <Pressable onPress={() => setInaCard(null)}>
                    <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5, color: color.brand[700] }}>Modifier</Txt>
                  </Pressable>
                </View>
                <Note icon="help-circle" tone="brand">
                  Vérifiez que ce numéro correspond bien à la carte physique que vous remettez au producteur.
                </Note>
              </>
            )}
          </>
        )}

        {/* STEP 2 */}
        {inaStep === 2 && (
          <>
            <StepTitle>Validation par le producteur</StepTitle>
            <StepSub>Un code a été envoyé par SMS au numéro de {name}. Le producteur vous le dicte : c’est son consentement.</StepSub>

            <View style={[{ backgroundColor: '#fff', borderWidth: 1, borderColor: sem.border.secondary, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14 }, shadow.xs]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                <View style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: sem.bg.brandPrimary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="user" size={16} color={color.brand[700]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13 }}>+221 78 902 44 31</Txt>
                  <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>Numéro de {name}</Txt>
                </View>
                <Pressable>
                  <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12, color: color.brand[700] }}>Modifier</Txt>
                </Pressable>
              </View>
            </View>

            <View style={{ gap: 9 }}>
              <Txt style={{ fontFamily: font.inter.medium, fontSize: 13, color: sem.text.secondary }}>Code reçu par le producteur</Txt>
              <PinInput value={otp} onChange={setOtp} autoFocus />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Txt style={{ fontSize: 12, color: sem.text.tertiary }}>Pas de code reçu ?</Txt>
                <Pressable>
                  <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12, color: color.brand[700] }}>Renvoyer le code</Txt>
                </Pressable>
              </View>
            </View>

            <Note icon="lock" tone="subtle">
              Sans réseau chez le producteur, un agent superviseur peut valider en présence du membre (mode témoin), tracé dans le registre.
            </Note>
          </>
        )}

        {/* STEP 3 */}
        {inaStep === 3 && (
          <>
            <View style={{ alignItems: 'center', gap: 8, paddingTop: 6, paddingBottom: 2 }}>
              <View style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: color.success[100], alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check-circle" size={22} color={color.success[600]} />
              </View>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 15 }}>INA émise pour {name}</Txt>
            </View>

            <LinearGradient colors={[color.brand[700], color.brand[900]]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 15 }, shadow.md]}>
              <View style={{ width: 64, height: 64, borderRadius: 10, backgroundColor: '#fff', padding: 6, alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={52} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase', color: color.brand[200] }}>Identité numérique agricole</Txt>
                <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 17, color: '#fff' }}>{INA_NEW_NUMBER}</Txt>
                <Txt style={{ fontSize: 11, color: color.brand[200] }}>{name} · émise le 7 juillet 2026 · {ORG}</Txt>
              </View>
            </LinearGradient>

            <Note icon="download" tone="subtle">
              Émise hors ligne : le numéro est réservé dans la plage attribuée à votre organisation, puis synchronisé vers le registre KYF.
            </Note>
          </>
        )}
      </ScrollView>

      {/* footer */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(14, insets.bottom + 6), backgroundColor: sem.bg.primary, borderTopWidth: 1, borderTopColor: sem.border.secondary }}>
        <Button label={nextLabel} disabled={!nextEnabled} onPress={onNext} style={{ flex: 1 }} />
      </View>
    </View>
  )
}

/* ── shared bits ──────────────────────────────────────────────────── */
const cardStyle = { backgroundColor: color.white, borderWidth: 1, borderColor: sem.border.secondary, borderRadius: radius['2xl'], ...shadow.xs } as const
const rowBetween = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } as const

function RoundBtn({ icon, onPress }: { icon: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: 32, height: 32, borderRadius: 999, borderWidth: 1, borderColor: sem.border.secondary, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={15} color={sem.fg.secondary} />
    </Pressable>
  )
}

function StatCard({ value, label, valueColor }: { value: string; label: string; valueColor?: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: sem.border.secondary, borderRadius: 14, padding: 12, gap: 2, ...shadow.xs }}>
      <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 17, color: valueColor ?? sem.text.primary }}>{value}</Txt>
      <Txt style={{ fontSize: 10.5, color: sem.text.quarterary }}>{label}</Txt>
    </View>
  )
}

function Label({ children }: { children: string }) {
  return <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: sem.text.quarterary }}>{children}</Txt>
}

function StepTitle({ children }: { children: string }) {
  return <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 15, letterSpacing: -0.15 }}>{children}</Txt>
}

function StepSub({ children }: { children: ReactNode }) {
  return <Txt style={{ fontSize: 12.5, lineHeight: 18, color: sem.text.tertiary, marginTop: -6 }}>{children}</Txt>
}

function Note({ icon, tone, children }: { icon: string; tone: 'subtle' | 'brand'; children: ReactNode }) {
  const brand = tone === 'brand'
  return (
    <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: brand ? sem.bg.brandPrimary : sem.bg.secondarySubtle, borderWidth: 1, borderColor: brand ? color.brand[200] : sem.border.tertiary, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 13 }}>
      <View style={{ marginTop: 1 }}>
        <Icon name={icon} size={brand ? 15 : 14} color={brand ? sem.fg.brandPrimary : sem.fg.tertiary} />
      </View>
      <Txt style={{ flex: 1, fontSize: 12, lineHeight: 18, color: brand ? color.brand[800] : sem.text.tertiary }}>{children}</Txt>
    </View>
  )
}
