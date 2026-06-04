import type { Fournisseur, FournisseursListeStats } from '~/types/fournisseur'

export const fournisseursStats: FournisseursListeStats = {
  count:     2400,
  parcelles: 2400,
  surfaceHa: 537,
}

export const fournisseursMock: Fournisseur[] = [
  { id: '1',  prenom: 'Ousmane',      nom: 'Diop',     codeParcelles: 'KLK-0042', ina: '20054112', telephone: '773971370', cooperative: 'Kaolack Maïs' },
  { id: '2',  prenom: 'Baye',         nom: 'Sow',      codeParcelles: 'KLK-0043', ina: '20054113', telephone: '774561230', cooperative: 'Kaolack Maïs' },
  { id: '3',  prenom: 'Ameth',        nom: 'Thiam',    codeParcelles: 'KLK-0044', ina: '20054114', telephone: '771234560', cooperative: 'Kaolack Maïs' },
  { id: '4',  prenom: 'Pape',         nom: 'Ibrahima', codeParcelles: 'KLK-0045', ina: '20054115', telephone: '775432100', cooperative: 'Kaolack Maïs' },
  { id: '5',  prenom: 'Samba',        nom: 'Diop',     codeParcelles: 'KLK-0046', ina: '20054116', telephone: '773876540', cooperative: 'Kaolack Maïs' },
  { id: '6',  prenom: 'Fatou',        nom: 'Ndiaye',   codeParcelles: 'KLK-0047', ina: '20054117', telephone: '776543210', cooperative: 'Kaolack Maïs' },
  { id: '7',  prenom: 'Mariama',      nom: 'Bâ',       codeParcelles: 'KLK-0048', ina: '20054118', telephone: '774321090', cooperative: 'Kaolack Maïs' },
  { id: '8',  prenom: 'Ibrahima',     nom: 'Cissé',    codeParcelles: 'KLK-0049', ina: '20054119', telephone: '773219870', cooperative: 'Kaolack Maïs' },
  { id: '9',  prenom: 'Modou',        nom: 'Fall',     codeParcelles: 'KLK-0050', ina: '20054120', telephone: '771098760', cooperative: 'Kaolack Maïs' },
  { id: '10', prenom: 'Aissatou',     nom: 'Diallo',   codeParcelles: 'KLK-0051', ina: '20054121', telephone: '778765430', cooperative: 'Kaolack Maïs' },
]
