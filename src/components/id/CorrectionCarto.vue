<template>
  <Teleport to="body">
    <div class="carto-root fixed inset-0 z-[9995] flex flex-col bg-white overflow-hidden">

      <!-- ── Header ────────────────────────────────────────────── -->
      <header class="shrink-0 flex items-center justify-between gap-4 px-6 py-3 border-b border-border bg-white">
        <div class="flex items-center gap-4 min-w-0">
          <button
            class="flex items-center gap-1.5 pl-3 pr-3.5 py-2 rounded-lg border border-border-strong bg-white text-text-secondary hover:bg-surface transition-colors shrink-0"
            @click="$emit('close')"
          >
            <ArrowLeft :size="18" />
            <span class="text-sm font-semibold">Retour au Bilan</span>
          </button>
          <div class="h-6 w-px bg-border shrink-0" />
          <p class="text-lg font-semibold text-text-primary leading-7 truncate">Correction cartographique</p>
          <div class="flex items-center gap-1.5 pl-2.5 pr-3 py-1 rounded-full bg-surface-alt shrink-0">
            <span class="size-2 rounded-full" :class="correctedCount === total ? 'bg-[#079455]' : 'bg-[#056033]'" />
            <span class="text-[13px] font-semibold text-text-secondary whitespace-nowrap">{{ correctedCount }} sur {{ total }} corrigé{{ total > 1 ? 's' : '' }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2.5 shrink-0">
          <DsButton
            v-if="sureCount > 0"
            :label="batchLabel"
            variant="secondary-gray"
            icon-leading="stars-02"
            @click="confirmAllSure"
          />
          <DsButton label="Terminer" variant="primary" @click="$emit('close')" />
        </div>
      </header>

      <!-- ── Corps : queue | carte | panneau ─────────────────────── -->
      <div class="flex flex-1 min-h-0">

        <!-- Liste-queue -->
        <aside class="w-[316px] shrink-0 flex flex-col border-r border-border bg-white min-h-0">
          <div class="flex items-start justify-between gap-3 px-4 pt-5 pb-3 shrink-0">
            <div class="flex flex-col gap-0.5 min-w-0">
              <p class="text-base font-semibold text-text-primary leading-[22px]">À corriger</p>
              <p class="text-[13px] text-text-secondary leading-[18px]">Fichier géographique</p>
            </div>
            <div class="flex items-center px-2.5 py-0.5 rounded-full bg-[#fee4e2] border border-[#fda29b] shrink-0">
              <span class="text-[13px] font-semibold text-[#d92d20]">{{ remainingCount }}</span>
            </div>
          </div>
          <div class="flex-1 min-h-0 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
            <button
              v-for="it in items" :key="it.id"
              class="flex items-center gap-2.5 px-3 py-3 rounded-[10px] border text-left transition-colors"
              :class="itemClass(it)"
              @click="selectItem(it.id)"
            >
              <component :is="statusIcon(it).comp" :size="20" :class="statusIcon(it).class" class="shrink-0" />
              <div class="flex-1 min-w-0 flex flex-col">
                <p class="truncate text-[13px] font-semibold" :class="it.corrige ? 'text-text-quaternary' : 'text-text-primary'">{{ itemTitle(it) }}</p>
                <p class="truncate text-[13px] leading-[18px]" :class="it.corrige ? 'text-[#079455]' : 'text-text-secondary'">{{ itemSubtitle(it) }}</p>
              </div>
              <ChevronRight v-if="it.id === activeId && !it.corrige" :size="16" class="text-[#056033] shrink-0" />
            </button>
          </div>
        </aside>

        <!-- Carte -->
        <div class="relative flex-1 min-h-0 bg-[#20261a] overflow-hidden">
          <div ref="mapRef" class="w-full h-full" />

          <!-- Bulle d'aide (haut-gauche) -->
          <div class="absolute top-4 left-4 z-10 max-w-[280px] px-3.5 py-2.5 rounded-xl bg-white shadow-[0px_4px_12px_-2px_rgba(16,24,40,0.16)] pointer-events-none">
            <p class="text-[13px] font-semibold text-text-primary leading-[18px]">{{ hint.title }}</p>
            <p class="text-[13px] text-text-secondary leading-[18px]">{{ hint.body }}</p>
          </div>

          <!-- Palette d'outils (haut-centre) -->
          <div class="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 p-1 rounded-[10px] bg-white shadow-[0px_4px_12px_-2px_rgba(16,24,40,0.16)]">
            <button
              v-for="t in tools" :key="t.key"
              class="flex items-center justify-center size-9 rounded-lg transition-colors"
              :class="activeTool === t.key ? 'bg-[#ecfdf3] text-[#056033]' : 'text-text-secondary hover:bg-surface'"
              :title="t.label"
              @click="activeTool = t.key"
            >
              <component :is="t.icon" :size="18" />
            </button>
            <div class="h-[22px] w-px bg-border mx-0.5" />
            <button class="flex items-center justify-center size-9 rounded-lg text-text-secondary hover:bg-surface transition-colors" title="Mesurer la surface">
              <Ruler :size="18" />
            </button>
          </div>

          <!-- Point sélectionné : marqueur + mini-toolbar ancrée -->
          <template v-if="toolbarPos">
            <div class="absolute z-10 pointer-events-none" :style="{ left: toolbarPos.x + 'px', top: toolbarPos.y + 'px', transform: 'translate(-50%,-50%)' }">
              <div class="size-4 rounded-full bg-white ring-[3px] ring-[#fdb022] shadow-[0px_0px_0px_8px_rgba(253,176,34,0.25)]" />
            </div>
            <div
              class="absolute z-20 flex items-center gap-0.5 p-1 rounded-[10px] bg-white shadow-[0px_6px_16px_-2px_rgba(16,24,40,0.2)]"
              :style="{ left: toolbarPos.x + 'px', top: toolbarPos.y + 'px', transform: 'translate(-50%,calc(-100% - 18px))' }"
            >
              <button
                class="flex items-center justify-center size-9 rounded-lg transition-colors"
                :class="moveMode ? 'bg-[#ecfdf3] text-[#056033]' : 'text-text-secondary hover:bg-surface'"
                title="Déplacer le point" @click="startMove"
              ><Move :size="18" /></button>
              <button class="flex items-center justify-center size-9 rounded-lg text-text-secondary hover:bg-surface transition-colors" title="Modifier les coordonnées"><Target :size="18" /></button>
              <button class="flex items-center justify-center size-9 rounded-lg text-text-secondary hover:bg-surface transition-colors" title="Supprimer le point" @click="onPointDelete"><Trash2 :size="18" /></button>
              <button class="flex items-center justify-center size-9 rounded-lg text-text-secondary hover:bg-surface transition-colors" title="Importer un tracé"><Upload :size="18" /></button>
              <div class="h-[22px] w-px bg-border mx-0.5" />
              <button
                class="flex items-center justify-center size-9 rounded-lg transition-colors"
                :class="isOrphan ? 'bg-[#ecfdf3] text-[#056033]' : 'text-text-secondary hover:bg-surface'"
                title="Lier à la parcelle"
                @click="onPointLink"
              ><Link2 :size="18" /></button>
            </div>
          </template>

          <!-- Zoom + recadrage (bas-droite) -->
          <div class="absolute bottom-4 right-4 z-10 flex flex-col items-center gap-2">
            <div class="flex flex-col bg-white rounded-lg overflow-hidden shadow-[0px_4px_12px_-2px_rgba(16,24,40,0.16)]">
              <button class="flex items-center justify-center size-11 text-text-secondary hover:bg-surface transition-colors" @click="map?.zoomIn()"><Plus :size="20" /></button>
              <div class="h-px bg-border" />
              <button class="flex items-center justify-center size-11 text-text-secondary hover:bg-surface transition-colors" @click="map?.zoomOut()"><Minus :size="20" /></button>
            </div>
            <button class="flex items-center justify-center size-11 bg-white rounded-lg text-text-secondary hover:bg-surface shadow-[0px_4px_12px_-2px_rgba(16,24,40,0.16)] transition-colors" title="Recadrer" @click="recenter"><LocateFixed :size="20" /></button>
          </div>
        </div>

        <!-- Panneau contextuel -->
        <aside class="w-[360px] shrink-0 flex flex-col border-l border-border bg-white min-h-0 overflow-y-auto">
          <template v-if="activeItem">

            <!-- Rattachement (tracé orphelin) -->
            <div v-if="activeItem.anomalie === 'trace-orphelin'" class="flex flex-col gap-4 p-5">
              <div class="flex flex-col gap-2">
                <span class="self-start px-2.5 py-0.5 rounded-full bg-surface-alt text-xs font-semibold text-text-secondary">Tracé orphelin</span>
                <p class="text-lg font-semibold text-text-primary leading-7">Rattacher ce tracé</p>
                <p class="text-[13px] text-text-secondary leading-[18px]" style="font-family: var(--ds-typography-font-family-inter)">Relevé {{ orphanRef }} · {{ orphanSurface }} · {{ orphanSommets }} sommets</p>
              </div>

              <template v-if="activeItem.orphelin?.suggestion">
                <div class="flex flex-col gap-3.5 p-4 rounded-xl border border-[#abefc6] bg-[#f6fef9]">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1.5">
                      <Sparkles :size="16" class="text-[#067647]" />
                      <span class="text-[13px] font-semibold text-[#067647]">Rattachement proposé</span>
                    </div>
                    <span v-if="activeItem.orphelin.suggestion.sure" class="px-2 py-0.5 rounded-full bg-[#dcfae6] text-xs font-semibold text-[#067647]">Sûre</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <DsAvatar size="md" :initials="initials(activeItem.orphelin.suggestion.cibleProducteur)" />
                    <div class="flex flex-col min-w-0">
                      <p class="text-[15px] font-semibold text-text-primary leading-[22px] truncate">{{ activeItem.orphelin.suggestion.cibleProducteur }}</p>
                      <p class="text-[13px] text-text-secondary leading-[18px] truncate">Parcelle {{ cibleWaypoint }}</p>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <div v-for="(r, i) in rationaleLines" :key="i" class="flex items-start gap-2">
                      <CheckCircle2 :size="16" class="text-[#067647] shrink-0 mt-0.5" />
                      <p class="text-[13px] text-text-secondary leading-[18px]">{{ r }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <DsButton label="Confirmer" variant="primary" class="flex-1" @click="confirmRattachement" />
                    <DsButton label="Rejeter" variant="secondary-gray" @click="rejectSuggestion" />
                  </div>
                </div>
                <div class="flex items-start gap-1.5">
                  <Info :size="15" class="text-text-quaternary shrink-0 mt-px" />
                  <p class="text-xs text-text-tertiary leading-4">Vérifie avant de confirmer, l'IA peut se tromper.</p>
                </div>
              </template>

              <div class="h-px bg-border" />
              <div class="flex flex-col gap-2.5">
                <p class="text-[13px] text-text-secondary">{{ activeItem.orphelin?.suggestion ? 'Ce n\'est pas la bonne parcelle ?' : 'Aucune suggestion — rattache à la main.' }}</p>
                <button class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border-strong bg-white text-text-secondary hover:bg-surface transition-colors">
                  <MapPin :size="18" />
                  <span class="text-sm font-semibold">Choisir une autre parcelle</span>
                </button>
                <button class="self-start text-[13px] font-semibold text-text-tertiary hover:text-text-secondary transition-colors" @click="markCorrige">Ignorer ce tracé</button>
              </div>
            </div>

            <!-- Nettoyage : sommet aberrant -->
            <div v-else-if="activeItem.anomalie === 'sommet-aberrant'" class="flex flex-col gap-4 p-5">
              <div class="flex flex-col gap-2">
                <span class="self-start px-2.5 py-0.5 rounded-full bg-[#fee4e2] text-xs font-semibold text-[#b42318]">Sommet aberrant</span>
                <p class="text-lg font-semibold text-text-primary leading-7">{{ itemTitle(activeItem) }}</p>
                <p class="text-[13px] text-text-primary font-semibold leading-[18px]">{{ activeItem.motif.quoi }}</p>
                <p class="text-[13px] text-text-secondary leading-[18px]">{{ activeItem.motif.consequence }}</p>
              </div>
              <div class="flex flex-col gap-3 p-4 rounded-xl border border-border bg-surface">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-[13px] font-semibold text-text-secondary">{{ selectedSommet ? 'Coordonnées du point' : 'Point retiré' }}</p>
                  <span class="text-[13px] font-semibold text-text-primary" style="font-family: var(--ds-typography-font-family-inter)">{{ surfaceLabel }}</span>
                </div>
                <div v-if="selectedSommet" class="flex gap-3">
                  <div class="flex-1 flex flex-col gap-1">
                    <label class="text-xs font-medium text-text-tertiary">Latitude</label>
                    <div class="px-3 py-2 rounded-lg border border-border-strong bg-white text-sm text-text-primary" style="font-family: var(--ds-typography-font-family-inter)">{{ selectedSommet.coord[1].toFixed(5) }}</div>
                  </div>
                  <div class="flex-1 flex flex-col gap-1">
                    <label class="text-xs font-medium text-text-tertiary">Longitude</label>
                    <div class="px-3 py-2 rounded-lg border border-border-strong bg-white text-sm text-text-primary" style="font-family: var(--ds-typography-font-family-inter)">{{ selectedSommet.coord[0].toFixed(5) }}</div>
                  </div>
                </div>
                <p class="text-[13px] text-text-tertiary leading-[18px]">{{ selectedSommet ? 'Fais glisser le point sur la carte, ou supprime-le du tracé.' : 'Le sommet aberrant a été retiré, la surface est recalculée.' }}</p>
              </div>
              <div class="flex items-center gap-2">
                <DsButton label="Marquer corrigé" variant="primary" class="flex-1" @click="markCorrige" />
                <button class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#fda29b] bg-white text-[#d92d20] hover:bg-[#fef3f2] transition-colors" @click="onPointDelete">
                  <Trash2 :size="18" />
                  <span class="text-sm font-semibold">Supprimer</span>
                </button>
              </div>
            </div>

            <!-- Nettoyage : contour non refermé / géométrie manquante -->
            <div v-else class="flex flex-col gap-4 p-5">
              <div class="flex flex-col gap-2">
                <span class="self-start px-2.5 py-0.5 rounded-full bg-[#fee4e2] text-xs font-semibold text-[#b42318]">{{ anomalieLabel(activeItem.anomalie) }}</span>
                <p class="text-lg font-semibold text-text-primary leading-7">{{ itemTitle(activeItem) }}</p>
                <p class="text-[13px] text-text-primary font-semibold leading-[18px]">{{ activeItem.motif.quoi }}</p>
                <p class="text-[13px] text-text-secondary leading-[18px]">{{ activeItem.motif.consequence }}</p>
              </div>
              <div class="flex flex-col gap-2.5">
                <button
                  v-if="activeItem.anomalie === 'geometrie-manquante'"
                  class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#056033] text-white hover:bg-[#044b28] transition-colors"
                >
                  <PencilLine :size="18" />
                  <span class="text-sm font-semibold">Dessiner la parcelle</span>
                </button>
                <button class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border-strong bg-white text-text-secondary hover:bg-surface transition-colors">
                  <Upload :size="18" />
                  <span class="text-sm font-semibold">Importer un tracé</span>
                </button>
                <DsButton
                  v-if="activeItem.anomalie === 'geometrie-invalide'"
                  label="Fermer le contour"
                  variant="primary"
                  @click="markCorrige"
                />
                <button class="self-start mt-1 text-[13px] font-semibold text-text-tertiary hover:text-text-secondary transition-colors" @click="markCorrige">Marquer corrigé</button>
              </div>
            </div>

          </template>

          <!-- Tous les items traités -->
          <div v-else class="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div class="flex items-center justify-center size-12 rounded-full bg-[#dcfae6]">
              <Check :size="24" class="text-[#079455]" />
            </div>
            <p class="text-base font-semibold text-text-primary">Tout est corrigé</p>
            <p class="text-[13px] text-text-secondary leading-[18px]">Les {{ total }} parcelles à corriger sont traitées. Reviens au Bilan pour finaliser.</p>
          </div>
        </aside>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  ArrowLeft, ChevronRight, Sparkles, CheckCircle2, Check, Info, MapPin,
  Move, Target, Trash2, Upload, Link2, PencilLine, Ruler, Plus, Minus, LocateFixed, AlertTriangle,
} from 'lucide-vue-next'
import type { Map as MaplibreMap, GeoJSONSource, StyleSpecification, MapMouseEvent, MapLayerMouseEvent } from 'maplibre-gl'
import { useScenarioStore } from '~/stores/scenario'
import type { AtelierGeo, ItemCorrection, LngLat, Sommet, TypeAnomalie } from '~/types/geo'

// `atelier` optionnel : la vue Producteurs (Phase 3) ouvre l'atelier en autonome en
// passant ses données ; l'import (ImportMatching) le laisse lire le scénario actif.
const props = defineProps<{ atelier?: AtelierGeo }>()
const emit = defineEmits<{ close: [] }>()

const scenario = useScenarioStore()
const atelier = computed<AtelierGeo | null>(() => props.atelier ?? scenario.producteurs?.atelierGeo ?? null)

// Copie de travail : confirmer/rejeter mute cette copie, jamais le scénario mock.
const items = ref<ItemCorrection[]>([])
const activeId = ref<string | null>(null)
watch(atelier, (a) => {
  items.value = a ? JSON.parse(JSON.stringify(a.aCorriger)) as ItemCorrection[] : []
  activeId.value = items.value.find(i => !i.corrige)?.id ?? items.value[0]?.id ?? null
}, { immediate: true })

const activeItem = computed<ItemCorrection | null>(() => items.value.find(i => i.id === activeId.value) ?? null)
const isOrphan = computed(() => activeItem.value?.anomalie === 'trace-orphelin')
const total = computed(() => items.value.length)
const correctedCount = computed(() => items.value.filter(i => i.corrige).length)
const remainingCount = computed(() => total.value - correctedCount.value)
const sureCount = computed(() =>
  items.value.filter(i => !i.corrige && i.anomalie === 'trace-orphelin' && i.orphelin?.suggestion?.sure).length,
)
const batchLabel = computed(() => sureCount.value === 1
  ? 'Confirmer le rattachement sûr'
  : `Confirmer les ${sureCount.value} rattachements sûrs`)

// ── Outils (palette Felt) ──
type ToolKey = 'select' | 'draw' | 'import'
const activeTool = ref<ToolKey>('select')
const tools = [
  { key: 'select' as ToolKey, label: 'Sélectionner', icon: Target },
  { key: 'draw'   as ToolKey, label: 'Dessiner un tracé', icon: PencilLine },
  { key: 'import' as ToolKey, label: 'Importer un tracé', icon: Upload },
]

// ── Libellés / icônes d'anomalie ──
const ANOMALIE_LABEL: Record<TypeAnomalie, string> = {
  'sommet-aberrant':     'Sommet aberrant',
  'geometrie-invalide':  'Contour non refermé',
  'geometrie-manquante': 'Géométrie manquante',
  'trace-orphelin':      'Rattachement proposé',
}
function anomalieLabel(a: TypeAnomalie) { return ANOMALIE_LABEL[a] }

function itemTitle(it: ItemCorrection) {
  if (it.producteur) return `${it.producteur.prenom} ${it.producteur.nom}`
  return it.orphelin?.suggestion?.cibleProducteur ?? 'Tracé orphelin'
}
function itemSubtitle(it: ItemCorrection) {
  return it.corrige ? 'Corrigé' : ANOMALIE_LABEL[it.anomalie]
}
function statusIcon(it: ItemCorrection) {
  if (it.corrige) return { comp: CheckCircle2, class: 'text-[#079455]' }
  if (it.anomalie === 'trace-orphelin') return { comp: Sparkles, class: 'text-[#056033]' }
  return { comp: AlertTriangle, class: 'text-[#d92d20]' }
}
function itemClass(it: ItemCorrection) {
  if (it.id === activeId.value && !it.corrige) return 'bg-[#ecfdf3] border-[#056033]'
  if (it.corrige) return 'bg-surface border-border'
  return 'bg-white border-border hover:border-border-strong'
}

// ── Panneau : détails de l'item actif ──
function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}
const orphanRef = computed(() => activeItem.value?.orphelin ? 'ZN9' : '—')
const orphanSommets = computed(() => activeItem.value?.orphelin?.sommets.length ?? 0)
const orphanSurface = computed(() => '1,3 ha')
const cibleWaypoint = computed(() => activeItem.value?.orphelin?.suggestion?.cibleProducteurId?.replace('pg-', 'WP') ?? '—')
const rationaleLines = computed<string[]>(() => {
  const s = activeItem.value?.orphelin?.suggestion
  if (!s) return []
  const lines = [s.rationale]
  if (s.distanceM != null) lines.push(`Bord commun estimé, à ${s.distanceM} m`)
  return lines
})
const hint = computed(() => {
  if (moveMode.value) return { title: 'Repositionner le point', body: 'Clique sur la carte pour placer le sommet.' }
  const it = activeItem.value
  if (!it) return { title: 'Tout est corrigé', body: 'Reviens au Bilan pour finaliser.' }
  if (it.anomalie === 'trace-orphelin') return { title: 'Tracé orphelin sélectionné', body: 'Relie-le à une parcelle, ou nettoie-le.' }
  if (it.anomalie === 'sommet-aberrant') return { title: 'Sommet aberrant sélectionné', body: 'Déplace le point, ou supprime-le du tracé.' }
  if (it.anomalie === 'geometrie-invalide') return { title: 'Contour non refermé', body: 'Ferme l\'anneau de la parcelle.' }
  return { title: 'Géométrie manquante', body: 'Dessine la parcelle, ou importe un tracé.' }
})

// ── Actions ──
function selectItem(id: string) { activeId.value = id }
function advance() { activeId.value = items.value.find(i => !i.corrige)?.id ?? null }
function confirmRattachement() { if (activeItem.value) { activeItem.value.corrige = true; advance() } }
function rejectSuggestion() { if (activeItem.value?.orphelin) activeItem.value.orphelin.suggestion = undefined }
function markCorrige() { if (activeItem.value) { activeItem.value.corrige = true; advance() } }
function confirmAllSure() {
  items.value.forEach(i => {
    if (!i.corrige && i.anomalie === 'trace-orphelin' && i.orphelin?.suggestion?.sure) i.corrige = true
  })
  advance()
}
// Actions de la mini-toolbar sur le point sélectionné.
function onPointLink() { if (isOrphan.value) confirmRattachement() }
function onPointDelete() { deleteSelectedSommet() }

// ── Carte MapLibre ───────────────────────────────────────────────────
const ESRI_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const mapRef = ref<HTMLElement | null>(null)
let map: MaplibreMap | null = null
let mapLoaded = false
let resizeObs: ResizeObserver | null = null
const toolbarPos = ref<{ x: number; y: number } | null>(null)

// GeoJSON helpers (mêmes conventions que ManuelAjout).
function ring(coords: LngLat[]): LngLat[] {
  const r = [...coords]; const a = r[0], b = r[r.length - 1]
  if (r.length && a && b && (a[0] !== b[0] || a[1] !== b[1])) r.push(a)
  return r
}
function poly(coords: LngLat[], props: Record<string, unknown> = {}) {
  return { type: 'Feature', properties: props, geometry: { type: 'Polygon', coordinates: [ring(coords)] } }
}
function pointF(coord: LngLat, props: Record<string, unknown> = {}) {
  return { type: 'Feature', properties: props, geometry: { type: 'Point', coordinates: coord } }
}
function lineF(coords: LngLat[]) {
  return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }
}
function fc(features: unknown[]) { return { type: 'FeatureCollection', features } as never }
function centroid(coords: LngLat[]): LngLat {
  let x = 0, y = 0; for (const c of coords) { x += c[0]; y += c[1] }
  return [x / coords.length, y / coords.length]
}
function setData(id: string, data: unknown) {
  const s = map?.getSource(id) as GeoJSONSource | undefined
  if (s) s.setData(data as never)
}

// Parcelle cible (la suggestion IA) parmi les parcelles de contexte.
function targetProducteur(it: ItemCorrection | null) {
  const sug = it?.orphelin?.suggestion
  return sug ? atelier.value?.contexte.find(pg => pg.id === sug.cibleProducteurId) ?? null : null
}

// ── Sommet sélectionné : cible des actions de la mini-toolbar ──
const selectedSommetId = ref<string | null>(null)
const moveMode = ref(false)   // « déplacer » armé : le prochain clic carte repositionne
let dragging = false

function activeSommets(): Sommet[] {
  const it = activeItem.value
  if (!it) return []
  if (it.orphelin) return it.orphelin.sommets
  if (it.producteur) return it.producteur.parcelles.flatMap(p => p.sommets)
  return []
}
// Sommet sélectionné = choix explicite (clic/drag), sinon le sommet par défaut de
// l'item. Éviter de forcer selectedSommetId dans un watch immediate (TDZ au setup).
const selectedSommet = computed<Sommet | null>(() => {
  const sommets = activeSommets()
  const explicit = selectedSommetId.value ? sommets.find(s => s.id === selectedSommetId.value) : null
  if (explicit) return explicit
  const did = defaultSommetId()
  return did ? sommets.find(s => s.id === did) ?? null : null
})
const currentSid = computed<string | null>(() => selectedSommet.value?.id ?? null)
const selectedPointCoord = computed<LngLat | null>(() => selectedSommet.value?.coord ?? null)

// Sommet sélectionné par défaut quand l'item change : le sommet aberrant, ou le
// sommet du tracé orphelin le plus proche de la parcelle cible.
function defaultSommetId(): string | null {
  const it = activeItem.value
  if (!it) return null
  if (it.orphelin) {
    const sommets = it.orphelin.sommets
    if (!sommets.length) return null
    const tgt = targetProducteur(it)
    if (tgt) {
      const tc = centroid(tgt.parcelles.flatMap(p => p.sommets.map(s => s.coord)))
      let best = sommets[0], bd = Infinity
      for (const s of sommets) { const d = (s.coord[0] - tc[0]) ** 2 + (s.coord[1] - tc[1]) ** 2; if (d < bd) { bd = d; best = s } }
      return best.id
    }
    return sommets[0].id
  }
  if (it.producteur) {
    for (const par of it.producteur.parcelles) { const ab = par.sommets.find(s => s.aberrant); if (ab) return ab.id }
    return it.producteur.parcelles[0]?.sommets[0]?.id ?? null
  }
  return null
}

// Surface calculée en direct (formule des lacets projetée en mètres à la latitude
// locale — approximation suffisante en prototype), pour refléter une correction.
function polygonAreaHa(coords: LngLat[]): number {
  if (coords.length < 3) return 0
  const lat0 = coords.reduce((s, c) => s + c[1], 0) / coords.length
  const mLng = 111320 * Math.cos((lat0 * Math.PI) / 180), mLat = 110574
  let a = 0
  for (let i = 0; i < coords.length; i++) {
    const [x1, y1] = coords[i], [x2, y2] = coords[(i + 1) % coords.length]
    a += (x1 * mLng) * (y2 * mLat) - (x2 * mLng) * (y1 * mLat)
  }
  return Math.abs(a / 2) / 10000
}
const liveSurface = computed<number>(() => {
  const it = activeItem.value
  if (it?.producteur) { const par = it.producteur.parcelles[0]; if (par) return polygonAreaHa(par.sommets.map(s => s.coord)) }
  if (it?.orphelin) return polygonAreaHa(it.orphelin.sommets.map(s => s.coord))
  return 0
})
const surfaceLabel = computed(() => `${liveSurface.value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ha`)

// Déplacer / supprimer le sommet sélectionné — mute la copie de travail, ce qui
// re-render la carte (watch deep) et recalcule la surface.
function setSommetCoord(sid: string, coord: LngLat) {
  const s = activeSommets().find(x => x.id === sid)
  if (s) { s.coord = coord; if (s.aberrant) s.aberrant = false }   // déplacé = plus aberrant
}
function deleteSelectedSommet() {
  const it = activeItem.value, sid = currentSid.value
  if (!it || !sid) return
  if (it.orphelin) it.orphelin.sommets = it.orphelin.sommets.filter(s => s.id !== sid)
  else if (it.producteur) for (const par of it.producteur.parcelles) par.sommets = par.sommets.filter(s => s.id !== sid)
  selectedSommetId.value = null
  moveMode.value = false
}
function startMove() { if (currentSid.value) moveMode.value = !moveMode.value }

function renderLayers() {
  if (!map || !mapLoaded) return
  const a = atelier.value; if (!a) return
  const it = activeItem.value
  const ctx: unknown[] = []
  for (const pg of a.contexte) for (const par of pg.parcelles) ctx.push(poly(par.sommets.map(s => s.coord)))
  const active: unknown[] = [], verts: unknown[] = [], orphan: unknown[] = [], target: unknown[] = [], link: unknown[] = []
  if (it?.producteur) {
    for (const par of it.producteur.parcelles) {
      active.push(poly(par.sommets.map(s => s.coord)))
      par.sommets.forEach(s => verts.push(pointF(s.coord, { aberrant: !!s.aberrant, sid: s.id })))
    }
  }
  if (it?.orphelin) {
    orphan.push(poly(it.orphelin.sommets.map(s => s.coord)))
    it.orphelin.sommets.forEach(s => verts.push(pointF(s.coord, { sid: s.id })))
    const tgt = targetProducteur(it)
    if (tgt) {
      const oc = centroid(it.orphelin.sommets.map(s => s.coord))
      for (const par of tgt.parcelles) {
        target.push(poly(par.sommets.map(s => s.coord)))
        link.push(lineF([oc, centroid(par.sommets.map(s => s.coord))]))
      }
    }
  }
  setData('contexte', fc(ctx)); setData('active', fc(active)); setData('orphan', fc(orphan))
  setData('target', fc(target)); setData('link', fc(link)); setData('vertices', fc(verts))
}

function fitActive() {
  if (!map || !mapLoaded) return
  const it = activeItem.value
  const pts: LngLat[] = []
  if (it?.producteur) for (const par of it.producteur.parcelles) for (const s of par.sommets) pts.push(s.coord)
  if (it?.orphelin) {
    for (const s of it.orphelin.sommets) pts.push(s.coord)
    const tgt = targetProducteur(it)
    if (tgt) for (const par of tgt.parcelles) for (const s of par.sommets) pts.push(s.coord)
  }
  if (!pts.length) { map.flyTo({ center: atelier.value?.centre ?? [-16.9, 14.7], zoom: atelier.value?.zoom ?? 14, duration: 500 }); return }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const [x, y] of pts) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y) }
  map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 130, maxZoom: 16.5, duration: 500 })
}

function updateToolbar() {
  const c = selectedPointCoord.value
  if (!map || !mapLoaded || !c) { toolbarPos.value = null; return }
  const p = map.project(c as [number, number])
  toolbarPos.value = { x: p.x, y: p.y }
}
function recenter() { fitActive() }

// ── Interactions sur les sommets : drag direct + clic-pour-repositionner ──
function onVertexDown(e: MapLayerMouseEvent) {
  if (!map) return
  e.preventDefault()   // empêche le pan de la carte pendant le drag
  const sid = e.features?.[0]?.properties?.sid
  if (sid == null) return
  selectedSommetId.value = String(sid)
  moveMode.value = false
  dragging = true
  map.on('mousemove', onVertexMove)
  map.once('mouseup', onVertexUp)
}
function onVertexMove(e: MapMouseEvent) {
  if (!dragging || !selectedSommetId.value) return
  setSommetCoord(selectedSommetId.value, [e.lngLat.lng, e.lngLat.lat])
}
function onVertexUp() {
  dragging = false
  if (map) { map.off('mousemove', onVertexMove); map.getCanvas().style.cursor = '' }
}
function onMapClick(e: MapMouseEvent) {
  const sid = currentSid.value
  if (!moveMode.value || !sid) return
  setSommetCoord(sid, [e.lngLat.lng, e.lngLat.lat])
  moveMode.value = false
  if (map) map.getCanvas().style.cursor = ''
}

async function initMap() {
  if (map || !mapRef.value) return
  const maplibregl = (await import('maplibre-gl')).default
  const style: StyleSpecification = {
    version: 8,
    sources: { sat: { type: 'raster', tiles: [ESRI_TILES], tileSize: 256, attribution: '© Esri, Maxar, Earthstar Geographics' } },
    layers: [{ id: 'sat', type: 'raster', source: 'sat' }],
  }
  map = new maplibregl.Map({
    container: mapRef.value,
    style,
    center: atelier.value?.centre ?? [-16.9, 14.7],
    zoom: atelier.value?.zoom ?? 14,
    attributionControl: false,
    dragRotate: false,
  })
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
  map.on('load', () => {
    if (!map) return
    for (const id of ['contexte', 'active', 'orphan', 'target', 'link', 'vertices']) map.addSource(id, { type: 'geojson', data: fc([]) })
    map.addLayer({ id: 'contexte-fill', type: 'fill', source: 'contexte', paint: { 'fill-color': '#ea6e14', 'fill-opacity': 0.14 } })
    map.addLayer({ id: 'contexte-line', type: 'line', source: 'contexte', paint: { 'line-color': '#f26d1e', 'line-opacity': 0.5, 'line-width': 2 } })
    map.addLayer({ id: 'target-fill', type: 'fill', source: 'target', paint: { 'fill-color': '#fdb022', 'fill-opacity': 0.20 } })
    map.addLayer({ id: 'target-line', type: 'line', source: 'target', paint: { 'line-color': '#fdb022', 'line-width': 3 } })
    map.addLayer({ id: 'active-fill', type: 'fill', source: 'active', paint: { 'fill-color': '#ea6e14', 'fill-opacity': 0.30 } })
    map.addLayer({ id: 'active-line', type: 'line', source: 'active', paint: { 'line-color': '#f26d1e', 'line-width': 3 } })
    map.addLayer({ id: 'orphan-fill', type: 'fill', source: 'orphan', paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.10 } })
    map.addLayer({ id: 'orphan-line', type: 'line', source: 'orphan', paint: { 'line-color': '#ffffff', 'line-width': 2.5, 'line-dasharray': [2, 1.4] } })
    map.addLayer({ id: 'link-line', type: 'line', source: 'link', paint: { 'line-color': '#fdb022', 'line-width': 2, 'line-dasharray': [2, 1.6] } })
    map.addLayer({ id: 'vertices', type: 'circle', source: 'vertices', paint: { 'circle-radius': 5, 'circle-color': '#ffffff', 'circle-stroke-color': '#f26d1e', 'circle-stroke-width': 2 } })
    map.addLayer({ id: 'vertices-aberrant', type: 'circle', source: 'vertices', filter: ['==', ['get', 'aberrant'], true], paint: { 'circle-radius': 7, 'circle-color': '#fdb022', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 3 } })
    map.on('mouseenter', 'vertices', () => { if (map && !moveMode.value && !dragging) map.getCanvas().style.cursor = 'move' })
    map.on('mouseleave', 'vertices', () => { if (map && !dragging) map.getCanvas().style.cursor = moveMode.value ? 'crosshair' : '' })
    map.on('mousedown', 'vertices', onVertexDown)
    map.on('click', onMapClick)
    mapLoaded = true
    map.resize()
    renderLayers(); fitActive(); nextTick(updateToolbar)
  })
  map.on('move', updateToolbar)
  resizeObs = new ResizeObserver(() => map?.resize())
  resizeObs.observe(mapRef.value)
}

// Re-render + recadrage quand l'item actif change ou qu'une correction tombe.
watch(activeId, () => { selectedSommetId.value = null; moveMode.value = false; renderLayers(); fitActive(); nextTick(updateToolbar) })
watch(items, () => { renderLayers(); nextTick(updateToolbar) }, { deep: true })

onMounted(() => nextTick(initMap))
onBeforeUnmount(() => {
  resizeObs?.disconnect(); resizeObs = null
  map?.remove(); map = null; mapLoaded = false
})
</script>

<style scoped>
/* Entrée en glissement seul — jamais d'opacité animée. Un onglet en arrière-plan
   gèle les animations CSS à 0 % ; si la frame 0 % portait opacity:0, l'overlay
   resterait invisible. Ici l'opacité de repos est toujours 1 (état naturel), et
   seule la translation s'anime : gelée, elle laisse l'atelier parfaitement visible. */
.carto-root { animation: carto-in 0.24s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes carto-in {
  from { transform: translateY(8px); }
  to   { transform: none; }
}
</style>
