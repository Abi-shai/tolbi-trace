# Contexte projet — Tolbi

> Fichier de référence à uploader dans le projet Claude. Dernière mise à jour : mai 2026.

---

## Qui est Tolbi

Tolbi est une startup sénégalaise **climate-agtech** fondée en 2020 par Mouhamadou Lamine Kébé. Siège à Dakar, présence à Abidjan et San Francisco. Mission : contribuer à la sécurité alimentaire en Afrique via l'agriculture de précision — IA, télédétection satellitaire, données terrain.

Signature produit : *"De l'Intelligence pour Une Agriculture Durable et Efficiente"*

---

## Le produit : Tolbi OS

Tolbi OS est un **système modulaire à 8 modules** interconnectés autour de la chaîne d'approvisionnement agricole.

| Module | Fonction |
|---|---|
| **Yield** | Estimations et prévisions de rendements via IA et satellites |
| **ID** | Identité numérique des producteurs et gestion des parcelles |
| **Survey** | Collecte de données terrain (campagnes agricoles, projets carbone) |
| **Scan** | Détection et cartographie des cultures par IA satellitaire |
| **Call** | Conseils agricoles temps réel aux producteurs en langues locales |
| **Trace** | Diligence raisonnée et conformité (notamment EUDR) |
| **ARR / REDD+** | Éligibilité et suivi des projets carbone forestiers |
| **Carbone** | Suivi forêts, biomasse, déforestation, séquestration carbone |

---

## Audiences

Tolbi OS adresse une chaîne d'acteurs hétérogène, regroupée en 4 profils :

- **Coopératives** — gestionnaires qui suivent leurs producteurs membres, parcelles, rendements et conformité de la chaîne de valeur
- **Agroindustriels** — entreprises agroalimentaires qui pilotent supply chain, conformité réglementaire (EUDR) et projets durabilité
- **Agents de terrain** — utilisateurs mobiles qui collectent données et observations sur les parcelles, souvent hors ligne
- **Producteurs individuels** — agriculteurs destinataires des conseils via TOLBI Call et notifications, souvent en langue locale (wolof, pulaar…)

La voix de Tolbi reste constante entre les profils. Le ton s'adapte.

---

## Stack & outils de l'équipe

- **Design** : Figma
- **Gestion de projet** : Jira
- **Documentation** : Confluence (espace Design — `tolbico-team-y306gi10.atlassian.net`)
- **UX Copy** : repository Excel (Google Drive) + Confluence
- **Claude** : utilisé pour le content design, la rédaction de guidelines, la structuration du content system

---

## La voix Tolbi en une phrase

> **Tolbi parle comme un partenaire technique africain qui connaît le terrain, qui maîtrise la donnée, et qui sait que chaque décision agricole compte — pour les rendements, pour les revenus, pour la planète.**

### Les 4 traits de la voix

1. **Compétent et précis** — on rend les concepts complexes lisibles sans les diluer (IA, MRV, EUDR, séquestration carbone…)
2. **Engagé, sans être moralisateur** — la mission transparaît sans sermon
3. **Concret et orienté décision** — on va au fait, on donne le chiffre, on indique l'action suivante
4. **Ancré africain, ouvert au monde** — voix assumant l'origine sénégalaise/panafricaine, sans se déformer pour ressembler au silicon valley

### Ce que Tolbi n'est pas
- Pas une startup tech qui parle de "disruption"
- Pas une ONG qui parle de "bénéficiaires"
- Pas un outil corporate ("solutions de productivité augmentée")
- Pas un assistant condescendant qui explique aux producteurs leur métier
- Pas un produit qui s'excuse en permanence

---

## Travail design accompli

### Content System — Confluence

Arborescence créée dans l'espace **Design** de Confluence, sous la page parent **Tolbi Content System** :
`https://tolbico-team-y306gi10.atlassian.net/wiki/spaces/Design/pages/721126/Tolbi+Content+System`

| Page | Statut | URL |
|---|---|---|
| **Voice & Tone** | ✅ Disponible | `…/pages/721147/Voice+Tone` |
| **Writing Principles** | ✅ Disponible | `…/pages/1605634/Writing+Principles` |
| **Audiences & Profiles** | ✅ Disponible | `…/pages/1900545/Audiences+Profiles` |
| **Glossary** | 🔜 Bientôt | — |
| **Style Guide** | 🔜 Bientôt | — |
| **Content Patterns** | 🔜 Bientôt | — |
| **Module-Specific Patterns** | 🔜 Bientôt | — |
| **Localization Guidelines** | 🔜 Bientôt | — |
| **Decisions Log** | 🔜 Bientôt | — |
| **Changelog** | 🔜 Bientôt | — |

**Ce que couvrent les pages existantes :**

- **Voice & Tone** — voix, 4 traits, ce qu'on n'est pas, modulation par situation (succès / erreur / onboarding / action destructive / formulaire), modulation par profil, exemples comparatifs par module, pièges fréquents
- **Writing Principles** — 5 règles d'écriture concrètes + checklist mentale
- **Audiences & Profiles** — détail des 4 profils utilisateurs + matrice profils × modules

---

### UX Copy Repository — Excel / Google Drive

Fichier `.xlsx` créé pour servir de repository de toutes les strings UX du produit, compatible liaison Figma.

Structure du fichier :

| Feuille | Contenu |
|---|---|
| **README** | Mode d'emploi du repository |
| **Strings** | Repository principal — clé, texte FR, contexte, statut |
| **Glossary** | Vocabulaire à respecter |
| **Voice & Tone** | Rappel rapide des principes |
| **Patterns** | Modèles de copy réutilisables |

Le fichier contient un onboarding parcours producteur en guise de contenu de test pour la liaison Figma.

---

## Convention de nommage des strings

Structure recommandée pour les keys :

```
[zone].[composant].[propriété]
```

Exemples :
```
onboarding.email-step.placeholder
survey.submit-btn.label
trace.alert.polygon-risk.body
```

---

## Décisions prises

- **Tutoiement** pour tous les profils métier (coopératives, agroindustriels, agents). Vouvoiement uniquement pour les exports destinés aux institutions.
- **Anglais Tolbi** : concret, technique, sans formules de politesse excessives. On évite le ton corporate américain ("we are thrilled to…") comme le ton britannique trop formel.
- **Langues locales** : les messages en wolof/pulaar ne sont pas des traductions littérales du français — ils sont retravaillés avec des locuteurs natifs.
- **Anglicismes acceptés** : brief, feedback, deadline (utilisés naturellement par l'audience).
- **Anglicismes refusés** : checker, scheduler, onboarder (en verbes — on dit vérifier, planifier, intégrer).

---

## Prochaines étapes identifiées

- [ ] Construire la page **Glossary** (vocabulaire produit, termes à éviter, anglicismes)
- [ ] Construire la page **Content Patterns** (empty states, erreurs, confirmations, onboarding, notifications, emails)
- [ ] Alimenter la page **Module-Specific Patterns** pour chaque module Tolbi OS
- [ ] Étoffer le fichier UX Copy repository avec des strings réelles du produit
- [ ] Finaliser la convention de nommage des keys avec l'équipe dev
