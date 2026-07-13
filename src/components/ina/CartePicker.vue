<template>
  <!-- Sélecteur de carte précise. Une carte physique porte un serial pré-imprimé :
       l'opérateur tient CETTE carte-là en main et lie exactement ce serial (pas
       « une carte au hasard » du stock). D'où recherche par n° de série + liste à
       sélection unique + aperçu de la carte choisie. `allowNone` ajoute l'option
       « Sans carte pour l'instant » (activation INA, où la carte est facultative).

       Chaque ligne se lit comme une carte : puce QR + serial héro. L'état choisi
       prend l'accent vert « carte vivante » (cohérent CarteInaTile / statut Associée).
       Un lecteur QR matériel tape le serial dans le champ puis envoie Entrée → le
       match unique se sélectionne (scan-to-select). Navigation clavier ↑↓ / ↵. -->
  <div class="flex flex-col gap-2.5">
    <div v-if="label || description" class="flex flex-col gap-0.5">
      <p v-if="label" class="text-sm font-medium text-text-secondary">{{ label }}</p>
      <p v-if="description" class="text-sm text-text-tertiary leading-5">{{ description }}</p>
    </div>

    <!-- Recherche / scan par serial (seulement s'il y a du stock à filtrer) -->
    <template v-if="nbDispo > 0">
      <DsInputField
        v-model="q"
        placeholder="Scanner ou taper un n° de série…"
        @keydown="onKeydown"
      >
        <template #icon-leading><DsIcon name="search-md" :size="20" class="text-text-quaternary" /></template>
      </DsInputField>
      <p class="text-xs text-text-tertiary">{{ countLabel }}</p>
    </template>

    <!-- Liste à sélection unique -->
    <div class="rounded-xl border border-border overflow-hidden">
      <div class="max-h-[236px] overflow-y-auto divide-y divide-border">
        <!-- Option « Sans carte » (activation) -->
        <button
          v-if="allowNone"
          :ref="(el) => setRow(el, 0)"
          type="button"
          class="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors"
          :class="rowClass(modelValue === null, activeIdx === 0)"
          @mouseenter="activeIdx = 0"
          @click="select(null)"
        >
          <span class="radio" :class="modelValue === null ? 'radio--on' : 'radio--off'">
            <span v-if="modelValue === null" class="radio__dot" />
          </span>
          <span class="chip chip--off">
            <Ban :size="15" />
          </span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-semibold text-text-primary">Sans carte pour l'instant</span>
            <span class="block text-xs text-text-tertiary leading-4">Tu pourras l'associer plus tard.</span>
          </span>
        </button>

        <!-- Cartes disponibles -->
        <button
          v-for="(c, i) in filtered"
          :key="c.id"
          :ref="(el) => setRow(el, i + noneOffset)"
          type="button"
          class="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors"
          :class="rowClass(modelValue === c.id, activeIdx === i + noneOffset)"
          @mouseenter="activeIdx = i + noneOffset"
          @click="select(c.id)"
        >
          <span class="radio" :class="modelValue === c.id ? 'radio--on' : 'radio--off'">
            <span v-if="modelValue === c.id" class="radio__dot" />
          </span>
          <!-- Puce carte : évoque la Carte INA physique (QR). Accent vert quand choisie. -->
          <span class="chip" :class="modelValue === c.id ? 'chip--on' : 'chip--off'">
            <QrCode :size="15" />
          </span>
          <!-- Serial héro, avec surlignage de la portion saisie/scannée. -->
          <span class="flex-1 min-w-0 text-[15px] font-semibold text-text-primary mono truncate leading-tight">
            <span
              v-for="(seg, si) in highlight(c.serial)"
              :key="si"
              :class="seg.on ? 'rounded-sm bg-primary/10 text-[#067647]' : ''"
            >{{ seg.t }}</span>
          </span>
          <Check v-if="modelValue === c.id" :size="17" class="shrink-0 text-[#067647]" />
        </button>

        <!-- Aucune correspondance à la recherche -->
        <EmptyState
          v-if="nbDispo > 0 && filtered.length === 0"
          size="sm"
          title="Aucune carte"
          :description="`Aucun numéro de série ne correspond à « ${q.trim()} ».`"
        >
          <template #icon><SearchX :size="20" /></template>
        </EmptyState>

        <!-- Rupture de stock -->
        <EmptyState
          v-else-if="nbDispo === 0"
          size="sm"
          title="Aucune carte en stock"
          description="Génère un lot de cartes pour pouvoir en associer une."
        >
          <template #icon><CreditCard :size="20" /></template>
        </EmptyState>
      </div>

      <!-- Aide clavier (façon palette de commande) -->
      <div
        v-if="filtered.length > 0"
        class="flex items-center justify-center gap-1.5 border-t border-border bg-surface px-3 py-1.5 text-[11px] text-text-quaternary"
      >
        <kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd>
        <span>naviguer</span>
        <span class="text-border-strong">·</span>
        <kbd class="kbd">↵</kbd>
        <span>choisir</span>
      </div>
    </div>

    <!-- Aperçu de la carte choisie (mini-carte : largeur contrainte pour tenir sans
         scroll et se lire comme un aperçu, pas la carte pleine échelle). -->
    <div v-if="selectedCarte" class="flex flex-col gap-1.5">
      <p class="text-xs font-medium text-text-tertiary">Aperçu de la carte une fois associée</p>
      <div class="w-[240px]">
        <CarteInaTile
          statut="activee"
          :numero-ina="previewNumero ?? null"
          :holder="previewHolder ?? null"
          :serial="selectedCarte.serial"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { SearchX, CreditCard, QrCode, Check, Ban } from 'lucide-vue-next'
import CarteInaTile from '~/components/ina/CarteInaTile.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import { useInaStore } from '~/stores/ina'

const props = withDefaults(defineProps<{
  modelValue:     string | null   // carteId sélectionné ; null = aucune / « sans carte »
  allowNone?:     boolean         // affiche l'option « Sans carte pour l'instant »
  label?:         string
  description?:   string
  previewHolder?: string | null   // porteur affiché sur l'aperçu (le producteur)
  previewNumero?: string | null   // N° INA affiché sur l'aperçu
}>(), {
  allowNone:     false,
  label:         'Carte à associer',
  description:   '',
  previewHolder: null,
  previewNumero: null,
})

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const ina = useInaStore()
ina.init()

const q = ref('')

// Stock associable, déjà trié par proximité terrain (distribuée → imprimée → générée).
const dispo   = computed(() => ina.cartesDisponibles)
const nbDispo = computed(() => dispo.value.length)

// Filtre par serial (les tirets/espaces saisis sont ignorés pour rester tolérant).
const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase().replace(/[\s-]/g, '')
  if (!needle) return dispo.value
  return dispo.value.filter((c) => c.serial.toLowerCase().replace(/[\s-]/g, '').includes(needle))
})

// Compteur de stock : total disponible, ou « X sur Y » pendant une recherche.
const countLabel = computed(() => {
  const total = nbDispo.value
  if (!q.value.trim()) return `${total} carte${total > 1 ? 's' : ''} disponible${total > 1 ? 's' : ''}`
  return `${filtered.value.length} sur ${total}`
})

// Carte sélectionnée cherchée dans tout le stock (pas seulement le filtre) : l'aperçu
// persiste même si la recherche ne la fait plus apparaître dans la liste.
const selectedCarte = computed(() => dispo.value.find((c) => c.id === props.modelValue) ?? null)

function select(id: string | null) {
  emit('update:modelValue', id)
}

// ── Surlignage du match ──────────────────────────────────────────────────────
// Met en évidence la portion du serial qui correspond à la saisie brute (couvre les
// cas courants : taper la fin numérique ou la partie « C… » du serial).
function highlight(serial: string): { t: string; on: boolean }[] {
  const raw = q.value.trim()
  if (!raw) return [{ t: serial, on: false }]
  const idx = serial.toLowerCase().indexOf(raw.toLowerCase())
  if (idx === -1) return [{ t: serial, on: false }]
  return [
    { t: serial.slice(0, idx),              on: false },
    { t: serial.slice(idx, idx + raw.length), on: true  },
    { t: serial.slice(idx + raw.length),    on: false },
  ].filter((s) => s.t.length > 0)
}

// ── Navigation clavier + scan-to-select ──────────────────────────────────────
// Les items navigables = [ (Sans carte) , ...cartes filtrées ]. `activeIdx` = curseur
// clavier (distinct de la sélection persistante). Un scan matériel tape le serial
// puis Entrée : la liste se réduit au match unique et Entrée le sélectionne.
const noneOffset = computed(() => (props.allowNone ? 1 : 0))
const navLen     = computed(() => filtered.value.length + noneOffset.value)
const activeIdx  = ref(0)

const rowEls = new Map<number, HTMLElement>()
function setRow(el: unknown, idx: number) {
  if (el) rowEls.set(idx, el as HTMLElement)
  else rowEls.delete(idx)
}

function rowClass(selected: boolean, active: boolean): string {
  if (selected) return 'bg-primary/[0.06]'
  return active ? 'bg-surface' : 'hover:bg-surface'
}

// Place le curseur sur la carte déjà choisie si visible, sinon sur le 1er élément.
function syncActive() {
  const i = filtered.value.findIndex((c) => c.id === props.modelValue)
  activeIdx.value = i >= 0
    ? i + noneOffset.value
    : Math.min(noneOffset.value, Math.max(navLen.value - 1, 0))
}
onMounted(syncActive)
watch(filtered, syncActive)

function scrollActive() {
  nextTick(() => rowEls.get(activeIdx.value)?.scrollIntoView({ block: 'nearest' }))
}

function selectNav(idx: number) {
  if (props.allowNone && idx === 0) { select(null); return }
  const c = filtered.value[idx - noneOffset.value]
  if (c) select(c.id)
}

function onKeydown(e: KeyboardEvent) {
  if (navLen.value === 0) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIdx.value = Math.min(activeIdx.value + 1, navLen.value - 1)
    scrollActive()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIdx.value = Math.max(activeIdx.value - 1, 0)
    scrollActive()
  } else if (e.key === 'Enter') {
    // preventDefault : ne pas déclencher la validation du panneau (scan + Entrée).
    e.preventDefault()
    e.stopPropagation()
    selectNav(activeIdx.value)
  }
}
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }

/* Radio custom (le DS n'a pas de radio-group), fidèle à ModuleAccessPicker. */
.radio {
  margin-top: 1px;
  display: flex;
  height: 1rem;
  width: 1rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  transition: background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
              border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}
.radio--off { border: 1px solid var(--color-border-strong); background: #fff; }
.radio--on  { background: var(--color-primary); }
.radio__dot { height: 0.375rem; width: 0.375rem; border-radius: 9999px; background: #fff; }

/* Puce carte (QR) : neutre par défaut, accent vert « carte vivante » quand choisie. */
.chip {
  display: flex;
  height: 1.75rem;
  width: 1.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--ds-radius-md, 0.5rem);
  transition: background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
              color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}
.chip--off { background: var(--color-surface-alt); color: var(--color-text-quaternary); }
.chip--on  { background: color-mix(in srgb, var(--color-primary) 12%, transparent); color: var(--ds-color-success-700); }

.kbd {
  display: inline-flex;
  min-width: 1rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  background: #fff;
  padding: 0 0.1875rem;
  font-family: var(--ds-typography-font-family-inter);
  line-height: 1.1;
}
</style>
