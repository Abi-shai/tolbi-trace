<template>
  <div ref="rootEl" class="relative">
    <!-- Contrôle : sélecteur d'indicatif (gauche) + numéro formaté (droite). -->
    <div
      class="flex items-stretch h-11 w-full rounded-lg border bg-white overflow-hidden transition"
      :class="open
        ? 'border-[#5b9e78] ring-4 ring-[#0560331a]'
        : 'border-border-strong focus-within:border-[#5b9e78] focus-within:ring-4 focus-within:ring-[#0560331a]'"
    >
      <!-- Bouton pays -->
      <button
        type="button"
        class="flex items-center gap-1.5 pl-3 pr-2.5 shrink-0 border-r border-border hover:bg-surface transition-colors"
        :aria-expanded="open"
        @click="toggle"
      >
        <span class="inline-flex items-center justify-center size-5 shrink-0 rounded-full overflow-hidden bg-surface-alt" v-html="flagOf(selectedIso)" />
        <span class="text-sm font-medium text-text-secondary tabular-nums">{{ country.dial }}</span>
        <ChevronDown :size="14" class="text-text-quaternary transition-transform" :class="open && 'rotate-180'" />
      </button>

      <!-- Numéro -->
      <input
        ref="inputEl"
        :value="display"
        type="text"
        inputmode="tel"
        autocomplete="tel-national"
        :placeholder="placeholder"
        class="flex-1 min-w-0 px-3 text-sm text-text-primary placeholder:text-text-quaternary bg-transparent outline-none tabular-nums"
        @input="onInput(($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Popover : recherche + liste des pays (drapeau + nom + indicatif). -->
    <Transition name="pf-pop">
      <div
        v-if="open"
        class="absolute z-30 mt-1.5 left-0 w-[320px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-white overflow-hidden shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)]"
      >
        <div class="p-2 border-b border-border">
          <div class="flex items-center gap-2 h-9 px-3 rounded-lg border border-border-strong">
            <Search :size="16" class="text-text-quaternary shrink-0" />
            <input
              ref="searchEl"
              v-model="query"
              type="text"
              placeholder="Rechercher un pays…"
              class="flex-1 min-w-0 text-sm text-text-primary placeholder:text-text-quaternary bg-transparent outline-none"
              @keydown.esc.stop="close"
            />
          </div>
        </div>
        <div class="max-h-64 overflow-y-auto p-1">
          <button
            v-for="c in filtered"
            :key="c.iso"
            type="button"
            class="flex items-center gap-3 w-full px-2.5 py-2 rounded-lg text-left hover:bg-surface transition-colors"
            :class="c.iso === selectedIso && 'bg-surface'"
            @click="selectCountry(c)"
          >
            <span class="inline-flex items-center justify-center size-6 shrink-0 rounded-full overflow-hidden bg-surface-alt" v-html="flagOf(c.iso)" />
            <span class="flex-1 min-w-0 truncate text-sm font-medium text-text-primary">{{ c.name }}</span>
            <span class="text-sm text-text-tertiary tabular-nums">{{ c.dial }}</span>
            <Check v-if="c.iso === selectedIso" :size="16" class="text-[#056033] shrink-0" />
          </button>
          <p v-if="filtered.length === 0" class="px-3 py-4 text-center text-sm text-text-tertiary">Aucun pays trouvé.</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, Search, Check } from 'lucide-vue-next'
import { COUNTRIES, DEFAULT_COUNTRY_ISO, countryByIso, maxNationalLen, groupDigits } from '~/data/countries'
import { COUNTRY_FLAGS } from '~/data/country-flags'

const props = withDefaults(defineProps<{ modelValue?: string }>(), { modelValue: '' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const selectedIso = ref(DEFAULT_COUNTRY_ISO)
const national    = ref('')     // chiffres du numéro national, sans espaces
const display     = ref('')     // numéro national formaté (avec espaces)
const open        = ref(false)
const query       = ref('')

const rootEl   = ref<HTMLElement | null>(null)
const inputEl  = ref<HTMLInputElement | null>(null)
const searchEl = ref<HTMLInputElement | null>(null)

const country     = computed(() => countryByIso(selectedIso.value))
const maxLen      = computed(() => maxNationalLen(country.value))
const placeholder = computed(() => country.value.groups.map((g) => 'X'.repeat(g)).join(' '))

function flagOf(iso: string) { return COUNTRY_FLAGS[iso] ?? COUNTRY_FLAGS.CI }

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const filtered = computed(() => {
  const q = norm(query.value.trim())
  if (!q) return COUNTRIES
  return COUNTRIES.filter((c) => norm(c.name).includes(q) || c.dial.includes(q) || c.iso.toLowerCase().includes(q))
})

function emitVal() {
  emit('update:modelValue', national.value ? `${country.value.dial} ${display.value}` : '')
}

function onInput(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, maxLen.value)
  national.value = digits
  display.value = groupDigits(digits, country.value.groups)
  emitVal()
}

function selectCountry(c: typeof COUNTRIES[number]) {
  selectedIso.value = c.iso
  national.value = national.value.slice(0, maxNationalLen(c))
  display.value = groupDigits(national.value, c.groups)
  emitVal()
  close()
  nextTick(() => inputEl.value?.focus())
}

function toggle() { open.value ? close() : openMenu() }
function openMenu() { open.value = true; query.value = ''; nextTick(() => searchEl.value?.focus()) }
function close() { open.value = false }

// Applique une valeur venue de l'extérieur (ex. réédition d'un producteur).
function applyExternal(v: string) {
  const digits = (v || '').replace(/\D/g, '')
  const current = (country.value.dial + national.value).replace(/\D/g, '')
  if (digits === current) return   // notre propre écho → on ignore (anti-boucle)
  if (!digits) { national.value = ''; display.value = ''; return }
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.replace(/\D/g, '').length - a.dial.replace(/\D/g, '').length)
  for (const c of sorted) {
    const dd = c.dial.replace(/\D/g, '')
    if (digits.startsWith(dd)) {
      selectedIso.value = c.iso
      national.value = digits.slice(dd.length).slice(0, maxNationalLen(c))
      display.value = groupDigits(national.value, c.groups)
      return
    }
  }
  // indicatif non reconnu : on garde le pays courant, tout en national
  national.value = digits.slice(0, maxLen.value)
  display.value = groupDigits(national.value, country.value.groups)
}

watch(() => props.modelValue, (v) => applyExternal(v ?? ''), { immediate: true })

// Fermeture au clic extérieur.
function onDocPointer(e: PointerEvent) {
  if (open.value && rootEl.value && !rootEl.value.contains(e.target as Node)) close()
}
onMounted(() => document.addEventListener('pointerdown', onDocPointer, true))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocPointer, true))
</script>

<style scoped>
.pf-pop-enter-active { transition: opacity 0.14s ease, transform 0.14s ease; }
.pf-pop-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.pf-pop-enter-from, .pf-pop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
