import type { Scenario } from '~/types/scenario'
import { projetsMock } from '~/data/dataos'

export const dataosScenarios: Scenario[] = [
  {
    id:          'dataos-liste-peuplee',
    label:       'Liste peuplée',
    description: 'Quelques projets de démonstration dans la vue Projets',
    group:       'Projets',
    scope:       'dataos',
    state: {
      dataos: { projets: projetsMock },
    },
  },
]
