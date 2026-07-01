import { useToastStore } from '~/stores/toast'

// TOQ-560 — Partager le lien d'un formulaire (copie + WhatsApp) pour que l'agent
// terrain y accède immédiatement. Réutilisé à la création et dans la liste.
export function useFormulaireShare() {
  const toast = useToastStore()

  // Lien public de collecte, ouvert par l'agent sur mobile.
  function formLink(formId: string) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.tolbi.co'
    return `${origin}/collecte/${formId}`
  }

  async function copyLink(formId: string) {
    try {
      await navigator.clipboard?.writeText(formLink(formId))
      toast.show({ title: 'Lien copié', description: 'Le lien du formulaire est dans ton presse-papiers.' })
    } catch {
      toast.show({ title: 'Copie impossible', description: 'Copie le lien manuellement.' })
    }
  }

  function shareWhatsApp(formId: string, formName?: string) {
    const link = formLink(formId)
    const intro = formName ? `Voici le formulaire de collecte « ${formName} »` : 'Voici le formulaire de collecte'
    const msg = `${intro} : ${link}\nOuvre-le pour démarrer la collecte sur le terrain.`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // Notification de partage : même contenu à l'enregistrement et à la création depuis un template.
  function notifyShare(formId: string, formName?: string, opts?: { title?: string; description?: string }) {
    toast.show({
      title:       opts?.title ?? 'Formulaire enregistré',
      description: opts?.description ?? 'Partage le lien pour que tes agents démarrent la collecte.',
      duration:    10000,
      actions: [
        { label: 'Copier le lien',        onClick: () => copyLink(formId) },
        { label: 'Partager sur WhatsApp', onClick: () => shareWhatsApp(formId, formName) },
      ],
    })
  }

  return { formLink, copyLink, shareWhatsApp, notifyShare }
}
