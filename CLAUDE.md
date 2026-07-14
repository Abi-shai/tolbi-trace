# Tolbi Trace — Référence technique

Lis ce fichier en entier avant de commencer à travailler.

## Priorité des sources (à lire en premier)

En cas de contradiction entre plusieurs sources, l'autorité décroît dans cet ordre :

1. **Ce fichier** (`CLAUDE.md`) — les règles ci-dessous priment sur tout.
2. **Le glossaire de domaine** (`CONTEXT.md`, à la racine) — vérité du vocabulaire métier.
3. **Le code réel** (`src/`) — vérité de la structure et des composants existants.
4. **Les fichiers de contexte** (`.claude/context/product.md`, `design-system.md`, etc.) — vérité du produit et du design.
5. **Le README** — OBSOLÈTE sur la stack. Le README parle de Next.js / `create-next-app` / App Router : **c'est faux**. La stack réelle est Nuxt 3 + Vue 3 (voir « Stack actuelle » plus bas). Ignore le README pour tout ce qui touche au framework, au routing ou à la structure.

Ne déduis jamais la stack, un terme ou un composant d'une source de rang inférieur quand une source de rang supérieur le contredit.

## Gate lexicale — vocabulaire de domaine (NON négociable)

Le vocabulaire Tolbi est un domaine mouvant avec un historique de renommages. Avant d'écrire **toute copy UI, tout label, tout message, tout nom de variable ou de type de domaine** :

1. **Vérifie le terme dans le glossaire** (`CONTEXT.md`, à la racine).
2. Si le terme figure dans un `Avoid:`, **tu ne l'emploies pas** — utilise le terme canonique lié en `[[...]]`.
3. Les entrées marquées `(retiré)` / `(retired)` ou décrivant explicitement un « ancien modèle » / « old model » sont de l'**historique conservé pour compréhension** : tu ne t'en sers JAMAIS comme spécification. Seul le paragraphe courant fait foi.
4. Distinction UI ↔ code : certains termes ne survivent qu'en code (ex. `Survey`, `KYF`, `tenant`, `workspace`). Ne les utilise jamais dans de la copy UI neuve — seulement dans du code/référence quand le glossaire l'autorise.

Pièges de collision à ne jamais commettre :
- **`champ` = champ de formulaire**, JAMAIS une parcelle. Une parcelle agricole est une `Parcelle`. (Collision dure signalée au glossaire.)
- **`rôle` est retiré** comme niveau org-wide — l'accès est par module (`Accès (module)` : Lecteur / Éditeur / Admin). Seul `Propriétaire` survit, comme flag de gouvernance.
- **`fournisseur`** n'est plus le tenant générique — c'est UN type d'`Organisation`. Le tenant, c'est `Organisation`.
- **`Code PIN` = le code à 4 chiffres que l'Agent crée lui-même** (terme réhabilité le 13 juil. 2026 pour la copy mobile). Ce qui reste retiré (ADR-0012), c'est l'ancien modèle : un PIN généré/régénéré côté web. Le web ne génère ni n'affiche jamais le code PIN.

En cas de doute sur un terme, consulte le glossaire plutôt que d'inventer — la cohérence terminologique est un livrable produit, pas un détail.

## Avant toute tâche UI ou fonctionnelle, identifie :

1. Sur quel module Tolbi OS on travaille (ID, INA, Source, Trace, Data OS, Yield…)
2. Quels profils utilisateurs verront ces écrans (Collaborateur ? Agent terrain ? Propriétaire ?)

## Puis lis ces fichiers avant d'écrire du code :

- `CONTEXT.md` (racine) — **source canonique du vocabulaire de domaine** (voir gate lexicale ci-dessus)
- `.claude/context/product.md` — vision produit, architecture fonctionnelle, principes de design, scénario de démo
- `.claude/context/design-system.md` — catalogue complet des composants `Ds*`, tokens CSS, règles d'usage
- `.claude/context/design-philosophy.md` — motion, densité, patterns d'interaction, états de feedback
- `.claude/context/voice-and-tone.md` — voix Tolbi, règles de rédaction UI, modulation par situation

## Gate d'inventaire des composants (NON négociable)

Avant de créer tout composant :

1. **Inventorie d'abord l'existant** via l'inventaire machine-readable `.claude/context/design-system.components.json` (source unique : `dsComponents` = les `Ds*`, `localPrimitives` = les primitives locales à réutiliser, `removedLocal` = à ne jamais recréer) ET, pour le reste, les composants de `src/components/`.
2. Si un composant existant couvre le besoin à ~80 %, **tu l'utilises ou tu le composes** à partir de l'existant — tu ne crées pas de doublon.
3. Créer un nouveau composant partagé exige une **justification explicite écrite dans ta réponse** : quel(s) composant(s) existant(s) tu as envisagé(s) et pourquoi il(s) ne convient (nent) pas.
4. Rappel : les `Ds*` sont enregistrés globalement (jamais d'import manuel) ; les composants de `src/components/` sont auto-importés. Ne réimporte rien, ne recrée rien qui soit déjà auto-disponible.

## Figma ↔ code (MCP) — deux modes

Le code reste le gardien de la cohérence du système. Figma peut servir à raffiner un composant existant **ou** à concevoir une proposition nouvelle from scratch — les deux sont légitimes. Ce qui n'est jamais autorisé, c'est qu'une entrée Figma atterrisse dans le code de production sans réconciliation avec l'existant.

**Mode raffinement** (Figma → code, sur un composant `Ds*` existant)
- Autorisé à modifier les propriétés visuelles : tokens, couleur, espacement, rayon, typo.
- Ne touche jamais à la structure, la logique ou l'API du composant.

**Mode proposition** (Figma → code, conception nouvelle)
- Autorisé : une proposition Figma peut partir de zéro.
- Mais elle est un **point de départ de conception, pas un artefact à transposer tel quel**. Avant de devenir du code de production, elle passe par une réconciliation obligatoire (la gate d'inventaire ci-dessus s'applique intégralement) :
  1. Vérifier si un `Ds*` ou un composant local couvre déjà tout ou partie de la proposition — réutiliser/composer plutôt que dupliquer.
  2. Isoler ce qui est réellement nouveau (le reste doit s'appuyer sur l'existant).
  3. Mapper les valeurs visuelles sur les **tokens existants** — jamais de valeurs en dur si un token équivalent existe.
  4. Justifier explicitement, dans la réponse, toute primitive ou composant vraiment nouveau (quel existant écarté, pourquoi).

Le court-circuit interdit : injecter du neuf depuis Figma sans passer par cette réconciliation (recréer un `Ds*` qui existe, introduire une primitive hors tokens sans choix conscient).

---

## Stack actuelle

```
Framework        Nuxt 3 (srcDir: src/)
Language         Vue 3 (Composition API + <script setup>)
UI components    @abi-shai/tolbi-design-system (composants Ds*, globaux)
Styling          Tailwind CSS v4 (@tailwindcss/vite)
Workflow canvas  Vue Flow
Graph viz        Cytoscape.js
State            Pinia (@pinia/nuxt)
Data mock        TypeScript dans src/data/
```

> Le README (Next.js / create-next-app / App Router) est obsolète — voir « Priorité des sources ». La stack ci-dessus fait foi.

---

## Structure des dossiers

```
src/
  app.vue                    # entrée Nuxt
  pages/                     # routes fichiers (Nuxt auto-routing)
  layouts/                   # app.vue, id.vue
  components/
    layout/                  # Topbar, Sidebar, Header
    ui/                      # composants locaux sans équivalent DS
    dashboard/               # composants spécifiques au dashboard
    workflow-canvas/         # WorkflowCanvas, StepNode, StepConfigPanel…
    workflows/               # liste workflows
    workflow-agents/         # gestion agents
    bags/                    # détail sac
    graph/                   # visualisation graphe
    qr-codes/                # gestion QR
    id/                      # module ID fournisseurs
  stores/                    # Pinia stores (un fichier par domaine)
  data/                      # données mock TypeScript (jamais dans les composants)
  types/                     # types TypeScript (un fichier par domaine)
  plugins/                   # design-system.ts, pinia-persistence.client.ts
  scenarios/                 # helpers de scénario de démo
  assets/css/                # design-system.css, main.css
```

---

## Conventions Vue 3 / Nuxt 3

- **Toujours `<script setup lang="ts">`** — pas d'Options API, pas de `defineComponent`
- **Composables** : logique réutilisable dans `src/composables/use*.ts` (pas de React hooks)
- **Pages** : `definePageMeta({ layout: 'app' })` pour appliquer un layout
- **Routing** : `useRoute()`, `useRouter()`, `navigateTo()` — jamais `useNavigate` ou `usePathname`
- **Auto-imports** : les composants de `src/components/` sont auto-importés (pas besoin de les importer dans les SFC)
- **Les composants `Ds*`** sont enregistrés globalement — jamais d'import manuel

## Patterns Pinia

```ts
export const useMyStore = defineStore('my-store', {
  state: () => ({ ... }),
  getters: { ... },
  actions: { ... },
})
```

- Un fichier par domaine dans `src/stores/`
- Initialisation des données mock dans une action `init()` appelée en `onMounted`
- Pas de `ref`/`reactive` globaux hors stores — tout état partagé passe par Pinia

## Conventions de code

- Composants en PascalCase, fichiers en kebab-case
- Un composant par fichier
- Les données mock dans `src/data/` — jamais hardcodées dans les composants
- Les types TypeScript dans `src/types/` — un fichier par domaine
- Tutoiement dans tous les labels et messages UI (pas « Vous »)
- Imports avec alias `~/` (ex : `~/stores/workflows`)
