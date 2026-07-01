<template>
  <span
    ref="trigger"
    class="inline-flex"
    @mouseenter="onEnter"
    @mouseleave="hovered = false"
    @focusin="onEnter"
    @focusout="hovered = false"
  >
    <slot />

    <Teleport to="body">
      <div
        v-if="hovered"
        class="fixed z-[9999] pointer-events-none"
        :style="posStyle"
      >
        <DsTooltip :title="label" :supporting-text="supportingText" :arrow="arrow" />
      </div>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// Wrapper réutilisable : affiche un DsTooltip au survol (ou au focus) de son
// contenu, positionné via Teleport pour ne pas être rogné par un conteneur
// scrollable. Le DS ne fournit que la bulle ; le déclenchement au survol est
// laissé au design (cf. règle « DS muet → design libre »).
const props = withDefaults(defineProps<{
  label: string
  supportingText?: string
  /** Côté de la bulle où pointe la flèche (vers le déclencheur). */
  arrow?: string
  /** Position de la bulle par rapport au déclencheur. */
  placement?: 'top' | 'bottom' | 'left' | 'right'
}>(), {
  arrow: 'bottom',
  placement: 'top',
})

const trigger = ref<HTMLElement | null>(null)
const hovered = ref(false)
const pos = reactive({ top: 0, left: 0 })

function onEnter() {
  const el = trigger.value
  if (!el) return
  const r = el.getBoundingClientRect()
  switch (props.placement) {
    case 'top':    pos.top = r.top - 8;             pos.left = r.left + r.width / 2; break
    case 'bottom': pos.top = r.bottom + 8;          pos.left = r.left + r.width / 2; break
    case 'left':   pos.top = r.top + r.height / 2;  pos.left = r.left - 8;           break
    case 'right':  pos.top = r.top + r.height / 2;  pos.left = r.right + 8;          break
  }
  hovered.value = true
}

const posStyle = computed(() => {
  const transform = {
    top:    'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0)',
    left:   'translate(-100%, -50%)',
    right:  'translate(0, -50%)',
  }[props.placement]
  return { top: `${pos.top}px`, left: `${pos.left}px`, transform }
})
</script>
