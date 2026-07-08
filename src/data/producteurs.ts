import type { Producteur, ProducteursListeStats } from '~/types/producteur'

export const producteurStats: ProducteursListeStats = {
  count:     2394,
  parcelles: 2394,
  surfaceHa: 534,
}

// Producteurs mis de côté à l'import (bucket « à corriger » — Phase 3). Cohabitent
// dans la liste avec la base, filtrables via le segment. Mélange géo (→ carte-atelier)
// et attribut (→ correction inline).
export const producteursACorriger: Producteur[] = [
  { id: 'ac-1', prenom: 'Awa',     nom: 'Diop',    codeParcelles: '—',        ina: '—',        telephone: '—',        cooperative: 'Kaolack Maïs', statut: 'a-corriger', correctionKind: 'geo',      origine: 'Géo · sommet',       motif: { quoi: 'Coordonnée hors du Sénégal.', cons: 'Corrige le point sur la carte.' } },
  { id: 'ac-2', prenom: 'Mamadou', nom: 'Sow',     codeParcelles: '—',        ina: '—',        telephone: '—',        cooperative: 'Kaolack Maïs', statut: 'a-corriger', correctionKind: 'geo',      origine: 'Géo · parcelle',     motif: { quoi: 'Géométrie manquante.', cons: 'Aucune parcelle rattachée à ce producteur.' } },
  { id: 'ac-3', prenom: 'Fatou',   nom: 'Ndiaye',  codeParcelles: 'KLK-0071', ina: '20054140', telephone: '—',        cooperative: 'Kaolack Maïs', statut: 'a-corriger', correctionKind: 'attribut', origine: 'Excel · téléphone',  motif: { quoi: 'Téléphone manquant.', cons: 'Le producteur sera importé sans numéro.' } },
  { id: 'ac-4', prenom: 'Ibrahim', nom: 'Diallo',  codeParcelles: '—',        ina: '—',        telephone: '—',        cooperative: 'Kaolack Maïs', statut: 'a-corriger', correctionKind: 'geo',      origine: 'Géo · sommet',       motif: { quoi: 'Sommet aberrant.', cons: 'Un point du tracé sort de la parcelle.' } },
  { id: 'ac-5', prenom: 'Jean',    nom: 'Kouassi', codeParcelles: '—',        ina: '—',        telephone: '—',        cooperative: 'Kaolack Maïs', statut: 'a-corriger', correctionKind: 'geo',      origine: 'Géo · parcelle',     motif: { quoi: 'Contour non refermé.', cons: 'La parcelle ne peut pas être calculée.' } },
  { id: 'ac-6', prenom: 'Aminata', nom: 'Ba',      codeParcelles: '—',        ina: '—',        telephone: '—',        cooperative: 'Kaolack Maïs', statut: 'a-corriger', correctionKind: 'geo',      origine: 'Géo · rattachement', motif: { quoi: 'Tracé non rattaché.', cons: 'Ce relevé n’est associé à aucun producteur.' } },
]

export const producteursMock: Producteur[] = [
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
