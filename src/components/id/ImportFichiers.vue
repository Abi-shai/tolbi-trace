<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">

    <Header title="Producteurs">
      <template #actions>
        <DsButton
          label="Ajouter des producteurs"
          variant="primary"
          icon-leading="user-plus-01"
          @click="$emit('add')"
        />
      </template>
    </Header>

    <div class="flex flex-1 min-h-0 overflow-hidden bg-surface">
      <div class="flex flex-col flex-1 min-h-0 p-6">
        <div class="flex flex-col flex-1 min-h-0 bg-white rounded-lg overflow-hidden">

          <div class="flex-1 overflow-y-auto min-h-0 no-scrollbar">
            <div class="flex flex-col items-center gap-6 mx-auto w-full max-w-[768px] pt-12 px-8 pb-6">

              <!-- Title + subtitle -->
              <div class="flex flex-col gap-2 items-center text-center w-full max-w-[640px] shrink-0">
                <p class="text-2xl font-semibold text-text-primary leading-8">Importer des fichiers</p>
                <p class="text-base text-text-tertiary leading-6">Importez les fichiers Excel ou GPS transmis par vos coopératives.</p>
              </div>

              <!-- Info banner -->
              <div
                class="flex gap-3 items-start p-4 bg-surface rounded-xl w-full shrink-0 cursor-pointer select-none"
                @click="bannerOpen = !bannerOpen"
              >
                <div class="flex flex-col gap-2 flex-1 min-w-0">
                  <p class="text-base font-semibold text-text-primary leading-6">Modèle de données Tolbi</p>
                  <Transition
                    @enter="onBannerEnter"
                    @after-enter="onBannerAfterEnter"
                    @leave="onBannerLeave"
                    @after-leave="onBannerAfterLeave"
                  >
                    <div v-if="bannerOpen" class="flex flex-col gap-2">
                      <p class="text-base text-text-secondary leading-6">C'est vers ce format que vos données seront alignées à l'import. Transmettez-le à vos coopératives pour faciliter la compatibilité.</p>
                      <DsButton label="Télécharger le modèle" variant="secondary-gray" class="w-fit" @click.stop />
                    </div>
                  </Transition>
                </div>
                <ChevronDown
                  :size="20"
                  class="shrink-0 mt-0.5 text-text-quaternary transition-transform duration-200"
                  :class="bannerOpen ? '' : '-rotate-180'"
                />
              </div>

              <!-- Files section -->
              <div class="flex flex-col gap-3 w-full py-4 shrink-0">

                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Fichiers</span>
                  <Info :size="16" class="text-text-quaternary" />
                </div>

                <!-- GeoJSON / KML — état erreur scénario -->
                <template v-if="showGeoError">
                  <div class="relative flex gap-3 items-start p-4 bg-white border-2 border-[#d92d20] rounded-xl w-full">
                    <div class="relative size-[40px] shrink-0">
                      <div class="absolute inset-[0_10%]">
                        <img :src="shpPage" class="absolute block inset-0 max-w-none size-full" alt="" />
                        <div class="absolute inset-[1.25%_1.56%_70%_62.5%]">
                          <div class="absolute" style="inset:0 -6.52% -6.52% 0">
                            <img :src="shpEarmark" class="block max-w-none size-full" alt="" />
                          </div>
                        </div>
                        <img :src="shpUnion" class="absolute -translate-x-1/2" style="height:12px;left:calc(50% + 0.5px);top:19px;width:13.2px" alt="" />
                      </div>
                    </div>
                    <div class="flex flex-col gap-1 flex-1 min-w-0">
                      <div class="flex flex-col">
                        <p class="text-sm font-medium text-text-secondary leading-5 truncate" style="font-family: var(--ds-typography-font-family-inter)">Producteurs.shp</p>
                        <p class="text-sm text-[#d92d20] leading-5" style="font-family: var(--ds-typography-font-family-poppins)">Le chargement a échoué suite à une erreur technique.</p>
                      </div>
                      <button
                        class="text-sm font-semibold text-text-tertiary leading-5 text-left w-fit hover:text-text-secondary transition-colors"
                        style="font-family: var(--ds-typography-font-family-poppins)"
                        @click="geoUploadError = false"
                      >
                        Réessayer
                      </button>
                    </div>
                    <button class="absolute top-2 right-2 p-2 rounded-lg text-text-quaternary hover:bg-surface transition-colors" @click="geoUploadError = false">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 2.5H12.5M2.5 5H17.5M15.833 5L15.111 15.117C15.05 15.988 14.322 16.667 13.449 16.667H6.551C5.678 16.667 4.95 15.988 4.889 15.117L4.167 5M8.333 9.167V13.333M11.667 9.167V13.333" stroke="#475467" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </template>

                <!-- GeoJSON / KML -->
                <template v-else-if="!geoUpload">
                  <label
                    class="flex flex-col items-center gap-3 p-6 border rounded-xl cursor-pointer transition-colors duration-150 hover:bg-[var(--ds-semantic-bg-primary-hover)]"
                    :class="isInvalidGeo
                      ? 'border-solid border-[var(--ds-semantic-border-error)] bg-[var(--ds-semantic-bg-error-primary)]'
                      : isDraggingGeo
                        ? 'border-solid border-[var(--ds-semantic-border-secondary)] bg-[var(--ds-semantic-bg-primary-hover)]'
                        : 'border-dashed border-border bg-white'"
                    @dragover.prevent="isDraggingGeo = true"
                    @dragleave.prevent="isDraggingGeo = false"
                    @drop.prevent="handleDropGeo"
                  >
                    <input type="file" class="hidden" accept=".geojson,.kml,.shp" @change="handleFileGeo" />
                    <div class="relative size-[40px] shrink-0">
                      <div class="absolute inset-[0_10%]">
                        <img :src="shpPage" class="absolute block inset-0 max-w-none size-full" alt="" />
                        <div class="absolute inset-[1.25%_1.56%_70%_62.5%]">
                          <div class="absolute" style="inset:0 -6.52% -6.52% 0">
                            <img :src="shpEarmark" class="block max-w-none size-full" alt="" />
                          </div>
                        </div>
                        <img :src="shpUnion" class="absolute -translate-x-1/2" style="height:12px;left:calc(50% + 0.5px);top:19px;width:13.2px" alt="" />
                      </div>
                    </div>
                    <div class="flex flex-col gap-1 items-center text-center">
                      <p class="text-sm font-semibold text-[color:var(--ds-semantic-text-brand-secondary)] leading-5">Zones d'approvisionnement (GeoJSON ou KML)</p>
                      <p class="text-xs text-text-tertiary leading-[18px]">Périmètres géographiques de vos bassins de collecte et parcelles producteurs.</p>
                    </div>
                  </label>
                </template>
                <template v-else>
                  <FileItem
                    :name="geoUpload.file.name"
                    :size="geoUpload.file.size"
                    :progress="geoUpload.progress"
                    @remove="geoUpload = null"
                  >
                    <template #icon>
                      <div class="relative size-[40px] shrink-0">
                        <div class="absolute inset-[0_10%]">
                          <img :src="shpPage" class="absolute block inset-0 max-w-none size-full" alt="" />
                          <div class="absolute inset-[1.25%_1.56%_70%_62.5%]">
                            <div class="absolute" style="inset:0 -6.52% -6.52% 0">
                              <img :src="shpEarmark" class="block max-w-none size-full" alt="" />
                            </div>
                          </div>
                          <img :src="shpUnion" class="absolute -translate-x-1/2" style="height:12px;left:calc(50% + 0.5px);top:19px;width:13.2px" alt="" />
                        </div>
                      </div>
                    </template>
                  </FileItem>
                </template>

                <!-- Excel -->
                <template v-if="!excelUpload">
                  <label
                    class="flex flex-col items-center gap-3 p-6 border rounded-xl cursor-pointer transition-colors duration-150 hover:bg-[var(--ds-semantic-bg-primary-hover)]"
                    :class="isInvalidExcel
                      ? 'border-solid border-[var(--ds-semantic-border-error)] bg-[var(--ds-semantic-bg-error-primary)]'
                      : isDraggingExcel
                        ? 'border-solid border-[var(--ds-semantic-border-secondary)] bg-[var(--ds-semantic-bg-primary-hover)]'
                        : 'border-dashed border-border bg-white'"
                    @dragover.prevent="isDraggingExcel = true"
                    @dragleave.prevent="isDraggingExcel = false"
                    @drop.prevent="handleDropExcel"
                  >
                    <input type="file" class="hidden" accept=".xlsx,.xls" @change="handleFileExcel" />
                    <div class="relative size-[40px] shrink-0">
                      <div class="absolute inset-[0_10%]">
                        <img :src="excelPage" class="absolute block inset-0 max-w-none size-full" alt="" />
                      </div>
                      <div class="absolute inset-[37.5%_27.5%_17.5%_27.5%] overflow-clip">
                        <div class="absolute" style="height:10.8px;left:0.9px;top:4.5px;width:16.2px">
                          <div class="absolute" style="inset:-6.94% -4.63%">
                            <img :src="excelIcon" class="block max-w-none size-full" alt="" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="flex flex-col gap-1 items-center text-center">
                      <p class="text-sm font-semibold text-[color:var(--ds-semantic-text-brand-secondary)] leading-5">Liste des producteurs (Excel)</p>
                      <p class="text-xs text-text-tertiary leading-[18px]">Déposez le fichier Excel de vos producteurs avec leurs identifiants uniques.</p>
                    </div>
                  </label>
                </template>
                <template v-else>
                  <FileItem
                    :name="excelUpload.file.name"
                    :size="excelUpload.file.size"
                    :progress="excelUpload.progress"
                    @remove="excelUpload = null"
                  >
                    <template #icon>
                      <div class="relative size-[40px] shrink-0">
                        <div class="absolute inset-[0_10%]">
                          <img :src="excelPage" class="absolute block inset-0 max-w-none size-full" alt="" />
                        </div>
                        <div class="absolute inset-[37.5%_27.5%_17.5%_27.5%] overflow-clip">
                          <div class="absolute" style="height:10.8px;left:0.9px;top:4.5px;width:16.2px">
                            <div class="absolute" style="inset:-6.94% -4.63%">
                              <img :src="excelIcon" class="block max-w-none size-full" alt="" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </FileItem>
                </template>

              </div>
            </div>
          </div>

          <BackConfirmModal
            v-if="showBackModal"
            @confirm="emit('back')"
            @cancel="showBackModal = false"
          />

          <div class="border-t border-[#eaecf0] px-8 py-4 flex items-center justify-between shrink-0">
            <DsButton label="Retour" variant="secondary-gray" @click="handleBack" />
            <DsButton
              label="Continuer"
              :variant="hasFiles ? 'primary' : 'secondary-gray'"
              :disabled="!hasFiles"
              @click="emit('next')"
            />
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Info, ChevronDown } from 'lucide-vue-next'
import Header            from '~/components/layout/Header.vue'
import FileItem          from '~/components/id/FileItem.vue'
import BackConfirmModal  from '~/components/id/BackConfirmModal.vue'
import { useScenarioStore } from '~/stores/scenario'
import shpPage    from '~/assets/images/upload-ways/shp-page.svg'
import shpEarmark from '~/assets/images/upload-ways/shp-earmark.svg'
import shpUnion   from '~/assets/images/upload-ways/shp-union.svg'
import excelPage  from '~/assets/images/upload-ways/excel-page.svg'
import excelIcon  from '~/assets/images/upload-ways/excel-icon.svg'

const emit = defineEmits<{ back: []; add: []; next: [] }>()

type FileUpload = { file: File; progress: number }

const GEO_EXTS   = ['.geojson', '.kml', '.shp']
const EXCEL_EXTS = ['.xlsx', '.xls']

function getExt(filename: string) {
  return '.' + (filename.split('.').pop() ?? '').toLowerCase()
}

const scenario       = useScenarioStore()
const geoUploadError = ref(false)
const showGeoError   = computed(() => geoUploadError.value)

const showBackModal = ref(false)

function handleBack() {
  if (geoUpload.value || excelUpload.value) {
    showBackModal.value = true
  } else {
    emit('back')
  }
}

const bannerOpen  = ref(true)
const geoUpload   = ref<FileUpload | null>(null)
const excelUpload = ref<FileUpload | null>(null)
const isDraggingGeo   = ref(false)
const isDraggingExcel = ref(false)
const isInvalidGeo    = ref(false)

watch(
  () => scenario.producteurs?.fileUploadError,
  (willError) => {
    if (willError && (geoUpload.value?.progress ?? 0) >= 100) {
      geoUpload.value      = null
      geoUploadError.value = true
    } else if (!willError) {
      geoUploadError.value = false
    }
  },
)
const isInvalidExcel  = ref(false)

const hasFiles = computed(() => {
  if (geoUploadError.value) return false
  return (geoUpload.value?.progress ?? 0) >= 100 || (excelUpload.value?.progress ?? 0) >= 100
})

function startUpload(target: typeof geoUpload | typeof excelUpload, file: File, isGeo = false) {
  const shouldFail = isGeo && (scenario.producteurs?.fileUploadError ?? false)
  const ceiling    = shouldFail ? Math.round(40 + Math.random() * 35) : 100

  target.value = { file, progress: 0 }
  const iv = setInterval(() => {
    if (!target.value) { clearInterval(iv); return }
    const next = Math.min(ceiling, target.value.progress + Math.round(Math.random() * 15 + 8))
    target.value = { ...target.value, progress: next }
    if (next >= ceiling) {
      clearInterval(iv)
      if (shouldFail) {
        setTimeout(() => { target.value = null; geoUploadError.value = true }, 350)
      }
    }
  }, 180)
}

function flashInvalid(flag: typeof isInvalidGeo | typeof isInvalidExcel) {
  flag.value = true
  setTimeout(() => { flag.value = false }, 1400)
}

function handleFileGeo(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (!GEO_EXTS.includes(getExt(f.name))) { flashInvalid(isInvalidGeo); return }
  startUpload(geoUpload, f, true)
}
function handleDropGeo(e: DragEvent) {
  isDraggingGeo.value = false
  const f = e.dataTransfer?.files[0]
  if (!f) return
  if (!GEO_EXTS.includes(getExt(f.name))) { flashInvalid(isInvalidGeo); return }
  startUpload(geoUpload, f, true)
}
function handleFileExcel(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (!EXCEL_EXTS.includes(getExt(f.name))) { flashInvalid(isInvalidExcel); return }
  startUpload(excelUpload, f)
}
function handleDropExcel(e: DragEvent) {
  isDraggingExcel.value = false
  const f = e.dataTransfer?.files[0]
  if (!f) return
  if (!EXCEL_EXTS.includes(getExt(f.name))) { flashInvalid(isInvalidExcel); return }
  startUpload(excelUpload, f)
}

function onBannerEnter(el: Element) {
  const h = el as HTMLElement
  h.style.overflow = 'hidden'
  h.style.height   = '0'
  h.style.opacity  = '0'
  requestAnimationFrame(() => {
    h.style.transition = 'height 0.22s cubic-bezier(0.16,1,0.3,1), opacity 0.18s ease-out'
    h.style.height  = h.scrollHeight + 'px'
    h.style.opacity = '1'
  })
}
function onBannerAfterEnter(el: Element) { (el as HTMLElement).style.cssText = '' }
function onBannerLeave(el: Element) {
  const h = el as HTMLElement
  h.style.overflow = 'hidden'
  h.style.height   = h.scrollHeight + 'px'
  requestAnimationFrame(() => {
    h.style.transition = 'height 0.18s ease-in, opacity 0.14s ease-in'
    h.style.height  = '0'
    h.style.opacity = '0'
  })
}
function onBannerAfterLeave(el: Element) { (el as HTMLElement).style.cssText = '' }
</script>

<style scoped>
.no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
