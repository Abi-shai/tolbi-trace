import { ScrollView, View, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Icon, Txt, Card } from '../../components/ds'
import { color, sem, font, radius, shadow } from '../../theme/tokens'
import { PRODUCERS } from '../../data/tolbi'

export default function ProducersTab() {
  const router = useRouter()

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: sem.bg.secondary }}
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* header block */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 12,
          gap: 10,
          backgroundColor: sem.bg.primary,
          borderBottomWidth: 1,
          borderBottomColor: sem.border.secondary,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 18, letterSpacing: -0.36 }}>Producteurs</Txt>
          <Txt style={{ fontSize: 12, color: sem.text.quarterary }}>128 membres · Coop. Kaolack</Txt>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View
            style={[
              {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: sem.border.primary,
                borderRadius: radius.md,
                backgroundColor: color.white,
                paddingVertical: 9,
                paddingHorizontal: 12,
              },
              shadow.xs,
            ]}
          >
            <Icon name="search" size={15} color={sem.text.placeholder} />
            <Txt style={{ fontSize: 13, color: sem.text.placeholder }}>Rechercher un producteur…</Txt>
          </View>
          <Pressable
            style={[
              {
                width: 40,
                height: 40,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: sem.border.brand,
                backgroundColor: color.white,
                alignItems: 'center',
                justifyContent: 'center',
              },
              shadow.xs,
            ]}
          >
            <Icon name="grid" size={18} color={color.brand[700]} />
          </Pressable>
        </View>
      </View>

      {/* content */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 9 }}>
        {/* Carte des parcelles banner */}
        <Pressable onPress={() => router.push('/module/gps' as never)}>
          <View
            style={[
              {
                height: 88,
                borderRadius: radius['2xl'],
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: sem.border.secondary,
              },
              shadow.xs,
            ]}
          >
            <LinearGradient
              colors={['#0B7A42', '#2E9B5F', '#7CC08F', '#B9DCA9', '#3FA96B', '#0E6B3B']}
              locations={[0, 0.2, 0.4, 0.55, 0.72, 0.9]}
              start={{ x: 0, y: 0.15 }}
              end={{ x: 1, y: 0.85 }}
              style={{ flex: 1 }}
            />
            <View style={{ position: 'absolute', left: 12, bottom: 10, gap: 1 }}>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: '#fff' }}>Carte des parcelles</Txt>
              <Txt style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.85)' }}>12 parcelles · 28,6 ha · guidage GPS</Txt>
            </View>
            <View
              style={[
                {
                  position: 'absolute',
                  right: 12,
                  bottom: 10,
                  width: 32,
                  height: 32,
                  borderRadius: radius.full,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                shadow.md,
              ]}
            >
              <Icon name="map" size={15} color={color.brand[700]} />
            </View>
          </View>
        </Pressable>

        <Txt
          style={{
            fontFamily: font.inter.semibold,
            fontSize: 11,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
            color: sem.text.quarterary,
          }}
        >
          Tous les producteurs
        </Txt>

        {PRODUCERS.map((p) => (
          <Pressable key={p.name} onPress={() => router.push('/module/producer' as never)}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 13 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: radius.full,
                  backgroundColor: sem.bg.brandPrimary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: color.brand[700] }}>{p.init}</Txt>
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13.5 }}>{p.name}</Txt>
                <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>{p.meta}</Txt>
              </View>
              <Icon name="chevron-right" size={16} color={sem.fg.quinary} />
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}
