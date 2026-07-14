import { useState } from 'react'
import { View, Pressable, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Polygon, Polyline, Text as SvgText } from 'react-native-svg'
import { Icon, Txt, Badge } from '../../components/ds'
import { color, sem, font, radius, shadow } from '../../theme/tokens'
import { FIELD_SOURCES, WPS } from '../../data/gps'

type Grad = readonly [string, string, ...string[]]

/* parcelle outlines + GPS trace + producer labels (source lines 1575-1595) */
const PARCELLES = [
  '30,38 52,32 58,48 42,56 27,50',
  '63,22 82,26 79,42 62,40',
  '10,62 30,58 36,74 16,80',
]
const TRACE = '18,76 28,62 36,47 48,38 60,34 70,28'
const LABELS: { x: number; y: number; t: string }[] = [
  { x: 42, y: 45, t: 'I. Diop' },
  { x: 71, y: 33, t: 'A. Ndiaye' },
  { x: 23, y: 70, t: 'M. Sarr' },
]

export default function GpsModule() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { width: winW, height: winH } = useWindowDimensions()

  const [source] = useState<'yield' | 'parc'>('yield')
  const [layerIdx, setLayerIdx] = useState(0)
  const [wpIdx, setWpIdx] = useState(2)

  const src = FIELD_SOURCES[source]
  const layer = src.layers[layerIdx]
  const wp = WPS[wpIdx]

  const legend = layer.legend
  const val = (source === 'yield' ? wp.yv : wp.pv) ?? '—'
  const badgeLabel = source === 'yield' ? wp.yb : wp.pb

  return (
    <View style={{ flex: 1, backgroundColor: '#101828', overflow: 'hidden' }}>
      {/* 1 · background gradient layer */}
      <LinearGradient
        colors={layer.colors as unknown as Grad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.4 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* 2 · parcelles + GPS trace */}
      <Svg
        width={winW}
        height={winH}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {PARCELLES.map((points, i) => (
          <Polygon
            key={i}
            points={points}
            fill="rgba(6,105,56,0.20)"
            stroke="#066938"
            strokeWidth={0.7}
            strokeLinejoin="round"
          />
        ))}
        <Polyline
          points={TRACE}
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={0.55}
          strokeDasharray="1.6,1.6"
        />
        {LABELS.map((l) => (
          <SvgText
            key={l.t}
            x={l.x}
            y={l.y}
            fontSize={3.2}
            fontWeight={600}
            fill="#fff"
            textAnchor="middle"
          >
            {l.t}
          </SvgText>
        ))}
      </Svg>

      {/* 3 · GPS puck */}
      <View style={{ position: 'absolute', left: (winW * wp.x) / 100, top: (winH * wp.y) / 100, width: 0, height: 0 }}>
        <View style={{ position: 'absolute', left: -22, top: -22, width: 44, height: 44, borderRadius: 999, backgroundColor: 'rgba(46,144,250,0.35)' }} />
        <View style={{ position: 'absolute', left: -9, top: -9, width: 18, height: 18, borderRadius: 999, backgroundColor: '#2E90FA', borderWidth: 3, borderColor: '#fff', ...shadow.lg }} />
      </View>

      {/* 4 · top bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 9, paddingTop: insets.top + 10, paddingHorizontal: 14, paddingBottom: 12 }}>
        <Pressable onPress={() => router.back()} style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', ...shadow.md }}>
          <Icon name="arrow-left" size={15} color={sem.fg.secondary} />
        </Pressable>
        <View style={{ backgroundColor: 'rgba(16,24,40,0.72)', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 13 }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 12, color: '#fff' }}>{layer.label}</Txt>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(16,24,40,0.72)', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 }}>
          <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: '#F79009' }} />
          <Txt style={{ fontFamily: font.inter.semibold, fontSize: 10.5, color: '#fff' }}>GPS ±15 m · mode allégé</Txt>
        </View>
      </View>

      {/* 5 · bottom controls */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'column', gap: 9, paddingHorizontal: 12, paddingBottom: insets.bottom + 12 }}>
        {/* row · walk + zoom + recenter */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Pressable onPress={() => setWpIdx((wpIdx + 1) % WPS.length)} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(16,24,40,0.72)', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 13 }}>
            <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: '#32D583' }} />
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11.5, color: '#fff' }}>Se déplacer</Txt>
          </Pressable>
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <View style={{ borderRadius: 10, overflow: 'hidden', ...shadow.md }}>
              <Pressable style={{ width: 34, height: 34, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: sem.border.secondary }}>
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 16, color: sem.fg.secondary }}>+</Txt>
              </Pressable>
              <Pressable style={{ width: 34, height: 34, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 16, color: sem.fg.secondary }}>−</Txt>
              </Pressable>
            </View>
            <Pressable onPress={() => setWpIdx(2)} style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: sem.bg.brandSolid, alignItems: 'center', justifyContent: 'center', ...shadow.lg }}>
              <Icon name="marker-pin" size={17} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* legend card */}
        <View style={{ alignSelf: 'flex-start', maxWidth: winW - 74, backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 11, gap: 6, ...shadow.md }}>
          <Txt style={{ fontFamily: font.inter.semibold, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: sem.text.quarterary }}>{legend.title}</Txt>
          {legend.type === 'ramp' ? (
            <View style={{ gap: 4 }}>
              <LinearGradient colors={legend.grad as unknown as Grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 170, height: 8, borderRadius: 4 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 9.5, color: sem.text.tertiary }}>{legend.min}</Txt>
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 9.5, color: sem.text.tertiary }}>{legend.unit}</Txt>
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 9.5, color: sem.text.tertiary }}>{legend.max}</Txt>
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, columnGap: 12 }}>
              {legend.items.map((li) => (
                <View key={li.l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: li.c, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.15)' }} />
                  <Txt style={{ fontFamily: font.inter.medium, fontSize: 10, color: sem.text.secondary }}>{li.l}</Txt>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* layer chips */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {src.layers.map((ly, i) => {
            const active = layerIdx === i
            return (
              <Pressable
                key={ly.label}
                onPress={() => setLayerIdx(i)}
                style={{ backgroundColor: active ? color.brand[700] : 'rgba(255,255,255,0.95)', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 13, ...shadow.sm }}
              >
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11.5, color: active ? '#fff' : sem.text.secondary }}>{ly.label}</Txt>
              </Pressable>
            )
          })}
        </View>

        {/* reading card */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 16, paddingVertical: 13, paddingHorizontal: 14, ...shadow.xl }}>
          <View style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: sem.bg.brandPrimary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={layer.read.icon} size={18} color={color.brand[700]} />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13, color: sem.text.primary }}>{layer.read.title}</Txt>
            <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{wp.name ? 'Dans la parcelle · GPS ±15 m' : (wp.dist ?? '')}</Txt>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 3 }}>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 17 }}>
              {val}
              {layer.read.unit ? <Txt style={{ fontFamily: font.inter.medium, fontSize: 10.5, color: sem.text.quarterary }}> {layer.read.unit}</Txt> : null}
            </Txt>
            {wp.name && badgeLabel ? <Badge label={badgeLabel} color="success" /> : null}
          </View>
        </View>

        {/* fiche producteur */}
        {wp.name ? (
          <Pressable
            onPress={() => router.push('/module/producer')}
            style={{ backgroundColor: sem.bg.brandSolid, borderWidth: 1, borderColor: sem.border.brandSolid, borderRadius: 8, paddingVertical: 11, alignItems: 'center', ...shadow.lg }}
          >
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: '#fff' }}>Ouvrir la fiche producteur</Txt>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}
