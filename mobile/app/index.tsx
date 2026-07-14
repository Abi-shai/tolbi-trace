import { useEffect, useRef, useState } from 'react'
import {
  View, ScrollView, Pressable, Animated, Easing, Platform, Vibration,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Icon, Txt, Button, Logo, PinInput, Keypad, Badge } from '../components/ds'
import { color, sem, font, radius, shadow } from '../theme/tokens'
import { useApp } from '../store/app'
import { SLIDES, ORGS, ROLE_LABELS, AGENT } from '../data/tolbi'

type Phase =
  | 'welcome' | 'who'
  /* activation agent (première connexion) */
  | 'agPhone' | 'agOtp' | 'agWelcome' | 'agCreate' | 'agConfirm' | 'agDone'
  /* connexions récurrentes */
  | 'pin' | 'login' | 'prOtp' | 'loginAccount'
  | 'diag'

const OTP_LEN = 6
const PIN_TRIES = 3
const LOCK_SECS = 30
const RESEND_SECS = 30

/** 0000, 1234, 4321, 1212… — un code qu'un collègue devine en deux essais. */
function isWeakPin(code: string) {
  if (/^(\d)\1{3}$/.test(code)) return true
  if ('0123456789'.includes(code) || '9876543210'.includes(code)) return true
  if (code[0] === code[2] && code[1] === code[3]) return true
  return false
}

const buzz = () => { if (Platform.OS !== 'web') Vibration.vibrate(60) }
const mmss = (s: number) => `0:${String(s).padStart(2, '0')}`

export default function Onboarding() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { login, setLang, lang, agentActivated, setAgentActivated, agentCode, setAgentCode } = useApp()

  const [phase, setPhase] = useState<Phase>('welcome')
  const [slide, setSlide] = useState(0)
  const [pin, setPin] = useState('')
  const [otp, setOtp] = useState('')
  const [newCode, setNewCode] = useState('')
  const [confirmCode, setConfirmCode] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [diagBusy, setDiagBusy] = useState(true)
  /* OTP : erreur simulée, secousse, renvoi */
  const [otpError, setOtpError] = useState(false)
  const [otpShake, setOtpShake] = useState(0)
  const [resendIn, setResendIn] = useState(RESEND_SECS)
  const [resendFlash, setResendFlash] = useState<string | null>(null)
  /* création du code : garde-fou codes faibles */
  const [weakCode, setWeakCode] = useState(false)
  const [createShake, setCreateShake] = useState(0)
  const [confirmShake, setConfirmShake] = useState(0)
  /* connexion : essais restants puis verrouillage temporaire */
  const [pinError, setPinError] = useState<string | null>(null)
  const [pinFails, setPinFails] = useState(0)
  const [pinShake, setPinShake] = useState(0)
  const [lockSecs, setLockSecs] = useState(0)
  const [showForgot, setShowForgot] = useState(false)
  /* d'où arrive-t-on sur la saisie du code : appareil enrôlé, ou numéro vérifié à l'instant */
  const [pinVia, setPinVia] = useState<'direct' | 'otp'>('direct')

  const padTop = Math.max(54, insets.top + 22)

  /* diagnostic busy → ready after 1.5s */
  useEffect(() => {
    if (phase !== 'diag') return
    setDiagBusy(true)
    const t = setTimeout(() => setDiagBusy(false), 1500)
    return () => clearTimeout(t)
  }, [phase])

  /* création du code : auto-avance à 4 chiffres, sauf code trop facile à deviner */
  useEffect(() => {
    if (phase === 'agCreate' && newCode.length === 4) {
      const t = setTimeout(() => {
        if (isWeakPin(newCode)) {
          setWeakCode(true); setNewCode(''); setCreateShake((k) => k + 1); buzz()
        } else {
          setWeakCode(false); setConfirmCode(''); setCodeError(false); setPhase('agConfirm')
        }
      }, 260)
      return () => clearTimeout(t)
    }
    if (phase === 'agConfirm' && confirmCode.length === 4) {
      const t = setTimeout(() => {
        if (confirmCode === newCode) {
          setAgentCode(newCode)
          setAgentActivated(true)
          setPhase('agDone')
        } else {
          setCodeError(true)
          setConfirmCode('')
          setConfirmShake((k) => k + 1)
          buzz()
        }
      }, 260)
      return () => clearTimeout(t)
    }
  }, [phase, newCode, confirmCode, setAgentActivated, setAgentCode])

  const finishAgent = () => { login('agent'); router.replace('/agent') }
  const finishProducer = () => { login('producer'); router.replace('/producer') }
  const startAgentActivation = () => {
    setOtp(''); setNewCode(''); setConfirmCode('')
    setCodeError(false); setOtpError(false); setWeakCode(false)
    setPhase('agPhone')
  }
  const resend = (channel: 'sms' | 'wa') => {
    setResendIn(RESEND_SECS)
    setOtpError(false)
    setResendFlash(channel === 'wa' ? 'Nouveau code envoyé sur WhatsApp.' : 'Nouveau code envoyé par SMS.')
  }

  /* OTP : à l'arrivée sur l'écran, on repart d'un état propre */
  useEffect(() => {
    if (phase !== 'agOtp' && phase !== 'prOtp') return
    setResendIn(RESEND_SECS)
    setResendFlash(null)
    setOtpError(false)
  }, [phase])

  /* OTP : compte à rebours avant de pouvoir renvoyer le code */
  useEffect(() => {
    if ((phase !== 'agOtp' && phase !== 'prOtp') || resendIn === 0) return
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, resendIn])

  useEffect(() => {
    if (!resendFlash) return
    const t = setTimeout(() => setResendFlash(null), 3000)
    return () => clearTimeout(t)
  }, [resendFlash])

  /* OTP : auto-validation à 6 chiffres — 6 chiffres identiques simulent le code erroné.
     Bon code → l'embranchement : compte déjà actif → saisie du code personnel ;
     pas encore de code → reconnaissance puis création. */
  useEffect(() => {
    if ((phase !== 'agOtp' && phase !== 'prOtp') || otp.length !== OTP_LEN) return
    const t = setTimeout(() => {
      if (/^(\d)\1+$/.test(otp)) {
        setOtpError(true); setOtp(''); setOtpShake((k) => k + 1); buzz()
      } else if (phase === 'agOtp') {
        if (agentCode) {
          setPin(''); setPinError(null); setShowForgot(false); setPinVia('otp'); setPhase('pin')
        } else {
          setPhase('agWelcome')
        }
      } else {
        finishProducer()
      }
    }, 320)
    return () => clearTimeout(t)
  }, [phase, otp, agentCode])

  /* connexion : auto-validation du code personnel, 3 essais puis verrouillage */
  useEffect(() => {
    if (phase !== 'pin' || pin.length !== 4 || lockSecs > 0) return
    const t = setTimeout(() => {
      if (pin === (agentCode ?? AGENT.code)) {
        setPinFails(0); setPinError(null); setPhase('diag')
      } else {
        const fails = pinFails + 1
        setPinFails(fails); setPin(''); setPinShake((k) => k + 1); buzz()
        if (fails >= PIN_TRIES) {
          setPinError(null); setLockSecs(LOCK_SECS)
        } else {
          const left = PIN_TRIES - fails
          setPinError(`Code erroné. Encore ${left} ${left > 1 ? 'essais' : 'essai'}.`)
        }
      }
    }, 300)
    return () => clearTimeout(t)
  }, [phase, pin, pinFails, lockSecs, agentCode])

  /* le verrouillage continue de s'écouler même si on quitte l'écran */
  useEffect(() => {
    if (lockSecs === 0) return
    const t = setTimeout(() => {
      if (lockSecs <= 1) { setPinFails(0); setLockSecs(0) } else { setLockSecs(lockSecs - 1) }
    }, 1000)
    return () => clearTimeout(t)
  }, [lockSecs])

  /* ── WELCOME SLIDES ─────────────────────────────────────────────── */
  if (phase === 'welcome') {
    const sl = SLIDES[slide]
    const isLast = slide === SLIDES.length - 1
    return (
      <View style={{ flex: 1, backgroundColor: sem.bg.primary }}>
        <LinearGradient
          colors={[color.brand[600], color.brand[800]]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={{ flex: 1.1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', top: padTop - 8, left: 18 }}>
            <Logo variant="light" height={30} />
          </View>
          <Pressable
            onPress={() => setPhase('who')}
            style={{ position: 'absolute', top: padTop - 8, right: 16, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 }}
          >
            <Txt style={{ color: '#fff', fontFamily: font.inter.medium, fontSize: 12.5 }}>Passer</Txt>
          </Pressable>
          <View style={{ alignItems: 'center', gap: 18 }}>
            <View style={[{ width: 104, height: 104, borderRadius: 24, backgroundColor: sl.tileBg, alignItems: 'center', justifyContent: 'center' }, shadow.xl]}>
              <Icon name={sl.icon} size={48} color={sl.iconColor} strokeWidth={1.8} />
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
              <Txt style={{ color: '#fff', fontFamily: font.inter.medium, fontSize: 11.5 }}>{sl.tag}</Txt>
            </View>
          </View>
        </LinearGradient>

        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 26, paddingBottom: Math.max(18, insets.bottom + 6), gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {SLIDES.map((_, i) => (
              <View key={i} style={{ width: slide === i ? 22 : 6, height: 6, borderRadius: 999, backgroundColor: slide === i ? color.brand[600] : color.gray[200] }} />
            ))}
          </View>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 23, lineHeight: 29, letterSpacing: -0.4, color: sem.text.primary }}>{sl.title}</Txt>
          <Txt style={{ fontSize: 14, lineHeight: 22, color: sem.text.tertiary }}>{sl.body}</Txt>
          <View style={{ flex: 1 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LangChip label="Français" active={lang === 'fr'} onPress={() => setLang('fr')} />
            <LangChip label="English" active={lang === 'en'} onPress={() => setLang('en')} />
            <LangChip label="Wolof · audio" active={lang === 'wo'} onPress={() => setLang('wo')} />
          </View>
          <Button label={isLast ? 'Commencer' : 'Suivant'} onPress={() => (isLast ? setPhase('who') : setSlide(slide + 1))} />
        </View>
      </View>
    )
  }

  /* ── WHO ────────────────────────────────────────────────────────── */
  if (phase === 'who') {
    return (
      <View style={{ flex: 1, backgroundColor: sem.bg.primary, paddingHorizontal: 24 }}>
        <View style={{ paddingTop: padTop, gap: 8 }}>
          <Logo height={28} />
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 22, letterSpacing: -0.4, marginTop: 18 }}>Qui es-tu ?</Txt>
          <Txt style={{ fontSize: 13.5, lineHeight: 20, color: sem.text.tertiary }}>L’accès et l’accueil dépendent de ton profil.</Txt>
        </View>
        <View style={{ gap: 12, marginTop: 24 }}>
          <RoleCard
            icon="marker-pin"
            title="Agent de terrain"
            sub={agentActivated ? 'Connecte-toi avec ton code PIN' : 'Ton numéro, puis ton code PIN à 4 chiffres'}
            onPress={() => { if (agentActivated) { setPin(''); setPinError(null); setShowForgot(false); setPinVia('direct'); setPhase('pin') } else { startAgentActivation() } }}
          />
          <RoleCard icon="user" title="Producteur" sub="Ton numéro de téléphone, c’est ton identité" onPress={() => setPhase('login')} />
        </View>
        <View style={{ flex: 1 }} />
        <Txt style={{ fontSize: 12, color: sem.text.quarterary, textAlign: 'center', marginBottom: Math.max(22, insets.bottom + 6) }}>
          Une fois l’appareil enrôlé, ce choix n’est plus demandé.
        </Txt>
      </View>
    )
  }

  /* ── ACTIVATION · TÉLÉPHONE ─────────────────────────────────────── */
  if (phase === 'agPhone') {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: sem.bg.primary, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingTop: padTop, gap: 8 }}>
          <BackButton onPress={() => setPhase('who')} />
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 22, letterSpacing: -0.4, marginTop: 14 }}>Active ton compte</Txt>
          <Txt style={{ fontSize: 13.5, lineHeight: 20, color: sem.text.tertiary }}>Ton numéro est ton identifiant : celui que ton organisation a enregistré. Un code de vérification te sera envoyé par SMS.</Txt>
        </View>
        <View style={{ gap: 14, marginTop: 26 }}>
          <View style={{ gap: 6 }}>
            <Txt style={{ fontFamily: font.inter.medium, fontSize: 13, color: sem.text.secondary }}>Numéro de téléphone</Txt>
            <View style={[fieldStyle, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
              <Txt style={{ fontFamily: font.inter.medium, fontSize: 14, color: sem.text.tertiary, borderRightWidth: 1, borderRightColor: sem.border.secondary, paddingRight: 8 }}>+221</Txt>
              <Txt style={{ fontSize: 14, color: sem.text.primary }}>77 123 45 67</Txt>
            </View>
          </View>
          <Button label="Recevoir mon code de vérification" onPress={() => { setOtp(''); setPhase('agOtp') }} />
        </View>
        <View style={{ flex: 1 }} />
        <InfoNote text="Pas encore enregistré ? Seule ton organisation peut t’ajouter comme agent. Rapproche-toi de ton responsable." bottom={insets.bottom} />
      </ScrollView>
    )
  }

  /* ── ACTIVATION · OTP SMS ───────────────────────────────────────── */
  if (phase === 'agOtp') {
    return (
      <View style={{ flex: 1, backgroundColor: sem.bg.primary, paddingHorizontal: 24 }}>
        <View style={{ paddingTop: padTop, gap: 8 }}>
          <BackButton onPress={() => setPhase('agPhone')} />
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 22, letterSpacing: -0.4, marginTop: 14 }}>Code de vérification</Txt>
          <Txt style={{ fontSize: 13.5, lineHeight: 20, color: sem.text.tertiary }}>Saisis le code à 6 chiffres envoyé par SMS au {AGENT.phone}. Il confirme que ce numéro est bien le tien.</Txt>
          <Pressable onPress={() => setPhase('agPhone')} hitSlop={6} style={{ alignSelf: 'flex-start' }}>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5, color: color.brand[700] }}>Modifier le numéro</Txt>
          </Pressable>
        </View>
        <View style={{ marginTop: 26 }}>
          <PinInput value={otp} length={OTP_LEN} readOnly error={otpError && otp.length === 0} shakeKey={otpShake} />
        </View>
        <View style={{ minHeight: 22, marginTop: 16, justifyContent: 'center' }}>
          {otpError && (
            <Txt style={{ fontFamily: font.inter.medium, fontSize: 12.5, color: color.error[600], textAlign: 'center' }}>
              Ce code ne correspond pas. Vérifie le dernier SMS reçu.
            </Txt>
          )}
        </View>
        <ResendRow secs={resendIn} flash={resendFlash} onResend={resend} />
        <View style={{ flex: 1 }} />
        <Keypad
          onKey={(d) => setOtp((v) => (v + d).slice(0, OTP_LEN))}
          onDelete={() => setOtp((v) => v.slice(0, -1))}
        />
        <View style={{ height: Math.max(18, insets.bottom + 6) }} />
      </View>
    )
  }

  /* ── ACTIVATION · RECONNAISSANCE ────────────────────────────────── */
  if (phase === 'agWelcome') {
    const org = ORGS[0]
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: sem.bg.primary, paddingHorizontal: 24 }}>
        <View style={{ paddingTop: padTop, gap: 8 }}>
          <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: sem.text.brandTertiary }}>Numéro vérifié</Txt>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 22, letterSpacing: -0.4 }}>Salut {AGENT.firstName}</Txt>
          <Txt style={{ fontSize: 13.5, lineHeight: 20, color: sem.text.tertiary }}>La {org.name} t’a enregistré comme {ROLE_LABELS.agent.toLowerCase()}. Il ne reste qu’à créer ton code PIN.</Txt>
        </View>

        <View style={[{ backgroundColor: '#fff', borderWidth: 1, borderColor: sem.border.secondary, borderRadius: radius['2xl'], marginTop: 24, overflow: 'hidden' }, shadow.xs]}>
          <LinearGradient
            colors={[color.brand[600], color.brand[800]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: 64 }}
          />
          <View style={{ alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, marginTop: -28 }}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: org.tile, borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 17, color: '#fff' }}>{org.init}</Txt>
            </View>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 17, letterSpacing: -0.2, marginTop: 12 }}>{org.name}</Txt>
            {org.type && (
              <View style={{ marginTop: 6 }}>
                <Badge label={org.type} color="brand" />
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', columnGap: 16, rowGap: 6, marginTop: 12 }}>
              {org.producteurs != null && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Icon name="users" size={13} color={sem.fg.quarterary} />
                  <Txt style={{ fontSize: 12, color: sem.text.tertiary }}>{org.producteurs} producteurs</Txt>
                </View>
              )}
              {org.region && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Icon name="marker-pin" size={13} color={sem.fg.quarterary} />
                  <Txt style={{ fontSize: 12, color: sem.text.tertiary }}>{org.region}</Txt>
                </View>
              )}
            </View>
          </View>
          {org.referent && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: sem.bg.secondarySubtle, borderTopWidth: 1, borderTopColor: sem.border.tertiary, paddingVertical: 12, paddingHorizontal: 16 }}>
              <Icon name="user" size={13} color={sem.fg.tertiary} />
              <Txt style={{ fontSize: 12, color: sem.text.tertiary }}>
                Ajouté à l’espace par <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12, color: sem.text.secondary }}>{org.referent}</Txt>
              </Txt>
            </View>
          )}
        </View>

        <View style={{ flex: 1, minHeight: 20 }} />
        <Button label="Créer mon code PIN" onPress={() => { setNewCode(''); setPhase('agCreate') }} />
        <InfoNote text="Ce n’est pas ton organisation ? Ne va pas plus loin et contacte ton responsable." bottom={insets.bottom} top={14} />
      </ScrollView>
    )
  }

  /* ── ACTIVATION · CRÉATION DU CODE ──────────────────────────────── */
  if (phase === 'agCreate') {
    return (
      <View style={{ flex: 1, backgroundColor: sem.bg.primary, paddingHorizontal: 24 }}>
        <View style={{ paddingTop: padTop, gap: 8 }}>
          <BackButton onPress={() => { setWeakCode(false); setPhase('agWelcome') }} />
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 22, letterSpacing: -0.4, marginTop: 14 }}>{AGENT.firstName}, crée ton code PIN</Txt>
          <Txt style={{ fontSize: 13.5, lineHeight: 20, color: sem.text.tertiary }}>4 chiffres, connus de toi seul. Ton organisation ne peut ni le voir, ni le changer.</Txt>
        </View>
        <View style={{ marginTop: 28 }}>
          <PinInput value={newCode} secure readOnly error={weakCode && newCode.length === 0} shakeKey={createShake} />
        </View>
        <View style={{ minHeight: 40, marginTop: 16, justifyContent: 'center' }}>
          {weakCode ? (
            <Txt style={{ fontFamily: font.inter.medium, fontSize: 12.5, lineHeight: 18, color: color.error[600], textAlign: 'center' }}>
              Trop simple : ce code se devine trop vite. Choisis-en un autre.
            </Txt>
          ) : (
            <Txt style={{ fontSize: 12, lineHeight: 18, color: sem.text.quarterary, textAlign: 'center' }}>
              Évite les suites (1234), les répétitions (0000) et ton année de naissance.
            </Txt>
          )}
        </View>
        <View style={{ flex: 1 }} />
        <Keypad
          onKey={(d) => setNewCode((v) => (v + d).slice(0, 4))}
          onDelete={() => setNewCode((v) => v.slice(0, -1))}
        />
        <View style={{ height: Math.max(18, insets.bottom + 6) }} />
      </View>
    )
  }

  /* ── ACTIVATION · CONFIRMATION DU CODE ──────────────────────────── */
  if (phase === 'agConfirm') {
    return (
      <View style={{ flex: 1, backgroundColor: sem.bg.primary, paddingHorizontal: 24 }}>
        <View style={{ paddingTop: padTop, gap: 8 }}>
          <BackButton onPress={() => { setNewCode(''); setCodeError(false); setPhase('agCreate') }} />
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 22, letterSpacing: -0.4, marginTop: 14 }}>Confirme ton code PIN</Txt>
          <Txt style={{ fontSize: 13.5, lineHeight: 20, color: sem.text.tertiary }}>Saisis-le une seconde fois, pour être sûr que tu le retiens.</Txt>
        </View>
        <View style={{ marginTop: 28 }}>
          <PinInput value={confirmCode} secure readOnly error={codeError && confirmCode.length === 0} shakeKey={confirmShake} />
        </View>
        <View style={{ minHeight: 22, marginTop: 16, justifyContent: 'center' }}>
          {codeError && (
            <Txt style={{ fontFamily: font.inter.medium, fontSize: 12.5, lineHeight: 18, color: color.error[600], textAlign: 'center' }}>
              Les codes ne correspondent pas. Réessaie.
            </Txt>
          )}
        </View>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => { setNewCode(''); setConfirmCode(''); setCodeError(false); setPhase('agCreate') }} style={{ paddingVertical: 10, alignItems: 'center' }}>
          <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13, color: color.brand[700] }}>Choisir un autre code</Txt>
        </Pressable>
        <Keypad
          onKey={(d) => { setCodeError(false); setConfirmCode((v) => (v + d).slice(0, 4)) }}
          onDelete={() => setConfirmCode((v) => v.slice(0, -1))}
        />
        <View style={{ height: Math.max(18, insets.bottom + 6) }} />
      </View>
    )
  }

  /* ── ACTIVATION · SUCCÈS ────────────────────────────────────────── */
  if (phase === 'agDone') {
    return (
      <View style={{ flex: 1, backgroundColor: sem.bg.primary, paddingHorizontal: 24 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <View style={{ width: 84, height: 84, borderRadius: 999, backgroundColor: color.success[50], borderWidth: 1, borderColor: color.success[200], alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check-circle" size={38} color={color.success[600]} strokeWidth={1.8} />
          </View>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 22, letterSpacing: -0.4 }}>Ton code PIN est créé</Txt>
            <Txt style={{ fontSize: 13.5, lineHeight: 20, color: sem.text.tertiary, textAlign: 'center' }}>
              Il te sera demandé à chaque connexion et pour confirmer les opérations sensibles. Toi seul le connais : ne le partage pas, même à ton responsable.
            </Txt>
          </View>
        </View>
        <Button label="Découvrir mon espace" onPress={() => setPhase('diag')} style={{ marginBottom: Math.max(22, insets.bottom + 6) }} />
      </View>
    )
  }

  /* ── CONNEXION AGENT (code personnel) ───────────────────────────── */
  if (phase === 'pin') {
    const locked = lockSecs > 0
    return (
      <View style={{ flex: 1, backgroundColor: sem.bg.primary, paddingHorizontal: 24 }}>
        <View style={{ paddingTop: padTop, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <BackButton onPress={() => { if (pinVia === 'otp') { setOtp(''); setPhase('agOtp') } else { setPhase('who') } }} />
            <Pressable onPress={() => setPhase('loginAccount')} hitSlop={6}>
              <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5, color: color.brand[700] }}>Compte TOLBI</Txt>
            </Pressable>
          </View>
          {pinVia === 'otp' && (
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: sem.text.brandTertiary, marginTop: 14 }}>Numéro vérifié</Txt>
          )}
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 22, letterSpacing: -0.4, marginTop: pinVia === 'otp' ? 0 : 14 }}>Content de te revoir, {AGENT.firstName}</Txt>
          <Txt style={{ fontSize: 13.5, lineHeight: 20, color: sem.text.tertiary }}>
            {pinVia === 'otp'
              ? 'Ton compte est déjà actif sur ce numéro. Saisis ton code PIN à 4 chiffres.'
              : 'Saisis ton code PIN à 4 chiffres.'}
          </Txt>
        </View>
        <View style={{ marginTop: 28 }}>
          <PinInput value={pin} secure readOnly error={(locked || !!pinError) && pin.length === 0} shakeKey={pinShake} />
        </View>
        <View style={{ minHeight: 22, marginTop: 16, justifyContent: 'center' }}>
          {locked ? (
            <Txt style={{ fontFamily: font.inter.medium, fontSize: 12.5, color: color.error[600], textAlign: 'center' }}>
              Trop d’essais. Réessaie dans {mmss(lockSecs)}.
            </Txt>
          ) : pinError ? (
            <Txt style={{ fontFamily: font.inter.medium, fontSize: 12.5, color: color.error[600], textAlign: 'center' }}>{pinError}</Txt>
          ) : null}
        </View>
        <View style={{ flex: 1 }} />
        {showForgot && (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: sem.bg.secondarySubtle, borderWidth: 1, borderColor: sem.border.tertiary, borderRadius: radius.xl, padding: 13 }}>
            <Icon name="lock" size={15} color={sem.fg.tertiary} />
            <Txt style={{ flex: 1, fontSize: 12, lineHeight: 18, color: sem.text.tertiary }}>
              Ton responsable peut relancer ton activation depuis TOLBI OS : tu créeras un nouveau code PIN toi-même. Personne ne peut te le donner.
            </Txt>
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22, paddingVertical: 10 }}>
          <Pressable onPress={() => setShowForgot((v) => !v)} hitSlop={6}>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13, color: color.brand[700] }}>Code PIN oublié ?</Txt>
          </Pressable>
          {pinVia === 'direct' && (
            <Pressable onPress={startAgentActivation} hitSlop={6}>
              <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13, color: color.brand[700] }}>Passer par mon numéro</Txt>
            </Pressable>
          )}
        </View>
        <Keypad
          disabled={locked}
          onKey={(d) => setPin((v) => (v + d).slice(0, 4))}
          onDelete={() => setPin((v) => v.slice(0, -1))}
        />
        <View style={{ height: Math.max(18, insets.bottom + 6) }} />
      </View>
    )
  }

  /* ── PRODUCER LOGIN (phone) ─────────────────────────────────────── */
  if (phase === 'login') {
    return (
      <View style={{ flex: 1, backgroundColor: sem.bg.primary, paddingHorizontal: 24 }}>
        <View style={{ paddingTop: padTop, gap: 8 }}>
          <Logo height={28} />
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 22, letterSpacing: -0.4, marginTop: 18 }}>Bienvenue</Txt>
          <Txt style={{ fontSize: 13.5, lineHeight: 20, color: sem.text.tertiary }}>Connecte-toi avec ton numéro de téléphone. Aucun mot de passe à retenir.</Txt>
        </View>
        <View style={{ gap: 14, marginTop: 26 }}>
          <View style={{ gap: 6 }}>
            <Txt style={{ fontFamily: font.inter.medium, fontSize: 13, color: sem.text.secondary }}>Numéro de téléphone</Txt>
            <View style={[fieldStyle, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
              <Txt style={{ fontFamily: font.inter.medium, fontSize: 14, color: sem.text.tertiary, borderRightWidth: 1, borderRightColor: sem.border.secondary, paddingRight: 8 }}>+221</Txt>
              <Txt style={{ fontSize: 14, color: sem.text.primary }}>77 123 45 67</Txt>
            </View>
          </View>
          <Button label="Recevoir mon code" onPress={() => { setOtp(''); setPhase('prOtp') }} />
        </View>
        <View style={{ flex: 1 }} />
        <InfoNote text="Ton numéro doit être celui enregistré sur ta fiche producteur auprès de ta coopérative." bottom={insets.bottom} />
      </View>
    )
  }

  /* ── PRODUCER OTP ───────────────────────────────────────────────── */
  if (phase === 'prOtp') {
    return (
      <View style={{ flex: 1, backgroundColor: sem.bg.primary, paddingHorizontal: 24 }}>
        <View style={{ paddingTop: padTop, gap: 8 }}>
          <BackButton onPress={() => setPhase('login')} />
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 22, letterSpacing: -0.4, marginTop: 14 }}>Code de vérification</Txt>
          <Txt style={{ fontSize: 13.5, lineHeight: 20, color: sem.text.tertiary }}>Saisis le code à 6 chiffres envoyé par SMS ou WhatsApp au +221 77 456 12 09. Cet appareil sera enrôlé : plus de code la prochaine fois.</Txt>
          <Pressable onPress={() => setPhase('login')} hitSlop={6} style={{ alignSelf: 'flex-start' }}>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5, color: color.brand[700] }}>Modifier le numéro</Txt>
          </Pressable>
        </View>
        <View style={{ marginTop: 26 }}>
          <PinInput value={otp} length={OTP_LEN} readOnly error={otpError && otp.length === 0} shakeKey={otpShake} />
        </View>
        <View style={{ minHeight: 22, marginTop: 16, justifyContent: 'center' }}>
          {otpError && (
            <Txt style={{ fontFamily: font.inter.medium, fontSize: 12.5, color: color.error[600], textAlign: 'center' }}>
              Ce code ne correspond pas. Vérifie le dernier message reçu.
            </Txt>
          )}
        </View>
        <ResendRow secs={resendIn} flash={resendFlash} onResend={resend} />
        <View style={{ flex: 1 }} />
        <Keypad
          onKey={(d) => setOtp((v) => (v + d).slice(0, OTP_LEN))}
          onDelete={() => setOtp((v) => v.slice(0, -1))}
        />
        <View style={{ height: Math.max(18, insets.bottom + 6) }} />
      </View>
    )
  }

  /* ── ACCOUNT LOGIN (email) ──────────────────────────────────────── */
  if (phase === 'loginAccount') {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: sem.bg.primary, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingTop: padTop, gap: 8 }}>
          <BackButton onPress={() => setPhase('pin')} />
          <Logo height={28} />
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 22, letterSpacing: -0.4, marginTop: 14 }}>Compte TOLBI</Txt>
          <Txt style={{ fontSize: 13.5, lineHeight: 20, color: sem.text.tertiary }}>Le même compte que sur TOLBI OS web. Recommandé pour les conseillers et responsables.</Txt>
        </View>
        <View style={{ gap: 14, marginTop: 24 }}>
          <View style={{ gap: 6 }}>
            <Txt style={{ fontFamily: font.inter.medium, fontSize: 13, color: sem.text.secondary }}>Email</Txt>
            <View style={[fieldStyle, { flexDirection: 'row', alignItems: 'center', gap: 9 }]}>
              <Icon name="mail" size={15} color={sem.fg.quarterary} />
              <Txt style={{ fontSize: 14, color: sem.text.primary }}>amadou.ba@coopkaolack.sn</Txt>
            </View>
          </View>
          <View style={{ gap: 6 }}>
            <Txt style={{ fontFamily: font.inter.medium, fontSize: 13, color: sem.text.secondary }}>Mot de passe</Txt>
            <View style={[fieldStyle, { flexDirection: 'row', alignItems: 'center', gap: 9 }]}>
              <Icon name="lock" size={15} color={sem.fg.quarterary} />
              <Txt style={{ flex: 1, fontFamily: font.inter.semibold, fontSize: 14, color: sem.text.primary, letterSpacing: 3 }}>••••••••</Txt>
              <Icon name="eye" size={16} color={sem.fg.quarterary} />
            </View>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12, color: color.brand[700], alignSelf: 'flex-end' }}>Mot de passe oublié ?</Txt>
          </View>
          <Button label="Se connecter" onPress={() => setPhase('diag')} />
        </View>
        <View style={{ flex: 1 }} />
        <InfoNote text="Session conservée sur cet appareil pour travailler hors ligne. Révocable à distance par ton administrateur." bottom={insets.bottom} />
      </ScrollView>
    )
  }

  /* ── DIAGNOSTIC ─────────────────────────────────────────────────── */
  if (phase === 'diag') {
    if (diagBusy) {
      return (
        <View style={{ flex: 1, backgroundColor: sem.bg.primary, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24 }}>
          <Logo height={26} />
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 16, letterSpacing: -0.2 }}>Préparation de ton espace…</Txt>
          <Txt style={{ fontSize: 12.5, lineHeight: 19, color: sem.text.tertiary, textAlign: 'center' }}>Vérification du GPS, du stockage,{'\n'}de la caméra et de la version du système</Txt>
          <IndeterminateBar />
        </View>
      )
    }
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: sem.bg.primary, paddingHorizontal: 24 }}>
        <View style={{ paddingTop: padTop, gap: 8 }}>
          <Txt style={{ fontFamily: font.inter.semibold, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: sem.text.brandTertiary }}>Diagnostic de l’appareil</Txt>
          <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 21, letterSpacing: -0.4, lineHeight: 27 }}>Ton téléphone peut utiliser TOLBI, avec quelques limites</Txt>
          <Txt style={{ fontSize: 12.5, color: sem.text.quarterary }}>Samsung Galaxy A14 · Android 13 · 1,2 Go libres</Txt>
        </View>
        <View style={{ gap: 9, marginTop: 18 }}>
          <DiagRow tone="warning" icon="marker-pin" title="Carte terrain — précision GPS réduite" body="±15 m au lieu de ±3 m. Active la localisation haute précision dans les réglages Android." />
          <DiagRow tone="warning" icon="image" title="Collecte — photos plus lentes à traiter" body="Stockage presque plein. Libère de l’espace ou synchronise en Wi-Fi." />
          <DiagRow tone="success" icon="check-circle" title="Yield, Procurement, ID, Producteurs" body="Aucune limite détectée. Tous les modules restent accessibles." />
        </View>
        <Txt style={{ fontSize: 11.5, lineHeight: 18, color: sem.text.quarterary, marginTop: 12 }}>Ce diagnostic est partagé avec ton superviseur. Retrouve-le à tout moment dans Profil → Compatibilité de l’appareil.</Txt>
        <View style={{ flex: 1, minHeight: 20 }} />
        <Button label="Continuer" onPress={finishAgent} />
        <Pressable onPress={() => setPhase('diag')} style={{ paddingVertical: 12, paddingBottom: Math.max(22, insets.bottom + 6), alignItems: 'center' }}>
          <Txt style={{ fontFamily: font.inter.semibold, fontSize: 13, color: color.brand[700] }}>Relancer l’analyse</Txt>
        </Pressable>
      </ScrollView>
    )
  }

  return null
}

/* ── local building blocks ────────────────────────────────────────── */

const fieldStyle = {
  borderWidth: 1,
  borderColor: sem.border.primary,
  borderRadius: radius.md,
  backgroundColor: color.white,
  paddingVertical: 11,
  paddingHorizontal: 14,
  ...shadow.xs,
} as const

function LangChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: active ? sem.border.brand : sem.border.primary,
        backgroundColor: active ? sem.bg.brandPrimary : '#fff',
        borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12,
      }}
    >
      <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12, color: active ? color.brand[700] : sem.text.tertiary }}>{label}</Txt>
    </Pressable>
  )
}

function RoleCard({ icon, title, sub, onPress }: { icon: string; title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: pressed ? sem.bg.brandPrimary : '#fff',
        borderWidth: 1, borderColor: pressed ? sem.border.brand : sem.border.secondary,
        borderRadius: radius['2xl'], padding: 16,
      }, shadow.xs]}
    >
      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: sem.bg.brandPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={22} color={sem.fg.brandPrimary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt style={{ fontFamily: font.poppins.semibold, fontSize: 14.5 }}>{title}</Txt>
        <Txt style={{ fontSize: 12.5, lineHeight: 18, color: sem.text.tertiary }}>{sub}</Txt>
      </View>
      <Icon name="chevron-right" size={16} color={sem.fg.quinary} />
    </Pressable>
  )
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>
      <Icon name="arrow-left" size={14} color={sem.text.tertiary} />
      <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5, color: sem.text.tertiary }}>Retour</Txt>
    </Pressable>
  )
}

function ResendRow({ secs, flash, onResend }: { secs: number; flash: string | null; onResend: (channel: 'sms' | 'wa') => void }) {
  return (
    <View style={{ minHeight: 22, marginTop: 4, alignItems: 'center', justifyContent: 'center' }}>
      {flash ? (
        <Txt style={{ fontFamily: font.inter.medium, fontSize: 12.5, color: color.success[600] }}>{flash}</Txt>
      ) : secs > 0 ? (
        <Txt style={{ fontSize: 12.5, color: sem.text.quarterary }}>Pas de code ? Renvoi possible dans {mmss(secs)}</Txt>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <Pressable onPress={() => onResend('sms')} hitSlop={6}>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5, color: color.brand[700] }}>Renvoyer par SMS</Txt>
          </Pressable>
          <Pressable onPress={() => onResend('wa')} hitSlop={6}>
            <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5, color: color.brand[700] }}>Recevoir sur WhatsApp</Txt>
          </Pressable>
        </View>
      )}
    </View>
  )
}

function InfoNote({ text, bottom, top = 0 }: { text: string; bottom: number; top?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: sem.bg.secondarySubtle, borderWidth: 1, borderColor: sem.border.tertiary, borderRadius: radius.xl, padding: 13, marginTop: top, marginBottom: Math.max(22, bottom + 6) }}>
      <Icon name="lock" size={15} color={sem.fg.tertiary} />
      <Txt style={{ flex: 1, fontSize: 12, lineHeight: 18, color: sem.text.tertiary }}>{text}</Txt>
    </View>
  )
}

function DiagRow({ tone, icon, title, body }: { tone: 'warning' | 'success'; icon: string; title: string; body: string }) {
  const bg = tone === 'warning' ? color.warning[50] : color.success[50]
  const bd = tone === 'warning' ? color.warning[200] : color.success[200]
  const fg = tone === 'warning' ? color.warning[600] : color.success[600]
  const tx = tone === 'warning' ? color.warning[700] : color.success[700]
  return (
    <View style={{ flexDirection: 'row', gap: 11, backgroundColor: bg, borderWidth: 1, borderColor: bd, borderRadius: 14, padding: 13 }}>
      <Icon name={icon} size={16} color={fg} />
      <View style={{ flex: 1, gap: 2 }}>
        <Txt style={{ fontFamily: font.inter.semibold, fontSize: 12.5, color: tx }}>{title}</Txt>
        <Txt style={{ fontSize: 11.5, lineHeight: 17, color: tx }}>{body}</Txt>
      </View>
    </View>
  )
}

function IndeterminateBar() {
  const x = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(x, { toValue: 1, duration: 1100, easing: Easing.bezier(0.25, 0, 0, 1), useNativeDriver: Platform.OS !== 'web' }),
    )
    loop.start()
    return () => loop.stop()
  }, [x])
  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [-72, 180] })
  return (
    <View style={{ width: 180, height: 5, borderRadius: 999, backgroundColor: sem.bg.tertiary, overflow: 'hidden' }}>
      <Animated.View style={{ width: 72, height: '100%', borderRadius: 999, backgroundColor: color.brand[600], transform: [{ translateX }] }} />
    </View>
  )
}
