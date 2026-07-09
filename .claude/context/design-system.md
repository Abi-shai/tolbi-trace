# Design System — @abi-shai/tolbi-design-system

**Version : 0.4.0**

## Règle fondamentale

Toujours utiliser les composants `Ds*` en priorité. Ne jamais recréer localement ce que le DS fournit. Les composants locaux supprimés (Input, Avatar, Badge, Button) ne doivent pas être recréés.

---

## Inventaire des composants (source unique)

L'inventaire complet est un fichier structuré, machine-readable : **[`design-system.components.json`](./design-system.components.json)** (nom → props → emits → statut → usage). C'est la **source unique** de la « gate d'inventaire » de `CLAUDE.md` — consulte-le avant de créer tout composant, ne réénumère pas les props ailleurs.

- `dsComponents` — les 35 composants `Ds*` du package, props/emits vérifiés au runtime (dist 0.4.0), avec une ligne `usage`.
- `localPrimitives` — les primitives locales de `src/components/ui/` à réutiliser (ex. `SlideOverPanel` pour tout panneau latéral droit, `EmptyState` pour tout état vide).
- `removedLocal` — supprimés, à ne jamais recréer (`Input`→`DsInputField`, `Avatar`→`DsAvatar`, `Badge`→`DsBadge`, `Button`→`DsButton`).

Complétude vérifiée : le nombre de `dsComponents` est contrôlé contre les enregistrements de `src/plugins/design-system.ts` (35). Tous les `Ds*` sont enregistrés globalement via ce plugin — pas besoin de les importer dans les SFC.

---

## Tokens CSS

Les variables `--ds-*` sont disponibles globalement via `src/assets/css/design-system.css`.

```
Couleurs      --ds-color-brand-*  --ds-color-error-*  --ds-color-success-*
              --ds-color-warning-*  --ds-color-gray-light-*
Sémantiques   --ds-semantic-{text,border,fg,bg}-*
Typographie   --ds-typography-*
Espacement    --ds-space-*  --ds-spacing-*
Rayon         --ds-radius-*
Ombres        --ds-shadow-*  --ds-focus-ring-*
```

Les tokens sémantiques (`--ds-semantic-*`) sont aliasés vers les variables Tailwind dans `src/assets/css/main.css`. Utiliser les tokens sémantiques pour les couleurs, jamais les valeurs brutes.

---

## CSS des composants — attention

`src/assets/css/design-system.css` est une copie locale de `dist/index.css` du package. Ne jamais importer `@abi-shai/tolbi-design-system/dist/index.css` directement — le champ `exports` du package ne l'expose pas et Vite le rejette en production.

Pour les tokens, l'import via specifier est valide : `import '@abi-shai/tolbi-design-system/tokens'`.

Pour mettre à jour le DS (et resynchroniser l'inventaire `design-system.components.json`) : utiliser le skill `/update-design-system`.

---

## Topbar

`src/components/layout/Topbar.vue` utilise `DsHNav`. Les breadcrumbs sont au format `{label, active}`. Navigation home via l'event `@learn`. Module actif : **Source** (`active: true` dans la liste `modules`).
