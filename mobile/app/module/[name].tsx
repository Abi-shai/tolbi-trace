import { View, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Icon, Txt, Button } from '../../components/ds'
import { color, sem, font, radius, shadow } from '../../theme/tokens'

type ModuleMeta = {
  icon: string
  title: string
  tagline: string
  bullets: string[]
}

const MODULES: Record<string, ModuleMeta> = {
  yield: {
    icon: 'sprout',
    title: 'Yield · Crop view',
    tagline: 'Rendements, phénologie et calendrier de collecte',
    bullets: [
      'Projets de rendement par culture et par campagne',
      'Fiche producteur : rendement, stade, confiance, conseil',
      'Carte de fertilisation raisonnée (dose variable NPK / urée)',
      'Calendrier de collecte dérivé de la phénologie',
    ],
  },
  proc: {
    icon: 'package',
    title: 'Procurement · Supply chain',
    tagline: 'Traçabilité du champ au provendier',
    bullets: [
      'Chaîne d’approvisionnement en 6 étapes',
      'Suivi des lots et des écarts de sacs',
      'Réception magasin avec scan en rafale',
      'Journal d’événements horodatés',
    ],
  },
  ina: {
    icon: 'credit-card',
    title: 'ID · INA',
    tagline: 'Identité Numérique Agricole',
    bullets: [
      'Émission de carte INA avec OTP producteur',
      'Scan de carte et vérification d’identité',
      'Réservation de numéro même hors ligne',
      'Registre KYF synchronisé',
    ],
  },
  gps: {
    icon: 'map',
    title: 'Carte terrain · GPS',
    tagline: 'Guidage et couches cartographiques',
    bullets: [
      'Couches Yield, dMRV et parcelles',
      'Guidage moto / à pied vers les champs',
      'Points GPS et contours de parcelles',
      'Alertes déforestation géolocalisées',
    ],
  },
  'collecte-form': {
    icon: 'edit',
    title: 'Collecte terrain',
    tagline: 'Formulaire en 5 étapes · hors ligne',
    bullets: [
      'Producteur · Stade · Photo · GPS · Parcelle',
      'Chaque champ sauvegardé au fur et à mesure',
      'Fonctionne entièrement sans réseau',
      'File de synchronisation au retour du réseau',
    ],
  },
  dmrv: {
    icon: 'activity',
    title: 'dMRV · Carbone',
    tagline: 'Monitoring vs baseline · 5 métriques',
    bullets: [
      'Stock carbone, biomasse, couverture forestière',
      'Comparaison baseline / monitoring',
      'Suivi par producteur et par périmètre',
      'Conforme au plan de certification',
    ],
  },
  producer: {
    icon: 'user',
    title: 'Fiche producteur',
    tagline: 'Ibrahima Diop · Ndiaganiao · INA-SN-04217',
    bullets: [
      'Identité INA, parcelles et cultures',
      'Historique des opérations validées par carte',
      'Rendement et stade phénologique en cours',
      'Émission ou remise de la carte INA',
    ],
  },
}

export default function ModuleScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { name } = useLocalSearchParams<{ name: string }>()

  if (name === 'locked') return <LockedModule />

  const meta = MODULES[name ?? ''] ?? {
    icon: 'grid', title: 'Module', tagline: '', bullets: [],
  }

  return (
    <View style={{ flex: 1, backgroundColor: sem.bg.secondary }}>
      <Header title={meta.title} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
        <View style={{ alignItems: 'center', gap: 14, paddingTop: 12 }}>
          <LinearGradient colors={[color.brand[600], color.brand[800]]} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={[{ width: 84, height: 84, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }, shadow.lg]}>
            <Icon name={meta.icon} size={38} color="#fff" strokeWidth={1.8} />
          </LinearGradient>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 20, letterSpacing: -0.3 }}>{meta.title}</Txt>
            <Txt style={{ fontSize: 13, color: sem.text.tertiary, textAlign: 'center' }}>{meta.tagline}</Txt>
          </View>
        </View>

        <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: sem.border.secondary, borderRadius: radius['2xl'], padding: 16, gap: 12, ...shadow.xs }}>
          {meta.bullets.map((b, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Icon name="check-circle" size={17} color={color.brand[600]} />
              <Txt style={{ flex: 1, fontSize: 13, lineHeight: 19, color: sem.text.secondary }}>{b}</Txt>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: sem.bg.brandPrimary, borderWidth: 1, borderColor: color.brand[200], borderRadius: radius.xl, padding: 13 }}>
          <Icon name="sparkles" size={16} color={color.brand[700]} />
          <Txt style={{ flex: 1, fontSize: 12.5, lineHeight: 19, color: color.brand[800] }}>
            Écran natif en cours d’implémentation. Le parcours complet de ce module est déjà défini dans le prototype de design.
          </Txt>
        </View>

        <Button label="Compris" onPress={() => router.back()} />
        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </View>
  )
}

function LockedModule() {
  const router = useRouter()
  return (
    <View style={{ flex: 1, backgroundColor: sem.bg.secondary }}>
      <Header title="Module verrouillé" onBack={() => router.back()} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 }}>
        <View style={{ width: 68, height: 68, borderRadius: 999, backgroundColor: sem.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="lock" size={28} color={sem.fg.tertiary} />
        </View>
        <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 18, textAlign: 'center' }}>Parcelles n’est pas activé</Txt>
        <Txt style={{ fontSize: 13.5, lineHeight: 21, color: sem.text.tertiary, textAlign: 'center' }}>
          Ce module n’est pas inclus dans l’abonnement de votre organisation. Contactez votre superviseur pour l’activer depuis TOLBI OS.
        </Txt>
        <Button label="Retour" variant="secondary" onPress={() => router.back()} style={{ alignSelf: 'stretch', marginTop: 8 }} />
      </View>
    </View>
  )
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 12, paddingTop: insets.top + 12, backgroundColor: sem.bg.primary, borderBottomWidth: 1, borderBottomColor: sem.border.secondary }}>
      <Pressable onPress={onBack} style={{ width: 32, height: 32, borderRadius: 999, borderWidth: 1, borderColor: sem.border.secondary, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="arrow-left" size={15} color={sem.fg.secondary} />
      </Pressable>
      <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14.5 }}>{title}</Txt>
    </View>
  )
}
