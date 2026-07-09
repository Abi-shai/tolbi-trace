# Voice & Tone — Tolbi

> Règles de rédaction pour tout texte produit dans l'interface : labels, messages, placeholders, empty states, erreurs, confirmations.
> Source de vérité pour le contenu UX. Complémentaire à `product.md`.

---

## La voix Tolbi en une phrase

> **Tolbi parle comme un partenaire technique africain qui connaît le terrain, qui maîtrise la donnée, et qui sait que chaque décision agricole compte — pour les rendements, pour les revenus, pour la planète.**

---

## Les 4 traits de la voix

1. **Compétent et précis** — on rend les concepts complexes lisibles sans les diluer (IA, MRV, EUDR, séquestration carbone…)
2. **Engagé, sans être moralisateur** — la mission transparaît sans sermon
3. **Concret et orienté décision** — on va au fait, on donne le chiffre, on indique l'action suivante
4. **Ancré africain, ouvert au monde** — voix assumant l'origine sénégalaise/panafricaine, sans se déformer pour ressembler au silicon valley

---

## Ce que Tolbi n'est pas

- Pas une startup tech qui parle de "disruption"
- Pas une ONG qui parle de "bénéficiaires"
- Pas un outil corporate ("solutions de productivité augmentée")
- Pas un assistant condescendant qui explique aux producteurs leur métier
- Pas un produit qui s'excuse en permanence

---

## Règles fondamentales

- **Tutoiement** pour tous les profils métier (coopératives, agroindustriels, agents terrain). Vouvoiement uniquement pour les exports destinés à des institutions.
- **Langue de l'interface : français.** Pas d'interface en anglais sauf éléments techniques établis.
- **Anglicismes acceptés** : brief, feedback, deadline (utilisés naturellement par l'audience)
- **Anglicismes refusés en verbes** : checker → vérifier · scheduler → planifier · onboarder → intégrer

---

## Modulation par situation

| Situation | Registre | Exemple |
|---|---|---|
| Succès (action validée) | Direct, chaleureux, bref | "Import finalisé — 47 producteurs ajoutés." |
| Erreur blocante | Clair sur le problème, orienté solution | "Ce fichier n'est pas lisible. Vérifie que c'est bien un CSV ou XLSX." |
| Action destructive | Sobre, factuel, sans dramatiser | "Cette action est irréversible. Les données ne pourront pas être récupérées." |
| Onboarding / première utilisation | Guidant sans condescendance | "Commence par créer ton premier workflow." |
| Formulaire (labels) | Courts, sans "Entrez votre…" | "Nom de l'étape" pas "Entrez le nom de l'étape" |
| État vide | Explicatif + orienté action | "Aucun producteur importé. Lance un import pour commencer." |

---

## Modulation par profil

| Profil | Adaptation |
|---|---|
| Responsable des opérations | Précis, technique, dashboards orientés décision |
| Agent terrain (mobile) | Très court, actionnable, résiste au stress du terrain |
| Administrateur | Factuel, nomenclature exacte, pas de simplification excessive |
| Producteur | Langue locale si applicable (wolof, pulaar…), non une traduction littérale |

---

## Anatomie d'un message d'erreur de donnée

Un message d'erreur de donnée (import, validation, correction) a **trois morceaux, jamais un seul** — c'est ce qui le rend lisible au lieu de technique :

1. **Quoi** — le problème en clair, sans jargon (« Coordonnée hors du Sénégal », pas « lat/lng out of bounds »).
2. **Conséquence** — ce que ça change (« ce producteur ne sera pas créé » / « sera importé sans numéro »).
3. **Comment corriger** — l'action concrète, ou le contrôle de correction lui-même.

| ❌ Trop technique | ✅ Quoi · Conséquence · Comment |
|---|---|
| `Colonne attendue manquante` | **Colonne « CODE PRODUCTEUR » introuvable.** Sans elle, aucun producteur ne peut être créé. Vérifie l'en-tête de ton fichier. |
| `Champ vide` | **Téléphone manquant.** Le producteur sera importé sans numéro. |
| coordonnée invalide | **Coordonnée hors du Sénégal.** Corrige le point sur la carte, ou modifie la latitude/longitude. |

Le « Quoi » est toujours visible (colonne **Motif**) ; « Conséquence » et « Comment » peuvent vivre dans le popover de la cellule.

---

## Pièges fréquents à éviter

- ❌ "Veuillez…" → trop formel
- ❌ "Nous avons rencontré une erreur" → passif corporate
- ❌ "Opération réussie !" → exclamation creuse
- ❌ "Êtes-vous sûr(e) de vouloir…" → paternaliste
- ✅ "Confirmé." / "Importé." / "Supprimé." → direct, factuel
