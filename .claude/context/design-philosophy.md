# Design Philosophy — Tolbi Trace

> Comment on conçoit l'interface — motion, densité, patterns d'interaction, états de feedback.
> Complémentaire à `design-system.md` (composants) et `product.md` (fonctionnel).
> Ne pas recréer ce fichier à partir de `product.md` — il documente le *comment*, pas le *quoi*.

---

## Processus de design — code-first

**Le flux par défaut :** objectif ou feature → code directement.

Avant de commencer, l'agent doit toujours identifier :
1. **Sur quel module Tolbi OS on travaille** (ID, Source, Trace, Yield…)
2. **Quels profils utilisateurs verront ces écrans** (Responsable ops ? Agent terrain ? Admin ?)

Ces deux points conditionnent chaque décision de densité, de copy, et d'interaction.

**Sources de vérité pour construire :**
1. Les fichiers `context/` (product, design-philosophy, design-system, voice-and-tone)
2. Le DS (`@abi-shai/tolbi-design-system`) — composants et tokens
3. Les composants déjà construits dans le repo — la base visuelle existante

**Le rôle de Figma MCP :** Figma peut être utilisé en cours de route pour préciser ou valider un choix UI/UX spécifique — pas comme point de départ. Si le Figma MCP est invoqué, c'est pour raffiner quelque chose qui existe déjà en code, pas pour concevoir depuis zéro.

Les maquettes Figma existantes documentent des flows déjà construits — elles ne précèdent pas les nouvelles features.

---

## Identité visuelle

**Interface de travail, pas de vitrine.** Dense, lisible, fonctionnelle.
Pas de glassmorphism. Pas de gradients décoratifs. Pas d'illustrations génériques.

**Couleurs fonctionnelles uniquement.** La couleur encode du sens — statut, type d'entité, niveau d'alerte. Elle ne décore pas.

| Usage | Couleur |
|---|---|
| Primaire Tolbi | `#1D9E75` (vert agriculture) |
| Complété / succès | vert |
| En cours | orange |
| Anomalie / erreur | rouge |
| En attente | gris |
| Nœuds graphe | couleur par type d'entité (sac, étape, agent, producteur) |

---

## Motion & Animation

**Référence :** Linear, Notion — sobre, fonctionnel, rapide.

**Principe :** Le mouvement porte du sens ou il n'existe pas. Aucune animation d'ego.

### Librairie

- **CSS transitions Tailwind + `<Transition>` Vue** — cas standards (90%)
- **`@vueuse/motion`** — cas complexes uniquement : spring physics, animations programmatiques, séquences. Construit sur Motion One (WAAPI), zéro overhead inutile.
- Pas de GSAP — trop lourd pour une interface de travail.

### Timings de référence

| Type | Durée | Easing |
|---|---|---|
| Feedback immédiat (hover, focus) | 100–150ms | `ease-out` |
| Transition de vue / route | 200ms | `ease-in-out` |
| Apparition modale / drawer | 200–250ms | `ease-out` |
| Toast de confirmation | entrée 150ms · sortie 200ms | `ease-out` |
| Skeleton → contenu | 200ms | `ease-in-out` |

### Ce qui s'anime (justifié)

- Transition entre pages/routes
- Apparition et fermeture de modales et drawers
- Changement de statut d'un sac dans le graphe (couleur + taille)
- Progression d'un import (barre de traitement)
- Toast de confirmation après une action

### Ce qui ne s'anime pas

- Apparition des items dans les listes et tableaux (pas de stagger d'entrée)
- Éléments statiques du layout (topbar, sidebar)
- Chargement initial de la page
- Tout effet purement décoratif

---

## Densité & Layout

**Référence :** Linear — compact sans être étouffant, chaque pixel a une raison d'être.

- Interface dense : les Responsables ops travaillent sur de vraies données, pas des maquettes aérées.
- Hiérarchie : **état → tendance → détail**. Jamais de tableaux bruts en premier écran.
- La base visuelle existante (DS + composants déjà construits) est la référence — on ne repart pas de zéro.
- Les Figma flows existants font autorité sur les choix visuels spécifiques aux modules.

---

## Contexte terrain africain

Ces contraintes s'appliquent à la **surface mobile uniquement**. L'interface web (Responsable ops au bureau) n'est pas concernée.

| Contrainte | Impact design |
|---|---|
| Connectivité intermittente | Offline-first obligatoire — jamais d'état bloquant réseau |
| Devices d'entrée de gamme | Performance critique — pas d'animations lourdes, bundle minimal |
| Langues locales (wolof, pulaar…) | Messages réécrits avec locuteurs natifs — pas de traductions littérales du français |

---

## Patterns d'interaction

### Modale
Utiliser pour : confirmations destructives, actions à effet immédiat et irréversible.
Ne pas utiliser pour : formulaires longs, navigation secondaire, états informatifs.

### Panneau latéral (drawer)
Utiliser pour : configuration contextuelle (ex: config d'une étape workflow), détail d'un élément sans quitter la liste.
Ne pas utiliser pour : actions destructives, formulaires multi-étapes.

### Page dédiée
Utiliser pour : entités autonomes avec leur propre contexte (ex: détail d'un sac, détail d'un workflow).
Ne pas utiliser pour : micro-interactions ou états temporaires.

*Règle de décision : si l'utilisateur a besoin de voir le contexte d'origine en même temps → panneau. S'il peut couper le contexte → page.*

---

## États de feedback

### État vide (empty state)
- Toujours expliquer pourquoi c'est vide et quelle action permet de changer ça.
- Pas d'illustrations génériques. Message orienté action.

### État de chargement
- Indicateur de progression uniquement si l'attente dépasse ~800ms.
- Skeleton screens pour les listes et tableaux (pas de spinner global).

### État d'erreur
- Clair sur le problème, orienté solution. Jamais "Une erreur s'est produite."
- L'erreur ne bloque pas le reste de l'interface (principe P3 — voir product.md).

### État de succès
- Confirmation bref et disparaissant (toast). Pas de modale de succès.
- Exception : finalisation d'un import → confirmation plus visible car point de non-retour.

---

## Typographie

| Rôle | Police | Poids disponibles |
|---|---|---|
| Interface (body, labels, titres) | **Poppins** | 400, 500, 600, 700 |
| Mono (code, identifiants) | **Inter** | 400 |

- Hiérarchie via poids (500 → 600 → 700) et taille, pas via couleur.
- Pas de typographie éditoriale ou décorative. Pas d'italique dans l'interface.
- Les tokens `--ds-typography-*` du DS sont la source de vérité — ne jamais hardcoder une font-family.
