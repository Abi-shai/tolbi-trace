<template>
  <div class="content-arrive px-10 py-8">
    <h1 class="text-2xl font-semibold text-text-primary">Bonjour {{ prenom }} 👋</h1>
    <p class="mt-1 text-base text-text-tertiary">
      Tu es sur {{ orgName }}. Choisis un module dans la barre du haut pour commencer.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '~/stores/session'

definePageMeta({ layout: 'home' })

const session = useSessionStore()
session.init()

const prenom  = computed(() => session.user?.prenom ?? '')
const orgName = computed(() => session.activeOrg?.name ?? '')
</script>
