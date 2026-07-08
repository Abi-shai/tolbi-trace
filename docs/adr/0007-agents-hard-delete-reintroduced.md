# La suppression définitive d'un agent est réintroduite

> ⚠️ **Supersédé par [ADR-0012](./0012-agents-org-level-affectation-replaces-per-module.md)** — la gestion des agents par-module disparaît. Les agents vivent dans un roster unique au niveau de l'organisation (Paramètres) ; les modules ne font plus que de l'[[Affectation]]. Le cycle de vie décrit ici (créer / supprimer / désactiver un agent dans un Formulaire) est retiré. Le souci de provenance ci-dessous (`Événement → Agent`) est repris tel quel au niveau du roster org.

**Supersède [ADR-0005](./0005-agents-soft-deactivate-not-delete.md).**

L'ADR-0005 avait retiré le hard delete des agents au profit de la seule désactivation (`statut: inactif`), pour ne jamais orpheliner les événements `Événement → Agent` du modèle graphe. On revient sur ce choix : le Responsable ops peut désormais **supprimer définitivement** un agent depuis la table des agents d'un Formulaire.

L'action `removeAgent` est réintroduite dans le store `dataos-agents`. Côté UI, elle apparaît comme une action **danger** (icône corbeille rouge au survol) dans la ligne de l'agent, au même titre que les autres actions de la table (copier, partager, régénérer, modifier), et elle est **gardée par une confirmation** (`DeleteAgentModal`) qui énonce l'irréversibilité et la perte de rattachement à l'historique.

## Pourquoi ce revirement

En pratique, un agent est souvent créé par erreur (doublon, mauvaise personne, test) **avant** toute collecte réelle. Le forcer à rester « inactif » à vie encombre la table et n'a pas de valeur de traçabilité — il n'y a aucun événement à préserver. Le product owner accepte le compromis : donner à l'opérateur un vrai retrait, plutôt qu'une désactivation qui ne dit pas ce qu'il veut dire.

## Le compromis assumé (le coût que soulevait l'ADR-0005)

Supprimer un agent qui **a déjà de l'activité** détache ses événements historiques de tout nœud agent : la trace ne peut plus répondre « quel agent a fait ça ? » pour ces événements. On l'accepte, mais :

- La **désactivation** (`deactivateAgent`, toggle *Accès mobile · Actif/Inactif*) reste disponible et demeure le chemin **non destructif** à privilégier dès qu'un historique existe.
- Le code PIN d'un agent supprimé **reste réservé à vie** (jamais réattribué), pour ne pas rouvrir une ambiguïté d'identité tenant-wide.
- La suppression est **confirmée explicitement** — jamais en un clic.

## Considered Options

**Conserver l'ADR-0005 (désactivation seule) — rejeté :** cohérent avec la traçabilité, mais ne répond pas au besoin réel de retirer un agent créé par erreur ; la table se remplit d'inactifs.

**Suppression conditionnelle (delete si aucun événement, sinon désactiver) — non retenu pour l'instant :** le plus principiel, mais ajoute une règle métier (compter les événements par agent) non nécessaire au stade prototype. Reste une évolution possible.

**Suppression définitive gardée par confirmation (retenu) :** simple, lisible, et le coût sur la provenance est explicitement porté à la connaissance de l'opérateur au moment d'agir.
