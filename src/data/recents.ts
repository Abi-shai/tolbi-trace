// Éléments « Récents » de la sidebar Accueil (décoratif, aligné sur le scénario démo).
export interface RecentItem {
  id:     string
  module: string
  name:   string
  href:   string
}

export const recentsMock: RecentItem[] = [
  { id: 'r-crop',    module: 'Crop mapping', name: 'Maïs 2025',              href: '/source/workflows' },
  { id: 'r-collect', module: 'Collect',      name: 'Onboarding producteurs', href: '/dataos/projets' },
]
