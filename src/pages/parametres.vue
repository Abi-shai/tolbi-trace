<template>
  <!-- Panneau de contenu blanc pleine largeur (Figma node 1063/690 : body =
       bg-primary blanc, px 16, contenu aligné à gauche). C'est le « background »
       blanc de la section principale — pas une carte flottante. -->
  <div class="content-arrive min-h-full bg-white px-6 py-6">
    <!-- En-tête : juste le titre (le Figma n'a pas de sous-titre ici). -->
    <header>
      <h1 class="text-2xl font-semibold text-text-primary">Paramètres</h1>
    </header>

    <!-- Onglets « soulignés » compacts alignés à gauche (Figma node 1063) : le DS
         DsTabs est un segmenté pleine largeur (flex:1 par onglet) — non fidèle et
         trop large. Barre custom : onglets à largeur naturelle, actif souligné en
         brand, divider bas. Abonnement/Paiement réservés au Propriétaire. -->
    <div class="mt-5 flex items-center gap-6 border-b border-border">
      <button
        v-for="t in tabs"
        :key="t.value"
        type="button"
        class="-mb-px whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-semibold transition-colors"
        :class="tab === t.value
          ? 'border-primary text-[#044b28]'
          : 'border-transparent text-text-quaternary hover:text-text-secondary'"
        @click="tab = t.value"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Panneau actif -->
    <div class="mt-8 pb-8">
      <CompteTab       v-if="tab === 'compte'" />
      <OrganisationTab v-else-if="tab === 'organisation'" />
      <AbonnementTab  v-else-if="tab === 'abonnement'" />
      <PaiementTab    v-else-if="tab === 'paiement'" />
      <PreferencesTab v-else-if="tab === 'preferences'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '~/stores/session'

definePageMeta({ layout: 'home' })

const route   = useRoute()
const router  = useRouter()
const session = useSessionStore()
session.init()

// Onglets : Compte · Organisation · [Abonnement · Paiement] · Préférences.
// Abonnement + Paiement (facturation) ne s'affichent que pour le Propriétaire.
//
// TEMPORAIRE : seuls Compte et Organisation sont exposés. L'UI d'Abonnement,
// Paiement et Préférences n'est pas encore conforme, on garde les onglets définis
// mais masqués. Pour ré-exposer un onglet, l'ajouter à VISIBLE_TABS.
const VISIBLE_TABS = new Set(['compte', 'organisation'])

const tabs = computed(() => {
  const base = [
    { value: 'compte',       label: 'Compte' },
    { value: 'organisation', label: 'Organisation' },
  ]
  if (session.isOwner) {
    base.push({ value: 'abonnement', label: 'Abonnement' }, { value: 'paiement', label: 'Paiement' })
  }
  base.push({ value: 'preferences', label: 'Préférences' })
  return base.filter((t) => VISIBLE_TABS.has(t.value))
})

const validIds = computed(() => tabs.value.map((t) => t.value))

// Onglet initial : depuis ?onglet= (deep-link avatar → Compte), sinon Compte.
// 'notifications' (ancien nom) retombe sur 'preferences'.
const raw = typeof route.query.onglet === 'string' ? route.query.onglet : ''
const initial = raw === 'notifications' ? 'preferences' : raw
const tab = ref(validIds.value.includes(initial) ? initial : 'compte')

// Reflète l'onglet dans l'URL (partageable + deep-link).
watch(tab, (v) => {
  if (route.query.onglet !== v) router.replace({ query: { ...route.query, onglet: v } })
})

// Si l'onglet actif disparaît après un changement d'org (ex. Abonnement → org où
// je ne suis pas Propriétaire), on retombe sur Compte.
watch(validIds, (ids) => {
  if (!ids.includes(tab.value)) tab.value = 'compte'
})
</script>
