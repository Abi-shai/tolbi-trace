# Guide de migration

## Migration Next.js → Nuxt 3

Le dépôt a été initialisé sous Next.js (React / App Router) puis migré vers
**Nuxt 3 + Vue 3**. Le `README.md` d'origine n'a pas suivi : il décrit encore
Next.js / `create-next-app` / App Router. **Il est obsolète sur tout ce qui
touche au framework, au routing et à la structure** (voir la « Priorité des
sources » dans `CLAUDE.md`). La stack qui fait autorité est celle ci-dessous.

### Correspondances à connaître

| Next.js / React | Nuxt 3 / Vue 3 |
| --- | --- |
| Composants React (`.tsx`, JSX) | SFC Vue `<script setup lang="ts">` (jamais d'Options API) |
| App Router (`app/`) | Routing par fichiers dans `src/pages/` (`srcDir: src/`) |
| `useRouter`, `usePathname`, `useSearchParams` (next/navigation) | `useRoute()`, `useRouter()`, `navigateTo()` |
| `<Link href>` | `<NuxtLink to>` |
| Hooks React (`useState`, `useEffect`, hooks maison) | Composition API (`ref`, `computed`, `onMounted`) + composables `src/composables/use*.ts` |
| État global (Context / Redux / Zustand) | **Pinia** (`@pinia/nuxt`), un store par domaine dans `src/stores/`, init dans une action `init()` appelée en `onMounted` |
| Imports d'alias `@/` | Imports d'alias `~/` (ex. `~/stores/workflows`) |
| Import manuel des composants | Composants de `src/components/` **auto-importés** ; composants `Ds*` **enregistrés globalement** (jamais d'import manuel) |
| CSS Modules / Tailwind config JS | **Tailwind CSS v4** (`@tailwindcss/vite`), tokens via `@theme` dans `src/assets/css/main.css` |

### Points de vigilance

- **Ne déduis pas la stack du README** : en cas de contradiction, l'autorité
  décroît `CLAUDE.md` > `CONTEXT.md` > code (`src/`) > `.claude/context/` > `README`.
- Les données mock vivent dans `src/data/` (jamais codées en dur dans les composants) ;
  les types de domaine dans `src/types/` (un fichier par domaine).
- La copy UI est au tutoiement (« tu », jamais « vous »).

## Notes

- Le `README.md` est conservé pour l'historique mais **ne fait pas foi** sur la
  stack. Réfère-toi à `CLAUDE.md` et à ce guide.
