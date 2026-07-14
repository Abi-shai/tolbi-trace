import { useState, type ReactNode } from 'react'
import { View, ScrollView, Pressable, Linking } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Icon, Txt, Badge, Button, Keypad } from '../../components/ds'
import { color, sem, font, radius, shadow } from '../../theme/tokens'
import { useApp } from '../../store/app'
import { resolveIna, INA_DEMO_SCANS, type InaScan } from '../../data/ina'

const ORG = 'Coop. Kaolack'
/* Le viseur se superpose au flux caméra : blancs et noirs directs,
 * hors palette sémantique (aucun token n'est défini sur image). */
const onCam = { primary: '#fff', secondary: 'rgba(255,255,255,0.72)', scrim: 'rgba(0,0,0,0.55)' }

export default function InaScan() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { online } = useApp()
  const [permission, requestPermission] = useCameraPermissions()

  const [mode, setMode] = useState<'scan' | 'manual'>('scan')
  const [torch, setTorch] = useState(false)
  const [digits, setDigits] = useState('')
  const [result, setResult] = useState<InaScan | null>(null)

  const openFiche = (r: Extract<InaScan, { kind: 'member' }>) => {
    router.replace({
      pathname: '/module/producer',
      params: { name: r.name, init: r.init, village: r.village, ina: r.num, pending: r.pending ? '1' : '0' },
    })
  }
  const toManual = (prefill?: string) => {
    setDigits(prefill ? prefill.slice(-5) : '')
    setResult(null)
    setMode('manual')
  }
  const rescan = () => {
    setResult(null)
    setMode('scan')
  }

  /* ── MANUAL ENTRY — fallback permanent quand le scan échoue ──────── */
  if (mode === 'manual') {
    return (
      <View style={{ flex: 1, backgroundColor: sem.bg.secondary }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 12, paddingTop: insets.top + 12, backgroundColor: sem.bg.primary, borderBottomWidth: 1, borderBottomColor: sem.border.secondary }}>
          <RoundBtn icon="arrow-left" onPress={rescan} />
          <View style={{ flex: 1 }}>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14.5 }}>Saisir le numéro INA</Txt>
            <Txt style={{ fontSize: 11, color: sem.text.quarterary }}>Numéro imprimé sous le QR de la carte</Txt>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: digits.length === 5 ? sem.border.brand : sem.border.secondary, borderRadius: 14, paddingVertical: 16, ...shadow.xs }}>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 20, color: sem.text.tertiary }}>INA-SN-</Txt>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 20, letterSpacing: 3, color: digits ? sem.text.primary : sem.text.placeholder }}>
              {digits.padEnd(5, '·')}
            </Txt>
          </View>

          {!online && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <Icon name="wifi-off" size={13} color={sem.fg.tertiary} />
              <Txt style={{ fontSize: 12, color: sem.text.tertiary }}>Hors ligne · lecture sur le registre local</Txt>
            </View>
          )}

          <Keypad
            onKey={(d) => setDigits((v) => (v.length < 5 ? v + d : v))}
            onDelete={() => setDigits((v) => v.slice(0, -1))}
          />
        </ScrollView>

        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(14, insets.bottom + 6), backgroundColor: sem.bg.primary, borderTopWidth: 1, borderTopColor: sem.border.secondary }}>
          <Button label="Rechercher au registre" disabled={digits.length < 5} onPress={() => setResult(resolveIna(`INA-SN-${digits}`))} />
        </View>

        {result && (
          <ResultCard result={result} online={online} mode={mode} insets={insets} onOpen={openFiche} onManual={toManual} onRescan={rescan} onDismiss={() => setResult(null)} />
        )}
      </View>
    )
  }

  /* ── PERMISSION GATE ─────────────────────────────────────────────── */
  const gate: ReactNode =
    permission == null ? (
      <View />
    ) : permission.granted ? null : (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 32 }}>
        <View style={{ width: 56, height: 56, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
          <Icon name="camera" size={26} color={onCam.primary} />
        </View>
        <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 16, color: onCam.primary, textAlign: 'center' }}>
          {permission.canAskAgain ? 'Autoriser la caméra' : 'Caméra désactivée'}
        </Txt>
        <Txt style={{ fontSize: 13, lineHeight: 19, color: onCam.secondary, textAlign: 'center' }}>
          {permission.canAskAgain
            ? 'Le scan lit le QR de la carte INA pour ouvrir la fiche du membre. La caméra n’est utilisée que pendant le scan.'
            : 'Autorisez la caméra pour Tolbi dans les réglages du téléphone, ou saisissez le numéro imprimé sur la carte.'}
        </Txt>
        <Button
          label={permission.canAskAgain ? 'Autoriser la caméra' : 'Ouvrir les réglages'}
          onPress={permission.canAskAgain ? requestPermission : () => Linking.openSettings()}
          style={{ alignSelf: 'stretch', marginTop: 10 }}
        />
      </View>
    )

  /* ── VIEWFINDER ──────────────────────────────────────────────────── */
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {permission?.granted && (
        <CameraView
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={result ? undefined : ({ data }) => setResult(resolveIna(data))}
        />
      )}

      {/* top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingTop: insets.top + 10, paddingBottom: 12, backgroundColor: onCam.scrim }}>
        <CamBtn icon="x-close" onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14.5, color: onCam.primary }}>Scanner une INA</Txt>
          <Txt style={{ fontSize: 11, color: onCam.secondary }}>{ORG}</Txt>
        </View>
        <CamBtn icon="zap" active={torch} onPress={() => setTorch((t) => !t)} />
      </View>

      {permission != null && !permission.granted ? (
        gate
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <Frame />
          <View style={{ alignItems: 'center', gap: 8, paddingHorizontal: 40 }}>
            <Txt style={{ fontSize: 13, lineHeight: 19, color: onCam.primary, textAlign: 'center' }}>
              Cadrez le QR au dos de la carte INA du membre
            </Txt>
            {!online && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: onCam.scrim, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 }}>
                <Icon name="wifi-off" size={12} color={onCam.secondary} />
                <Txt style={{ fontSize: 11.5, color: onCam.secondary }}>Hors ligne · lecture sur le registre local</Txt>
              </View>
            )}
          </View>
        </View>
      )}

      {/* bottom controls */}
      <View style={{ gap: 12, paddingHorizontal: 16, paddingTop: 14, paddingBottom: Math.max(16, insets.bottom + 8), backgroundColor: onCam.scrim }}>
        {/* les QR du prototype sont décoratifs : chips de simulation pour la démo */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, alignItems: 'center' }}>
          <Txt style={{ fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase', color: onCam.secondary, marginRight: 4 }}>Démo</Txt>
          {INA_DEMO_SCANS.map((d) => (
            <Pressable key={d.label} onPress={() => setResult(resolveIna(d.payload))} style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 }}>
              <Txt style={{ fontFamily: font.inter.medium, fontSize: 11.5, color: onCam.primary }}>{d.label}</Txt>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable onPress={() => toManual()} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: radius.md, paddingVertical: 12 }}>
          <Icon name="edit" size={15} color={onCam.primary} />
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13.5, color: onCam.primary }}>Saisir le numéro à la place</Txt>
        </Pressable>
      </View>

      {result && (
        <ResultCard result={result} online={online} mode={mode} insets={insets} onOpen={openFiche} onManual={toManual} onRescan={rescan} onDismiss={() => setResult(null)} />
      )}
    </View>
  )
}

/* ── RESULT CARD — la résolution, jamais d'ouverture silencieuse ───── */
function ResultCard({
  result,
  online,
  mode,
  insets,
  onOpen,
  onManual,
  onRescan,
  onDismiss,
}: {
  result: InaScan
  online: boolean
  mode: 'scan' | 'manual'
  insets: { bottom: number }
  onOpen: (r: Extract<InaScan, { kind: 'member' }>) => void
  onManual: (prefill?: string) => void
  onRescan: () => void
  onDismiss: () => void
}) {
  const retryLabel = mode === 'scan' ? 'Scanner une autre carte' : 'Corriger le numéro'
  const retry = mode === 'scan' ? onRescan : onDismiss

  return (
    <View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Math.max(20, insets.bottom + 10), gap: 14 }, shadow.md]}>
      <View style={{ alignSelf: 'center', width: 36, height: 4, borderRadius: 999, backgroundColor: sem.border.secondary, marginTop: -8 }} />

      {result.kind === 'member' && (
        <>
          <ResultHeader icon="check-circle" iconColor={color.success[600]} iconBg={color.success[100]} title="Carte INA reconnue" />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: sem.border.secondary, borderRadius: 14, padding: 13 }}>
            <View style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: sem.bg.brandPrimary, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: color.brand[700] }}>{result.init}</Txt>
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14.5 }}>{result.name}</Txt>
              <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>{result.village} · {result.org} · {result.num}</Txt>
            </View>
            {result.pending && <Badge label="À synchroniser" color="warning" size="sm" />}
          </View>
          <Txt style={{ fontSize: 12, lineHeight: 17, color: sem.text.tertiary, marginTop: -4 }}>
            Vérifiez que c’est bien la personne devant vous avant d’ouvrir sa fiche.
          </Txt>
          <Button label="Ouvrir la fiche" onPress={() => onOpen(result)} />
        </>
      )}

      {result.kind === 'other-org' && (
        <>
          <ResultHeader icon="users" iconColor={color.warning[600]} iconBg={color.warning[100]} title="Membre d’une autre organisation" />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: sem.border.secondary, borderRadius: 14, padding: 13 }}>
            <View style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: color.warning[100], alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 13, color: color.warning[700] }}>{result.init}</Txt>
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14.5 }}>{result.name}</Txt>
              <Txt style={{ fontSize: 11.5, color: sem.text.quarterary }}>{result.org} · {result.region} · {result.num}</Txt>
            </View>
          </View>
          <Txt style={{ fontSize: 12, lineHeight: 17, color: sem.text.tertiary, marginTop: -4 }}>
            Son INA est valide dans tout l’écosystème TOLBI, mais ses données de production appartiennent à {result.org}.
          </Txt>
          <Button label="Demander l’accès à sa fiche" variant="secondary" onPress={() => {}} />
        </>
      )}

      {result.kind === 'unknown' && (
        <>
          <ResultHeader icon="alert-circle" iconColor={color.error[600]} iconBg={color.error[100]} title={online ? 'INA introuvable au registre' : 'Introuvable dans le registre local'} />
          <Txt style={{ fontSize: 12.5, lineHeight: 18, color: sem.text.tertiary }}>
            {online
              ? `Le numéro ${result.num} n’existe pas au registre KYF. Vérifiez le numéro imprimé sur la carte : elle peut être invalide ou révoquée.`
              : `${result.num} n’est pas dans la copie locale du registre. Cette INA existe peut-être : émise ailleurs, elle n’est pas encore synchronisée sur cet appareil. Réessayez une fois connecté.`}
          </Txt>
          <Button label="Vérifier en saisissant le numéro" variant="secondary" onPress={() => onManual(result.num)} />
        </>
      )}

      {result.kind === 'not-ina' && (
        <>
          <ResultHeader icon="alert-triangle" iconColor={color.warning[600]} iconBg={color.warning[100]} title="Ce QR n’est pas une carte INA" />
          <Txt style={{ fontSize: 12.5, lineHeight: 18, color: sem.text.tertiary }}>
            Le code scanné ne contient pas de numéro INA. Vérifiez que vous cadrez bien le QR au dos de la carte du membre.
          </Txt>
        </>
      )}

      <Pressable onPress={retry} style={{ alignItems: 'center', paddingVertical: 4 }}>
        <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13, color: color.brand[700] }}>{retryLabel}</Txt>
      </Pressable>
    </View>
  )
}

function ResultHeader({ icon, iconColor, iconBg, title }: { icon: string; iconColor: string; iconBg: string; title: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={17} color={iconColor} />
      </View>
      <Txt style={{ flex: 1, fontFamily: font.poppins.semibold, fontSize: 15 }}>{title}</Txt>
    </View>
  )
}

/* ── viewfinder frame — 4 coins blancs sur le flux caméra ───────────── */
function Frame() {
  const corner = (pos: object) => (
    <View style={{ position: 'absolute', width: 34, height: 34, borderColor: onCam.primary, ...pos }} />
  )
  return (
    <View style={{ width: 240, height: 240 }}>
      {corner({ top: 0, left: 0, borderTopWidth: 3.5, borderLeftWidth: 3.5, borderTopLeftRadius: 18 })}
      {corner({ top: 0, right: 0, borderTopWidth: 3.5, borderRightWidth: 3.5, borderTopRightRadius: 18 })}
      {corner({ bottom: 0, left: 0, borderBottomWidth: 3.5, borderLeftWidth: 3.5, borderBottomLeftRadius: 18 })}
      {corner({ bottom: 0, right: 0, borderBottomWidth: 3.5, borderRightWidth: 3.5, borderBottomRightRadius: 18 })}
    </View>
  )
}

function CamBtn({ icon, onPress, active = false }: { icon: string; onPress: () => void; active?: boolean }) {
  return (
    <Pressable onPress={onPress} style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: active ? onCam.primary : 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={16} color={active ? '#000' : onCam.primary} />
    </Pressable>
  )
}

function RoundBtn({ icon, onPress }: { icon: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: 32, height: 32, borderRadius: 999, borderWidth: 1, borderColor: sem.border.secondary, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={15} color={sem.fg.secondary} />
    </Pressable>
  )
}
