import { useState } from 'react'
import { useWindowDimensions, View, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import Svg, { Polygon, Circle } from 'react-native-svg'
import { Icon, Txt, Button } from '../../components/ds'
import { color, sem, font, radius, shadow } from '../../theme/tokens'
import { FORM_PRODUCERS, STADES } from '../../data/tolbi'

const PTS: [number, number][] = [
  [70, 46], [250, 34], [308, 108], [196, 172], [62, 150],
]

export default function CollecteForm() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { width: winW } = useWindowDimensions()
  const mapW = Math.min(560, winW) - 16 * 2

  const [step, setStep] = useState(0)
  const [fProd, setFProd] = useState<number | null>(null)
  const [fStade, setFStade] = useState<number | null>(null)
  const [fPhoto, setFPhoto] = useState(false)
  const [fGps, setFGps] = useState(false)
  const [fPts, setFPts] = useState(0)

  const canNext =
    step === 0 ? fProd != null
    : step === 1 ? fStade != null
    : step === 2 ? fPhoto
    : step === 3 ? fGps
    : fPts >= 3

  const nextLabel = step === 4 ? 'Enregistrer la collecte' : 'Continuer'

  const onNext = () => {
    if (!canNext) return
    if (step === 4) router.replace('/agent/collecte')
    else setStep(step + 1)
  }

  const polyStr = PTS.slice(0, fPts).map(([x, y]) => `${x},${y}`).join(' ')
  const ptsLabel = `${fPts} point${fPts > 1 ? 's' : ''} placé${fPts > 1 ? 's' : ''}`

  return (
    <View style={{ flex: 1, backgroundColor: sem.bg.secondary }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 12, paddingTop: insets.top + 12, backgroundColor: sem.bg.primary, borderBottomWidth: 1, borderBottomColor: sem.border.secondary }}>
        <Pressable onPress={() => router.back()} style={{ width: 32, height: 32, borderRadius: 999, borderWidth: 1, borderColor: sem.border.secondary, backgroundColor: color.white, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x-close" size={15} color={sem.fg.secondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14 }}>Nouvelle collecte</Txt>
          <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>Recensement Coop Kaolack</Txt>
        </View>
        <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12, color: color.brand[700] }}>Étape {step + 1}/5</Txt>
      </View>

      {/* progress bar */}
      <View style={{ height: 4, backgroundColor: sem.bg.tertiary }}>
        <View style={{ width: `${((step + 1) / 5) * 100}%`, height: '100%', backgroundColor: sem.bg.brandSolid }} />
      </View>

      {/* body */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 18, paddingHorizontal: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
        {/* Step 0 — producteur */}
        {step === 0 && (
          <>
            <StepTitle>Quel producteur enregistrez-vous ?</StepTitle>
            <View style={{ gap: 8 }}>
              {FORM_PRODUCERS.map((p, i) => {
                const sel = fProd === i
                return (
                  <Pressable
                    key={p.name}
                    onPress={() => setFProd(i)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: sel ? sem.bg.brandPrimary : color.white, borderWidth: 1, borderColor: sel ? sem.border.brand : sem.border.secondary, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 13, ...shadow.xs }}
                  >
                    <View style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: sem.bg.brandPrimary, alignItems: 'center', justifyContent: 'center' }}>
                      <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12, color: color.brand[700] }}>{p.init}</Txt>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13 }}>{p.name}</Txt>
                      <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{p.village}</Txt>
                    </View>
                    {sel && <Icon name="check-circle" size={18} color={sem.fg.brandPrimary} />}
                  </Pressable>
                )
              })}
            </View>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderStyle: 'dashed', borderColor: sem.border.primary, borderRadius: 12, paddingVertical: 11 }}>
              <Icon name="plus" size={14} color={sem.text.tertiary} />
              <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5, color: sem.text.tertiary }}>Nouveau producteur</Txt>
            </Pressable>
          </>
        )}

        {/* Step 1 — stade */}
        {step === 1 && (
          <>
            <StepTitle>Stade phénologique observé</StepTitle>
            <StepSub>Culture : arachide · Hivernale 2026</StepSub>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {STADES.map((s, i) => {
                const sel = fStade === i
                return (
                  <Pressable
                    key={s}
                    onPress={() => setFStade(i)}
                    style={{ borderWidth: 1, borderColor: sel ? color.brand[600] : sem.border.primary, backgroundColor: sel ? color.brand[600] : color.white, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 15 }}
                  >
                    <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13, color: sel ? color.white : sem.text.secondary }}>{s}</Txt>
                  </Pressable>
                )
              })}
            </View>
          </>
        )}

        {/* Step 2 — photo */}
        {step === 2 && (
          <>
            <StepTitle>Photo de la parcelle</StepTitle>
            {!fPhoto ? (
              <Pressable
                onPress={() => setFPhoto(true)}
                style={{ alignItems: 'center', justifyContent: 'center', gap: 10, height: 190, borderWidth: 1.5, borderStyle: 'dashed', borderColor: sem.border.primary, borderRadius: 16, backgroundColor: color.white }}
              >
                <Icon name="image" size={30} color={sem.fg.quarterary} />
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13, color: sem.text.tertiary }}>Prendre une photo</Txt>
                <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>Stockée sur le téléphone, envoyée à la synchronisation</Txt>
              </Pressable>
            ) : (
              <View style={{ gap: 10 }}>
                <View style={{ height: 190, borderRadius: 16, overflow: 'hidden' }}>
                  <LinearGradient colors={['#8FBF7F', '#5E9E56', '#3E7D42', '#2D5F35']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ position: 'absolute', inset: 0 }} />
                  <View style={{ position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(16,24,40,0.65)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
                    <Txt style={{ fontFamily: font.inter.medium, fontSize: 10.5, color: color.white }}>IMG_0421 · 14:32 · GPS intégré</Txt>
                  </View>
                </View>
                <Pressable onPress={() => setFPhoto(true)} style={{ alignSelf: 'flex-start' }}>
                  <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5, color: color.brand[700] }}>Reprendre la photo</Txt>
                </Pressable>
              </View>
            )}
          </>
        )}

        {/* Step 3 — GPS */}
        {step === 3 && (
          <>
            <StepTitle>Position GPS</StepTitle>
            {!fGps ? (
              <Pressable
                onPress={() => setFGps(true)}
                style={{ alignItems: 'center', justifyContent: 'center', gap: 10, height: 150, borderWidth: 1.5, borderStyle: 'dashed', borderColor: sem.border.primary, borderRadius: 16, backgroundColor: color.white }}
              >
                <Icon name="marker-pin" size={28} color={sem.fg.quarterary} />
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13, color: sem.text.tertiary }}>Capturer ma position</Txt>
                <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>Placez-vous au centre de la parcelle</Txt>
              </Pressable>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: color.success[50], borderWidth: 1, borderColor: color.success[200], borderRadius: 16, padding: 14 }}>
                <View style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: color.success[100], alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="marker-pin" size={18} color={color.success[600]} />
                </View>
                <View style={{ gap: 1 }}>
                  <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13, color: color.success[700] }}>14,7645° N · 16,4238° O</Txt>
                  <Txt style={{ fontSize: 11.5, color: color.success[600] }}>Précision ± 3 m · capturée à 14:34</Txt>
                </View>
              </View>
            )}
          </>
        )}

        {/* Step 4 — contour */}
        {step === 4 && (
          <>
            <StepTitle>Contour de la parcelle</StepTitle>
            <StepSub>Marchez le long de la limite et placez un point à chaque angle.</StepSub>
            <View style={{ height: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: sem.border.secondary }}>
              <LinearGradient colors={['#D8E4C6', '#C9DBB2', '#DCE4CB', '#CBD8B8']} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={{ position: 'absolute', inset: 0 }} />
              <Svg width={mapW} height={200} viewBox="0 0 358 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
                <Polygon points={polyStr} fill="rgba(6,105,56,0.20)" stroke="#066938" strokeWidth={2.5} strokeLinejoin="round" />
                {PTS.slice(0, fPts).map(([x, y], i) => (
                  <Circle key={i} cx={x} cy={y} r={6} fill="#fff" stroke="#066938" strokeWidth={2.5} />
                ))}
              </Svg>
              <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, ...shadow.sm }}>
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11, color: sem.text.secondary }}>{ptsLabel}</Txt>
              </View>
              {fPts >= 3 && (
                <View style={{ position: 'absolute', bottom: 10, left: 10, backgroundColor: color.brand[700], borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12, ...shadow.md }}>
                  <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11.5, color: color.white }}>Surface : 1,24 ha</Txt>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', gap: 9 }}>
              <Pressable
                onPress={() => setFPts((n) => Math.min(5, n + 1))}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: color.white, borderWidth: 1, borderColor: sem.border.brand, borderRadius: radius.md, paddingVertical: 11, ...shadow.xs }}
              >
                <Icon name="plus" size={14} color={color.brand[700]} />
                <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: color.brand[700] }}>Placer un point</Txt>
              </Pressable>
              <Pressable
                onPress={() => setFPts(0)}
                style={{ backgroundColor: color.white, borderWidth: 1, borderColor: sem.border.primary, borderRadius: radius.md, paddingVertical: 11, paddingHorizontal: 14, ...shadow.xs }}
              >
                <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: sem.fg.tertiary }}>Effacer</Txt>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      {/* footer */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 14, backgroundColor: sem.bg.primary, borderTopWidth: 1, borderTopColor: sem.border.secondary }}>
        {step > 0 && (
          <Button label="Retour" variant="secondary" onPress={() => setStep(step - 1)} />
        )}
        <Button label={nextLabel} onPress={onNext} disabled={!canNext} style={{ flex: 1 }} />
      </View>
    </View>
  )
}

/* ── shared bits ──────────────────────────────────────────────────── */
function StepTitle({ children }: { children: string }) {
  return <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 16, letterSpacing: -0.16 }}>{children}</Txt>
}
function StepSub({ children }: { children: string }) {
  return <Txt style={{ fontSize: 12.5, color: sem.text.tertiary, marginTop: -6 }}>{children}</Txt>
}
