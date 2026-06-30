export default defineNuxtPlugin(() => {
  const store = useScenarioStore()

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.shiftKey && e.key === 'D' && store.enabled) store.togglePanel()
  })
})
