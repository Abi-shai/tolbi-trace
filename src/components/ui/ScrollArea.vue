<template>
  <div
    ref="root"
    class="relative overflow-hidden"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <!-- Viewport -->
    <div
      ref="viewport"
      class="w-full h-full overflow-auto"
      style="scrollbar-width: none;"
      @scroll="onScroll"
    >
      <slot />
    </div>

    <!-- Thumb vertical -->
    <Transition name="sb-y">
      <div
        v-show="thumbVisible && hasV"
        class="absolute top-0 bottom-0 right-0 pointer-events-none"
        style="width: 10px; padding: 4px 3px;"
      >
        <div
          class="w-full rounded-full transition-colors duration-100"
          :class="scrolling ? 'bg-black/30' : 'bg-black/[0.16]'"
          :style="{ height: vH + 'px', marginTop: vY + 'px' }"
        />
      </div>
    </Transition>

    <!-- Thumb horizontal -->
    <Transition name="sb-x">
      <div
        v-show="thumbVisible && hasH"
        class="absolute left-0 right-0 bottom-0 pointer-events-none"
        style="height: 10px; padding: 3px 4px;"
      >
        <div
          class="h-full rounded-full transition-colors duration-100"
          :class="scrolling ? 'bg-black/30' : 'bg-black/[0.16]'"
          :style="{ width: hW + 'px', marginLeft: hX + 'px' }"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const root     = ref<HTMLElement | null>(null)
const viewport = ref<HTMLElement | null>(null)

const thumbVisible = ref(false)
const scrolling    = ref(false)

// thumb geometry
const vH = ref(0)
const vY = ref(0)
const hW = ref(0)
const hX = ref(0)
const hasV = ref(false)
const hasH = ref(false)

let hideTimer:   ReturnType<typeof setTimeout> | null = null
let scrollTimer: ReturnType<typeof setTimeout> | null = null

function recalc() {
  const el = viewport.value
  if (!el) return

  hasV.value = el.scrollHeight > el.clientHeight + 1
  hasH.value = el.scrollWidth  > el.clientWidth  + 1

  // vertical
  if (hasV.value) {
    const ratio = el.clientHeight / el.scrollHeight
    const h     = Math.max(Math.round(ratio * (el.clientHeight - 8)), 40)
    const track = el.clientHeight - 8 - h
    vH.value    = h
    vY.value    = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * track)
  }

  // horizontal
  if (hasH.value) {
    const ratio = el.clientWidth / el.scrollWidth
    const w     = Math.max(Math.round(ratio * (el.clientWidth - 8)), 40)
    const track = el.clientWidth - 8 - w
    hW.value    = w
    hX.value    = Math.round((el.scrollLeft / (el.scrollWidth - el.clientWidth)) * track)
  }
}

function onScroll() {
  recalc()
  scrolling.value = true
  show()
  scheduleHide(1400)

  if (scrollTimer) clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => { scrolling.value = false }, 150)
}

function onEnter() { recalc(); show() }
function onLeave() { scheduleHide(800) }

function show() {
  thumbVisible.value = true
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
}

function scheduleHide(delay: number) {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { thumbVisible.value = false }, delay)
}

let ro: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  if (viewport.value) {
    ro = new ResizeObserver(() => recalc())
    ro.observe(viewport.value)
    // observer les enfants directs aussi
    viewport.value.childNodes.forEach(n => {
      if (n instanceof Element) ro!.observe(n)
    })
  }
})

onUnmounted(() => {
  ro?.disconnect()
  if (hideTimer)   clearTimeout(hideTimer)
  if (scrollTimer) clearTimeout(scrollTimer)
})
</script>

<style scoped>
.overflow-auto::-webkit-scrollbar { display: none; }

/* Vertical : slide depuis la droite */
.sb-y-enter-active { transition: opacity var(--ds-motion-duration-moderate) ease, transform var(--ds-motion-duration-moderate) ease; }
.sb-y-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.sb-y-enter-from,
.sb-y-leave-to     { opacity: 0; transform: translateX(4px); }

/* Horizontal : slide depuis le bas */
.sb-x-enter-active { transition: opacity var(--ds-motion-duration-moderate) ease, transform var(--ds-motion-duration-moderate) ease; }
.sb-x-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.sb-x-enter-from,
.sb-x-leave-to     { opacity: 0; transform: translateY(4px); }
</style>
