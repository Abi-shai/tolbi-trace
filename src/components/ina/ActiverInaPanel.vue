<template>
  <SlideOverPanel
    ref="panel"
    title="Activer le statut INA"
    :supporting-text="supportingText"
    :width="480"
    @close="$emit('close')"
  >
    <template #icon><Fingerprint :size="20" /></template>

    <!-- Numéro de téléphone (indicatif pays) + « Envoyer le code » sur la même ligne -->
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-text-secondary">Numéro de téléphone</label>
      <div class="flex items-stretch gap-2">
        <div class="flex-1 min-w-0">
          <PhoneField v-model="telephone" />
        </div>
        <DsButton
          :label="sendLabel"
          variant="secondary-gray"
          size="md"
          class="shrink-0"
          :disabled="!canSend"
          @click="sendCode"
        />
      </div>
      <p class="text-sm text-text-tertiary leading-5">
        Pré-rempli depuis les informations du producteur sur ID. Modifie-le si le producteur préfère un autre numéro.
      </p>
    </div>

    <!-- Code de vérification (OTP) — inactif tant que le code n'a pas été envoyé -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-text-secondary">Code de vérification</span>
      <p class="text-sm text-text-tertiary leading-5">
        <template v-if="codeSent">Envoyé par SMS au <span class="font-medium text-text-secondary mono">{{ telephone.trim() || '—' }}</span>. Le producteur te le communique.</template>
        <template v-else>Clique sur « Envoyer le code » pour l'envoyer par SMS au producteur.</template>
      </p>
      <DsVerificationCode v-model="otp" :digits="4" :disabled="!codeSent" />
    </div>

    <!-- Associer une carte : sélection précise d'une carte du stock (facultatif à
         l'activation → option « Sans carte pour l'instant »). -->
    <CartePicker
      v-model="selectedCarteId"
      allow-none
      label="Associer une carte (optionnel)"
      description="Choisis la carte physique remise au producteur, ou active sans carte pour l'instant."
      :preview-holder="nomComplet"
      :preview-numero="numeroIna"
    />

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" @click="close" />
      <DsButton
        label="Activer le statut INA"
        variant="primary"
        :loading="submitting"
        :disabled="!canActivate"
        @click="activate"
      />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { Fingerprint } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import PhoneField from '~/components/ui/PhoneField.vue'
import CartePicker from '~/components/ina/CartePicker.vue'
import { countryByIso, groupDigits, maxNationalLen } from '~/data/countries'
import { useProducteursStore } from '~/stores/producteurs'
import { useInaStore } from '~/stores/ina'
import { useToastStore } from '~/stores/toast'

const props = defineProps<{ producteurId: string }>()
const emit  = defineEmits<{ close: [] }>()

const prod  = useProducteursStore()
prod.init()
const ina   = useInaStore()
ina.init()
const toast = useToastStore()

const panel = ref<InstanceType<typeof SlideOverPanel> | null>(null)

const producteur = computed(() => prod.base.find((p) => p.id === props.producteurId) ?? null)
const nomComplet = computed(() => (producteur.value ? `${producteur.value.prenom} ${producteur.value.nom}` : ''))
// Numéro issu des informations du producteur sur le module ID. Valeur par défaut,
// éditable. Préfixé + formaté à l'indicatif Sénégal (+221) : les producteurs de la
// coop sont sénégalais et le n° mock est un national brut ; PhoneField sélectionne
// alors le bon pays et affiche le n° groupé, sans divergence avec la valeur stockée.
const SN = countryByIso('SN')
const defaultTel = computed(() => {
  const raw = (producteur.value?.telephone ?? '').replace(/\D/g, '')
  if (!raw) return ''
  return `${SN.dial} ${groupDigits(raw.slice(0, maxNationalLen(SN)), SN.groups)}`
})
// Le Numéro INA est logique (déjà porté par le producteur dans le mock) ; fallback
// si absent, pour ne jamais activer sans identifiant.
const numeroIna = computed(() => {
  const n = producteur.value?.ina
  return n && n !== '—' ? n : `2005${props.producteurId.padStart(4, '0')}`
})

const telephone    = ref(defaultTel.value)
const otp          = ref('')
// Carte précise choisie dans le stock ; null = « sans carte pour l'instant ».
const selectedCarteId = ref<string | null>(null)
const submitting   = ref(false)
// Envoi du code : le champ OTP reste inactif tant que `codeSent` est faux ; après
// un envoi, `resendIn` compte à rebours avant d'autoriser un renvoi.
const codeSent  = ref(false)
const resendIn  = ref(0)
const RESEND_DELAY = 30

// Si le numéro change, l'envoi précédent ne vaut plus (le code visait l'ancien
// numéro) : on remet à zéro (code à renvoyer, OTP vidé et re-désactivé).
watch(telephone, () => {
  otp.value      = ''
  codeSent.value = false
  resendIn.value = 0
  clearInterval(resendTimer)
})

const supportingText = computed(() => `Active le statut INA de ${nomComplet.value} et lui donne un identifiant traçable sur le terrain.`)

// Bouton d'envoi : « Envoyer le code » d'abord, puis « Renvoyer le code (Xs) »
// verrouillé pendant le compte à rebours, puis « Renvoyer le code » réactivé.
const canSend = computed(() =>
  telephone.value.trim().length > 0 && (!codeSent.value || resendIn.value === 0) && !submitting.value,
)
const sendLabel = computed(() => {
  if (!codeSent.value)     return 'Envoyer le code'
  if (resendIn.value > 0)  return `Renvoyer le code (${resendIn.value}s)`
  return 'Renvoyer le code'
})

let resendTimer: ReturnType<typeof setInterval>
function sendCode() {
  if (!canSend.value) return
  const isResend = codeSent.value
  codeSent.value = true
  resendIn.value = RESEND_DELAY
  clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    resendIn.value -= 1
    if (resendIn.value <= 0) { resendIn.value = 0; clearInterval(resendTimer) }
  }, 1000)
  toast.show({
    title:       isResend ? 'Code renvoyé' : 'Code envoyé',
    description: `Un code à 4 chiffres a été envoyé par SMS au ${telephone.value.trim()}.`,
    duration:    4000,
  })
}

// Activation impossible tant que le code n'a pas été envoyé puis saisi.
const canActivate = computed(() =>
  !!producteur.value && telephone.value.trim().length > 0 && codeSent.value && otp.value.length >= 4,
)

let submitTimer: ReturnType<typeof setTimeout>
function activate() {
  if (submitting.value || !canActivate.value) return
  submitting.value = true
  submitTimer = setTimeout(() => {
    ina.activerIna({
      producteurId:  props.producteurId,
      numeroIna:     numeroIna.value,
      prenom:        producteur.value!.prenom,
      nom:           producteur.value!.nom,
      telephone:     telephone.value.trim(),
      cooperative:   producteur.value!.cooperative,
      localite:      'Kaolack',
      carteId:       selectedCarteId.value,
    })
    const carte = selectedCarteId.value ? ina.carteActiveFor(props.producteurId) : null
    toast.show({
      title:       'Statut INA activé',
      description: carte
        ? `${nomComplet.value} a un statut INA actif. Carte ${carte.serial} associée.`
        : `${nomComplet.value} a un statut INA actif. Aucune carte associée pour l'instant.`,
      duration: 6000,
    })
    panel.value?.close()
  }, 600)
}

onBeforeUnmount(() => { clearTimeout(submitTimer); clearInterval(resendTimer) })
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }
</style>
