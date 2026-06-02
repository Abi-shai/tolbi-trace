import { useState, useRef, useCallback, useEffect } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Vibration, Animated, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { CheckCircle2, AlertTriangle, X, CheckSquare } from 'lucide-react-native'
import { colors, radius, fontSize, fonts } from '../../../lib/tokens'
import { AppHeader } from '../../../components/ui/AppHeader'
import { markTaskDone } from '../../../lib/stepState'
import { consumePendingAnomaly } from '../../../lib/anomalyQueue'
import { PressableScale } from '../../../components/ui/PressableScale'

const EXPECTED = 12
const STEP_NAME = 'Réception entrepôt'
const PROCESS_NAME = 'Collecte maïs — Campagne nov. 2025'

type BagStatus = 'ok' | 'anomaly'
interface ScannedBag {
  id: string
  code: string
  status: BagStatus
  scannedAt: string
  anomalyLabel?: string
}

interface BagRowProps {
  bag: ScannedBag
  onFlag: () => void
  onRemove: () => void
}

function AnimatedBagRow({ bag, onFlag, onRemove }: BagRowProps) {
  const anim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 5 }).start()
  }, [])
  const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] })
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: ty }], marginBottom: 6 }}>
      <View style={[s.bagRow, bag.status === 'anomaly' && s.bagRowAnomaly]}>
        <View style={[s.bagIcon, { backgroundColor: bag.status === 'ok' ? `${colors.statusCompleted}18` : `${colors.statusAnomaly}18` }]}>
          {bag.status === 'ok'
            ? <CheckCircle2 size={16} color={colors.statusCompleted} />
            : <AlertTriangle size={16} color={colors.statusAnomaly} />
          }
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.bagCode}>{bag.code}</Text>
          {bag.anomalyLabel
            ? <Text style={s.bagAnomaly}>{bag.anomalyLabel}</Text>
            : <Text style={s.bagTime}>{bag.scannedAt}</Text>
          }
        </View>
        <TouchableOpacity
          style={s.bagAction}
          onPress={bag.status === 'anomaly' ? undefined : onFlag}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          disabled={bag.status === 'anomaly'}
        >
          <AlertTriangle size={16} color={bag.status === 'anomaly' ? colors.statusAnomaly : colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ padding: 8 }}>
          <X size={14} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

export default function ScanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState<ScannedBag[]>([])
  const [scanning, setScanning] = useState(true)
  const flashAnim = useRef(new Animated.Value(0)).current
  const cooldownRef = useRef(false)
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  // Anomaly confirmation toast
  const [toastMsg, setToastMsg] = useState('')
  const toastAnim = useRef(new Animated.Value(0)).current

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToastMsg(''))
  }, [toastAnim])

  // Manual entry
  const [manualMode, setManualMode] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [manualError, setManualError] = useState('')
  const manualInputRef = useRef<TextInput>(null)

  useFocusEffect(
    useCallback(() => {
      const result = consumePendingAnomaly()
      if (!result) return
      setScanned((prev) =>
        prev.map((b) =>
          b.id === result.bagId
            ? { ...b, status: 'anomaly', anomalyLabel: result.categoryLabel }
            : b
        )
      )
      showToast(`Anomalie enregistrée · ${result.categoryLabel}`)
    }, [showToast])
  )

  const flashFeedback = useCallback(() => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start()
  }, [flashAnim])

  const addBag = useCallback((code: string) => {
    const bag: ScannedBag = {
      id: String(Date.now()),
      code,
      status: 'ok',
      scannedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }
    setScanned((prev) => [bag, ...prev])
  }, [])

  const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
    if (cooldownRef.current) return
    if (scanned.some((b) => b.code === data)) return

    cooldownRef.current = true
    Vibration.vibrate(60)
    flashFeedback()
    addBag(data)
    setTimeout(() => { cooldownRef.current = false }, 1200)
  }, [scanned, flashFeedback, addBag])

  const flagAnomaly = (bag: ScannedBag) => {
    if (bag.status === 'anomaly') return
    router.push(`/step/${id}/anomaly?bagId=${bag.id}&bagCode=${encodeURIComponent(bag.code)}`)
  }

  const removeItem = (bagId: string) => {
    setScanned((prev) => prev.filter((b) => b.id !== bagId))
  }

  // Manual entry handlers
  const openManual = () => {
    setManualMode(true)
    setManualCode('')
    setManualError('')
    setTimeout(() => manualInputRef.current?.focus(), 80)
  }

  const closeManual = () => {
    setManualMode(false)
    setManualCode('')
    setManualError('')
  }

  const confirmManual = () => {
    const code = manualCode.trim().toUpperCase()
    if (!code) return
    if (scanned.some((b) => b.code === code)) {
      setManualError('Ce code est déjà dans la liste')
      return
    }
    Vibration.vibrate(40)
    addBag(code)
    setManualCode('')
    setManualError('')
  }

  const validated = scanned.filter((b) => b.status === 'ok').length
  const anomalies = scanned.filter((b) => b.status === 'anomaly').length

  if (!permission) return <View style={s.screen} />

  if (!permission.granted) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <AppHeader
          title="Scanner les QR codes"
          onBack={() => router.back()}
        />
        <View style={s.permissionBox}>
          <Text style={s.permissionTitle}>Accès à la caméra requis</Text>
          <Text style={s.permissionSub}>
            Autorise l'accès à la caméra pour scanner les QR codes des sacs.
          </Text>
          <TouchableOpacity style={s.permBtn} onPress={requestPermission}>
            <Text style={s.permBtnText}>Autoriser la caméra</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <AppHeader
        title={STEP_NAME}
        subtitle={PROCESS_NAME}
        onBack={() => router.back()}
        right={
          <View style={s.counter}>
            <Text style={s.counterText}>{scanned.length}/{EXPECTED}</Text>
            <Text style={s.counterLabel}>sacs</Text>
          </View>
        }
      />

      {/* Camera */}
      <View style={s.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'ean13'] }}
        />
        <Animated.View style={[StyleSheet.absoluteFill, s.flashOverlay, { opacity: flashAnim }]} />
        <Animated.View style={[s.targetFrame, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[s.corner, s.tl]} />
          <View style={[s.corner, s.tr]} />
          <View style={[s.corner, s.bl]} />
          <View style={[s.corner, s.br]} />
        </Animated.View>
        <Text style={s.cameraHint}>Pointe vers un QR code</Text>
        <TouchableOpacity style={s.pauseBtn} onPress={() => setScanning((v) => !v)}>
          <Text style={s.pauseBtnText}>{scanning ? 'Pause' : '▶ Reprendre'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Manual entry bar */}
        <View style={s.manualBar}>
          {!manualMode ? (
            <TouchableOpacity onPress={openManual} hitSlop={12}>
              <Text style={s.manualTrigger}>QR illisible ? Saisir le code manuellement</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.manualRow}>
              <TextInput
                ref={manualInputRef}
                style={[s.manualInput, manualError ? s.manualInputError : null]}
                value={manualCode}
                onChangeText={(v) => { setManualCode(v); setManualError('') }}
                placeholder="Ex : KLK-2025-042"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={confirmManual}
              />
              <TouchableOpacity
                style={[s.manualAddBtn, !manualCode.trim() && s.manualAddBtnDisabled]}
                onPress={confirmManual}
                disabled={!manualCode.trim()}
              >
                <Text style={s.manualAddBtnText}>Ajouter</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeManual} hitSlop={12} style={{ padding: 4 }}>
                <X size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}
          {!!manualError && <Text style={s.manualError}>{manualError}</Text>}
        </View>

        {/* Scanned list */}
        {scanned.length > 0 && (
          <View style={s.listSection}>
            <View style={s.listHeader}>
              <Text style={s.listTitle}>
                {scanned.length} sac{scanned.length > 1 ? 's' : ''} enregistré{scanned.length > 1 ? 's' : ''}
                {anomalies > 0 ? ` · ${anomalies} anomalie${anomalies > 1 ? 's' : ''}` : ''}
              </Text>
            </View>
            <ScrollView style={s.list} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {scanned.map((bag) => (
                <AnimatedBagRow
                  key={bag.id}
                  bag={bag}
                  onFlag={() => flagAnomaly(bag)}
                  onRemove={() => removeItem(bag.id)}
                />
              ))}
              <View style={{ height: 8 }} />
            </ScrollView>
          </View>
        )}

        {/* Anomaly confirmation toast */}
        {!!toastMsg && (
          <Animated.View style={[s.toast, { opacity: toastAnim }]}>
            <AlertTriangle size={13} color={colors.statusAnomaly} />
            <Text style={s.toastText}>{toastMsg}</Text>
          </Animated.View>
        )}

        {/* Validate button */}
        <View style={s.footer}>
          <PressableScale
            style={[s.validateBtn, validated === 0 && s.validateBtnDisabled]}
            disabled={validated === 0}
            onPress={() => {
              markTaskDone(id, 'scan', { validated, anomalies })
              router.back()
            }}
          >
            <CheckSquare size={18} color={colors.white} />
            <Text style={s.validateBtnText}>
              Valider{validated > 0 ? ` (${validated}/${EXPECTED} sacs)` : ''}
            </Text>
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const CORNER = 22
const BORDER = 3

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  counter: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.textPrimary },
  counterLabel: { fontFamily: fonts.regular, fontSize: 9, color: colors.textTertiary, marginTop: -2 },

  cameraWrap: { height: 260, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  flashOverlay: { backgroundColor: '#fff', zIndex: 10 },
  targetFrame: { width: 190, height: 190, position: 'relative' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: colors.white },
  tl: { top: 0, left: 0, borderTopWidth: BORDER, borderLeftWidth: BORDER, borderTopLeftRadius: 4 },
  tr: { top: 0, right: 0, borderTopWidth: BORDER, borderRightWidth: BORDER, borderTopRightRadius: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: BORDER, borderLeftWidth: BORDER, borderBottomLeftRadius: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER, borderBottomRightRadius: 4 },
  cameraHint: { position: 'absolute', bottom: 12, fontFamily: fonts.regular, fontSize: fontSize.xs, color: 'rgba(255,255,255,0.8)' },
  pauseBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 10 },
  pauseBtnText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.white },

  // Manual entry
  manualBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 4,
  },
  manualTrigger: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manualInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  manualInputError: {
    borderColor: colors.statusAnomaly,
  },
  manualAddBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  manualAddBtnDisabled: { opacity: 0.4 },
  manualAddBtnText: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.white },
  manualError: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.statusAnomaly,
  },

  listSection: { flex: 1, backgroundColor: colors.surface },
  listHeader: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  listTitle: { fontFamily: fonts.semibold, fontSize: 11, color: colors.textTertiary, letterSpacing: 0.6, textTransform: 'uppercase' },
  list: { flex: 1, paddingHorizontal: 12 },
  bagRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.white, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  bagRowAnomaly: {
    borderColor: `${colors.statusAnomaly}35`,
    backgroundColor: `${colors.statusAnomaly}04`,
  },
  bagIcon: { width: 32, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  bagCode: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.textPrimary },
  bagTime: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  bagAnomaly: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.statusAnomaly, marginTop: 1 },
  bagAction: { padding: 8 },

  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${colors.statusAnomaly}12`,
    borderTopWidth: 1,
    borderTopColor: `${colors.statusAnomaly}25`,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  toastText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.statusAnomaly, flex: 1 },

  footer: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, borderTopWidth: 1, borderTopColor: colors.border },
  validateBtn: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  validateBtnDisabled: { opacity: 0.4 },
  validateBtnText: { fontFamily: fonts.semibold, fontSize: fontSize.md, color: colors.white },

  permissionBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  permissionTitle: { fontFamily: fonts.semibold, fontSize: fontSize.lg, color: colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  permissionSub: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textTertiary, textAlign: 'center', marginBottom: 24 },
  permBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingHorizontal: 24, paddingVertical: 13 },
  permBtnText: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.white },
})
