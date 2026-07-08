// Catalogue des modules Tolbi OS (cf. .claude/context/product.md).
// Noms de glossaire (TOLBI …). Chaque module référence son icône de marque via
// `moduleIcon` — le nom attendu par le composant DS `DsModuleIcon` (vraies icônes
// couleur), et non un slug DsIcon monochrome.

export interface ModuleDef {
  id:         string
  name:       string   // nom canonique (glossaire)
  short:      string   // libellé court
  moduleIcon: string   // nom module DsModuleIcon : ID/Source/Data/Scan/Yield/Trace/Carbone/Call/Forest
}

export const MODULES: ModuleDef[] = [
  { id: 'id',      name: 'TOLBI ID',      short: 'ID',      moduleIcon: 'ID'      },
  // INA réutilise l'icône de marque du module ID (pas d'icône DsModuleIcon dédiée).
  { id: 'ina',     name: 'TOLBI INA',     short: 'INA',     moduleIcon: 'ID'      },
  { id: 'scan',    name: 'TOLBI Scan',    short: 'Scan',    moduleIcon: 'Scan'    },
  { id: 'dataos',  name: 'TOLBI Data OS', short: 'Data OS', moduleIcon: 'Data'    },
  { id: 'source',  name: 'TOLBI Source',  short: 'Source',  moduleIcon: 'Source'  },
  { id: 'yield',   name: 'TOLBI Yield',   short: 'Yield',   moduleIcon: 'Yield'   },
  { id: 'trace',   name: 'TOLBI Trace',   short: 'Trace',   moduleIcon: 'Trace'   },
  { id: 'carbone', name: 'TOLBI Carbone', short: 'Carbone', moduleIcon: 'Carbone' },
  { id: 'forest',  name: 'TOLBI Forest+', short: 'Forest+', moduleIcon: 'Forest'  },
  { id: 'call',    name: 'TOLBI Call',    short: 'Call',    moduleIcon: 'Call'    },
]

export const MODULES_BY_ID: Record<string, ModuleDef> = Object.fromEntries(
  MODULES.map((m) => [m.id, m]),
)

export function moduleDef(id: string): ModuleDef | undefined {
  return MODULES_BY_ID[id]
}
