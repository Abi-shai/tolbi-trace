// Le User = la personne connectée (compte personnel). Distinct de l'Organisation :
// un même User peut être membre de plusieurs organisations (cf. CONTEXT.md + ADR-0009).
// La zone « Personnel » de Paramètres reflète ce User, identique dans toutes ses orgs.

export type Langue = 'fr' | 'en'

export interface User {
  id:         string
  prenom:     string
  nom:        string
  email:      string
  telephone:  string
  avatarSrc?: string
  langue:     Langue
}

// Préférences de notification — personnelles (zone Personnel > Notifications).
// Le flux/historique des alertes vit dans la cloche du topbar, pas ici.
export interface NotificationPreferences {
  // Types d'alertes
  consoCredits:  boolean
  quantiteDelai: boolean
  membres:       boolean
  actualites:    boolean
  // Canaux
  canalEmail: boolean
  canalPush:  boolean
  canalInApp: boolean
}

export const LANGUES: { value: Langue; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
]
