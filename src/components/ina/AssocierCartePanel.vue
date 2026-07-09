<template>
  <SlideOverPanel
    ref="panel"
    title="Associer une carte"
    :supporting-text="supportingText"
    :width="480"
    @close="$emit('close')"
  >
    <template #icon><CreditCard :size="20" /></template>

    <!-- Sélection précise : on lie exactement la carte physique remise au producteur. -->
    <CartePicker
      v-model="selectedCarteId"
      label="Choisis la carte à associer"
      :description="`Sélectionne la carte physique remise à ${nomComplet}.`"
      :preview-holder="nomComplet"
      :preview-numero="identite?.numeroIna ?? null"
    />

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" @click="close" />
      <DsButton
        label="Associer la carte"
        variant="primary"
        :loading="submitting"
        :disabled="!canAssocier"
        @click="submit"
      />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { CreditCard } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import CartePicker from '~/components/ina/CartePicker.vue'
import { useInaStore } from '~/stores/ina'
import { useToastStore } from '~/stores/toast'

const props = defineProps<{ producteurId: string }>()
const emit  = defineEmits<{ close: [] }>()

const ina   = useInaStore()
ina.init()
const toast = useToastStore()

const panel = ref<InstanceType<typeof SlideOverPanel> | null>(null)
// Carte précise choisie dans le stock ; null tant que rien n'est sélectionné.
const selectedCarteId = ref<string | null>(null)
const submitting = ref(false)

const identite   = computed(() => ina.identiteFor(props.producteurId))
const nomComplet = computed(() => (identite.value ? `${identite.value.prenom} ${identite.value.nom}` : ''))

const supportingText = computed(() => `Rattache une carte physique au statut INA de ${nomComplet.value}.`)
const canAssocier    = computed(() => selectedCarteId.value !== null)

let timer: ReturnType<typeof setTimeout>
function submit() {
  if (submitting.value || !canAssocier.value) return
  submitting.value = true
  timer = setTimeout(() => {
    const carte = ina.associerCarte(props.producteurId, selectedCarteId.value!)
    toast.show({
      title:       'Carte associée',
      description: carte
        ? `Carte ${carte.serial} associée à ${nomComplet.value}.`
        : 'Cette carte n\'est plus disponible.',
      duration: 6000,
    })
    panel.value?.close()
  }, 600)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>
