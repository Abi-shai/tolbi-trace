<template>
  <!-- Sidebar Accueil (Figma node 1700:15440) : logo · switcher d'org · nav
       Accueil/Paramètres · Récents · carte d'essai. Sert de sidebar aux pages
       cross-module Accueil et Paramètres. -->
  <aside class="flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-white">
    <div class="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 pt-5">
      <!-- Pas de logo ici : le logo Tolbi vit déjà dans la topbar horizontale.
           Le switcher d'organisation est le premier élément de la sidebar. -->
      <OrgSwitcher />

      <!-- Navigation -->
      <nav class="flex flex-col gap-1">
        <button
          v-for="item in navItems"
          :key="item.href"
          type="button"
          :class="navClass(item.href)"
          @click="router.push(item.href)"
        >
          <component :is="item.icon" :size="22" :class="isActive(item.href) ? 'text-text-secondary' : 'text-text-quaternary'" />
          {{ item.label }}
        </button>
      </nav>

      <div class="h-px bg-border" />

      <!-- Récents -->
      <div class="flex flex-col gap-2">
        <p class="px-1 text-sm text-text-tertiary">Récents</p>
        <button
          v-for="r in recents"
          :key="r.id"
          type="button"
          class="flex items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface"
          @click="router.push(r.href)"
        >
          <Folder :size="20" class="mt-0.5 shrink-0 text-text-quaternary" />
          <div class="min-w-0">
            <p class="truncate text-xs text-text-tertiary">{{ r.module }}</p>
            <p class="truncate text-base font-semibold text-text-primary">{{ r.name }}</p>
          </div>
        </button>
      </div>

      <div class="flex-1" />

      <!-- Carte d'essai / plan -->
      <div class="rounded-xl bg-surface p-4">
        <template v-if="trial">
          <p class="text-base font-semibold text-text-primary">Plus que {{ trialDaysLeft }} jours pour explorer Tolbi OS</p>
          <p class="mt-1.5 text-sm text-text-tertiary">
            Profite de ta période de démo pour découvrir les modules activés, et expérimenter nos outils.
            Prolonge l'expérience en souscrivant à l'offre complète.
          </p>
          <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white">
            <div class="h-full rounded-full bg-primary" :style="{ width: `${trialPct}%` }" />
          </div>
        </template>
        <template v-else>
          <p class="text-base font-semibold text-text-primary">Plan {{ activeOrg?.plan.name }} actif</p>
          <p class="mt-1.5 text-sm text-text-tertiary">Tu profites de tous les modules de ton offre.</p>
        </template>
        <button type="button" class="mt-4 text-base font-semibold text-primary" @click="contactSupport">
          Contacter le support
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, Settings, Folder } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import { useSessionStore } from '~/stores/session'
import { useToastStore } from '~/stores/toast'
import { recentsMock } from '~/data/recents'

const route   = useRoute()
const router  = useRouter()
const session = useSessionStore()
const toast   = useToastStore()
session.init()

const recents = recentsMock

const navItems = [
  { label: 'Accueil',    href: '/accueil',    icon: Home },
  { label: 'Paramètres', href: '/parametres', icon: Settings },
]

const activeOrg     = computed(() => session.activeOrg)
const trial         = computed(() => activeOrg.value?.plan.status === 'essai')
const trialDaysLeft = computed(() => activeOrg.value?.plan.trialDaysLeft ?? 0)
const trialPct      = computed(() => Math.min(100, Math.max(0, Math.round(((30 - trialDaysLeft.value) / 30) * 100))))

function isActive(href: string) {
  return route.path === href || route.path.startsWith(href + '/')
}
function navClass(href: string) {
  return cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-base font-semibold transition-colors',
    isActive(href)
      ? 'bg-surface text-text-nav-hover'
      : 'bg-white text-text-secondary hover:bg-surface hover:text-text-nav-hover',
  )
}
function contactSupport() { toast.show({ title: 'Support', description: 'On te recontacte au plus vite.' }) }
</script>
