# Agents

This file is read by AI coding assistants. Edit freely outside the Lyse-managed block.

## Lyse audit (auto-managed)

<!-- lyse-managed:begin -->
### Validate design-system conformance

```bash
pnpm exec lyse audit
```

Exit codes:
- 0 — pass (Health Score ≥ project threshold)
- 1 — fail (Health Score below threshold or hard errors)
- 2 — config error
<!-- lyse-managed:end -->

## Toolchain

Fichiers de configuration réellement présents à la racine, pour situer le périmètre :

- `package.json` — dépendances et scripts (Nuxt 3, Vue 3, `@abi-shai/tolbi-design-system`, Pinia, Vue Flow, Cytoscape).
- `package-lock.json` — lockfile npm (source de vérité des versions installées).
- `nuxt.config.ts` — configuration Nuxt (`srcDir: src/`, modules, Tailwind v4 via `@tailwindcss/vite`).
- `tsconfig.json` — configuration TypeScript (alias `~/`).
- `.lyse.yaml` — configuration de l'audit design system Lyse (`componentsModule`, `excludePaths`).

Stack de référence et conventions détaillées : voir `CLAUDE.md`. Vocabulaire de domaine : `CONTEXT.md`.
