<template>
  <!-- Trigger pill -->
  <button
    class="debug-trigger"
    :class="scenario.activeId ? 'debug-trigger--active' : ''"
    @click="scenario.togglePanel()"
  >
    <Settings :size="13" />
    <span>UX Scénarios</span>
    <span v-if="scenario.active" class="debug-trigger__dot" />
  </button>

  <!-- Panel -->
  <Transition name="debug-panel">
    <div v-if="scenario.panelOpen" class="debug-panel">

      <!-- Header -->
      <div class="debug-panel__header">
        <div class="debug-panel__title">
          <Bug :size="14" />
          <span>UX Scénarios</span>
        </div>
        <div class="debug-panel__shortcuts">
          <kbd>Shift</kbd><span>+</span><kbd>D</kbd>
        </div>
        <button class="debug-panel__close" @click="scenario.panelOpen = false">
          <X :size="14" />
        </button>
      </div>

      <!-- Scenario list -->
      <div class="debug-panel__body">
        <template v-if="scenario.groups.size > 0">
          <div v-for="[group, items] in scenario.groups" :key="group" class="debug-group">
            <p class="debug-group__label">{{ group }}</p>

            <template v-for="({ ungrouped, folders }) in [splitGroup(items)]" :key="group + '-split'">

              <!-- Ungrouped scenarios -->
              <button
                v-for="s in ungrouped"
                :key="s.id"
                class="debug-scenario"
                :class="scenario.activeId === s.id ? 'debug-scenario--active' : ''"
                @click="scenario.activate(s.id)"
              >
                <div class="debug-scenario__check">
                  <Check v-if="scenario.activeId === s.id" :size="10" />
                </div>
                <div class="debug-scenario__text">
                  <span class="debug-scenario__label">{{ s.label }}</span>
                  <span v-if="s.description" class="debug-scenario__desc">{{ s.description }}</span>
                </div>
              </button>

              <!-- Folders -->
              <div v-for="[folder, folderItems] in folders" :key="folder" class="debug-folder">
                <button
                  class="debug-folder__header"
                  :class="openFolders.has(group + ':' + folder) ? 'debug-folder__header--open' : ''"
                  @click="toggleFolder(group + ':' + folder)"
                >
                  <ChevronRight :size="11" class="debug-folder__chevron" />
                  <Folder :size="12" class="debug-folder__icon" />
                  <span class="debug-folder__name">{{ folder }}</span>
                  <span class="debug-folder__count">{{ folderItems.length }}</span>
                </button>
                <div v-if="openFolders.has(group + ':' + folder)" class="debug-folder__body">
                  <button
                    v-for="s in folderItems"
                    :key="s.id"
                    class="debug-scenario debug-scenario--indented"
                    :class="scenario.activeId === s.id ? 'debug-scenario--active' : ''"
                    @click="scenario.activate(s.id)"
                  >
                    <div class="debug-scenario__check">
                      <Check v-if="scenario.activeId === s.id" :size="10" />
                    </div>
                    <div class="debug-scenario__text">
                      <span class="debug-scenario__label">{{ s.label }}</span>
                      <span v-if="s.description" class="debug-scenario__desc">{{ s.description }}</span>
                    </div>
                  </button>
                </div>
              </div>

            </template>
          </div>
        </template>

        <div v-else class="debug-empty">
          <p>Aucun scénario défini.</p>
          <p>Ajoute-en dans <code>src/scenarios/</code></p>
        </div>
      </div>

      <!-- Footer -->
      <div class="debug-panel__footer">
        <span class="debug-footer__active">
          <template v-if="scenario.active">
            <span class="debug-footer__dot" />
            {{ scenario.active.label }}
          </template>
          <template v-else>
            Aucun scénario actif
          </template>
        </span>
        <button
          v-if="scenario.activeId"
          class="debug-footer__reset"
          @click="scenario.reset()"
        >
          Reset
        </button>
      </div>

    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Settings, Bug, X, Check, ChevronRight, Folder } from 'lucide-vue-next'
import { useScenarioStore } from '~/stores/scenario'
import type { Scenario } from '~/types/scenario'

const scenario = useScenarioStore()

const openFolders = ref(new Set<string>())

function toggleFolder(key: string) {
  if (openFolders.value.has(key)) openFolders.value.delete(key)
  else openFolders.value.add(key)
}

function splitGroup(items: Scenario[]) {
  const visible = items.filter(s => !s.scope || scenario.activeScopes.includes(s.scope))
  const ungrouped: Scenario[] = []
  const folders = new Map<string, Scenario[]>()
  for (const s of visible) {
    if (s.folder) {
      if (!folders.has(s.folder)) folders.set(s.folder, [])
      folders.get(s.folder)!.push(s)
    } else {
      ungrouped.push(s)
    }
  }
  return { ungrouped, folders }
}
</script>

<style scoped>
/* ── Trigger ── */
.debug-trigger {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  background: #18181b;
  color: #a1a1aa;
  border: 1px solid #3f3f46;
  border-radius: 999px;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  user-select: none;
}
.debug-trigger:hover {
  background: #27272a;
  color: #e4e4e7;
  border-color: #52525b;
}
.debug-trigger--active {
  color: #4ade80;
  border-color: #166534;
}
.debug-trigger__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
}

/* ── Panel ── */
.debug-panel {
  position: fixed;
  bottom: 52px;
  right: 16px;
  z-index: 9998;
  width: 300px;
  background: #18181b;
  border: 1px solid #3f3f46;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 12px;
}

/* ── Header ── */
.debug-panel__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #3f3f46;
  background: #09090b;
}
.debug-panel__title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e4e4e7;
  font-weight: 600;
  flex: 1;
}
.debug-panel__shortcuts {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #52525b;
  font-size: 10px;
}
kbd {
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 4px;
  padding: 1px 4px;
  color: #a1a1aa;
  font-family: inherit;
  font-size: 10px;
}
.debug-panel__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #52525b;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}
.debug-panel__close:hover {
  background: #27272a;
  color: #e4e4e7;
}

/* ── Body ── */
.debug-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  max-height: calc(60vh - 90px);
  scrollbar-width: thin;
  scrollbar-color: #3f3f46 transparent;
}

/* ── Group ── */
.debug-group { margin-bottom: 4px; }
.debug-group__label {
  padding: 6px 6px 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #52525b;
}

/* ── Scenario card ── */
.debug-scenario {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 7px 8px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s, border-color 0.1s;
}
.debug-scenario:hover {
  background: #27272a;
  border-color: #3f3f46;
}
.debug-scenario--active {
  background: #052e16;
  border-color: #166534;
}
.debug-scenario__check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #3f3f46;
  background: #27272a;
  color: #4ade80;
  flex-shrink: 0;
  margin-top: 1px;
  transition: background 0.1s, border-color 0.1s;
}
.debug-scenario--active .debug-scenario__check {
  background: #166534;
  border-color: #4ade80;
}
.debug-scenario__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.debug-scenario__label {
  color: #d4d4d8;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
}
.debug-scenario--active .debug-scenario__label { color: #86efac; }
.debug-scenario__desc {
  color: #71717a;
  font-size: 11px;
  line-height: 1.4;
}

/* ── Folder ── */
.debug-folder { margin-bottom: 2px; }

.debug-folder__header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 8px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s, border-color 0.1s;
  color: #71717a;
}
.debug-folder__header:hover {
  background: #27272a;
  border-color: #3f3f46;
  color: #a1a1aa;
}
.debug-folder__header--open { color: #a1a1aa; }
.debug-folder__chevron {
  flex-shrink: 0;
  transition: transform 0.15s ease;
}
.debug-folder__header--open .debug-folder__chevron { transform: rotate(90deg); }
.debug-folder__icon { flex-shrink: 0; }
.debug-folder__name {
  flex: 1;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.debug-folder__count {
  font-size: 10px;
  padding: 1px 5px;
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 999px;
  color: #52525b;
  flex-shrink: 0;
}
.debug-folder__body {
  margin-left: 8px;
  border-left: 1px solid #3f3f46;
  padding-left: 4px;
  margin-bottom: 2px;
}
.debug-scenario--indented { }

/* ── Empty state ── */
.debug-empty {
  padding: 20px 8px;
  text-align: center;
  color: #52525b;
  line-height: 1.6;
}
.debug-empty code {
  color: #a1a1aa;
  background: #27272a;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11px;
}

/* ── Footer ── */
.debug-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid #3f3f46;
  background: #09090b;
}
.debug-footer__active {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #71717a;
  font-size: 11px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.debug-footer__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
}
.debug-footer__reset {
  padding: 3px 8px;
  background: transparent;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  color: #f87171;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.1s, border-color 0.1s;
}
.debug-footer__reset:hover {
  background: #450a0a;
  border-color: #b91c1c;
}

/* ── Transition ── */
.debug-panel-enter-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.debug-panel-leave-active { transition: opacity 0.08s ease, transform 0.08s ease; }
.debug-panel-enter-from, .debug-panel-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
