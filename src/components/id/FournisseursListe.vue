<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">

    <Header title="Fournisseurs">
      <template #actions>
        <DsButton label="Ajouter des fournisseurs" variant="primary" icon-leading="user-plus-01" @click="$emit('add')" />
      </template>
    </Header>

    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto bg-surface">
      <div class="flex flex-col gap-4 p-6">

        <!-- Métriques -->
        <div class="flex gap-4">
          <MetricCard :icon="Users" label="Nombres de fournisseurs" :value="stats.count.toLocaleString('fr-FR')" />
          <MetricCard :icon="MapPin" label="Nombre de parcelles" :value="stats.parcelles.toLocaleString('fr-FR')" />
          <MetricCard :icon="Layers" label="Surface totale (Hectares)" :value="stats.surfaceHa.toLocaleString('fr-FR') + ' ha'" />
        </div>

        <!-- Carte principale -->
        <div class="bg-white rounded-xl border border-[#eaecf0] overflow-hidden flex flex-col">

          <!-- Onglets -->
          <div class="px-6 pt-4 pb-0">
            <div class="flex items-center gap-1 p-1 bg-[#f9fafb] border border-[#eaecf0] rounded-[10px] w-fit">
              <button
                class="flex items-center gap-2 h-9 px-3 rounded-md text-sm font-semibold transition-all"
                :class="activeTab === 'profils'
                  ? 'bg-white shadow-[0px_1px_3px_rgba(16,24,40,0.1),0px_1px_2px_rgba(16,24,40,0.06)] text-text-secondary'
                  : 'text-text-quaternary'"
                style="font-family: var(--ds-typography-font-family-poppins)"
                @click="activeTab = 'profils'"
              >
                <Users :size="16" />
                Profils
              </button>
              <button
                class="flex items-center gap-2 h-9 px-3 rounded-md text-sm font-semibold transition-all"
                :class="activeTab === 'polygones'
                  ? 'bg-white shadow-[0px_1px_3px_rgba(16,24,40,0.1),0px_1px_2px_rgba(16,24,40,0.06)] text-text-secondary'
                  : 'text-text-quaternary'"
                style="font-family: var(--ds-typography-font-family-poppins)"
                @click="activeTab = 'polygones'"
              >
                <Map :size="16" />
                Polygones
              </button>
            </div>
          </div>

          <!-- Barre d'outils -->
          <div class="flex items-center gap-3 px-6 pt-4 pb-3">
            <div class="flex-1 min-w-0 relative">
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                <Search :size="16" />
              </div>
              <input
                v-model="search"
                type="text"
                placeholder="Rechercher un producteur (ex: code, num...)"
                class="w-full h-10 pl-9 pr-3 border border-[#d0d5dd] rounded-lg text-sm text-text-secondary placeholder-text-quaternary bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors"
                style="font-family: var(--ds-typography-font-family-inter)"
              />
            </div>
            <DsButton label="Télécharger la liste" variant="primary" icon-leading="download-01" />
            <button
              class="flex items-center gap-1.5 px-[14px] py-[10px] bg-white border border-[#d0d5dd] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-sm font-semibold text-[#344054] hover:bg-[#f9fafb] transition-colors shrink-0"
              style="font-family: var(--ds-typography-font-family-poppins)"
            >
              <LayoutGrid :size="16" class="text-[#667085]" />
              Réorganiser la liste
            </button>
            <button
              class="flex items-center justify-center w-10 h-10 bg-white border border-[#d0d5dd] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-[#667085] hover:bg-[#f9fafb] transition-colors shrink-0"
            >
              <MoreVertical :size="16" />
            </button>
          </div>

          <!-- Tableau -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-t border-b border-[#eaecf0] bg-[#f9fafb]">
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Prénom et nom</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Code parcelles</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">INA</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Numéro de téléphone</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Coopératives</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredRows"
                  :key="row.id"
                  class="border-b border-[#eaecf0] last:border-b-0 bg-white hover:bg-[#f9fafb] transition-colors"
                >
                  <td class="h-16 px-6 py-3">
                    <div class="flex items-center gap-3">
                      <DsAvatar size="sm" :initials="initials(row.prenom, row.nom)" />
                      <span class="text-sm font-medium text-[#101828]" style="font-family: var(--ds-typography-font-family-inter)">
                        {{ row.prenom }} {{ row.nom }}
                      </span>
                    </div>
                  </td>
                  <td class="h-16 px-6 py-3 text-sm text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">{{ row.codeParcelles }}</td>
                  <td class="h-16 px-6 py-3 text-sm text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">{{ row.ina }}</td>
                  <td class="h-16 px-6 py-3 text-sm text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">{{ row.telephone }}</td>
                  <td class="h-16 px-6 py-3 text-sm text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">{{ row.cooperative }}</td>
                  <td class="h-16 px-6 py-3">
                    <div class="flex items-center gap-1">
                      <button class="flex items-center justify-center w-8 h-8 rounded-md text-[#667085] hover:bg-[#f2f4f7] transition-colors">
                        <Pencil :size="16" />
                      </button>
                      <button class="flex items-center justify-center w-8 h-8 rounded-md text-[#667085] hover:bg-[#fef3f2] hover:text-[#d92d20] transition-colors">
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between px-6 py-3 border-t border-[#eaecf0]">
            <div class="flex items-center gap-1">
              <button
                class="flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-semibold text-[#344054] border border-[#d0d5dd] bg-white hover:bg-[#f9fafb] transition-colors"
                style="font-family: var(--ds-typography-font-family-poppins)"
              >
                <ChevronLeft :size="16" />
                Précédent
              </button>
              <div class="flex items-center gap-0.5 mx-1">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  class="flex items-center justify-center w-9 h-9 rounded-md text-sm font-semibold transition-colors"
                  :class="page === currentPage
                    ? 'bg-[#f9fafb] text-[#1D9E75] border border-[#1D9E75]'
                    : page === '...'
                    ? 'text-[#667085] cursor-default'
                    : 'text-[#667085] hover:bg-[#f9fafb]'"
                  style="font-family: var(--ds-typography-font-family-poppins)"
                  :disabled="page === '...'"
                >
                  {{ page }}
                </button>
              </div>
              <button
                class="flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-semibold text-[#344054] border border-[#d0d5dd] bg-white hover:bg-[#f9fafb] transition-colors"
                style="font-family: var(--ds-typography-font-family-poppins)"
              >
                Suivant
                <ChevronRight :size="16" />
              </button>
            </div>
            <div class="flex items-center gap-2 text-sm text-[#344054]" style="font-family: var(--ds-typography-font-family-inter)">
              Producteurs par page
              <button
                class="flex items-center gap-1 h-9 px-3 border border-[#d0d5dd] rounded-lg bg-white hover:bg-[#f9fafb] text-sm font-medium text-[#344054] transition-colors"
                style="font-family: var(--ds-typography-font-family-poppins)"
              >
                100
                <ChevronDown :size="14" class="text-[#667085]" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Users, MapPin, Layers, Search, Map, LayoutGrid, MoreVertical, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import MetricCard from '~/components/ui/MetricCard.vue'
import { fournisseursMock, fournisseursStats } from '~/data/fournisseurs'

defineEmits<{ add: [] }>()

const stats     = fournisseursStats
const activeTab = ref<'profils' | 'polygones'>('profils')
const search    = ref('')
const currentPage = 1

const visiblePages = [1, 2, 3, '...', 8, 9, 10]

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return fournisseursMock
  return fournisseursMock.filter(f =>
    `${f.prenom} ${f.nom}`.toLowerCase().includes(q) ||
    f.codeParcelles.toLowerCase().includes(q) ||
    f.ina.toLowerCase().includes(q) ||
    f.telephone.includes(q) ||
    f.cooperative.toLowerCase().includes(q),
  )
})

function initials(prenom: string, nom: string) {
  return (prenom[0] ?? '') + (nom[0] ?? '')
}
</script>
