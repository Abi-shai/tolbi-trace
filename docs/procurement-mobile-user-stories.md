# Procurement — User Stories Mobile (Agent terrain)

Épic de référence : [TOQ-500 — Parcours end-to-end de Procurement](https://tolbico-team-y306gi10.atlassian.net/browse/TOQ-500)
Projet Jira : TOLBI OS Q2 2026 (TOQ)

> Ces stories ne sont pas encore formalisées dans Jira. Elles ont été dérivées à partir des critères
> d'acceptation des stories web existantes (TOQ-498 à TOQ-507). Elles couvrent la surface **mobile**
> du parcours — l'exécution par l'Agent terrain — que les stories web supposent implicitement.
>
> Règle fondamentale du produit : **le web configure et observe, le mobile exécute.**
> Aucune modification de workflow ne doit être possible depuis le mobile.

---

## Lot 1 — Orientation & accès

### M-01 · Voir mes étapes assignées

**En tant qu'** Agent,
**Je veux** voir la liste des étapes du processus qui me sont assignées avec leur statut actuel,
**Afin de** savoir ce que j'ai à faire, dans quel ordre, et ce qui est déjà traité.

**Critères d'acceptation :**
- L'écran d'accueil affiche uniquement les étapes assignées à l'agent connecté (pas l'ensemble du workflow).
- Chaque étape affiche : son nom, le processus parent, son statut (En attente / En cours / Terminée / Bloquée).
- Les étapes sont ordonnées par priorité ou par ordre de séquence dans le workflow.
- Les étapes déjà terminées restent visibles mais visuellement distinctes.

**Découle de :** TOQ-501 (l'assignation par étape est configurée côté web — l'agent doit la consommer)

---

### M-02 · Être notifié quand mon intervention est requise

**En tant qu'** Agent,
**Je veux** recevoir une notification push quand une étape m'est assignée ou qu'une action m'est demandée,
**Afin de** réagir immédiatement sans surveiller l'application en permanence.

**Critères d'acceptation :**
- Une notification est envoyée dès qu'une étape est assignée à l'agent.
- Une notification est envoyée si une étape précédente est validée et que l'étape de l'agent devient active.
- La notification inclut : le nom du processus, le nom de l'étape, et un lien direct vers l'action requise.
- L'agent peut désactiver les notifications dans ses préférences.

**Découle de :** TOQ-501 (assignation) + TOQ-503 (statuts en temps réel côté web)

---

## Lot 2 — Exécution d'une étape

### M-03 · Scanner un QR code pour identifier un item

**En tant qu'** Agent,
**Je veux** scanner le QR code d'un item pour l'associer à l'étape que j'exécute,
**Afin de** créer un lien traçable et vérifiable entre l'entité physique et l'événement enregistré.

**Critères d'acceptation :**
- L'interface active la caméra du téléphone et détecte automatiquement le QR code.
- Si le QR code est reconnu, l'item s'affiche avec ses informations (identifiant, données existantes).
- Si le QR code n'est pas reconnu, un message d'erreur clair s'affiche avec l'option de signaler une anomalie (→ M-07).
- Le scan est immédiatement enregistré avec un horodatage et l'identité de l'agent.

**Découle de :** TOQ-498 (type de question QR code unique)

---

### M-04 · Scanner en mode batch (rafale)

**En tant qu'** Agent,
**Je veux** scanner plusieurs QR codes à la suite sans avoir à confirmer chaque scan individuellement,
**Afin de** traiter de grands volumes rapidement lors d'étapes de réception, chargement ou inventaire.

**Critères d'acceptation :**
- Un mode "Scan en rafale" peut être activé depuis l'interface de l'étape.
- Chaque QR code scanné s'ajoute à une liste en temps réel avec un retour visuel (son + vibration optionnel).
- L'agent peut retirer un item de la liste s'il a été scanné par erreur.
- Une fois le batch terminé, l'agent valide l'ensemble en une seule action.
- Le nombre total d'items scannés est affiché en permanence pendant la session.

**Découle de :** TOQ-498 (batch scanning mentionné explicitement dans les critères)

---

### M-05 · Remplir le formulaire d'une étape

**En tant qu'** Agent,
**Je veux** remplir les champs du formulaire configuré pour mon étape (texte, nombre, date, sélection, etc.),
**Afin d'** enregistrer les données opérationnelles nécessaires à la validation de l'étape.

**Critères d'acceptation :**
- Le formulaire affiché correspond exactement à la configuration définie par le Responsable des Opérations (TOQ-501).
- Tous les types de champs supportés sont disponibles : texte libre, nombre, date, sélection simple/multiple, QR code.
- Les champs obligatoires sont clairement signalés — la soumission est bloquée si un champ requis est vide.
- Une confirmation visuelle (succès) s'affiche après enregistrement.
- En cas d'erreur de format, le message indique précisément quel champ est incorrect et pourquoi.

**Découle de :** TOQ-501 (type validation = formulaire) + TOQ-498 (types de questions)
**Note :** TOQ-504 tel que rédigé dans Jira couvre cette story + M-06 — à splitter.

---

### M-06 · Valider une étape via un code

**En tant qu'** Agent,
**Je veux** saisir un code de validation pour clôturer une étape,
**Afin de** confirmer l'exécution de manière sécurisée sans passer par un formulaire.

**Critères d'acceptation :**
- Si l'étape est configurée en mode "Code de validation", un champ de saisie unique s'affiche.
- Le code est vérifié côté serveur avant d'accepter la validation.
- En cas de code incorrect, un message d'erreur est affiché (sans révéler le code attendu).
- Après validation réussie, l'étape passe au statut "Terminée" et le résultat est visible côté web (TOQ-503).

**Découle de :** TOQ-501 (type validation = code)
**Note :** À splitter de TOQ-504.

---

## Lot 3 — Cas particuliers

### M-07 · Signaler une anomalie sans bloquer le flux

**En tant qu'** Agent,
**Je veux** pouvoir signaler un problème sur un item (QR illisible, donnée manquante, non-conformité)
tout en continuant à traiter les autres items,
**Afin de** ne jamais bloquer les opérations à cause d'un cas isolé.

**Critères d'acceptation :**
- Une option "Signaler une anomalie" est accessible depuis le scan ou le formulaire.
- L'agent peut choisir le type d'anomalie (QR illisible / Données incorrectes / Problème qualité / Autre) et ajouter un commentaire libre.
- L'item est marqué "Anomalie signalée" et reste visible dans le flux — il ne bloque pas la progression des autres items.
- L'anomalie apparaît côté web avec le statut "Bloqué" sur le diagramme (TOQ-503) pour que le Responsable puisse intervenir.
- L'agent reçoit une confirmation que l'anomalie a bien été enregistrée.

**Découle de :** TOQ-503 (statut "Bloqué" existe côté web — il faut un déclencheur mobile) + principe produit Tolbi (1 QR sur 40 ne bloque pas les 39)

---

### M-08 · Travailler hors ligne et synchroniser au retour réseau

**En tant qu'** Agent,
**Je veux** pouvoir exécuter mes étapes, scanner des items et remplir des formulaires sans connexion internet,
**Afin de** ne jamais être bloqué sur le terrain dans des zones à faible couverture réseau.

**Critères d'acceptation :**
- L'application fonctionne en mode dégradé hors ligne : accès aux étapes assignées, scan, saisie de formulaires.
- Les données saisies hors ligne sont stockées localement avec horodatage.
- Dès que la connexion revient, la synchronisation se déclenche automatiquement et silencieusement.
- En cas de conflit lors de la sync (ex : étape déjà validée par quelqu'un d'autre), l'agent est notifié avec une option de résolution.
- Un indicateur visuel signale clairement quand l'app est en mode hors ligne.

**Découle de :** Principe fondamental Tolbi OS — "Le réseau est une exception, pas un prérequis"

---

## Lot 4 — Consultation (lecture seule)

### M-09 · Consulter l'historique de mes validations

**En tant qu'** Agent,
**Je veux** voir la liste de mes actions passées (items scannés, formulaires soumis, codes saisis) avec leur statut,
**Afin de** vérifier mon historique et répondre en cas de litige ou de question du Responsable.

**Critères d'acceptation :**
- Un écran "Historique" liste toutes les validations effectuées par l'agent, triées par date décroissante.
- Chaque entrée affiche : nom de l'étape, processus, date/heure, statut (Validé / Anomalie signalée).
- L'agent peut filtrer par processus ou par plage de dates.
- Les données sont en lecture seule — aucune modification possible a posteriori.

**Découle de :** TOQ-506 (le Responsable filtre les événements côté web — ces événements sont produits par l'agent mobile)

---

### M-10 · Voir l'avancement global du processus (lecture seule)

**En tant qu'** Agent,
**Je veux** consulter l'état d'avancement du flux en cours pour comprendre où se situe mon étape dans la chaîne,
**Afin d'** avoir le contexte global sans pouvoir intervenir sur la configuration du workflow.

**Critères d'acceptation :**
- L'agent peut accéder à une vue simplifiée du diagramme de processus en lecture seule.
- Son étape est mise en évidence visuellement dans la séquence.
- Les statuts des autres étapes sont visibles (En attente / En cours / Terminée / Bloquée) mais non modifiables.
- Aucune action d'édition ou de suppression n'est accessible depuis cette vue.

**Découle de :** TOQ-503 (vue diagramme côté web — version read-only simplifiée pour l'agent mobile)

---

## Couverture croisée — Stories web → Stories mobiles

| Story Jira (web) | Stories mobiles couvertes |
|---|---|
| [TOQ-498](https://tolbico-team-y306gi10.atlassian.net/browse/TOQ-498) — Concevoir le workflow | M-03, M-04, M-05 |
| [TOQ-501](https://tolbico-team-y306gi10.atlassian.net/browse/TOQ-501) — Configurer validation + assignation | M-01, M-05, M-06 |
| [TOQ-502](https://tolbico-team-y306gi10.atlassian.net/browse/TOQ-502) — Modifier / supprimer | *(pas de pendant mobile — la modification reste web only)* |
| [TOQ-503](https://tolbico-team-y306gi10.atlassian.net/browse/TOQ-503) — Visualiser le diagramme | M-02, M-07, M-10 |
| [TOQ-504](https://tolbico-team-y306gi10.atlassian.net/browse/TOQ-504) — Enregistrer données *(à splitter)* | M-05 + M-06 |
| [TOQ-505](https://tolbico-team-y306gi10.atlassian.net/browse/TOQ-505) — Résumé global | *(tableau de bord Resp. uniquement — pas de pendant mobile direct)* |
| [TOQ-506](https://tolbico-team-y306gi10.atlassian.net/browse/TOQ-506) — Filtrer événements | M-09 |
| [TOQ-507](https://tolbico-team-y306gi10.atlassian.net/browse/TOQ-507) — Télécharger le diagramme | *(export web uniquement)* |
| *(pas de story web)* | M-08 (offline — contrainte d'infrastructure mobile) |

---

## Recommandation backlog

1. **Splitter TOQ-504** en deux tickets distincts : un pour M-05 (formulaire) et un pour M-06 (code).
2. **Créer M-01 à M-10** dans Jira sous l'épic TOQ-500 avec le label `Mobile`.
3. **Prioriser M-08 (offline)** dès le début — c'est une contrainte d'architecture qui impacte toute la couche données mobile. À traiter avant M-03/M-04/M-05.
4. **M-07 (anomalie)** est critique pour la confiance terrain — à inclure dans le premier sprint mobile.
