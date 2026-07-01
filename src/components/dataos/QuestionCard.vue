<template>
  <!-- Conteneur relatif : laisse déborder le « + » d'ajout sans le rogner -->
  <div ref="root" class="relative" :class="readonly ? '' : 'group/qcard'">
    <div
      class="flex items-stretch bg-white border border-border rounded-lg overflow-hidden"
      :class="readonly ? '' : 'transition-shadow duration-150 ease-out group-hover/qcard:shadow-[var(--ds-shadow-lg)]'"
    >
      <!-- Poignée de déplacement (Material drag_indicator — vecteur Figma exact) -->
      <div class="flex items-start pl-2 py-3 shrink-0">
        <button
          class="flex items-center justify-center w-[34px] h-8"
          :class="readonly ? 'text-[var(--ds-semantic-fg-disabled)] cursor-default' : 'text-[var(--ds-semantic-fg-tertiary)] cursor-grab active:cursor-grabbing'"
          :disabled="readonly"
          aria-label="Déplacer la question"
          @pointerdown="!readonly && $emit('grab')"
        >
          <svg viewBox="0 0 34 32" width="34" height="32" fill="none" aria-hidden="true">
            <path d="M14 24C13.45 24 12.9792 23.8042 12.5875 23.4125C12.1958 23.0208 12 22.55 12 22C12 21.45 12.1958 20.9792 12.5875 20.5875C12.9792 20.1958 13.45 20 14 20C14.55 20 15.0208 20.1958 15.4125 20.5875C15.8042 20.9792 16 21.45 16 22C16 22.55 15.8042 23.0208 15.4125 23.4125C15.0208 23.8042 14.55 24 14 24ZM20 24C19.45 24 18.9792 23.8042 18.5875 23.4125C18.1958 23.0208 18 22.55 18 22C18 21.45 18.1958 20.9792 18.5875 20.5875C18.9792 20.1958 19.45 20 20 20C20.55 20 21.0208 20.1958 21.4125 20.5875C21.8042 20.9792 22 21.45 22 22C22 22.55 21.8042 23.0208 21.4125 23.4125C21.0208 23.8042 20.55 24 20 24ZM14 18C13.45 18 12.9792 17.8042 12.5875 17.4125C12.1958 17.0208 12 16.55 12 16C12 15.45 12.1958 14.9792 12.5875 14.5875C12.9792 14.1958 13.45 14 14 14C14.55 14 15.0208 14.1958 15.4125 14.5875C15.8042 14.9792 16 15.45 16 16C16 16.55 15.8042 17.0208 15.4125 17.4125C15.0208 17.8042 14.55 18 14 18ZM20 18C19.45 18 18.9792 17.8042 18.5875 17.4125C18.1958 17.0208 18 16.55 18 16C18 15.45 18.1958 14.9792 18.5875 14.5875C18.9792 14.1958 19.45 14 20 14C20.55 14 21.0208 14.1958 21.4125 14.5875C21.8042 14.9792 22 15.45 22 16C22 16.55 21.8042 17.0208 21.4125 17.4125C21.0208 17.8042 20.55 18 20 18ZM14 12C13.45 12 12.9792 11.8042 12.5875 11.4125C12.1958 11.0208 12 10.55 12 10C12 9.45 12.1958 8.97917 12.5875 8.5875C12.9792 8.19583 13.45 8 14 8C14.55 8 15.0208 8.19583 15.4125 8.5875C15.8042 8.97917 16 9.45 16 10C16 10.55 15.8042 11.0208 15.4125 11.4125C15.0208 11.8042 14.55 12 14 12ZM20 12C19.45 12 18.9792 11.8042 18.5875 11.4125C18.1958 11.0208 18 10.55 18 10C18 9.45 18.1958 8.97917 18.5875 8.5875C18.9792 8.19583 19.45 8 20 8C20.55 8 21.0208 8.19583 21.4125 8.5875C21.8042 8.97917 22 9.45 22 10C22 10.55 21.8042 11.0208 21.4125 11.4125C21.0208 11.8042 20.55 12 20 12Z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <!-- Titre de la question : champ texte libre (le type se choisit dans Paramètres). -->
      <div class="relative flex-1 min-w-0 p-4">
        <DsInputField
          label="Question"
          placeholder="Renseignez votre nom et prénom"
          :model-value="question.label"
          @update:model-value="onRename"
        >
          <template v-if="leadingIcon" #icon-leading>
            <DsIcon :name="leadingIcon" :size="20" />
          </template>
        </DsInputField>
        <!-- Liste de producteurs : récap de la liste importée (ou amorce si vide). -->
        <p
          v-if="producteurSummary"
          class="flex items-center gap-1.5 mt-1.5 text-xs leading-[18px]"
          :class="hasProducteurs ? 'text-text-tertiary' : 'text-[color:var(--ds-semantic-text-warning-primary,#b54708)]'"
        >
          <DsIcon name="users-01" :size="14" />
          {{ producteurSummary }}
        </p>
        <!-- Lecture seule (template pas encore utilisé) : couche transparente qui
             absorbe les clics → le champ ne peut ni se focaliser ni s'éditer. -->
        <div v-if="readonly" class="absolute inset-0 cursor-not-allowed" aria-hidden="true" />
      </div>

      <!-- Actions — vecteurs Figma exacts (copy-06 · trash-01 · settings-01 · rows-01).
           Le libellé ressort au survol via un tooltip DS (sans changer le bouton). -->
      <div class="flex flex-col items-start border-l border-border p-2 shrink-0">
        <button
          class="qc-btn" :disabled="readonly" aria-label="Dupliquer la question"
          @click="$emit('duplicate')"
          @mouseenter="showTip($event, 'Dupliquer')" @mouseleave="hideTip"
          @focus="showTip($event, 'Dupliquer')" @blur="hideTip"
        >
          <svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
            <path d="M6.25 2.5H12.1667C14.0335 2.5 14.9669 2.5 15.68 2.86331C16.3072 3.18289 16.8171 3.69282 17.1367 4.32003C17.5 5.03307 17.5 5.96649 17.5 7.83333V13.75M5.16667 17.5H11.9167C12.8501 17.5 13.3168 17.5 13.6733 17.3183C13.9869 17.1586 14.2419 16.9036 14.4017 16.59C14.5833 16.2335 14.5833 15.7668 14.5833 14.8333V8.08333C14.5833 7.14991 14.5833 6.6832 14.4017 6.32668C14.2419 6.01308 13.9869 5.75811 13.6733 5.59832C13.3168 5.41667 12.8501 5.41667 11.9167 5.41667H5.16667C4.23325 5.41667 3.76654 5.41667 3.41002 5.59832C3.09641 5.75811 2.84144 6.01308 2.68166 6.32668C2.5 6.6832 2.5 7.14991 2.5 8.08333V14.8333C2.5 15.7668 2.5 16.2335 2.68166 16.59C2.84144 16.9036 3.09641 17.1586 3.41002 17.3183C3.76654 17.5 4.23325 17.5 5.16667 17.5Z" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          class="qc-btn qc-btn--danger" :disabled="readonly || !deletable" aria-label="Supprimer la question"
          @click="$emit('remove')"
          @mouseenter="showTip($event, removeTip)" @mouseleave="hideTip"
          @focus="showTip($event, removeTip)" @blur="hideTip"
        >
          <svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
            <path d="M13.3333 5V4.33333C13.3333 3.39991 13.3333 2.9332 13.1517 2.57668C12.9919 2.26308 12.7369 2.00811 12.4233 1.84832C12.0668 1.66667 11.6001 1.66667 10.6667 1.66667H9.33333C8.39991 1.66667 7.9332 1.66667 7.57668 1.84832C7.26308 2.00811 7.00811 2.26308 6.84832 2.57668C6.66667 2.9332 6.66667 3.39991 6.66667 4.33333V5M8.33333 9.58333V13.75M11.6667 9.58333V13.75M2.5 5H17.5M15.8333 5V14.3333C15.8333 15.7335 15.8333 16.4335 15.5608 16.9683C15.3212 17.4387 14.9387 17.8212 14.4683 18.0608C13.9335 18.3333 13.2335 18.3333 11.8333 18.3333H8.16667C6.76654 18.3333 6.06647 18.3333 5.53169 18.0608C5.06129 17.8212 4.67883 17.4387 4.43915 16.9683C4.16667 16.4335 4.16667 15.7335 4.16667 14.3333V5" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          class="qc-btn" :disabled="readonly" aria-label="Réglages de la question"
          @click="$emit('settings')"
          @mouseenter="showTip($event, 'Paramètres')" @mouseleave="hideTip"
          @focus="showTip($event, 'Paramètres')" @blur="hideTip"
        >
          <svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
            <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15.6061 12.2727C15.5052 12.5012 15.4751 12.7547 15.5197 13.0004C15.5643 13.2462 15.6814 13.473 15.8561 13.6515L15.9015 13.697C16.0424 13.8377 16.1541 14.0048 16.2304 14.1887C16.3066 14.3727 16.3459 14.5698 16.3459 14.7689C16.3459 14.9681 16.3066 15.1652 16.2304 15.3492C16.1541 15.5331 16.0424 15.7002 15.9015 15.8409C15.7608 15.9818 15.5937 16.0935 15.4098 16.1698C15.2258 16.246 15.0287 16.2853 14.8295 16.2853C14.6304 16.2853 14.4333 16.246 14.2493 16.1698C14.0654 16.0935 13.8983 15.9818 13.7576 15.8409L13.7121 15.7955C13.5336 15.6208 13.3068 15.5036 13.0611 15.4591C12.8153 15.4145 12.5618 15.4446 12.3333 15.5455C12.1093 15.6415 11.9182 15.8009 11.7836 16.0042C11.649 16.2074 11.5767 16.4456 11.5758 16.6894V16.8182C11.5758 17.22 11.4161 17.6054 11.132 17.8896C10.8478 18.1737 10.4624 18.3333 10.0606 18.3333C9.65876 18.3333 9.27338 18.1737 8.98923 17.8896C8.70509 17.6054 8.54545 17.22 8.54545 16.8182V16.75C8.53959 16.4992 8.45842 16.2561 8.31251 16.052C8.16659 15.848 7.96268 15.6926 7.72727 15.6061C7.49878 15.5052 7.24531 15.4751 6.99955 15.5197C6.7538 15.5643 6.52703 15.6814 6.34848 15.8561L6.30303 15.9015C6.16231 16.0424 5.99521 16.1541 5.81127 16.2304C5.62734 16.3066 5.43017 16.3459 5.23106 16.3459C5.03195 16.3459 4.83478 16.3066 4.65085 16.2304C4.46691 16.1541 4.29981 16.0424 4.15909 15.9015C4.01822 15.7608 3.90646 15.5937 3.83021 15.4098C3.75396 15.2258 3.71472 15.0287 3.71472 14.8295C3.71472 14.6304 3.75396 14.4333 3.83021 14.2493C3.90646 14.0654 4.01822 13.8983 4.15909 13.7576L4.20455 13.7121C4.37919 13.5336 4.49635 13.3068 4.54091 13.0611C4.58547 12.8153 4.55539 12.5618 4.45455 12.3333C4.35851 12.1093 4.19906 11.9182 3.99581 11.7836C3.79256 11.649 3.55438 11.5767 3.31061 11.5758H3.18182C2.77997 11.5758 2.39459 11.4161 2.11044 11.132C1.8263 10.8478 1.66667 10.4624 1.66667 10.0606C1.66667 9.65876 1.8263 9.27338 2.11044 8.98923C2.39459 8.70509 2.77997 8.54545 3.18182 8.54545H3.25C3.50075 8.53959 3.74394 8.45842 3.94795 8.31251C4.15196 8.16659 4.30736 7.96268 4.39394 7.72727C4.49478 7.49878 4.52487 7.24531 4.48031 6.99955C4.43575 6.7538 4.31859 6.52703 4.14394 6.34848L4.09848 6.30303C3.95761 6.16231 3.84586 5.99521 3.76961 5.81127C3.69336 5.62734 3.65411 5.43017 3.65411 5.23106C3.65411 5.03195 3.69336 4.83478 3.76961 4.65085C3.84586 4.46691 3.95761 4.29981 4.09848 4.15909C4.2392 4.01822 4.40631 3.90646 4.59024 3.83021C4.77418 3.75396 4.97134 3.71472 5.17045 3.71472C5.36957 3.71472 5.56673 3.75396 5.75067 3.83021C5.9346 3.90646 6.10171 4.01822 6.24242 4.15909L6.28788 4.20455C6.46642 4.37919 6.69319 4.49635 6.93895 4.54091C7.1847 4.58547 7.43817 4.55539 7.66667 4.45455H7.72727C7.95134 4.35851 8.14244 4.19906 8.27704 3.99581C8.41164 3.79256 8.48388 3.55438 8.48485 3.31061V3.18182C8.48485 2.77997 8.64448 2.39459 8.92863 2.11044C9.21277 1.8263 9.59816 1.66667 10 1.66667C10.4018 1.66667 10.7872 1.8263 11.0714 2.11044C11.3555 2.39459 11.5152 2.77997 11.5152 3.18182V3.25C11.5161 3.49378 11.5884 3.73195 11.723 3.9352C11.8576 4.13845 12.0487 4.29791 12.2727 4.39394C12.5012 4.49478 12.7547 4.52487 13.0004 4.48031C13.2462 4.43575 13.473 4.31859 13.6515 4.14394L13.697 4.09848C13.8377 3.95761 14.0048 3.84586 14.1887 3.76961C14.3727 3.69336 14.5698 3.65411 14.7689 3.65411C14.9681 3.65411 15.1652 3.69336 15.3492 3.76961C15.5331 3.84586 15.7002 3.95761 15.8409 4.09848C15.9818 4.2392 16.0935 4.40631 16.1698 4.59024C16.246 4.77418 16.2853 4.97134 16.2853 5.17045C16.2853 5.36957 16.246 5.56673 16.1698 5.75067C16.0935 5.9346 15.9818 6.10171 15.8409 6.24242L15.7955 6.28788C15.6208 6.46642 15.5036 6.69319 15.4591 6.93895C15.4145 7.1847 15.4446 7.43817 15.5455 7.66667V7.72727C15.6415 7.95134 15.8009 8.14244 16.0042 8.27704C16.2074 8.41164 16.4456 8.48388 16.6894 8.48485H16.8182C17.22 8.48485 17.6054 8.64448 17.8896 8.92863C18.1737 9.21277 18.3333 9.59816 18.3333 10C18.3333 10.4018 18.1737 10.7872 17.8896 11.0714C17.6054 11.3555 17.22 11.5152 16.8182 11.5152H16.75C16.5062 11.5161 16.268 11.5884 16.0648 11.723C15.8615 11.8576 15.7021 12.0487 15.6061 12.2727Z" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          class="qc-btn qc-btn--lg" :disabled="readonly" aria-label="Options de réponse"
          @click="$emit('options')"
          @mouseenter="showTip($event, 'Options')" @mouseleave="hideTip"
          @focus="showTip($event, 'Options')" @blur="hideTip"
        >
          <svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
            <path d="M14.8333 8.33333C15.7668 8.33333 16.2335 8.33333 16.59 8.15168C16.9036 7.99189 17.1586 7.73692 17.3183 7.42332C17.5 7.0668 17.5 6.60009 17.5 5.66667V5.16667C17.5 4.23325 17.5 3.76654 17.3183 3.41002C17.1586 3.09641 16.9036 2.84145 16.59 2.68166C16.2335 2.5 15.7668 2.5 14.8333 2.5L5.16667 2.5C4.23325 2.5 3.76654 2.5 3.41002 2.68166C3.09641 2.84144 2.84144 3.09641 2.68166 3.41002C2.5 3.76654 2.5 4.23325 2.5 5.16667L2.5 5.66667C2.5 6.60009 2.5 7.0668 2.68166 7.42332C2.84144 7.73692 3.09641 7.99189 3.41002 8.15168C3.76654 8.33333 4.23325 8.33333 5.16667 8.33333L14.8333 8.33333Z" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14.8333 17.5C15.7668 17.5 16.2335 17.5 16.59 17.3183C16.9036 17.1586 17.1586 16.9036 17.3183 16.59C17.5 16.2335 17.5 15.7668 17.5 14.8333V14.3333C17.5 13.3999 17.5 12.9332 17.3183 12.5767C17.1586 12.2631 16.9036 12.0081 16.59 11.8483C16.2335 11.6667 15.7668 11.6667 14.8333 11.6667L5.16667 11.6667C4.23325 11.6667 3.76654 11.6667 3.41002 11.8483C3.09641 12.0081 2.84144 12.2631 2.68166 12.5767C2.5 12.9332 2.5 13.3999 2.5 14.3333L2.5 14.8333C2.5 15.7668 2.5 16.2335 2.68166 16.59C2.84144 16.9036 3.09641 17.1586 3.41002 17.3183C3.76654 17.5 4.23325 17.5 5.16667 17.5H14.8333Z" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Ajouter une question juste en dessous — révélé au survol de la carte -->
    <button
      v-if="!readonly"
      class="qc-add-below"
      aria-label="Ajouter une question en dessous"
      @click="$emit('add')"
    >
      <DsIcon name="plus" :size="20" />
    </button>
  </div>

  <!-- Tooltip DS du libellé d'action, positionné à gauche du bouton survolé -->
  <Teleport to="body">
    <div
      v-if="tip"
      class="fixed z-[9999] pointer-events-none -translate-y-1/2 -translate-x-full"
      :style="{ top: `${tip.top}px`, left: `${tip.left}px` }"
    >
      <DsTooltip :title="tip.label" arrow="right" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import type { Question, QuestionFieldType } from '~/types/dataos'

const props = withDefaults(defineProps<{
  question: Question
  readonly?: boolean
  /** Suppression possible : false quand c'est la dernière question (formulaire non vide). */
  deletable?: boolean
  /** Place le curseur dans le champ titre au montage (1re question d'un formulaire vierge). */
  autofocus?: boolean
}>(), {
  readonly: false,
  deletable: true,
  autofocus: false,
})

// Curseur d'emblée dans le titre à l'arrivée sur un formulaire créé de zéro :
// l'utilisateur peut saisir la question sans cliquer d'abord dans le champ.
const root = ref<HTMLElement | null>(null)
onMounted(async () => {
  if (!props.autofocus || props.readonly) return
  await nextTick()
  root.value?.querySelector('input')?.focus()
})

const emit = defineEmits<{
  grab:      []
  rename:    [label: string]
  duplicate: []
  remove:    []
  settings:  []
  options:   []
  add:       []
}>()

function onRename(value: string) {
  if (!props.readonly) emit('rename', value)
}

// Icône de tête selon le type (choisi dans le panneau Paramètres) — slugs Ds exacts.
const SLUG: Record<QuestionFieldType, string> = {
  text:       'text-input',
  phone:      'phone',
  date:       'calendar',
  producteur: 'users-01',
}
const leadingIcon = computed(() => (props.question.fieldType ? SLUG[props.question.fieldType] : undefined))

// Récap de la liste importée pour une question « Liste de producteurs ».
// Sert aussi d'amorce si rien n'est encore importé.
const hasProducteurs     = computed(() => (props.question.producteurs?.length ?? 0) > 0)
const producteurSummary  = computed(() => {
  if (props.question.fieldType !== 'producteur') return null
  return hasProducteurs.value
    ? `Liste · ${props.question.producteurs!.length} producteurs`
    : 'Aucune liste importée'
})

// Libellé du tooltip de la corbeille : explique l'état inactif sur la dernière question.
const removeTip = computed(() => (props.deletable ? 'Supprimer' : 'Garde au moins une question'))

// Tooltip de libellé d'action au survol.
const tip = ref<{ label: string; top: number; left: number } | null>(null)

function showTip(e: MouseEvent | FocusEvent, label: string) {
  if (props.readonly) return
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  tip.value = { label, top: r.top + r.height / 2, left: r.left - 8 }
}
function hideTip() {
  tip.value = null
}
</script>

<style scoped>
.qc-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--ds-radius-md, 8px);
  color: var(--ds-semantic-fg-tertiary, #475467);
  transition: background-color 0.12s, color 0.12s;
}
.qc-btn:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-secondary, #f9fafb);
  color: var(--ds-semantic-fg-secondary, #344054);
}
.qc-btn:disabled {
  color: var(--ds-semantic-fg-disabled, #98a2b3);
  cursor: default;
}
.qc-btn--lg { width: 40px; height: 40px; }

/* Corbeille : active comme les autres actions ; feedback destructif (rouge) au survol. */
.qc-btn--danger:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-error-primary, #fef3f2);
  color: var(--ds-semantic-fg-error-primary, #d92d20);
}

/* Bouton « + » d'ajout en dessous — débord bas-gauche, révélé au survol. */
.qc-add-below {
  position: absolute;
  bottom: -10px;
  left: -10px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: var(--ds-radius-full, 9999px);
  color: #fff;
  background-color: var(--ds-semantic-bg-brand-solid, #056033);
  border: 1px solid var(--ds-semantic-bg-brand-solid, #056033);
  box-shadow: var(--ds-shadow-xs);
  opacity: 0;
  transform: scale(0.9);
  pointer-events: none;
  transition: opacity 0.15s ease-out, transform 0.15s ease-out, background-color 0.12s ease-out;
}
.group\/qcard:hover .qc-add-below,
.qc-add-below:focus-visible {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.qc-add-below:hover {
  background-color: var(--ds-semantic-bg-brand-solid-hover, #044d29);
  border-color: var(--ds-color-brand-700, #044d29);
}
</style>
