import { ScrollView, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Icon, Txt, Badge, Card, Pill } from '../../components/ds'
import { color, sem, font, radius, shadow } from '../../theme/tokens'
import { FORM_VIDEOS, FORM_DOCS } from '../../data/tolbi'

export default function FormationTab() {
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
        <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 18, letterSpacing: -0.36 }}>Formation</Txt>
        <View
          style={[
            {
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
          <Txt style={{ fontSize: 13, color: sem.text.placeholder }}>Rechercher un tutoriel…</Txt>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Pill label="Tout" active />
          <Pill label="Vidéos" />
          <Pill label="Documents" />
          <View style={{ flex: 1 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="download" size={12} color={sem.text.quarterary} />
            <Txt style={{ fontFamily: font.inter.medium, fontSize: 10.5, color: sem.text.quarterary }}>Hors ligne</Txt>
          </View>
        </View>
      </View>

      {/* content */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 16 }}>
        {/* Tutoriels vidéo */}
        <View style={{ gap: 9 }}>
          <SectionLabel>Tutoriels vidéo</SectionLabel>
          {FORM_VIDEOS.map((fv) => (
            <Card key={fv.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12 }}>
              <View style={{ width: 60, height: 46, borderRadius: radius.lg, overflow: 'hidden' }}>
                <LinearGradient
                  colors={['#0E7A44', color.brand[800]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: radius.full,
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 0,
                        height: 0,
                        marginLeft: 2,
                        borderLeftWidth: 8,
                        borderLeftColor: color.brand[700],
                        borderTopWidth: 5,
                        borderTopColor: 'transparent',
                        borderBottomWidth: 5,
                        borderBottomColor: 'transparent',
                      }}
                    />
                  </View>
                </LinearGradient>
                <View
                  style={{
                    position: 'absolute',
                    right: 4,
                    bottom: 4,
                    backgroundColor: 'rgba(16,24,40,0.72)',
                    borderRadius: 5,
                    paddingVertical: 1,
                    paddingHorizontal: 5,
                  }}
                >
                  <Txt style={{ fontFamily: font.inter.semibold, fontSize: 9, color: '#fff' }}>{fv.dur}</Txt>
                </View>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13 }}>{fv.title}</Txt>
                <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{fv.meta}</Txt>
              </View>
              <Badge label={fv.lang} color={fv.langC} size="sm" />
            </Card>
          ))}
        </View>

        {/* Documents */}
        <View style={{ gap: 9 }}>
          <SectionLabel>Documents</SectionLabel>
          {FORM_DOCS.map((fd) => (
            <Card key={fd.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 13 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: radius.lg,
                  backgroundColor: color.error[50],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="file" size={18} color={color.error[500]} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13 }}>{fd.title}</Txt>
                <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>{fd.meta}</Txt>
              </View>
              <Icon name="download" size={16} color={sem.fg.quinary} />
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Txt
      style={{
        fontFamily: font.inter.semibold,
        fontSize: 11,
        letterSpacing: 0.9,
        textTransform: 'uppercase',
        color: sem.text.quarterary,
      }}
    >
      {children}
    </Txt>
  )
}
