<template>
  <Transition name="config-panel">
    <aside
      v-if="step"
      class="shrink-0 border-l border-border bg-white flex flex-col overflow-hidden"
      style="width: 360px"
    >
      <div class="w-[360px] flex flex-col flex-1 min-h-0">

        <div class="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
          <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">
            {{ step.order }}
          </span>
          <span class="text-sm font-semibold text-text-primary truncate flex-1 min-w-0">{{ step.name }}</span>
          <DsCloseButton @click="builder.selectStep(null)" />
        </div>

        <div class="flex-1 overflow-y-auto">

          <div class="px-5 py-5 space-y-4">

            <DsInputField
              label="Nom de l'étape"
              type="text"
              :model-value="step.name"
              @update:model-value="(val: string) => builder.updateStep(step!.id, { name: val })"
              placeholder="Nom de l'étape"
            />

            <!-- Agent assigné -->
            <div>
              <label class="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
                Agent assigné
              </label>

              <select
                v-if="workflowAgents.length > 0"
                :value="step.agentId ?? ''"
                @change="(e: Event) => handleAgentChange((e.target as HTMLSelectElement).value)"
                class="w-full px-3 py-2 text-sm text-text-primary border border-border-strong rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                <option value="">— Aucun agent assigné</option>
                <option v-for="agent in workflowAgents" :key="agent.id" :value="agent.id">
                  {{ agent.name }}
                </option>
              </select>

              <div v-else class="px-3 py-2.5 border border-dashed border-border rounded-lg bg-surface text-xs text-text-quaternary">
                Aucun agent dans l'équipe pour l'instant.
              </div>

              <NuxtLink
                :to="`/source/workflows/${workflowId}/agents`"
                class="flex items-center gap-1 mt-1.5 text-xs text-primary hover:underline"
              >
                <Users :size="11" />
                Gérer l'équipe
              </NuxtLink>
            </div>

            <!-- Type de validation -->
            <div>
              <label class="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
                Type de validation
              </label>
              <DsButtonGroup aria-label="Type de validation">
                <DsButtonGroupItem
                  label="Formulaire"
                  :active="step.validationType === 'form'"
                  @click="builder.updateStep(step!.id, { validationType: 'form' })"
                />
                <DsButtonGroupItem
                  label="Code de validation"
                  :active="step.validationType === 'code'"
                  @click="builder.updateStep(step!.id, { validationType: 'code' })"
                />
              </DsButtonGroup>
              <p class="text-[11px] text-text-quaternary mt-1 leading-4">
                {{ step.validationType === 'form'
                  ? 'L\'agent remplit les champs définis ci-dessous.'
                  : 'L\'agent saisit un code unique pour valider l\'étape.' }}
              </p>
            </div>

            <DsTextareaField
              label="Description (optionnel)"
              :model-value="step.description ?? ''"
              @update:model-value="(val: string) => builder.updateStep(step!.id, { description: val })"
              placeholder="Description courte de cette étape"
            />
          </div>

          <div class="h-px bg-border" />

          <div class="px-5 py-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Questions
                <span class="ml-1.5 px-1.5 py-0.5 bg-surface rounded text-text-quaternary font-normal normal-case">
                  {{ step.questions.length }}
                </span>
              </h3>
              <DsButton label="Ajouter" icon-leading="plus" variant="primary" size="sm" @click="builder.addQuestion(step!.id, 'texte')" />
            </div>

            <div v-if="step.questions.length === 0" class="py-10 flex flex-col items-center text-center">
              <div class="w-8 h-8 rounded-full bg-surface flex items-center justify-center mb-3">
                <Plus :size="14" class="text-text-quaternary" />
              </div>
              <p class="text-sm font-medium text-text-secondary mb-1">Aucune question</p>
              <p class="text-xs text-text-quaternary leading-4 max-w-[200px]">
                Cliquez sur « Ajouter » pour définir les données à collecter.
              </p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="(q, i) in step.questions"
                :key="q.id"
                class="group flex items-start gap-2 p-3 border border-border rounded-lg bg-white hover:border-border-strong transition-colors"
              >
                <GripVertical :size="14" class="text-text-quaternary mt-[9px] shrink-0 cursor-grab" />
                <span class="flex items-center justify-center w-5 h-5 rounded-full bg-surface border border-border text-[10px] font-bold text-text-tertiary shrink-0 mt-[9px]">
                  {{ i + 1 }}
                </span>

                <div class="flex-1 space-y-2 min-w-0">
                  <select
                    :value="q.type"
                    @change="(e: Event) => builder.updateQuestion(step!.id, q.id, { type: (e.target as HTMLSelectElement).value as QuestionType })"
                    class="w-full px-2.5 py-1.5 text-xs font-semibold border border-border-strong rounded-md bg-surface text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer"
                  >
                    <option v-for="opt in QUESTION_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>

                  <input
                    type="text"
                    :value="q.label"
                    @input="(e: Event) => builder.updateQuestion(step!.id, q.id, { label: (e.target as HTMLInputElement).value })"
                    :placeholder="`Libellé — ex. &quot;${QUESTION_TYPE_LABELS[q.type]}&quot;`"
                    class="w-full px-2.5 py-1.5 text-xs text-text-primary border border-border-strong rounded-md placeholder:text-text-quaternary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>

                <button
                  @click="builder.removeQuestion(step!.id, q.id)"
                  class="p-1.5 rounded-md text-text-quaternary hover:text-status-anomaly hover:bg-red-50 transition-colors shrink-0 mt-0.5 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 :size="13" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="shrink-0 px-5 py-4 border-t border-border">
          <button
            @click="confirmDelete = true"
            class="flex items-center gap-1.5 text-xs text-text-quaternary hover:text-status-anomaly transition-colors"
          >
            <Trash2 :size="13" />
            Supprimer l'étape
          </button>
        </div>

        <!-- Confirmation modale -->
        <Teleport to="body">
          <div
            v-if="confirmDelete && step"
            class="fixed inset-0 z-50 flex items-center justify-center"
            @click="confirmDelete = false"
          >
            <div class="absolute inset-0 bg-black/40" />
            <div
              class="relative bg-white rounded-xl shadow-xl border border-border w-full max-w-sm mx-4 p-6 space-y-4"
              @click.stop
            >
              <div class="flex items-start gap-3">
                <div class="flex items-center justify-center w-9 h-9 rounded-full bg-red-100 shrink-0">
                  <AlertTriangle :size="16" class="text-red-600" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-text-primary">Supprimer cette étape ?</p>
                  <p class="text-xs text-text-quaternary mt-0.5">« {{ step.name }} »</p>
                </div>
              </div>
              <p class="text-xs text-text-secondary leading-5">
                Cette action est irréversible. Les questions configurées et l'agent assigné seront supprimés avec l'étape.
              </p>
              <div class="flex gap-2 pt-1">
                <DsButton label="Annuler" variant="secondary-gray" class="flex-1" @click="confirmDelete = false" />
                <DsButton label="Supprimer" variant="danger" class="flex-1" @click="handleDelete" />
              </div>
            </div>
          </div>
        </Teleport>

      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Trash2, GripVertical, Users, AlertTriangle } from 'lucide-vue-next'
import { useWorkflowBuilderStore } from '~/stores/workflow-builder'
import { useAgentsStore } from '~/stores/agents'
import { QUESTION_TYPE_LABELS, type QuestionType, type ValidationType } from '~/types/workflow-step'

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'qr_batch',   label: 'Scan QR (rafale)' },
  { value: 'qr_scan',    label: 'Scan QR' },
  { value: 'producteur', label: 'Producteur' },
  { value: 'texte',      label: 'Texte libre' },
  { value: 'nombre',     label: 'Nombre' },
  { value: 'date',       label: 'Date' },
  { value: 'selection',  label: 'Sélection' },
]

const route   = useRoute()
const builder = useWorkflowBuilderStore()
const agentsStore = useAgentsStore()

const workflowId = computed(() => route.path.match(/^\/source\/workflows\/([^/]+)/)?.[1] ?? '')

const confirmDelete = ref(false)

const step = computed(() => builder.steps.find((s) => s.id === builder.selectedStepId) ?? null)
const workflowAgents = computed(() => agentsStore.agents.filter((a) => a.workflowId === workflowId.value))

agentsStore.init()

function handleDelete() {
  if (step.value) builder.removeStep(step.value.id)
  confirmDelete.value = false
}

function handleAgentChange(value: string) {
  if (!step.value) return
  if (!value) {
    builder.updateStep(step.value.id, { agentId: undefined, agentRole: '' })
    return
  }
  const agent = agentsStore.agents.find((a) => a.id === value)
  if (agent) builder.updateStep(step.value.id, { agentId: agent.id, agentRole: agent.name })
}
</script>

<style scoped>
.config-panel-enter-active,
.config-panel-leave-active {
  transition: width 0.22s var(--ds-motion-easing-in-out);
  overflow: hidden;
}
.config-panel-enter-from,
.config-panel-leave-to {
  width: 0 !important;
}
</style>
