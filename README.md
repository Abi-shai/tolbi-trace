# Tolbi Trace

Plateforme web de Tolbi OS — configuration et observation des chaînes de valeur agricoles (modules ID, INA, Source, Trace, Data OS…).

## Stack

Nuxt 3 · Vue 3 (`<script setup lang="ts">`) · Tailwind CSS v4 · Pinia · Vue Flow · Cytoscape.
`srcDir: src/`, routing par fichiers (`src/pages/`).

> ⚠️ Ce projet **n'est pas** du Next.js. Toute référence antérieure à `create-next-app` / App Router / `app/page.tsx` était erronée. La source de vérité de la stack est [`CLAUDE.md`](./CLAUDE.md).

## Démarrer

```bash
npm install
npm run dev      # serveur de dev Nuxt
```

Autres scripts : `npm run build`, `npm run generate`, `npm run preview`.

## Sources de vérité

Avant de contribuer, lis dans cet ordre :

- [`CLAUDE.md`](./CLAUDE.md) — **règles d'ingénierie et priorité des sources** (stack, conventions, gates lexicale / composants / Figma).
- [`CONTEXT.md`](./CONTEXT.md) — **le glossaire de domaine** : acteurs, modules, features, vocabulaire figé.
- [`.claude/context/`](./.claude/context/) — vision produit, design system (`Ds*`), philosophie de design, voix & ton.

`CLAUDE.md` prime sur ce README pour tout ce qui touche au framework, au routing ou à la structure.
