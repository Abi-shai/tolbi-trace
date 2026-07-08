<template>
  <div v-if="org" class="flex flex-col gap-8">
    <PanelHeader title="Abonnement" description="Ton plan et tes crédits." />

    <!-- Plan -->
    <section class="flex flex-col gap-4 rounded-xl border border-border p-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-2">
            <p class="text-lg font-semibold text-text-primary">Plan {{ plan.name }}</p>
            <DsBadge
              :label="statusLabel"
              :color="plan.status === 'actif' ? 'success' : 'warning'"
              variant="pill-color"
              size="sm"
            />
          </div>
          <p class="text-sm text-text-tertiary">
            <template v-if="plan.status === 'actif'">
              {{ plan.prix }}<template v-if="plan.renewsOn"> · Se renouvelle le {{ formatDate(plan.renewsOn) }}</template>
            </template>
            <template v-else>
              Période d'essai — passe à un plan payant pour continuer sans interruption.
            </template>
          </p>
        </div>
        <div class="flex items-center gap-3">
          <DsButton
            v-if="plan.status === 'essai'"
            label="Passer à un plan payant"
            variant="primary"
            size="md"
            @click="notify('Changement de plan bientôt disponible.')"
          />
          <DsButton
            v-else
            label="Changer de plan"
            variant="secondary-gray"
            size="md"
            @click="notify('Changement de plan bientôt disponible.')"
          />
        </div>
      </div>
    </section>

    <!-- Crédits (côté plan) -->
    <section class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-text-primary">Crédits</h3>
        <DsButton label="Recharger des crédits" variant="secondary-color" size="md" icon-leading="plus" @click="notify('Recharge de crédits bientôt disponible.')" />
      </div>

      <div class="flex flex-col gap-2 rounded-xl border border-border p-5">
        <div class="flex items-end justify-between">
          <p class="text-2xl font-semibold text-text-primary">{{ remaining }} <span class="text-base font-normal text-text-tertiary">crédits restants</span></p>
          <p class="text-sm text-text-tertiary">{{ plan.creditsUsed }} / {{ plan.creditsIncluded }} utilisés</p>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-surface-alt">
          <div class="h-full rounded-full bg-primary transition-all" :style="{ width: `${usedPct}%` }" />
        </div>
      </div>

      <p class="text-sm text-text-tertiary">
        Le détail de consommation par module se consulte sur l'écran Crédits (pastille en haut).
      </p>
    </section>
  </div>

  <div v-else class="py-12 text-center text-text-tertiary">Aucune organisation active.</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '~/stores/session'
import { useToastStore } from '~/stores/toast'

const session = useSessionStore()
const toast   = useToastStore()
session.init()

const org  = computed(() => session.activeOrg)
const plan = computed(() => org.value!.plan)

const remaining = computed(() => Math.max(0, plan.value.creditsIncluded - plan.value.creditsUsed))
const usedPct   = computed(() => (plan.value.creditsIncluded ? Math.round((plan.value.creditsUsed / plan.value.creditsIncluded) * 100) : 0))

const statusLabel = computed(() =>
  plan.value.status === 'actif'
    ? 'Actif'
    : `Essai${plan.value.trialDaysLeft != null ? ` • ${plan.value.trialDaysLeft} j restants` : ''}`,
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
function notify(title: string) { toast.show({ title, description: 'Démo.' }) }
</script>
