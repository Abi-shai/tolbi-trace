<template>
  <ScreenTransition :show="showFinalizing">
    <img :src="tolbiLogoAnimation" alt="" class="size-[150px] object-contain pointer-events-none" />
  </ScreenTransition>

  <ImportMatching v-if="step === 'matching'" @back="step = 'import'" @add="$emit('add')" @cancel="step = 'import'" @finalize-start="onFinalizeStart" />

  <Transition name="step-reveal">
    <ImportFichiers v-if="step === 'import'" @back="step = 'empty'" @next="step = 'matching'" @add="$emit('add')" />
  </Transition>

  <ProducteursListe v-if="step === 'done'" @add="$emit('add')" />

  <div v-if="step === 'empty'" class="flex flex-col flex-1 min-h-0 overflow-hidden">

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

    <!-- Empty state -->
    <div class="flex flex-1 overflow-y-auto bg-surface">
      <div class="flex flex-col items-center gap-6 px-6 pt-12 w-full">

        <!-- Title + subtitle -->
        <div class="flex flex-col items-center gap-2 text-center">
          <p class="text-2xl font-semibold text-text-primary leading-8">
            Ajouter des producteurs
          </p>
          <p class="text-base text-text-tertiary leading-6 max-w-lg">
            Trois méthodes d'intégration. Choisissez selon votre source de données.
          </p>
        </div>

        <!-- 3 method cards -->
        <div class="flex gap-6 items-center justify-center w-full h-[216px]">

          <!-- Card: Importer des fichiers -->
          <button
            class="flex flex-col items-center gap-4 p-4 bg-white rounded-lg w-[276px] h-full text-center overflow-hidden cursor-pointer shadow-[0_0_0_4px_rgba(152,162,179,0.2)] hover:shadow-[0_0_0_4px_rgba(29,158,117,0.25)] hover:bg-[var(--ds-semantic-bg-brand-primary)] transition duration-150"
            @click="step = 'import'"
          >
            <div class="relative w-[60px] h-12 shrink-0">
              <UploadWaysIcon />
            </div>
            <div class="flex flex-col gap-1 items-center text-center">
              <p class="text-lg font-semibold text-[color:var(--ds-semantic-text-brand-secondary)] leading-7">
                Importer des fichiers
              </p>
              <p class="text-sm text-text-tertiary leading-5">
                Importez les fichiers Excel ou GPS transmis par vos coopératives.
              </p>
            </div>
          </button>

          <!-- Card: Lancer une collecte terrain -->
          <button
            class="flex flex-col items-center gap-4 p-4 bg-white rounded-lg w-[276px] h-full text-center overflow-hidden cursor-pointer shadow-[0_0_0_4px_rgba(152,162,179,0.2)] hover:shadow-[0_0_0_4px_rgba(29,158,117,0.25)] hover:bg-[var(--ds-semantic-bg-brand-primary)] transition duration-150"
            @click="$emit('collect')"
          >
            <DsModuleIcon module="Survey" :size="48" class="shrink-0" />
            <div class="flex flex-col gap-1 items-center text-center">
              <p class="text-lg font-semibold text-[color:var(--ds-semantic-text-brand-secondary)] leading-7">
                Lancer une collecte terrain
              </p>
              <p class="text-sm text-text-tertiary leading-5">
                Déployez vos agents pour géolocaliser les parcelles et enregistrer chaque producteur.
              </p>
            </div>
          </button>

          <!-- Card: Ajouter manuellement -->
          <button
            class="flex flex-col items-center gap-4 p-4 bg-white rounded-lg w-[276px] h-full text-center overflow-hidden cursor-pointer shadow-[0_0_0_4px_rgba(152,162,179,0.2)] hover:shadow-[0_0_0_4px_rgba(29,158,117,0.25)] hover:bg-[var(--ds-semantic-bg-brand-primary)] transition duration-150"
            @click="$emit('manual')"
          >
            <div class="relative size-[48px] shrink-0 overflow-hidden rounded-[10px] border border-border shadow-xs">
              <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <img
                  :src="manualIllustration"
                  class="absolute max-w-none"
                  style="height:133.13%;left:-46.08%;top:-16.56%;width:193.64%"
                  alt=""
                />
              </div>
            </div>
            <div class="flex flex-col gap-1 items-center text-center">
              <p class="text-lg font-semibold text-[color:var(--ds-semantic-text-brand-secondary)] leading-7">
                Ajouter manuellement
              </p>
              <p class="text-sm text-text-tertiary leading-5">
                Renseignez leurs informations, puis cartographiez leurs parcelles. Un producteur à la fois.
              </p>
            </div>
          </button>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import Header from '~/components/layout/Header.vue'
import ImportFichiers from '~/components/id/ImportFichiers.vue'
import ImportMatching from '~/components/id/ImportMatching.vue'
import ProducteursListe from '~/components/id/ProducteursListe.vue'
import manualIllustration from '~/assets/images/upload-ways/manual-illustration.png'
import tolbiLogoAnimation from '~/assets/images/tolbi-logo-animation.gif'
import { useScenarioStore } from '~/stores/scenario'

defineEmits<{ add: []; collect: []; manual: [] }>()

const step          = ref<'empty' | 'import' | 'matching' | 'done'>('empty')
const showFinalizing = ref(false)
const scenario      = useScenarioStore()
let finalizeTimer: ReturnType<typeof setTimeout>

function onFinalizeStart() {
  showFinalizing.value = true
  step.value = 'done'
  clearTimeout(finalizeTimer)
  finalizeTimer = setTimeout(() => { showFinalizing.value = false }, 2000)
}

watch(step, (val, old) => {
  if (val === 'matching') {
    scenario.registerScope('matching')
    if (!scenario.active || scenario.active.scope !== 'matching')
      scenario.activeId = 'producteurs-succes-clean'
  }
  if (old === 'matching') scenario.unregisterScope('matching')
  if (val === 'import') {
    scenario.registerScope('import')
    if (!scenario.active || scenario.active.scope !== 'import')
      scenario.activeId = 'producteurs-chargement-succes'
  }
  if (old === 'import')   scenario.unregisterScope('import')
})

watch(() => scenario.activeId, (newId) => {
  if (!newId) return
  const s = scenario.active
  if (!s?.scope) return
  if (s.scope === 'import' && step.value !== 'import')     step.value = 'import'
  else if (s.scope === 'matching' && step.value !== 'matching') step.value = 'matching'
})

onUnmounted(() => {
  scenario.unregisterScope('matching')
  scenario.unregisterScope('import')
  clearTimeout(finalizeTimer)
})
</script>

<style scoped>
/* L'overlay quitte en 0.28s — on démarre le fondu après 0.1s
   pour que la page apparaisse pendant la descente, pas après */
.step-reveal-enter-active {
  transition: opacity 0.3s ease 0.1s;
}
.step-reveal-enter-from {
  opacity: 0;
}
</style>
