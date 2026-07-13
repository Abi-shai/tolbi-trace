import { useState } from 'react'
import { View, ScrollView, Pressable, Modal, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import Svg, { Polygon, Text as SvgText } from 'react-native-svg'
import { Icon, ModuleIcon, Txt, Badge } from '../../components/ds'
import { color, sem, font, radius, shadow } from '../../theme/tokens'
import {
  YIELD_PROJECTS, YIELD_PRODUCERS, FERTS, METEO, RAIN_WEEKS, SAT_DAYS,
  COLLECTE_BARS, PHENO_NAMES, PHENO_CURRENT,
} from '../../data/yield'

export default function YieldModule() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [proj, setProj] = useState<number | null>(null)
  const [prod, setProd] = useState<number | null>(null)

  const headSub =
    prod != null ? YIELD_PRODUCERS[prod].name
    : proj != null ? YIELD_PROJECTS[proj].name
    : 'Projets de rendement'

  const back = () => {
    if (prod != null) setProd(null)
    else if (proj != null) setProj(null)
    else router.back()
  }

  return (
    <View style={{ flex: 1, backgroundColor: sem.bg.secondary }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 12, paddingTop: insets.top + 12, backgroundColor: sem.bg.primary, borderBottomWidth: 1, borderBottomColor: sem.border.secondary }}>
        <RoundBtn icon="arrow-left" onPress={back} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14.5 }}>Yield · Arachide</Txt>
          <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{headSub}</Txt>
        </View>
        <RoundBtn icon="download" onPress={() => {}} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 13 }} showsVerticalScrollIndicator={false}>
        {proj == null ? (
          <ProjectList onOpen={setProj} />
        ) : prod == null ? (
          <ProducerList proj={proj} onOpen={setProd} />
        ) : (
          <ProducerDetail prod={prod} />
        )}
      </ScrollView>
    </View>
  )
}

/* ── Projects ─────────────────────────────────────────────────────── */
function ProjectList({ onOpen }: { onOpen: (i: number) => void }) {
  return (
    <>
      <FakeSearch placeholder="Rechercher un projet…" />
      <Label>Projets en cours</Label>
      {YIELD_PROJECTS.map((yj, i) => (
        <Pressable key={yj.name} onPress={() => onOpen(i)} style={[cardStyle, { padding: 15, gap: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: '#E6F0EB', alignItems: 'center', justifyContent: 'center' }}>
              <ModuleIcon module="Yield" size={28} background={false} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14 }}>{yj.name}</Txt>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ backgroundColor: sem.bg.brandPrimary, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8 }}>
                  <Txt style={{ fontFamily: font.inter.semibold, fontSize: 10, color: color.brand[700] }}>{yj.ha}</Txt>
                </View>
                <Txt style={{ fontSize: 10.5, color: sem.text.quarterary }}>{yj.nprod} producteurs</Txt>
              </View>
            </View>
            <Badge label={yj.badge} color={yj.badgeC} dot />
          </View>
          <View style={{ backgroundColor: sem.bg.secondarySubtle, borderRadius: 10, padding: 10, gap: 5 }}>
            <MiniLabel>Période de l’analyse</MiniLabel>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Icon name="calendar" size={14} color={sem.fg.tertiary} />
              <Txt style={{ fontFamily: font.inter.medium, fontSize: 12, color: sem.text.secondary }}>{yj.period}</Txt>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SubtleStat label="Culture" value={yj.culture} />
            <SubtleStat label="Rendement moyen" value={`${yj.rdt} t/ha`} />
          </View>
        </Pressable>
      ))}
    </>
  )
}

/* ── Producers ────────────────────────────────────────────────────── */
function ProducerList({ proj, onOpen }: { proj: number; onOpen: (i: number) => void }) {
  const p = YIELD_PROJECTS[proj]
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: sem.bg.brandPrimary, borderWidth: 1, borderColor: color.brand[200], borderRadius: 12, padding: 11 }}>
        <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <ModuleIcon module="Yield" size={24} background={false} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12.5, color: color.brand[800] }}>{p.name}</Txt>
          <Txt style={{ fontSize: 10.5, color: color.brand[700] }}>{p.nprod} producteurs · {p.ha}</Txt>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <BigStat value="1,24" unit="t/ha" label="Rendement moyen" />
        <BigStat value="4 520" unit="t" label="Production" />
        <BigStat value="+8 %" label="vs 2025" valueColor={color.success[600]} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}><FakeSearch placeholder="Rechercher un producteur…" /></View>
        <Pressable style={{ width: 40, height: 40, borderRadius: radius.md, borderWidth: 1, borderColor: sem.border.brand, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow.xs }}>
          <Icon name="grid" size={18} color={color.brand[700]} />
        </Pressable>
      </View>
      <FieldMapBanner title="Carte terrain" sub="Rendement t/ha · guidage GPS" />
      <Label>Producteurs suivis</Label>
      {YIELD_PRODUCERS.map((yp, i) => (
        <Pressable key={yp.name} onPress={() => onOpen(i)} style={[cardStyle, { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }]}>
          <Avatar init={yp.init} />
          <View style={{ flex: 1, gap: 1 }}>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13 }}>{yp.name}</Txt>
            <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{yp.meta}</Txt>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14 }}>{yp.rdt}<Txt style={{ fontFamily: font.inter.medium, fontSize: 10, color: sem.text.quarterary }}> t/ha</Txt></Txt>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 10.5, color: yp.up ? color.success[600] : color.warning[600] }}>{yp.delta}</Txt>
          </View>
          <Icon name="chevron-right" size={15} color={sem.fg.quinary} />
        </Pressable>
      ))}
    </>
  )
}

/* ── Producer detail ──────────────────────────────────────────────── */
function ProducerDetail({ prod }: { prod: number }) {
  const p = YIELD_PRODUCERS[prod]
  const fert = FERTS[prod]
  const [selDay, setSelDay] = useState(8)
  const [calOpen, setCalOpen] = useState(false)
  const { width: winW } = useWindowDimensions()
  const mapW = Math.min(560, winW) - 16 * 2 - 14 * 2 - 2 // page + card padding + borders

  const isSat = SAT_DAYS.includes(selDay)
  const lastSat = [...SAT_DAYS].reverse().find((d) => d <= selDay) ?? 2
  const humColor = p.hum < 25 ? color.warning[600] : p.hum < 32 ? color.warning[500] : color.brand[700]
  const soilVals = [p.hum, p.hum - 2, p.hum - 4, p.hum - 6, p.hum - 7, p.hum + 6, p.hum + 9, p.hum + 7, p.hum + 4, p.hum + 2]

  return (
    <>
      {/* producer + stade */}
      <View style={[cardStyle, { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 11 }]}>
        <Avatar init={p.init} size={36} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13 }}>{p.name}</Txt>
          <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{p.meta}</Txt>
        </View>
        <Badge label={p.stade} color="success" />
      </View>

      {/* date selector */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable onPress={() => setCalOpen(true)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: sem.border.primary, backgroundColor: '#fff', borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 13, ...shadow.xs }}>
          <Icon name="calendar" size={16} color={sem.fg.tertiary} />
          <Txt style={{ flex: 1, fontFamily: font.inter.semibold, fontSize: 13 }}>{selDay} juillet 2026</Txt>
          <Icon name="chevron-down" size={14} color={sem.fg.quinary} />
        </Pressable>
        <Badge label={isSat ? 'Passage satellite' : 'Météo & sol'} color={isSat ? 'success' : 'gray'} dot />
      </View>
      {!isSat && (
        <View style={{ flexDirection: 'row', gap: 9, backgroundColor: sem.bg.secondarySubtle, borderWidth: 1, borderColor: sem.border.tertiary, borderRadius: 12, padding: 11, marginTop: -4 }}>
          <Icon name="alert-circle" size={14} color={sem.fg.tertiary} />
          <Txt style={{ flex: 1, fontSize: 11.5, lineHeight: 17, color: sem.text.tertiary }}>
            Pas de passage satellite ce jour. Rendement et phénologie affichés au dernier passage : <Txt style={{ fontFamily: font.inter.semibold, color: sem.text.secondary }}>{lastSat} juillet</Txt>. Météo et sol : données du jour.
          </Txt>
        </View>
      )}

      {/* metrics */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={[cardStyle, { flex: 1, padding: 13, gap: 3 }]}>
          <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>Rendement estimé</Txt>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 21 }}>{p.rdt}<Txt style={{ fontFamily: font.inter.medium, fontSize: 12, color: sem.text.quarterary }}> t/ha</Txt></Txt>
          <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11.5, color: p.up ? color.success[600] : color.warning[600] }}>{p.up ? '↑' : '↓'} {p.delta} vs 2025</Txt>
        </View>
        <View style={[cardStyle, { flex: 1, padding: 13, gap: 3 }]}>
          <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>Production estimée</Txt>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 21 }}>{p.prod}<Txt style={{ fontFamily: font.inter.medium, fontSize: 12, color: sem.text.quarterary }}> t</Txt></Txt>
          <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11.5, color: sem.text.quarterary }}>Confiance modèle {p.conf}</Txt>
        </View>
      </View>

      {/* météo 14 j */}
      <View style={[cardStyle, { padding: 14, gap: 12 }]}>
        <View style={rowBetween}>
          <Txt style={h3}>Météo · {p.village}</Txt>
          <Badge label="Prévision 14 jours" color="blue" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 34, letterSpacing: -0.6 }}>31°</Txt>
          <View style={{ gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="droplets" size={13} color="#2E90FA" />
              <Txt style={{ fontSize: 12, color: sem.text.tertiary }}>Pluie aujourd’hui : <Txt style={{ fontFamily: font.inter.semibold, color: sem.text.primary }}>2,4 mm</Txt></Txt>
            </View>
            <Txt style={{ fontSize: 12, color: sem.text.tertiary }}>Vent : <Txt style={{ fontFamily: font.inter.semibold, color: sem.text.primary }}>14 km/h</Txt> · Humidité : <Txt style={{ fontFamily: font.inter.semibold, color: sem.text.primary }}>68 %</Txt></Txt>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 5 }}>
          {METEO.map((m, i) => (
            <View key={m.d} style={{ width: 44, alignItems: 'center', gap: 4, backgroundColor: i === 0 ? sem.bg.brandPrimary : sem.bg.secondarySubtle, borderWidth: 1, borderColor: i === 0 ? sem.border.brand : sem.border.tertiary, borderRadius: 10, paddingVertical: 8 }}>
              <Txt style={{ fontFamily: font.inter.semibold, fontSize: 9.5, color: sem.text.quarterary }}>{m.d}</Txt>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12.5 }}>{m.t}°</Txt>
              <View style={{ height: 26, justifyContent: 'flex-end' }}>
                <View style={{ width: 8, height: Math.max(2, Math.round(m.r * 1.6)), borderRadius: 3, backgroundColor: '#2E90FA' }} />
              </View>
              <Txt style={{ fontFamily: font.inter.medium, fontSize: 8.5, color: '#175CD3' }}>{m.r > 0 ? m.r.toFixed(1).replace('.', ',') : '—'}</Txt>
              <Txt style={{ fontFamily: font.inter.medium, fontSize: 8.5, color: sem.text.quarterary }}>{m.w}</Txt>
            </View>
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Txt style={legendTxt}>mm = pluie</Txt><Txt style={legendTxt}>km/h = vent</Txt>
          <View style={{ flex: 1 }} /><Txt style={legendTxt}>Source : TOLBI Météo</Txt>
        </View>
      </View>

      {/* pluie 6 semaines */}
      <View style={[cardStyle, { padding: 14, gap: 11 }]}>
        <View style={rowBetween}>
          <Txt style={h3}>Pluie · 6 prochaines semaines</Txt>
          <Txt style={legendTxt}>mm / semaine</Txt>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 74 }}>
          {RAIN_WEEKS.map((rw) => (
            <View key={rw.w} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
              <Txt style={{ fontFamily: font.inter.semibold, fontSize: 9.5, color: '#175CD3' }}>{rw.mm}</Txt>
              <View style={{ width: '100%', height: Math.max(4, Math.round(rw.mm * 1.05)), borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: rw.mm >= 45 ? '#175CD3' : rw.mm >= 20 ? '#2E90FA' : '#B2DDFF' }} />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {RAIN_WEEKS.map((rw) => <Txt key={rw.w} style={{ flex: 1, textAlign: 'center', fontFamily: font.inter.medium, fontSize: 9.5, color: sem.text.quarterary }}>{rw.w}</Txt>)}
        </View>
        <NoteBox>Pic de pluie attendu en S31 (52 mm) : fenêtre favorable pour les apports d’engrais avant la S31.</NoteBox>
      </View>

      {/* sol & humidité */}
      <View style={[cardStyle, { padding: 14, gap: 12 }]}>
        <View style={rowBetween}>
          <Txt style={h3}>Sol de la parcelle</Txt>
          <Badge label={p.soil} color="gray" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 26, color: humColor }}>{p.hum} %</Txt>
            <Txt style={{ fontSize: 10.5, color: sem.text.quarterary }}>Humidité du sol</Txt>
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={rowBetween}>
              <Txt style={{ fontSize: 10.5, color: sem.text.quarterary }}>Prévision 10 jours</Txt>
              <Txt style={{ fontSize: 10.5, color: sem.text.quarterary }}>seuil : 25 %</Txt>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 34 }}>
              {soilVals.map((v, i) => (
                <View key={i} style={{ flex: 1, height: Math.max(4, Math.round(v * 0.75)), borderRadius: 2, backgroundColor: v < 25 ? color.warning[500] : v < 32 ? '#FEC84B' : '#3FA96B' }} />
              ))}
            </View>
          </View>
        </View>
        {p.stress && (
          <View style={{ flexDirection: 'row', gap: 10, backgroundColor: color.warning[50], borderWidth: 1, borderColor: color.warning[200], borderRadius: 12, padding: 11 }}>
            <Icon name="alert-triangle" size={15} color={color.warning[600]} />
            <Txt style={{ flex: 1, fontSize: 12, lineHeight: 18, color: color.warning[700] }}><Txt style={{ fontFamily: font.inter.semibold }}>Alerte stress hydrique</Txt> — {p.alertTxt}</Txt>
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 10, backgroundColor: sem.bg.brandPrimary, borderWidth: 1, borderColor: color.brand[200], borderRadius: 12, padding: 11 }}>
          <Icon name="check-circle" size={15} color={sem.fg.brandPrimary} />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12, color: color.brand[800] }}>Diagnostic express</Txt>
            <Txt style={{ fontSize: 12, lineHeight: 18, color: color.brand[800] }}>{p.advice}</Txt>
          </View>
        </View>
      </View>

      {/* phénologie */}
      <View style={[cardStyle, { padding: 14, gap: 12 }]}>
        <Txt style={h3}>Phénologie de la zone</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {PHENO_NAMES.map((name, i) => {
            const done = i < PHENO_CURRENT
            const current = i === PHENO_CURRENT
            return (
              <View key={name} style={{ flex: 1, alignItems: 'center', gap: 5 }}>
                {i < PHENO_NAMES.length - 1 && (
                  <View style={{ position: 'absolute', top: 10, left: '50%', width: '100%', height: 2, backgroundColor: done ? color.brand[600] : color.gray[200] }} />
                )}
                <View style={{ width: 21, height: 21, borderRadius: 999, backgroundColor: done ? color.brand[600] : current ? '#fff' : color.gray[100], borderWidth: 2, borderColor: i <= PHENO_CURRENT ? color.brand[600] : color.gray[300], alignItems: 'center', justifyContent: 'center' }}>
                  {done && <Icon name="check" size={11} color="#fff" strokeWidth={3} />}
                </View>
                <Txt style={{ fontFamily: current ? font.inter.semibold : font.inter.medium, fontSize: 9.5, textAlign: 'center', color: current ? color.brand[700] : done ? sem.text.secondary : sem.text.quarterary }}>{name}</Txt>
              </View>
            )
          })}
        </View>
        <NoteBox>62 % des parcelles en floraison. Maturation attendue autour de la S38 (mi-septembre).</NoteBox>
      </View>

      {/* calendrier de collecte */}
      <View style={[cardStyle, { padding: 14, gap: 11 }]}>
        <View style={rowBetween}>
          <Txt style={h3}>Calendrier de collecte</Txt>
          <Txt style={legendTxt}>tonnes / semaine</Txt>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 7, height: 96 }}>
          {COLLECTE_BARS.map(([c1, c2], i) => (
            <View key={i} style={{ flex: 1, justifyContent: 'flex-end', gap: 2, height: '100%' }}>
              <View style={{ height: c1, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: color.brand[600] }} />
              {c2 > 0 && <View style={{ height: c2, borderRadius: 2, backgroundColor: color.brand[200] }} />}
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {COLLECTE_BARS.map((_, i) => <Txt key={i} style={{ flex: 1, textAlign: 'center', fontFamily: font.inter.medium, fontSize: 9.5, color: i === 0 ? color.brand[700] : sem.text.quarterary }}>S{29 + i}</Txt>)}
        </View>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <LegendDot color={color.brand[600]} label="Collectable" />
          <LegendDot color={color.brand[200]} label="Déjà collecté" />
          <View style={{ flex: 1 }} />
          <Txt style={legendTxt}>Précision : 83 %</Txt>
        </View>
      </View>

      {/* fertilisation raisonnée */}
      <View style={[cardStyle, { padding: 14, gap: 12 }]}>
        <View style={rowBetween}>
          <Txt style={h3}>Fertilisation raisonnée</Txt>
          <Badge label="Dose variable (VRT)" color="brand" />
        </View>
        <View style={{ gap: 7 }}>
          {fert.diag.map((d) => (
            <View key={d.k} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Txt style={{ width: 110, fontSize: 11.5, color: sem.text.quarterary }}>{d.k}</Txt>
              <Txt style={{ flex: 1, fontFamily: font.inter.semibold, fontSize: 11.5, color: sem.text.secondary }}>{d.v}</Txt>
              <Badge label={d.tag} color={d.tagC} />
            </View>
          ))}
        </View>
        {/* VRT prescription map */}
        <View style={{ height: 130, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: sem.border.secondary }}>
          <LinearGradient colors={['#D8E4C6', '#DCE4CB', '#D6E2C4']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ position: 'absolute', inset: 0 }} />
          <Svg width={mapW} height={130} viewBox="0 0 326 130" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
            <Polygon points="30,26 170,14 296,40 288,108 120,118 24,92" fill="none" stroke="#066938" strokeWidth={2.5} strokeLinejoin="round" />
            <Polygon points="30,26 170,14 176,64 96,92 24,92" fill={fert.zones[0][0]} opacity={0.85} />
            <Polygon points="170,14 296,40 292,74 176,64" fill={fert.zones[1][0]} opacity={0.85} />
            <Polygon points="176,64 292,74 288,108 120,118 96,92" fill={fert.zones[2][0]} opacity={0.85} />
            <SvgText x={96} y={56} fontSize={10} fontWeight="700" fill="#fff" textAnchor="middle">{fert.zones[0][1]}</SvgText>
            <SvgText x={232} y={46} fontSize={10} fontWeight="700" fill="#fff" textAnchor="middle">{fert.zones[1][1]}</SvgText>
            <SvgText x={196} y={96} fontSize={10} fontWeight="700" fill="#fff" textAnchor="middle">{fert.zones[2][1]}</SvgText>
          </Svg>
          <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, ...shadow.sm }}>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 10, color: sem.text.secondary }}>Prescription urée · kg/ha</Txt>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, columnGap: 12 }}>
          <LegendDot color="#0B6237" label="Dose forte · sol pauvre" small />
          <LegendDot color="#3FA96B" label="Dose modérée" small />
          <LegendDot color="#9BCB8B" label="Dose réduite" small />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <FertStat value={fert.npk} label="sacs NPK 15-15-15" />
          <FertStat value={fert.uree} label="sacs urée 46 %" />
          <FertStat value={`${fert.mo} t`} label="matière organique" />
        </View>
        <NoteBox>{fert.note}</NoteBox>
        <OutlineBtn icon="map" label="Carte de prescription plein écran" />
      </View>

      {/* cartes */}
      <View style={[cardStyle, { padding: 14, gap: 10 }]}>
        <View style={rowBetween}>
          <Txt style={h3}>Cartes de {p.name}</Txt>
          <Txt style={legendTxt}>{selDay} juillet 2026</Txt>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
          <MapTile label="Rendement" colors={['#0B7A42', '#7CC08F', '#0E6B3B']} />
          <MapTile label="Phénologie" colors={['#FAC720', '#3FA96B', '#2E9B5F']} />
          <MapTile label="Humidité" colors={['#0B4A8F', '#2E90FA', '#B2DDFF']} />
          <MapTile label="Type de sol" colors={['#B98A4A', '#8A6A3B', '#DCCB9C']} />
        </View>
        <OutlineBtn icon="marker-pin" label="Ouvrir avec guidage GPS" />
      </View>

      {/* xAI CTA */}
      <Pressable>
        <LinearGradient colors={[color.brand[700], color.brand[900]]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 14 }, shadow.xs]}>
          <Icon name="zap" size={17} color="#fff" />
          <View style={{ flex: 1 }}>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: '#fff' }}>Interpréter avec TOLBI xAI</Txt>
            <Txt style={{ fontSize: 11, color: color.brand[200] }}>« Pourquoi le rendement baisse-t-il à Nioro ? »</Txt>
          </View>
          <Icon name="chevron-right" size={16} color={color.brand[200]} />
        </LinearGradient>
      </Pressable>

      {/* calendar sheet */}
      <Modal visible={calOpen} transparent animationType="fade" onRequestClose={() => setCalOpen(false)}>
        <Pressable onPress={() => setCalOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(16,24,40,0.45)', justifyContent: 'flex-end' }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 34, gap: 14 }}>
            <View style={rowBetween}>
              <View>
                <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 16 }}>Calendrier des données</Txt>
                <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>Satellite : revisite tous les 6 jours · juillet 2026</Txt>
              </View>
              <RoundBtn icon="x-close" onPress={() => setCalOpen(false)} />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {Array.from({ length: 31 }, (_, k) => k + 1).map((n) => {
                const TODAY = 8, MAXF = 21
                const sat = SAT_DAYS.includes(n) && n <= TODAY
                const disabled = n > MAXF
                const selected = n === selDay
                return (
                  <View key={n} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 }}>
                    <Pressable
                      disabled={disabled}
                      onPress={() => { setSelDay(n); setCalOpen(false) }}
                      style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
                        backgroundColor: selected ? color.brand[600] : sat ? sem.bg.brandPrimary : '#fff',
                        borderColor: selected ? color.brand[600] : sat ? sem.border.brand : sem.border.tertiary }}>
                      <Txt style={{ fontFamily: selected || sat ? font.inter.semibold : font.inter.medium, fontSize: 13, color: selected ? '#fff' : disabled ? sem.text.disabled : n > TODAY ? sem.text.tertiary : sem.text.primary }}>{n}</Txt>
                      {sat && !selected && <View style={{ width: 4, height: 4, borderRadius: 999, backgroundColor: color.brand[600], marginTop: 1 }} />}
                    </Pressable>
                  </View>
                )
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <LegendDot color={color.brand[600]} label="Passage satellite" small />
              <Txt style={legendTxt}>Jours après le 21 : prévision indisponible</Txt>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

/* ── shared bits ──────────────────────────────────────────────────── */
const cardStyle = { backgroundColor: color.white, borderWidth: 1, borderColor: sem.border.secondary, borderRadius: radius['2xl'], ...shadow.xs } as const
const rowBetween = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } as const
const h3 = { fontFamily: font.poppins.semibold, fontSize: 13 } as const
const legendTxt = { fontSize: 10.5, color: sem.text.quarterary } as const

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
function MiniLabel({ children }: { children: string }) {
  return <Txt style={{ fontFamily: font.inter.semibold, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: sem.text.quarterary }}>{children}</Txt>
}
function FakeSearch({ placeholder }: { placeholder: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: sem.border.primary, borderRadius: radius.md, backgroundColor: '#fff', paddingVertical: 9, paddingHorizontal: 12, ...shadow.xs }}>
      <Icon name="search" size={15} color={sem.text.placeholder} />
      <Txt style={{ fontSize: 13, color: sem.text.placeholder }}>{placeholder}</Txt>
    </View>
  )
}
function SubtleStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: sem.bg.secondarySubtle, borderRadius: 10, padding: 10, gap: 2 }}>
      <MiniLabel>{label}</MiniLabel>
      <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5, color: sem.text.secondary }}>{value}</Txt>
    </View>
  )
}
function BigStat({ value, unit, label, valueColor }: { value: string; unit?: string; label: string; valueColor?: string }) {
  return (
    <View style={[cardStyle, { flex: 1, padding: 12, gap: 2 }]}>
      <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 16, color: valueColor ?? sem.text.primary }}>{value}{unit ? <Txt style={{ fontFamily: font.inter.medium, fontSize: 10, color: sem.text.quarterary }}> {unit}</Txt> : null}</Txt>
      <Txt style={{ fontSize: 10.5, color: sem.text.quarterary }}>{label}</Txt>
    </View>
  )
}
function FertStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: sem.bg.secondarySubtle, borderRadius: 10, padding: 10, gap: 2 }}>
      <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 15 }}>{value}</Txt>
      <Txt style={{ fontSize: 10, color: sem.text.quarterary }}>{label}</Txt>
    </View>
  )
}
function NoteBox({ children }: { children: string }) {
  return (
    <View style={{ backgroundColor: sem.bg.secondarySubtle, borderRadius: 10, padding: 10 }}>
      <Txt style={{ fontSize: 11.5, lineHeight: 17, color: sem.text.tertiary }}>{children}</Txt>
    </View>
  )
}
function LegendDot({ color: c, label, small }: { color: string; label: string; small?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: c }} />
      <Txt style={{ fontFamily: font.inter.medium, fontSize: small ? 10 : 10.5, color: sem.text.secondary }}>{label}</Txt>
    </View>
  )
}
function OutlineBtn({ icon, label }: { icon: string; label: string }) {
  return (
    <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#fff', borderWidth: 1, borderColor: sem.border.brand, borderRadius: radius.md, paddingVertical: 10, ...shadow.xs }}>
      <Icon name={icon} size={14} color={color.brand[700]} />
      <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12.5, color: color.brand[700] }}>{label}</Txt>
    </Pressable>
  )
}
function MapTile({ label, colors }: { label: string; colors: [string, string, string] }) {
  return (
    <Pressable style={{ width: '48%', flexGrow: 1, height: 82, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: sem.border.secondary }}>
      <LinearGradient colors={colors} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ position: 'absolute', inset: 0 }} />
      <View style={{ position: 'absolute', left: 9, bottom: 8, backgroundColor: 'rgba(16,24,40,0.7)', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 }}>
        <Txt style={{ fontFamily: font.inter.semibold, fontSize: 10, color: '#fff' }}>{label}</Txt>
      </View>
    </Pressable>
  )
}
function FieldMapBanner({ title, sub }: { title: string; sub: string }) {
  return (
    <Pressable style={{ height: 92, borderRadius: radius['2xl'], overflow: 'hidden', borderWidth: 1, borderColor: sem.border.secondary, ...shadow.xs }}>
      <LinearGradient colors={['#0B7A42', '#7CC08F', '#B9DCA9', '#0E6B3B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', inset: 0 }} />
      <View style={{ position: 'absolute', left: 12, bottom: 10 }}>
        <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: '#fff' }}>{title}</Txt>
        <Txt style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.85)' }}>{sub}</Txt>
      </View>
      <View style={{ position: 'absolute', right: 12, bottom: 10, width: 32, height: 32, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', ...shadow.md }}>
        <Icon name="map" size={15} color={color.brand[700]} />
      </View>
    </Pressable>
  )
}
