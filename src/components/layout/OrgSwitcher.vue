<template>
  <!-- Déclencheur — deux présentations :
       · variant "full"  → boîte bordée (avatar + nom + chevron) : sidebar Accueil (Figma)
       · variant "rail"  → avatar seul dans l'icon rail d'un module (juste après l'icône module) -->
  <button
    v-if="variant === 'rail'"
    ref="trigger"
    type="button"
    title="Changer d'organisation"
    class="flex h-12 w-12 items-center justify-center rounded-lg transition-colors hover:bg-surface"
    @click="toggle"
  >
    <span
      class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
      :style="{ backgroundColor: activeOrg?.logoColor ?? '#98A2B3' }"
    >{{ activeOrg?.logoInitials }}</span>
  </button>

  <button
    v-else
    ref="trigger"
    type="button"
    class="flex w-full items-center gap-2.5 rounded-lg border border-border bg-white px-3 py-2 text-left transition-colors hover:bg-surface"
    @click="toggle"
  >
    <span
      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      :style="{ backgroundColor: activeOrg?.logoColor ?? '#98A2B3' }"
    >{{ activeOrg?.logoInitials }}</span>
    <span class="flex-1 truncate text-base font-medium text-text-primary">{{ activeOrg?.name ?? 'Organisation' }}</span>
    <ChevronDown :size="18" class="shrink-0 text-text-quaternary transition-transform" :class="open && 'rotate-180'" />
  </button>

  <!-- Menu (téléporté, positionné par rapport au déclencheur) -->
  <Teleport to="body">
    <template v-if="open">
      <div class="fixed inset-0 z-[9998]" @click="open = false" />
      <div
        class="fixed z-[9999] rounded-lg border border-border bg-white p-1 shadow-lg"
        :style="menuStyle"
      >
        <button
          v-for="o in session.organisations"
          :key="o.id"
          type="button"
          class="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface"
          @click="select(o.id)"
        >
          <span
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
            :style="{ backgroundColor: o.logoColor }"
          >{{ o.logoInitials }}</span>
          <span class="flex-1 truncate text-sm font-medium text-text-primary">{{ o.name }}</span>
          <Check v-if="o.id === session.activeOrgId" :size="16" class="shrink-0 text-primary" />
        </button>

        <div class="my-1 h-px bg-border" />

        <button
          type="button"
          class="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
          @click="openCreate"
        >
          <span class="flex h-6 w-6 shrink-0 items-center justify-center"><Plus :size="16" /></span>
          Créer une organisation
        </button>
      </div>
    </template>
  </Teleport>

  <!-- Création -->
  <Modal v-model="createOpen" title="Créer une organisation" description="Tu en deviendras le Propriétaire." size="md">
    <div class="mt-4 flex flex-col gap-4">
      <DsInputField v-model="draft.name" label="Nom de l'organisation" placeholder="Ma coopérative" />
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-text-secondary">Type</label>
        <DsInputDropdown v-model="draft.type" :options="typeOptions" />
      </div>
    </div>
    <template #footer>
      <DsButton label="Annuler" variant="secondary-gray" size="md" @click="createOpen = false" />
      <DsButton label="Créer l'organisation" variant="primary" size="md" :disabled="!draft.name.trim()" @click="create" />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ChevronDown, Check, Plus } from 'lucide-vue-next'
import Modal from '~/components/ui/Modal.vue'
import { useSessionStore } from '~/stores/session'
import { useToastStore } from '~/stores/toast'
import { ORGANISATION_TYPE_LABELS, type OrganisationType } from '~/types/organisation'

const props = withDefaults(defineProps<{ variant?: 'full' | 'rail' }>(), { variant: 'full' })

const session = useSessionStore()
const toast   = useToastStore()
session.init()

const activeOrg = computed(() => session.activeOrg)

const typeOptions = (Object.keys(ORGANISATION_TYPE_LABELS) as OrganisationType[]).map((value) => ({
  value,
  label: ORGANISATION_TYPE_LABELS[value],
}))

// ── Ouverture / positionnement du menu téléporté ────────────────────────────────
const open = ref(false)
const trigger = ref<HTMLElement | null>(null)
const menuStyle = reactive({ top: '0px', left: '0px', width: '240px', minWidth: '220px' })

function toggle() {
  if (!open.value && trigger.value) {
    const r = trigger.value.getBoundingClientRect()
    if (props.variant === 'rail') {
      // Flyout à droite de l'avatar
      menuStyle.top   = `${r.top}px`
      menuStyle.left  = `${r.right + 8}px`
      menuStyle.width = '240px'
    } else {
      // Sous la boîte, même largeur
      menuStyle.top   = `${r.bottom + 6}px`
      menuStyle.left  = `${r.left}px`
      menuStyle.width = `${r.width}px`
    }
  }
  open.value = !open.value
}

function select(id: string) {
  session.switchOrg(id)
  open.value = false
  toast.show({ title: `Organisation : ${session.activeOrg?.name}.` })
}

// ── Création ──────────────────────────────────────────────────────────────────
const createOpen = ref(false)
const draft = reactive({ name: '', type: 'agroindustriel' as OrganisationType })
function openCreate() { open.value = false; draft.name = ''; draft.type = 'agroindustriel'; createOpen.value = true }
function create() {
  if (!draft.name.trim()) return
  const org = session.createOrg({ name: draft.name.trim(), type: draft.type })
  createOpen.value = false
  toast.show({ title: `${org.name} créée.`, description: 'Tu en es le Propriétaire.' })
}
</script>
