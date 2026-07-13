# Changelog

Toutes les évolutions notables de Tolbi Trace sont consignées ici.

Le format s'appuie sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet suit (de façon souple, prototype) le [versionnage sémantique](https://semver.org/lang/fr/).

## [Unreleased]

### Added
- Surface IA du dépôt : `llms.txt` (carte llmstxt.org), manifeste de composants `lyse.components.json`, `MIGRATION.md`.
- Bloc `@media (forced-colors: active)` pour préserver bordures et focus en mode contraste élevé (Windows HCM).

### Changed
- Conformité design system : remplacement des valeurs codées en dur (couleurs, durées/courbes de motion) par les tokens `--ds-*` correspondants dans les composants applicatifs.
- `.lyse.yaml` : périmètre d'audit cadré (module mobile, sources de tokens, données mock et artefacts compilés exclus) + `componentsModule` déclaré.

## [0.1.0] - 2026-07-09

Première base fonctionnelle du prototype (Nuxt 3 + Vue 3 + `@abi-shai/tolbi-design-system`).

### Added
- **Module INA** — cartes QR, wallet & transactions ; fiche web à onglets, galerie de cartes, parcours & commande.
- **Module ID** — import et rapprochement des producteurs (matching, modals, scénarios) ; finalisation partielle des imports, rejets & édition inline (TOQ-497) ; ajout manuel d'un producteur (formulaire + carte MapLibre) ; téléphone (pays + formatage) et champs supplémentaires ; fichier géospatial obligatoire à l'import ; correction cartographique (bilan géo hybride, bucket à corriger).
- **Module Data OS** — projets, formulaires et builder ; sidebars contextuelles et transitions ; analytiques, métriques partagées, confirmations de suppression ; panneau de détail d'une réponse en lecture seule.
- **Module Source** — canevas de workflows (Vue Flow), agents de workflow.
- **Paramètres** — Organisation-tenant multi-org, accès par module (Lecteur / Éditeur / Admin), crédits & écran d'accueil ; agents au niveau organisation, affectation par formulaire.

### Changed
- Migration de la stack de Next.js / React vers **Nuxt 3 / Vue 3** (voir [MIGRATION.md](MIGRATION.md)).
- Renommages de domaine : `fournisseur` → `producteur`, `KYF` → `ID` (copy UI), workflows déplacés sous `/source`.

### Documentation
- `CLAUDE.md` (référence technique, gates, priorité des sources), `CONTEXT.md` (glossaire de domaine), contexte produit & design partagé sous `.claude/context/`.
