# Finalisation overlay is owned by FournisseursClient via ScreenTransition, not as a phase inside ImportMatching

_Reverses [ADR-0001](./0001-finalisation-phase-inside-import-matching.md)._

When ScreenTransition was introduced as a shared primitive for module-switch animations (used in `app.vue`), we reversed the ADR-0001 decision. `ImportMatching` now emits a `'finalize-start'` event; `FournisseursClient` handles it by showing `<ScreenTransition>` with the Tolbi logo GIF.

The reason: ScreenTransition is the platform-wide pattern for full-screen animated overlays. Reusing it from `FournisseursClient` gives the finalisation overlay identical enter/leave behaviour to module transitions — same spring curve, same slide-up-out to top — at zero extra cost. Keeping the overlay inside `ImportMatching` would have meant a parallel Teleport + transition implementation that diverged from that established pattern the moment ScreenTransition existed.

## Why ADR-0001 was wrong in hindsight

ADR-0001 rejected "overlay in FournisseursClient" on the grounds that it would duplicate full-screen overlay logic. That was true before ScreenTransition. Once the shared component existed, the duplication argument collapsed — the "duplication" became a one-liner slot.
