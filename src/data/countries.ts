// Liste des pays proposés par le sélecteur d'indicatif du champ Téléphone.
// Périmètre : CEDEAO + Cameroun/Gabon (bassin cacao/café) + Maroc + France.
// `groups` = découpage des chiffres du numéro national pour un espacement lisible
// (formatage « maison », sans dépendance). Côte d'Ivoire par défaut.

export interface Country {
  iso:    string    // ISO 3166-1 alpha-2 (clé des drapeaux dans country-flags.ts)
  name:   string    // nom en français
  dial:   string    // indicatif international, avec « + »
  groups: number[]  // tailles des groupes de chiffres du numéro national
}

export const DEFAULT_COUNTRY_ISO = 'CI'

// Côte d'Ivoire en tête (défaut), le reste par ordre alphabétique du nom.
export const COUNTRIES: Country[] = [
  { iso: 'CI', name: "Côte d'Ivoire", dial: '+225', groups: [2, 2, 2, 2, 2] },
  { iso: 'BJ', name: 'Bénin',         dial: '+229', groups: [2, 2, 2, 2, 2] },
  { iso: 'BF', name: 'Burkina Faso',  dial: '+226', groups: [2, 2, 2, 2] },
  { iso: 'CM', name: 'Cameroun',      dial: '+237', groups: [3, 2, 2, 2] },
  { iso: 'FR', name: 'France',        dial: '+33',  groups: [1, 2, 2, 2, 2] },
  { iso: 'GA', name: 'Gabon',         dial: '+241', groups: [2, 2, 2, 2] },
  { iso: 'GM', name: 'Gambie',        dial: '+220', groups: [3, 4] },
  { iso: 'GH', name: 'Ghana',         dial: '+233', groups: [2, 3, 4] },
  { iso: 'GN', name: 'Guinée',        dial: '+224', groups: [3, 2, 2, 2] },
  { iso: 'GW', name: 'Guinée-Bissau', dial: '+245', groups: [3, 3, 3] },
  { iso: 'LR', name: 'Libéria',       dial: '+231', groups: [2, 3, 4] },
  { iso: 'ML', name: 'Mali',          dial: '+223', groups: [2, 2, 2, 2] },
  { iso: 'MA', name: 'Maroc',         dial: '+212', groups: [3, 2, 2, 2] },
  { iso: 'NE', name: 'Niger',         dial: '+227', groups: [2, 2, 2, 2] },
  { iso: 'NG', name: 'Nigeria',       dial: '+234', groups: [3, 3, 4] },
  { iso: 'SN', name: 'Sénégal',       dial: '+221', groups: [2, 3, 2, 2] },
  { iso: 'SL', name: 'Sierra Leone',  dial: '+232', groups: [2, 3, 3] },
  { iso: 'TG', name: 'Togo',          dial: '+228', groups: [2, 2, 2, 2] },
]

export function countryByIso(iso: string): Country {
  return COUNTRIES.find((c) => c.iso === iso) ?? COUNTRIES[0]
}

export function maxNationalLen(c: Country): number {
  return c.groups.reduce((a, b) => a + b, 0)
}

// Découpe une suite de chiffres selon les groupes du pays (espacement lisible).
// Les chiffres au-delà du dernier groupe sont accolés en fin (jamais tronqués ici).
export function groupDigits(digits: string, groups: number[]): string {
  const parts: string[] = []
  let i = 0
  for (const g of groups) {
    if (i >= digits.length) break
    parts.push(digits.slice(i, i + g))
    i += g
  }
  if (i < digits.length) parts.push(digits.slice(i))
  return parts.join(' ')
}
