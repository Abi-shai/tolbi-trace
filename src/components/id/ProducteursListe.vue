<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">

    <Header title="Producteurs">
      <template #actions>
        <DsButton label="Ajouter des producteurs" variant="primary" icon-leading="user-plus-01" @click="$emit('add')" />
      </template>
    </Header>

    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto bg-surface">
      <div class="flex flex-col gap-4 p-6">

        <!-- Métriques -->
        <div class="flex gap-4">
          <MetricCard :icon="Users" label="Nombre de producteurs" :value="stats.count.toLocaleString('fr-FR')" />
          <MetricCard :icon="MapPin" label="Nombre de parcelles" :value="stats.parcelles.toLocaleString('fr-FR')" />
          <MetricCard :icon="Layers" label="Surface totale (Hectares)" :value="stats.surfaceHa.toLocaleString('fr-FR') + ' ha'" />
        </div>

        <!-- Carte principale -->
        <div class="bg-white rounded-xl border border-[#eaecf0] overflow-hidden flex flex-col">

          <!-- Onglets (mode de vue) -->
          <div class="px-6 pt-4 pb-0">
            <div class="flex items-center gap-1 p-1 bg-[#f9fafb] border border-[#eaecf0] rounded-[10px] w-fit">
              <button
                class="flex items-center gap-2 h-9 px-3 rounded-md text-sm font-semibold transition-all"
                :class="activeTab === 'profils'
                  ? 'bg-white shadow-[0px_1px_3px_rgba(16,24,40,0.1),0px_1px_2px_rgba(16,24,40,0.06)] text-text-secondary'
                  : 'text-text-quaternary'"
                style="font-family: var(--ds-typography-font-family-poppins)"
                @click="activeTab = 'profils'"
              >
                <Users :size="16" />
                Profils
              </button>
              <button
                class="flex items-center gap-2 h-9 px-3 rounded-md text-sm font-semibold transition-all"
                :class="activeTab === 'polygones'
                  ? 'bg-white shadow-[0px_1px_3px_rgba(16,24,40,0.1),0px_1px_2px_rgba(16,24,40,0.06)] text-text-secondary'
                  : 'text-text-quaternary'"
                style="font-family: var(--ds-typography-font-family-poppins)"
                @click="activeTab = 'polygones'"
              >
                <Map :size="16" />
                Polygones
              </button>
            </div>
          </div>

          <!-- Bannière : producteurs mis de côté (Phase 3) — nudge sur le segment Base -->
          <div v-if="segment === 'base' && aCorriger.length > 0" class="px-6 pt-4">
            <div class="flex items-center gap-3 px-4 py-3 bg-[#fffaeb] border border-[#fedf89] rounded-xl">
              <div class="flex items-center justify-center size-9 rounded-full bg-[#fef0c7] shrink-0">
                <AlertTriangle :size="20" class="text-[#dc6803]" />
              </div>
              <div class="flex-1 min-w-0 flex flex-col">
                <p class="text-sm font-semibold text-[#b54708]" style="font-family: var(--ds-typography-font-family-poppins)">{{ aCorriger.length }} producteur{{ aCorriger.length > 1 ? 's' : '' }} mis de côté à l'import</p>
                <p class="text-[13px] text-[#b54708] leading-[18px]" style="font-family: var(--ds-typography-font-family-inter)">Corrige-les pour les ajouter à ta base. En attendant, ils ne comptent pas dans tes statistiques.</p>
              </div>
              <button
                class="shrink-0 px-3.5 py-2 bg-white border border-[#fedf89] rounded-lg text-[13px] font-semibold text-[#b54708] hover:bg-[#fffaeb] transition-colors"
                style="font-family: var(--ds-typography-font-family-poppins)"
                @click="segment = 'a-corriger'"
              >
                Voir les producteurs
              </button>
            </div>
          </div>

          <!-- Barre d'outils : segment Base / À corriger + recherche + actions -->
          <div class="flex items-center gap-3 px-6 pt-4 pb-3">
            <!-- Segment de statut -->
            <div class="flex items-center gap-1 p-1 bg-[#f9fafb] border border-[#eaecf0] rounded-[10px] shrink-0">
              <button
                v-for="seg in segments" :key="seg.key"
                class="flex items-center gap-2 h-9 px-3 rounded-md text-[13px] font-semibold transition-all"
                :class="segment === seg.key
                  ? 'bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.06)] text-text-secondary'
                  : 'text-text-quaternary'"
                style="font-family: var(--ds-typography-font-family-poppins)"
                @click="segment = seg.key"
              >
                {{ seg.label }}
                <span
                  class="px-1.5 py-px rounded-full text-xs font-semibold"
                  :class="seg.key === 'a-corriger'
                    ? 'bg-[#fee4e2] text-[#d92d20]'
                    : 'bg-[#f2f4f7] text-[#475467]'"
                  style="font-family: var(--ds-typography-font-family-inter)"
                >{{ seg.count.toLocaleString('fr-FR') }}</span>
              </button>
            </div>

            <div class="flex-1 min-w-0 relative">
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                <Search :size="16" />
              </div>
              <input
                v-model="search"
                type="text"
                placeholder="Rechercher un producteur (ex: code, num...)"
                class="w-full h-10 pl-9 pr-3 border border-[#d0d5dd] rounded-lg text-sm text-text-secondary placeholder-text-quaternary bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors"
                style="font-family: var(--ds-typography-font-family-inter)"
              />
            </div>
            <DsButton label="Télécharger la liste" variant="secondary-gray" icon-leading="download-01" />
            <button
              class="flex items-center justify-center w-10 h-10 bg-white border border-[#d0d5dd] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-[#667085] hover:bg-[#f9fafb] transition-colors shrink-0"
            >
              <MoreVertical :size="16" />
            </button>
          </div>

          <!-- ── Table : base ────────────────────────────────────── -->
          <div v-if="segment === 'base'" class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-t border-b border-[#eaecf0] bg-[#f9fafb]">
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Prénom et nom</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Code parcelles</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">INA</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Numéro de téléphone</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Coopératives</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredRows"
                  :key="row.id"
                  class="border-b border-[#eaecf0] last:border-b-0 bg-white hover:bg-[#f9fafb] transition-colors"
                >
                  <td class="h-16 px-6 py-3">
                    <div class="flex items-center gap-3">
                      <DsAvatar size="sm" :initials="initials(row.prenom, row.nom)" />
                      <EditableCell :value="`${row.prenom} ${row.nom}`" emphasis @commit="(v) => updateName(row, v)" />
                    </div>
                  </td>
                  <td class="h-16 px-6 py-3 text-sm whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">
                    <EditableCell :value="row.codeParcelles" @commit="(v) => prodStore.updateProducteur(row.id, { codeParcelles: v })" />
                  </td>
                  <td class="h-16 px-6 py-3 text-sm whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">
                    <EditableCell :value="row.ina" @commit="(v) => prodStore.updateProducteur(row.id, { ina: v })" />
                  </td>
                  <td class="h-16 px-6 py-3 text-sm whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">
                    <EditableCell :value="row.telephone" @commit="(v) => prodStore.updateProducteur(row.id, { telephone: v })" />
                  </td>
                  <td class="h-16 px-6 py-3 text-sm whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">
                    <EditableCell :value="row.cooperative" @commit="(v) => prodStore.updateProducteur(row.id, { cooperative: v })" />
                  </td>
                  <td class="h-16 px-6 py-3">
                    <div class="flex items-center gap-1">
                      <button class="flex items-center justify-center w-8 h-8 rounded-md text-[#667085] hover:bg-[#f2f4f7] transition-colors">
                        <Pencil :size="16" />
                      </button>
                      <button class="flex items-center justify-center w-8 h-8 rounded-md text-[#667085] hover:bg-[#fef3f2] hover:text-[#d92d20] transition-colors">
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- ── Table : à corriger (bucket persistant) ──────────── -->
          <div v-else class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-t border-b border-[#eaecf0] bg-[#f9fafb]">
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Producteur</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Origine</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Motif</th>
                  <th class="h-11 px-6 py-3 text-right text-xs font-medium text-[#475467] whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredRows"
                  :key="row.id"
                  class="border-b border-[#eaecf0] last:border-b-0 bg-white hover:bg-[#f9fafb] transition-colors"
                >
                  <td class="h-[72px] px-6 py-3">
                    <div class="flex items-center gap-3">
                      <DsAvatar size="sm" :initials="initials(row.prenom, row.nom)" />
                      <span class="text-[13px] font-semibold text-text-primary" style="font-family: var(--ds-typography-font-family-poppins)">{{ row.prenom }} {{ row.nom }}</span>
                    </div>
                  </td>
                  <td class="h-[72px] px-6 py-3 w-[190px]">
                    <span
                      class="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-0.5 rounded-full border text-xs font-semibold"
                      :class="row.correctionKind === 'geo'
                        ? 'bg-[#fef3f2] border-[#fecdca] text-[#b42318]'
                        : 'bg-[#fffaeb] border-[#fedf89] text-[#b54708]'"
                      style="font-family: var(--ds-typography-font-family-poppins)"
                    >
                      <span class="size-1.5 rounded-full" :class="row.correctionKind === 'geo' ? 'bg-[#d92d20]' : 'bg-[#dc6803]'" />
                      {{ row.origine }}
                    </span>
                  </td>
                  <td class="h-[72px] px-6 py-3">
                    <p class="text-[13px] font-semibold text-text-primary leading-[18px]" style="font-family: var(--ds-typography-font-family-poppins)">{{ row.motif?.quoi }}</p>
                    <p class="text-[13px] text-text-secondary leading-[18px]" style="font-family: var(--ds-typography-font-family-inter)">{{ row.motif?.cons }}</p>
                  </td>
                  <td class="h-[72px] px-6 py-3 text-right">
                    <button
                      class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#044b28] hover:gap-2 transition-all"
                      style="font-family: var(--ds-typography-font-family-poppins)"
                      @click="corriger(row)"
                    >
                      {{ row.correctionKind === 'geo' ? 'Sur la carte' : 'Corriger' }}
                      <ArrowRight :size="15" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pied : pagination (base) ou compteur (à corriger) -->
          <div class="flex items-center justify-between px-6 py-3 border-t border-[#eaecf0]">
            <div v-if="segment === 'base'" class="flex items-center gap-1">
              <button
                class="flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-semibold text-[#344054] border border-[#d0d5dd] bg-white hover:bg-[#f9fafb] transition-colors"
                style="font-family: var(--ds-typography-font-family-poppins)"
              >
                <ChevronLeft :size="16" />
                Précédent
              </button>
              <div class="flex items-center gap-0.5 mx-1">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  class="flex items-center justify-center w-9 h-9 rounded-md text-sm font-semibold transition-colors"
                  :class="page === currentPage
                    ? 'bg-[#f9fafb] text-[#1D9E75] border border-[#1D9E75]'
                    : page === '...'
                    ? 'text-[#667085] cursor-default'
                    : 'text-[#667085] hover:bg-[#f9fafb]'"
                  style="font-family: var(--ds-typography-font-family-poppins)"
                  :disabled="page === '...'"
                >
                  {{ page }}
                </button>
              </div>
              <button
                class="flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-semibold text-[#344054] border border-[#d0d5dd] bg-white hover:bg-[#f9fafb] transition-colors"
                style="font-family: var(--ds-typography-font-family-poppins)"
              >
                Suivant
                <ChevronRight :size="16" />
              </button>
            </div>
            <p v-else class="text-[13px] text-text-secondary" style="font-family: var(--ds-typography-font-family-inter)">
              {{ aCorriger.length }} producteur{{ aCorriger.length > 1 ? 's' : '' }} à corriger
            </p>
          </div>

        </div>
      </div>
    </div>

    <!-- Correction cartographique (ouverte depuis une ligne géo à corriger) -->
    <CorrectionCarto v-if="showCarto" :atelier="atelierGeoDemo" @close="onCartoClose" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Users, MapPin, Layers, Search, Map, MoreVertical, Pencil, Trash2, ChevronLeft, ChevronRight, AlertTriangle, ArrowRight } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import MetricCard from '~/components/ui/MetricCard.vue'
import { useProducteursStore } from '~/stores/producteurs'
import { useToastStore } from '~/stores/toast'
import { atelierGeoDemo } from '~/scenarios/producteurs-geo'
import type { Producteur } from '~/types/producteur'

const props = defineProps<{ focusProducteurId?: string }>()
defineEmits<{ add: [] }>()

// Liste KYF réactive : alimentée aussi par la synchronisation Data OS (TOQ-559).
const prodStore = useProducteursStore()
prodStore.init()
const toast = useToastStore()

const stats     = computed(() => prodStore.stats)
const activeTab = ref<'profils' | 'polygones'>('profils')
const search    = ref('')
const currentPage = 1
const visiblePages = [1, 2, 3, '...', 8, 9, 10]

// ── Segment de statut : base créée vs. producteurs mis de côté (Phase 3) ──
type Segment = 'base' | 'a-corriger'
const segment = ref<Segment>('base')
const base      = computed<Producteur[]>(() => prodStore.base)
const aCorriger = computed<Producteur[]>(() => prodStore.aCorriger)
const segments = computed(() => [
  { key: 'base' as Segment,       label: 'Base',       count: stats.value.count },
  { key: 'a-corriger' as Segment, label: 'À corriger', count: aCorriger.value.length },
])

// Deep-link « Voir tous les détails sur ID » (fiche INA) : pré-filtre la liste sur le
// producteur ciblé pour révéler sa ligne (code parcelles, INA, téléphone, coopérative).
if (props.focusProducteurId) {
  const p = prodStore.producteurs.find((x) => x.id === props.focusProducteurId)
  if (p) { segment.value = 'base'; search.value = `${p.prenom} ${p.nom}` }
}

const filteredRows = computed<Producteur[]>(() => {
  const rows = segment.value === 'base' ? base.value : aCorriger.value
  const q = search.value.trim().toLowerCase()
  if (!q) return rows
  return rows.filter(f =>
    `${f.prenom} ${f.nom}`.toLowerCase().includes(q) ||
    f.codeParcelles.toLowerCase().includes(q) ||
    f.ina.toLowerCase().includes(q) ||
    f.telephone.includes(q) ||
    f.cooperative.toLowerCase().includes(q),
  )
})

function initials(prenom: string, nom: string) {
  return (prenom[0] ?? '') + (nom[0] ?? '')
}

// Édition inline du nom : « Prénom Nom » re-splitté sur le premier espace.
function updateName(row: Producteur, v: string) {
  const t = v.trim()
  if (!t) return
  const i = t.indexOf(' ')
  const prenom = i === -1 ? t : t.slice(0, i)
  const nom    = i === -1 ? '' : t.slice(i + 1)
  prodStore.updateProducteur(row.id, { prenom, nom })
}

// ── Correction d'un producteur mis de côté (Phase 3) ──
const showCarto    = ref(false)
const correctingId = ref<string | null>(null)

function corriger(row: Producteur) {
  if (row.correctionKind === 'geo') { correctingId.value = row.id; showCarto.value = true }
  else promote(row)   // attribut : correction inline assumée (prototype)
}
function onCartoClose() {
  showCarto.value = false
  const id = correctingId.value
  correctingId.value = null
  const p = id ? prodStore.producteurs.find(x => x.id === id) : null
  if (p && p.statut === 'a-corriger') promote(p)
}
function promote(p: Producteur) {
  prodStore.promote(p.id)
  toast.show({
    title:       'Producteur corrigé',
    description: `${p.prenom} ${p.nom} a rejoint ta base ID.`,
    duration:    5000,
  })
  if (aCorriger.value.length === 0) segment.value = 'base'
}
</script>
