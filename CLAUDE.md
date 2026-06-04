# Tolbi Trace — Référence technique

Lis ce fichier en entier avant de commencer à travailler.

**Pour toute tâche UI ou fonctionnelle, lis aussi ces deux fichiers avant d'écrire du code :**
- `.claude/context/product.md` — vision produit, principes de design, scénario de démo
- `.claude/context/design-system.md` — catalogue complet des composants `Ds*`, tokens CSS, règles d'usage

---

## Stack actuelle

```
Framework        Nuxt 3 (App Router, srcDir: src/)
Language         Vue 3 (Composition API + <script setup>)
UI components    @abi-shai/tolbi-design-system (composants Ds*, globaux)
Styling          Tailwind CSS v4 (@tailwindcss/vite)
Workflow canvas  Vue Flow
Graph viz        Cytoscape.js
State            Pinia (@pinia/nuxt)
Data mock        TypeScript dans src/data/
```

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
    id/                      # module ID/KYF fournisseurs
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

---

## Patterns Pinia

```ts
// Définition d'un store
export const useMyStore = defineStore('my-store', {
  state: () => ({ ... }),
  getters: { ... },
  actions: { ... },
})

// Utilisation dans un composant
const store = useMyStore()
```

- Un fichier par domaine dans `src/stores/`
- Initialisation des données mock dans une action `init()` appelée en `onMounted`
- Pas de `ref`/`reactive` globaux hors stores — tout état partagé passe par Pinia

---

## Conventions de code

- Composants en PascalCase, fichiers en kebab-case
- Un composant par fichier
- Les données mock dans `src/data/` — jamais hardcodées dans les composants
- Les types TypeScript dans `src/types/` — un fichier par domaine
- Tutoiement dans tous les labels et messages UI (pas "Vous", "Tu")
- Imports avec alias `~/` (ex: `~/stores/workflows`)
