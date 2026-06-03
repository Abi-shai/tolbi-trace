export default defineNuxtPlugin(() => {
  const store = useScenarioStore()
  const router = useRouter()

  const check = () => {
    const url = new URL(window.location.href)
    if (url.searchParams.has('__ux')) store.enable()
  }

  check()
  router.afterEach(check)

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.shiftKey && e.key === 'D' && store.enabled) store.togglePanel()
  })
})
