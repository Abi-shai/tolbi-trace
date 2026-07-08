<template>
  <div class="flex max-w-3xl flex-col gap-8">
    <PanelHeader
      title="Préférences"
      description="Choisis les alertes que tu reçois et par quels canaux."
    />

    <!-- Types d'alertes -->
    <section class="flex flex-col gap-1">
      <h3 class="mb-2 text-base font-semibold text-text-primary">Types d'alertes</h3>
      <div class="divide-y divide-border rounded-lg border border-border">
        <div v-for="a in alertRows" :key="a.key" class="px-4 py-3.5">
          <DsToggle
            size="md"
            :model-value="prefs[a.key]"
            :label="a.label"
            :supporting-text="a.hint"
            @update:model-value="(v: boolean) => session.updateNotificationPreferences({ [a.key]: v })"
          />
        </div>
      </div>
    </section>

    <!-- Canaux -->
    <section class="flex flex-col gap-1">
      <h3 class="mb-2 text-base font-semibold text-text-primary">Canaux</h3>
      <div class="divide-y divide-border rounded-lg border border-border">
        <div v-for="c in channelRows" :key="c.key" class="px-4 py-3.5">
          <DsToggle
            size="md"
            :model-value="prefs[c.key]"
            :label="c.label"
            :supporting-text="c.hint"
            @update:model-value="(v: boolean) => session.updateNotificationPreferences({ [c.key]: v })"
          />
        </div>
      </div>
    </section>

    <p class="text-sm text-text-tertiary">
      Le flux et l'historique des alertes vivent dans la cloche 🔔 en haut de l'écran.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '~/stores/session'
import type { NotificationPreferences } from '~/types/user'

const session = useSessionStore()
session.init()

const prefs = computed(() => session.notificationPreferences)

type PrefKey = keyof NotificationPreferences
const alertRows: { key: PrefKey; label: string; hint: string }[] = [
  { key: 'consoCredits',  label: 'Consommation de crédits', hint: 'Quand tes crédits baissent ou approchent d\'une limite.' },
  { key: 'quantiteDelai', label: 'Quantité & délais',       hint: 'Alertes sur les seuils de quantité ou les retards.' },
  { key: 'membres',       label: 'Activité des membres',    hint: 'Invitations, arrivées et changements d\'accès.' },
  { key: 'actualites',    label: 'Actualités Tolbi',        hint: 'Nouveautés produit et annonces.' },
]
const channelRows: { key: PrefKey; label: string; hint: string }[] = [
  { key: 'canalEmail',  label: 'Email',       hint: 'Reçois les alertes par email.' },
  { key: 'canalPush',   label: 'Push',        hint: 'Notifications sur ton appareil.' },
  { key: 'canalInApp',  label: 'Dans l\'app', hint: 'Affichées dans la cloche en haut.' },
]
</script>
