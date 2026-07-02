<template>
  <Teleport to="body">
    <Transition name="ma" appear>
      <div class="fixed inset-0 z-[9990] flex items-center justify-center p-8">

        <!-- Fond assombri -->
        <div class="absolute inset-0 bg-modal-overlay/70 backdrop-blur-sm" @click="attemptClose" />

        <!-- Carte du modal -->
        <div class="ma-card relative flex flex-col w-full h-full bg-white rounded-lg overflow-hidden shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">

          <!-- ── Confirmation : annuler les saisies ── -->
          <Transition name="ma-confirm">
            <div v-if="showDiscardModal" class="absolute inset-0 z-50 flex items-center justify-center px-8">
              <div class="absolute inset-0 bg-modal-overlay/70 backdrop-blur-sm" @click="showDiscardModal = false" />
              <div class="relative bg-white rounded-xl w-full max-w-[544px] overflow-hidden shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
                <div class="flex gap-4 items-start px-6 pt-6">
                  <div class="flex items-center justify-center size-12 rounded-full bg-[#fee4e2] shrink-0">
                    <Trash2 :size="24" class="text-[#d92d20]" />
                  </div>
                  <div class="flex flex-col gap-1 flex-1 min-w-0 pr-8">
                    <p class="text-[18px] font-semibold text-text-primary leading-7">Annuler les saisies</p>
                    <p class="text-sm text-text-secondary leading-5">
                      Les {{ producteurs.length.toLocaleString('fr-FR') }} producteur{{ producteurs.length > 1 ? 's' : '' }} saisi{{ producteurs.length > 1 ? 's' : '' }} seront abandonnés. Cette action est irréversible.
                    </p>
                  </div>
                </div>
                <button
                  class="absolute top-3 right-3 flex items-center justify-center w-11 h-11 rounded-lg text-text-quaternary hover:bg-surface transition-colors"
                  @click="showDiscardModal = false"
                >
                  <X :size="20" />
                </button>
                <div class="flex items-center justify-end gap-3 px-6 pt-8 pb-6">
                  <DsButton label="Continuer la saisie" variant="secondary-gray" @click="showDiscardModal = false" />
                  <DsButton label="Annuler les saisies" variant="danger" @click="confirmDiscard" />
                </div>
              </div>
            </div>
          </Transition>

          <!-- Bouton fermer -->
          <button
            class="absolute top-5 right-5 z-20 flex items-center justify-center size-9 rounded-lg bg-surface text-text-quaternary hover:bg-surface-active transition-colors"
            @click="attemptClose"
          >
            <X :size="20" />
          </button>

          <!-- Contenu -->
          <div class="flex flex-col flex-1 min-h-0 px-8 py-8">

            <!-- En-tête : retour + titre -->
            <div class="flex items-start gap-2.5 shrink-0">
              <button
                class="flex items-center justify-center size-11 rounded-lg border border-border-strong bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-text-secondary hover:bg-surface transition-colors shrink-0"
                @click="onBack"
              >
                <ArrowLeft :size="20" />
              </button>
              <div class="flex-1 min-w-0 flex flex-col items-center gap-2 text-center pr-11">
                <p class="text-2xl font-semibold text-text-primary leading-8">Ajouter manuellement</p>
                <p class="text-base text-text-tertiary leading-6">Renseigne leurs informations, puis cartographie leurs parcelles.</p>
              </div>
            </div>
            <div class="h-px bg-border w-full mt-6 shrink-0" />

            <!-- Étapes (vue formulaire uniquement) -->
            <div v-if="view === 'form'" class="flex gap-4 items-start w-full mt-6 shrink-0">
              <div
                v-for="s in steps"
                :key="s.key"
                class="flex-1 min-w-0 flex flex-col gap-0.5 pt-3 border-t-4 transition-colors"
                :class="formStep === s.key ? 'border-[#056033]' : 'border-border'"
              >
                <p class="text-sm font-semibold text-text-secondary leading-5">{{ s.title }}</p>
                <p class="text-sm text-text-tertiary leading-5">{{ s.hint }}</p>
              </div>
            </div>

            <!-- ── Corps ── -->
            <div class="flex-1 min-h-0 flex flex-col mt-6">

              <!-- Récap : liste des producteurs saisis -->
              <template v-if="view === 'recap'">
                <!-- Le conteneur scrollable (overflow-y-auto) rogne les bords collés
                     à ses arêtes : un léger padding évite de couper la bordure du bouton. -->
                <div class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 p-0.5 pr-2">
                  <div
                    v-for="p in producteurs"
                    :key="p.id"
                    class="flex items-center gap-3 pl-3 pr-3 py-3 bg-surface rounded-xl"
                  >
                    <div class="flex items-center justify-center size-10 rounded-full bg-surface-alt text-text-quaternary shrink-0">
                      <User :size="20" />
                    </div>
                    <p class="flex-1 min-w-0 truncate text-sm font-semibold text-text-primary">
                      {{ p.prenom }} {{ p.nom }}
                    </p>
                    <div class="flex flex-col items-end text-right mr-1">
                      <span class="text-sm font-semibold text-text-primary">{{ formatHa(p.surfaceHa) }} ha</span>
                      <span class="text-sm text-text-tertiary">{{ p.localite || '—' }}</span>
                    </div>
                    <button
                      class="flex items-center justify-center size-9 rounded-lg border border-border-strong bg-white text-text-tertiary hover:bg-surface transition-colors"
                      @click="editEntry(p)"
                    >
                      <Pencil :size="16" />
                    </button>
                    <button
                      class="flex items-center justify-center size-9 rounded-lg border border-[#fda29b] bg-white text-[#d92d20] hover:bg-[#fef3f2] transition-colors"
                      @click="deleteEntry(p.id)"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>

                  <!-- Ajouter un producteur — zone en pointillés (Figma 24-19423).
                       Même style dans l'état vide et pour l'ajout supplémentaire ;
                       le fond réagit au survol (gris légèrement plus foncé). -->
                  <button
                    class="flex items-center justify-center gap-2 w-full px-6 py-8 bg-white border border-dashed border-border-strong rounded-xl text-text-secondary hover:bg-surface-alt transition-colors"
                    @click="startAdd"
                  >
                    <Plus :size="24" />
                    <span class="text-sm font-medium" style="font-family: var(--ds-typography-font-family-inter)">Ajouter un producteur</span>
                  </button>
                </div>
              </template>

              <!-- Formulaire — Informations (composants du Design System) -->
              <template v-else-if="formStep === 'informations'">
                <div class="flex flex-col gap-4">
                  <div class="flex gap-4">
                    <div class="flex-1 min-w-0 flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-text-secondary">Prénom</label>
                      <DsInputField v-model="prenom" type="text" placeholder="Ex: Amadou" />
                    </div>
                    <div class="flex-1 min-w-0 flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-text-secondary">Nom</label>
                      <DsInputField v-model="nom" type="text" placeholder="Ex: Diallo" />
                    </div>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-medium text-text-secondary">Culture principale</label>
                    <DsInputDropdown v-model="culture" placeholder="Ex: Cacao" :options="cultureOptions" />
                  </div>
                </div>
              </template>

              <!-- Formulaire — Parcelles (carte interactive) -->
              <template v-else>
                <div class="relative flex-1 min-h-0 rounded-2xl overflow-hidden bg-[#20261a]">
                  <!-- Conteneur de la carte MapLibre (MapLibre force position:relative,
                       on remplit donc le parent en w/h plutôt qu'en inset-0) -->
                  <div ref="mapRef" class="w-full h-full" />

                  <!-- Bulle d'aide — compacte, largeur = contenu, une seule ligne (Figma 24-18964). -->
                  <div class="absolute top-3 left-3 z-10 w-fit max-w-[calc(100%-1.5rem)] px-4 py-3 bg-white border border-border-strong rounded-xl shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] pointer-events-none">
                    <p class="text-sm font-semibold text-text-primary leading-5 whitespace-nowrap">{{ mapHint }}</p>
                  </div>

                  <!-- Recherche + contrôles -->
                  <div class="absolute top-3 right-3 z-10 flex items-start gap-2">
                    <div class="w-[320px]">
                      <DsInputField
                        v-model="localiteSearch"
                        type="text"
                        placeholder="Rechercher une localité..."
                        @keydown.enter="searchLocality"
                      >
                        <template #icon-leading>
                          <DsIcon name="search-md" />
                        </template>
                      </DsInputField>
                    </div>

                    <div class="flex flex-col gap-2 items-center">
                      <!-- Zoom -->
                      <div class="flex flex-col bg-white rounded-lg overflow-hidden shadow-[0px_1px_3px_rgba(16,24,40,0.1),0px_1px_2px_rgba(16,24,40,0.06)]">
                        <button class="flex items-center justify-center size-11 text-text-secondary hover:bg-surface transition-colors" @click="map?.zoomIn()">
                          <Plus :size="20" />
                        </button>
                        <div class="h-px bg-border" />
                        <button class="flex items-center justify-center size-11 text-text-secondary hover:bg-surface transition-colors" @click="map?.zoomOut()">
                          <Minus :size="20" />
                        </button>
                      </div>
                      <!-- Recentrer -->
                      <button class="flex items-center justify-center size-11 bg-white rounded-lg text-text-secondary hover:bg-surface shadow-[0px_1px_3px_rgba(16,24,40,0.1),0px_1px_2px_rgba(16,24,40,0.06)] transition-colors" @click="recenter">
                        <LocateFixed :size="20" />
                      </button>
                      <!-- Dessiner -->
                      <button
                        class="flex items-center justify-center size-11 rounded-lg shadow-[0px_1px_3px_rgba(16,24,40,0.1),0px_1px_2px_rgba(16,24,40,0.06)] transition-colors"
                        :class="drawing ? 'bg-[#ecfdf3] text-[#056033]' : 'bg-white text-text-secondary hover:bg-surface'"
                        title="Dessiner une parcelle"
                        @click="toggleDraw"
                      >
                        <PencilLine :size="20" />
                      </button>
                      <!-- Supprimer -->
                      <button
                        class="flex items-center justify-center size-11 bg-white rounded-lg shadow-[0px_1px_3px_rgba(16,24,40,0.1),0px_1px_2px_rgba(16,24,40,0.06)] transition-colors"
                        :class="canDelete ? 'text-[#d92d20] hover:bg-[#fef3f2]' : 'text-text-quaternary hover:bg-surface'"
                        title="Supprimer la parcelle"
                        @click="deleteSelected"
                      >
                        <Trash2 :size="20" />
                      </button>
                    </div>
                  </div>
                </div>
              </template>

            </div>

            <!-- ── Barre du bas ── -->
            <div class="shrink-0 mt-4">
              <div class="h-px bg-border w-full" />
              <div class="flex items-center justify-between gap-4 mt-4">
                <!-- Compteurs -->
                <div class="flex items-center gap-3">
                  <div class="bg-surface p-2 rounded-2xl">
                    <div class="flex flex-col gap-1 px-4 py-2 bg-surface-alt rounded-xl w-[217px]">
                      <span class="text-sm font-medium text-text-secondary" style="font-family: var(--ds-typography-font-family-inter)">Surface calculée</span>
                      <span class="text-sm font-semibold text-text-primary">{{ surfaceLabel }}</span>
                    </div>
                  </div>
                  <div v-if="view === 'form' && formStep === 'parcelles'" class="bg-surface p-2 rounded-2xl">
                    <div class="flex flex-col gap-1 px-4 py-2 bg-surface-alt rounded-xl w-[217px]">
                      <span class="text-sm font-medium text-text-secondary" style="font-family: var(--ds-typography-font-family-inter)">Localité</span>
                      <span class="text-sm font-semibold text-text-primary">{{ localite || '—' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Actions contextuelles -->
                <div class="flex items-center gap-2 shrink-0">
                  <template v-if="view === 'recap'">
                    <DsButton label="Annuler les saisies" variant="secondary-gray" @click="attemptClose" />
                    <DsButton label="Ajouter les producteurs" variant="primary" :disabled="producteurs.length === 0" @click="finalize" />
                  </template>
                  <template v-else-if="formStep === 'informations'">
                    <DsButton label="Annuler la saisie" variant="secondary-gray" @click="cancelDraft" />
                    <DsButton label="Continuer" variant="primary" :disabled="!canContinue" @click="formStep = 'parcelles'" />
                  </template>
                  <template v-else>
                    <DsButton label="Annuler la saisie" variant="secondary-gray" @click="cancelDraft" />
                    <DsButton label="Ajouter le producteur" variant="primary" :disabled="draftPolygons.length === 0" @click="commitDraft" />
                  </template>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { ArrowLeft, X, Plus, Minus, LocateFixed, PencilLine, Trash2, User, Pencil } from 'lucide-vue-next'
import type { Map as MaplibreMap, GeoJSONSource, MapMouseEvent, StyleSpecification } from 'maplibre-gl'

type LngLat = [number, number]

export interface ProducteurManuel {
  id:        string
  prenom:    string
  nom:       string
  culture:   string
  surfaceHa: number
  localite:  string
  polygons:  LngLat[][]
}

const emit = defineEmits<{ close: []; finalize: [payload: { count: number; entries: ProducteurManuel[] }] }>()

type View = 'recap' | 'form'
type FormStep = 'informations' | 'parcelles'

const steps = [
  { key: 'informations' as const, title: 'Informations', hint: 'Renseigne ses informations personnelles du producteur.' },
  { key: 'parcelles'    as const, title: 'Parcelles',    hint: 'Dessine les contours de ses parcelles.' },
]

const cultureOptions = ['Cacao', 'Café', 'Hévéa (caoutchouc)', 'Anacarde', 'Palmier à huile', 'Coton', 'Maïs', 'Riz', 'Manioc']
  .map((c) => ({ label: c, value: c }))

const view     = ref<View>('recap')
const formStep = ref<FormStep>('informations')
const producteurs = ref<ProducteurManuel[]>([])
const showDiscardModal = ref(false)

// ── Brouillon en cours ──
const editingId = ref<string | null>(null)
const prenom    = ref('')
const nom       = ref('')
const culture   = ref('')

// ── Carte / parcelles ──
const ESRI_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const CI_CENTER: LngLat = [-5.29, 7.73]   // région Béoumi / Bouaké / Sakassou (Côte d'Ivoire)
const CI_ZOOM = 13                         // échelle parcellaire : surfaces dessinées réalistes

const mapRef = ref<HTMLElement | null>(null)
let map: MaplibreMap | null = null
let resizeObs: ResizeObserver | null = null
const savedView = { center: CI_CENTER as LngLat, zoom: CI_ZOOM }

const draftPolygons  = ref<LngLat[][]>([])   // parcelles terminées du producteur en cours
const draftVertices  = ref<LngLat[]>([])     // sommets de la parcelle en cours de tracé
const drawing        = ref(false)
const selectedIndex  = ref<number | null>(null)
const hoverCursor    = ref<LngLat | null>(null)
const surfaceHa      = ref(0)
const localite       = ref('')
const localiteSearch = ref('')

const canContinue = computed(() => prenom.value.trim() !== '' && nom.value.trim() !== '')
const canDelete   = computed(() => drawing.value || draftPolygons.value.length > 0)

const surfaceLabel = computed(() => {
  const total = view.value === 'recap'
    ? producteurs.value.reduce((s, p) => s + p.surfaceHa, 0)
    : surfaceHa.value
  return `${formatHa(total)} ha`
})

const mapHint = computed(() => {
  if (drawing.value) {
    if (draftVertices.value.length === 0) return 'Clique sur la carte pour placer le premier point.'
    if (draftVertices.value.length < 3)   return 'Place les points de la parcelle, un à un.'
    return 'Clique sur le premier point pour fermer la parcelle.'
  }
  if (selectedIndex.value !== null) return 'Clique sur cette parcelle pour la modifier ou la supprimer.'
  if (draftPolygons.value.length)   return 'Clique sur la carte pour dessiner une autre parcelle.'
  return 'Clique sur la carte pour dessiner une parcelle.'
})

function formatHa(v: number) { return (Math.round(v * 10) / 10).toLocaleString('fr-FR') }

// ── GeoJSON helpers ──
function ringOf(coords: LngLat[]): LngLat[] {
  const r = [...coords]
  const a = r[0], b = r[r.length - 1]
  if (r.length && a && b && (a[0] !== b[0] || a[1] !== b[1])) r.push(a)
  return r
}
function polyFeature(coords: LngLat[], props: Record<string, unknown> = {}) {
  return { type: 'Feature' as const, properties: props, geometry: { type: 'Polygon' as const, coordinates: [ringOf(coords)] } }
}
function fc(features: unknown[]) { return { type: 'FeatureCollection' as const, features } as never }

// ── Rendu des couches ──
function renderParcelles() {
  if (!map || !map.getSource('parcelles')) return
  const feats = draftPolygons.value.map((p, i) => polyFeature(p, { idx: i }))
  ;(map.getSource('parcelles') as GeoJSONSource).setData(fc(feats))
  map.setFilter('parcelles-sel', ['==', ['get', 'idx'], selectedIndex.value ?? -1])
}
function renderDraft() {
  if (!map || !map.getSource('draft')) return
  const verts = draftVertices.value
  const preview = drawing.value ? hoverCursor.value : null
  const feats: unknown[] = []
  const polyPts = preview ? [...verts, preview] : verts
  if (polyPts.length >= 3) feats.push(polyFeature(polyPts))
  const lineCoords = preview ? [...verts, preview] : verts
  if (lineCoords.length >= 2) feats.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: lineCoords } })
  ;(map.getSource('draft') as GeoJSONSource).setData(fc(feats))
  const vfeats = verts.map((v, i) => ({ type: 'Feature', properties: { first: i === 0 }, geometry: { type: 'Point', coordinates: v } }))
  ;(map.getSource('vertices') as GeoJSONSource).setData(fc(vfeats))
}

// Curseur cohérent avec l'action en cours :
//  • tracé          → crosshair (placer un point)
//  • carte vierge   → crosshair (inviter le tracé) tant qu'aucune parcelle
//  • carte peuplée  → grab (déplacer) / grabbing pendant le pan
function updateCursor() {
  if (!map) return
  map.getCanvas().style.cursor = drawing.value || draftPolygons.value.length === 0 ? 'crosshair' : 'grab'
}

// ── Cycle de vie de la carte ──
async function initMap() {
  if (map || !mapRef.value) return
  const maplibregl = (await import('maplibre-gl')).default
  const style: StyleSpecification = {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      sat: { type: 'raster', tiles: [ESRI_TILES], tileSize: 256, attribution: '© Esri, Maxar, Earthstar Geographics' },
    },
    layers: [{ id: 'sat', type: 'raster', source: 'sat' }],
  }
  map = new maplibregl.Map({
    container: mapRef.value,
    style,
    center: savedView.center,
    zoom: savedView.zoom,
    attributionControl: false,
    doubleClickZoom: false,
    dragRotate: false,
  })
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

  map.on('load', () => {
    if (!map) return
    map.addSource('parcelles', { type: 'geojson', data: fc([]) })
    map.addLayer({ id: 'parcelles-fill', type: 'fill', source: 'parcelles', paint: { 'fill-color': '#ea6e14', 'fill-opacity': 0.35 } })
    map.addLayer({ id: 'parcelles-line', type: 'line', source: 'parcelles', paint: { 'line-color': '#f26d1e', 'line-width': 2.5 } })
    map.addLayer({ id: 'parcelles-sel', type: 'line', source: 'parcelles', filter: ['==', ['get', 'idx'], -1], paint: { 'line-color': '#fdb022', 'line-width': 4 } })

    map.addSource('draft', { type: 'geojson', data: fc([]) })
    map.addLayer({ id: 'draft-fill', type: 'fill', source: 'draft', filter: ['==', '$type', 'Polygon'], paint: { 'fill-color': '#ea6e14', 'fill-opacity': 0.22 } })
    map.addLayer({ id: 'draft-line', type: 'line', source: 'draft', filter: ['==', '$type', 'LineString'], paint: { 'line-color': '#f26d1e', 'line-width': 2.5, 'line-dasharray': [2, 1.4] } })

    map.addSource('vertices', { type: 'geojson', data: fc([]) })
    map.addLayer({ id: 'vertices', type: 'circle', source: 'vertices', paint: { 'circle-radius': 5, 'circle-color': '#ffffff', 'circle-stroke-color': '#f26d1e', 'circle-stroke-width': 2 } })
    map.addLayer({ id: 'vertices-first', type: 'circle', source: 'vertices', filter: ['==', ['get', 'first'], true], paint: { 'circle-radius': 7, 'circle-color': '#f26d1e', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2.5 } })

    map.on('click', onMapClick)
    map.on('mousemove', onMapMove)
    map.on('dblclick', onMapDblClick)
    // Main fermée pendant le déplacement de la carte (immersion).
    map.on('dragstart', () => { if (map && !drawing.value) map.getCanvas().style.cursor = 'grabbing' })
    map.on('dragend', updateCursor)

    map.resize()
    renderParcelles()
    renderDraft()
    updateCursor()
    fitToParcelles()
    void recompute()
  })

  resizeObs = new ResizeObserver(() => map?.resize())
  resizeObs.observe(mapRef.value)
  window.addEventListener('keydown', onKey)
}

function destroyMap() {
  if (map) { savedView.center = map.getCenter().toArray() as LngLat; savedView.zoom = map.getZoom() }
  resizeObs?.disconnect(); resizeObs = null
  window.removeEventListener('keydown', onKey)
  map?.remove(); map = null
}

function fitToParcelles() {
  if (!map || draftPolygons.value.length === 0) return
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const poly of draftPolygons.value) for (const [x, y] of poly) {
    minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y)
  }
  map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 80, duration: 0, maxZoom: 14 })
}

// ── Interactions de tracé ──
function onMapClick(e: MapMouseEvent) {
  const p: LngLat = [e.lngLat.lng, e.lngLat.lat]
  if (drawing.value) {
    if (draftVertices.value.length >= 3 && map) {
      const first = draftVertices.value[0]
      const fp = map.project(first as never)
      if (Math.hypot(fp.x - e.point.x, fp.y - e.point.y) < 12) { closePolygon(); return }
    }
    draftVertices.value = [...draftVertices.value, p]
    renderDraft()
    return
  }
  const hits = map?.queryRenderedFeatures(e.point, { layers: ['parcelles-fill'] }) ?? []
  if (hits.length) {
    selectedIndex.value = Number(hits[0].properties?.idx ?? 0)
    renderParcelles()
  } else {
    selectedIndex.value = null
    drawing.value = true
    draftVertices.value = [p]
    renderDraft()
  }
  updateCursor()
}

function onMapMove(e: MapMouseEvent) {
  if (!map) return
  const c = map.getCanvas()
  if (drawing.value) {
    hoverCursor.value = [e.lngLat.lng, e.lngLat.lat]
    renderDraft()
    // Près du premier point (fermeture possible) → main/pointeur, sinon crosshair.
    let nearFirst = false
    if (draftVertices.value.length >= 3) {
      const fp = map.project(draftVertices.value[0] as never)
      nearFirst = Math.hypot(fp.x - e.point.x, fp.y - e.point.y) < 12
    }
    c.style.cursor = nearFirst ? 'pointer' : 'crosshair'
    return
  }
  // Hors tracé : main pointeur au survol d'une parcelle, sinon crosshair/grab.
  const over = map.queryRenderedFeatures(e.point, { layers: ['parcelles-fill'] }).length > 0
  c.style.cursor = over ? 'pointer' : (draftPolygons.value.length === 0 ? 'crosshair' : 'grab')
}

function onMapDblClick(e: MapMouseEvent) {
  if (!drawing.value) return
  e.preventDefault()
  closePolygon()
}

function onKey(e: KeyboardEvent) {
  if (!drawing.value) return
  if (e.key === 'Enter') { e.preventDefault(); closePolygon() }
  else if (e.key === 'Escape') cancelDraw()
  else if (e.key === 'Backspace') { e.preventDefault(); draftVertices.value = draftVertices.value.slice(0, -1); renderDraft() }
}

function dedupe(pts: LngLat[]): LngLat[] {
  const out: LngLat[] = []
  for (const p of pts) {
    const last = out[out.length - 1]
    if (!last || Math.abs(last[0] - p[0]) > 1e-7 || Math.abs(last[1] - p[1]) > 1e-7) out.push(p)
  }
  return out
}

function closePolygon() {
  const verts = dedupe(draftVertices.value)
  if (verts.length < 3) return
  draftPolygons.value = [...draftPolygons.value, verts]
  draftVertices.value = []
  hoverCursor.value = null
  drawing.value = false
  selectedIndex.value = draftPolygons.value.length - 1
  renderDraft(); renderParcelles(); updateCursor()
  void recompute()
}

function toggleDraw() {
  if (drawing.value) { cancelDraw(); return }
  selectedIndex.value = null
  drawing.value = true
  draftVertices.value = []
  hoverCursor.value = null
  renderParcelles(); renderDraft(); updateCursor()
}

function cancelDraw() {
  drawing.value = false
  draftVertices.value = []
  hoverCursor.value = null
  renderDraft(); updateCursor()
}

function deleteSelected() {
  if (drawing.value) { cancelDraw(); return }
  if (selectedIndex.value !== null) {
    draftPolygons.value = draftPolygons.value.filter((_, i) => i !== selectedIndex.value)
    selectedIndex.value = null
  } else if (draftPolygons.value.length) {
    draftPolygons.value = draftPolygons.value.slice(0, -1)
  } else return
  renderParcelles(); void recompute()
}

function recenter() { map?.flyTo({ center: draftPolygons.value.length ? map.getCenter() : CI_CENTER, zoom: CI_ZOOM }) }

// ── Surface + localité (réels) ──
async function recompute() {
  const areaFn = (await import('@turf/area')).default
  let total = 0
  for (const poly of draftPolygons.value) total += areaFn(polyFeature(poly) as never)
  surfaceHa.value = total / 10000
  if (draftPolygons.value.length === 0) { localite.value = ''; return }
  void reverseGeocode(draftPolygons.value[draftPolygons.value.length - 1])
}

let geoSeq = 0
async function reverseGeocode(poly: LngLat[]) {
  try {
    const centroidFn = (await import('@turf/centroid')).default
    const c = (centroidFn(polyFeature(poly) as never).geometry.coordinates) as LngLat
    const seq = ++geoSeq
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${c[1]}&lon=${c[0]}&zoom=12&accept-language=fr`, { headers: { Accept: 'application/json' } })
    if (seq !== geoSeq) return
    const j = await res.json()
    const a = j.address ?? {}
    localite.value = a.village || a.hamlet || a.town || a.city || a.municipality || a.county || a.state || '—'
  } catch { /* réseau indisponible : on garde la valeur courante */ }
}

async function searchLocality() {
  const q = localiteSearch.value.trim()
  if (!q || !map) return
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=ci&limit=1`, { headers: { Accept: 'application/json' } })
    const j = await res.json()
    if (Array.isArray(j) && j[0]) map.flyTo({ center: [parseFloat(j[0].lon), parseFloat(j[0].lat)], zoom: 12 })
  } catch { /* silencieux */ }
}

// ── Navigation formulaire ──
function resetDraft() {
  editingId.value = null
  prenom.value = ''; nom.value = ''; culture.value = ''
  draftPolygons.value = []; draftVertices.value = []; drawing.value = false
  selectedIndex.value = null; hoverCursor.value = null
  surfaceHa.value = 0; localite.value = ''
  formStep.value = 'informations'
}

function startAdd() { resetDraft(); view.value = 'form' }

function editEntry(p: ProducteurManuel) {
  resetDraft()
  editingId.value = p.id
  prenom.value = p.prenom; nom.value = p.nom; culture.value = p.culture
  draftPolygons.value = p.polygons.map((poly) => poly.map((pt) => [...pt] as LngLat))
  surfaceHa.value = p.surfaceHa; localite.value = p.localite
  view.value = 'form'
}

function deleteEntry(id: string) { producteurs.value = producteurs.value.filter((p) => p.id !== id) }

function cancelDraft() { resetDraft(); view.value = 'recap' }

function commitDraft() {
  const entry: ProducteurManuel = {
    id:        editingId.value ?? `manuel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    prenom:    prenom.value.trim(),
    nom:       nom.value.trim(),
    culture:   culture.value,
    surfaceHa: surfaceHa.value,
    localite:  localite.value,
    polygons:  draftPolygons.value.map((poly) => poly.map((pt) => [...pt] as LngLat)),
  }
  if (editingId.value) {
    const i = producteurs.value.findIndex((p) => p.id === editingId.value)
    if (i !== -1) producteurs.value[i] = entry
  } else {
    producteurs.value.push(entry)
  }
  resetDraft()
  view.value = 'recap'
}

function onBack() {
  if (view.value === 'form') {
    if (formStep.value === 'parcelles') { formStep.value = 'informations'; return }
    cancelDraft()
    return
  }
  attemptClose()
}

function attemptClose() {
  if (producteurs.value.length > 0) { showDiscardModal.value = true; return }
  emit('close')
}
function confirmDiscard() { showDiscardModal.value = false; emit('close') }

function finalize() {
  emit('finalize', { count: producteurs.value.length, entries: producteurs.value.map((p) => ({ ...p, polygons: p.polygons.map((poly) => poly.map((pt) => [...pt] as LngLat)) })) })
}

// La carte n'existe que sur l'étape « Parcelles » : on l'instancie / détruit au bon moment.
watch([view, formStep], () => {
  const onMap = view.value === 'form' && formStep.value === 'parcelles'
  if (onMap && !map) nextTick(initMap)
  else if (!onMap && map) destroyMap()
})

onBeforeUnmount(destroyMap)
</script>

<style scoped>
/* Apparition du modal */
.ma-enter-active { transition: opacity 0.2s ease; }
.ma-leave-active { transition: opacity 0.18s ease; }
.ma-enter-from, .ma-leave-to { opacity: 0; }
.ma-enter-active .ma-card { transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1); }
.ma-leave-active .ma-card { transition: transform 0.18s ease; }
.ma-enter-from .ma-card, .ma-leave-to .ma-card { transform: translateY(12px) scale(0.99); }

/* Confirmation */
.ma-confirm-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.ma-confirm-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.ma-confirm-enter-from, .ma-confirm-leave-to { opacity: 0; transform: scale(0.97); }
</style>
