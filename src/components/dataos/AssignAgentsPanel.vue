<template>
  <!-- Affectation (cf. ADR-0012) : on AFFECTE des agents existants du roster de
       l'organisation à ce formulaire. On ne crée jamais d'agent ici — la création
       vit dans Paramètres > Organisation (deep-link ci-dessous). -->
  <SlideOverPanel
    ref="panel"
    title="Agents affectés"
    supporting-text="Choisis les agents qui collecteront ce formulaire sur le terrain."
    :width="480"
    @close="emit('close')"
  >
    <template #icon>
      <DsIcon name="users-01" :size="20" />
    </template>

    <!-- Roster vide : pas d'agent à affecter → on renvoie vers les Paramètres. -->
    <div v-if="roster.length === 0" class="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
        <DsIcon name="users-01" :size="22" class="text-text-quaternary" />
      </div>
      <div class="flex flex-col gap-1">
        <p class="text-sm font-semibold text-text-secondary">Aucun agent dans ton organisation</p>
        <p class="max-w-xs text-xs text-text-quaternary">Les agents se créent dans les Paramètres, puis tu les affectes ici.</p>
      </div>
      <DsButton label="Ajouter un agent" variant="primary" size="md" icon-leading="user-plus-01" @click="goToParametres" />
    </div>

    <template v-else>
      <!-- Recherche -->
      <div class="flex flex-col gap-1.5">
        <DsInputField v-model="search" placeholder="Rechercher un agent…">
          <template #icon-leading>
            <DsIcon name="search-md" :size="20" class="text-text-quaternary" />
          </template>
        </DsInputField>
      </div>

      <!-- Roster de l'org : cocher = affecter. Identité seule (v1). -->
      <div class="flex flex-col gap-1">
        <button
          v-for="a in filtered"
          :key="a.id"
          type="button"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface"
          :class="selected.has(a.id) && 'bg-surface'"
          @click="toggle(a.id)"
        >
          <DsCheckbox :model-value="selected.has(a.id)" size="sm" visual-only />
          <DsAvatar :initials="initials(a)" size="md" />
          <div class="flex min-w-0 flex-col">
            <span class="truncate text-sm font-medium text-text-primary">{{ a.prenom }} {{ a.nom }}</span>
            <span class="truncate text-sm text-text-tertiary tabular-nums">{{ a.telephone }}</span>
          </div>
        </button>

        <p v-if="filtered.length === 0" class="px-3 py-6 text-center text-sm text-text-tertiary">
          Aucun agent ne correspond à ta recherche.
        </p>
      </div>

      <!-- L'agent recherché n'est pas dans le roster : deep-link Paramètres. -->
      <button
        type="button"
        class="flex items-center gap-1.5 self-start text-sm font-medium text-[#056033] hover:underline"
        @click="goToParametres"
      >
        <UserPlus :size="16" />
        Ajouter un agent dans les Paramètres
      </button>
    </template>

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" size="md" @click="close" />
      <DsButton :label="saveLabel" variant="primary" size="md" @click="save" />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { UserPlus } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import { useDataOsStore } from '~/stores/dataos'
import { useSessionStore } from '~/stores/session'
import type { OrgAgent } from '~/types/organisation'

const props = defineProps<{ formulaireId: string }>()
const emit  = defineEmits<{ close: []; saved: [string] }>()

const store   = useDataOsStore()
const session = useSessionStore()
session.init()

const panel = ref<{ close: () => void } | null>(null)

// Source unique : le roster d'agents de l'org active (Paramètres).
const roster = computed<OrgAgent[]>(() => session.activeOrg?.agents ?? [])

// Sélection initiale = affectations actuelles du formulaire.
const formulaire = computed(() => store.formulaireById(props.formulaireId))
const selected   = ref<Set<string>>(new Set(formulaire.value?.agentIds ?? []))

const search = ref('')
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const filtered = computed(() => {
  const q = norm(search.value.trim())
  if (!q) return roster.value
  return roster.value.filter((a) => norm(`${a.prenom} ${a.nom} ${a.telephone}`).includes(q))
})

const saveLabel = computed(() => (selected.value.size > 0 ? `Enregistrer (${selected.value.size})` : 'Enregistrer'))

function initials(a: OrgAgent) { return `${a.prenom.charAt(0)}${a.nom.charAt(0)}`.toUpperCase() }

function toggle(id: string) {
  const next = new Set(selected.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selected.value = next
}

function goToParametres() {
  navigateTo('/parametres?onglet=organisation')
}

function save() {
  store.setFormulaireAgents(props.formulaireId, [...selected.value])
  const n = selected.value.size
  emit('saved', n === 0
    ? 'Aucun agent affecté à ce formulaire.'
    : `${n} agent${n > 1 ? 's' : ''} affecté${n > 1 ? 's' : ''} à ce formulaire.`)
  panel.value?.close()
}
</script>
