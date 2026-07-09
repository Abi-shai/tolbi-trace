# Mettre à jour le Design System Tolbi

Met à jour le package `@abi-shai/tolbi-design-system` et synchronise tous les fichiers dépendants.

## Procédure

### 1. Mettre à jour le package

```bash
npm install @abi-shai/tolbi-design-system@latest --legacy-peer-deps
```

Vérifie la version installée et les nouveaux composants dans `node_modules/@abi-shai/tolbi-design-system/dist/`.

### 2. Vendoriser le CSS des composants

Le `dist/index.css` **n'est pas dans le champ `exports` du package** — toute tentative de l'importer via un specifier de package (`@abi-shai/...`) sera rejetée par Vite/Rollup/Tailwind en production Vercel.

**Toujours copier le fichier localement :**

```bash
cp node_modules/@abi-shai/tolbi-design-system/dist/index.css src/assets/css/design-system.css
```

Ce fichier est commité dans le repo et chargé comme CSS local dans `nuxt.config.ts` :
```ts
css: [
  '~/assets/css/design-system.css',  // vendorisé — ne pas changer en import package
  '~/assets/css/main.css',
],
```

### 3. Tokens CSS

Les tokens sont dans le champ `exports` du package sous `./tokens`. Les importer via le plugin :

```ts
// src/plugins/design-system.ts
import '@abi-shai/tolbi-design-system/tokens'  // ✅ export valide
// NE PAS faire :
// import '@abi-shai/tolbi-design-system/dist/tokens/index.css'  // ❌ non exporté
// import '@abi-shai/tolbi-design-system/dist/index.css'          // ❌ non exporté
```

### 4. Enregistrer les nouveaux composants

Si de nouveaux composants ont été ajoutés, les enregistrer dans `src/plugins/design-system.ts` :

```ts
import { NouveauComposant } from '@abi-shai/tolbi-design-system'
// ...
nuxtApp.vueApp.component('DsNouveauComposant', NouveauComposant)
```

### 5. Resynchroniser l'inventaire machine-readable

L'inventaire des composants vit dans `.claude/context/design-system.components.json` (source unique de la « gate d'inventaire » de `CLAUDE.md`). Après tout ajout/retrait/changement de props :

1. Mets à jour `dsComponents` (nom → props → emits → statut → usage) d'après le runtime du nouveau `dist`.
2. Vérifie la **complétude** contre les enregistrements du plugin — le compte doit correspondre :

```bash
node -e "const c=require('./.claude/context/design-system.components.json');const r=require('fs').readFileSync('src/plugins/design-system.ts','utf8').match(/component\('(Ds[A-Za-z]+)'/g).map(s=>s.match(/Ds[A-Za-z]+/)[0]);const ds=c.dsComponents.map(x=>x.name);console.log('catalog:',ds.length,'plugin:',r.length);console.log('manquants:',r.filter(x=>!ds.includes(x)));console.log('en trop:',ds.filter(x=>!r.includes(x)));"
```

`manquants` et `en trop` doivent être vides.

3. Vérifie que `localPrimitives` reflète toujours l'état réel de `src/components/ui/` (`find src/components/ui -name '*.vue'`).

### 6. Vérifier le build local

```bash
npm run build
```

Un build local qui passe = build Vercel qui passe. Ne pas pousser sans avoir validé localement.

## Pourquoi vendoriser le CSS ?

Le package `@abi-shai/tolbi-design-system` a un champ `exports` restrictif :
```json
{
  ".": { "import": "./dist/index.js" },
  "./tokens": "./dist/tokens/index.css",
  "./tokens/*": "./dist/tokens/*.css"
}
```

`./dist/index.css` n'y figure pas. Vite en mode production (et le plugin `@tailwindcss/vite`) valide strictement les imports contre ce champ. En dev, Vite est plus permissif — c'est pourquoi ça marche en local mais échoue sur Vercel.

La solution pérenne est d'ajouter `"./dist/index.css": "./dist/index.css"` aux exports du package DS. En attendant, on vendorise.