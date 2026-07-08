import type { User, NotificationPreferences } from '~/types/user'

// Le User connecté (mock). Nom/coordonnées repris de la base Figma « Compte ».
export const currentUser: User = {
  id:        'user-jbs',
  prenom:    'Jean Baptiste',
  nom:       'Saar',
  email:     'jeanbaptiste@gmail.com',
  telephone: '+221 77 397 13 70',
  langue:    'fr',
}

export const defaultNotificationPreferences: NotificationPreferences = {
  consoCredits:  true,
  quantiteDelai: true,
  membres:       true,
  actualites:    false,
  canalEmail:    true,
  canalPush:     false,
  canalInApp:    true,
}
