# Correction géo hybride (nettoyer + rattacher), rattachement IA confirmé par l'humain

- Status: accepted

The fichier géographique of an [[Import de producteurs]] is treated as **raw field capture** — points/tracés to both *clean* (aberrant sommets, invalid geometry) and *rattacher* to the right [[Parcelle]] / [[Producteur]] — not as clean polygons already tied to a producteur (hybrid **Modèle 2**). Its correction happens in [[Correction cartographique]], the one focused full-screen mode that leaves the [[Bilan du traitement]] surface. When a geometry is orphan, the IA **suggests** a parcelle rattachement but **never writes it silently**: the operator confirms — or overrides — each link.

Two things drive this. (1) The deck's own action vocabulary — *importer un tracé*, *lier à la parcelle*, *modifier les coordonnées* — only makes sense if rattachement is a first-class task (Modèle 2), not an edge case (Modèle 1 = repair-only). (2) [[TOLBI ID]] is the socle: every downstream module inherits its data, so a wrong parcelle→producteur link is expensive and near-impossible to spot after the fact — cheaper to spend two clicks confirming than to debug a corrupted base later.

## Considered Options

- **Hybrid-M2 + human-confirmed AI (chosen).** The geo file is raw waypoints/traces; the map both repairs geometry and assigns it to parcelles, the IA proposing the rattachement with a checkable spatial rationale ("le point tombe dans Parcelle A"), the human confirming. Fits the deck's action list and the field reality; protects the socle.
- **Modèle 1 (repair-only, geo arrives clean and already attached).** Rejected: contradicts the deck's action vocabulary and the field reality — agents drop GPS points/traces that need appariement, they don't hand over validated polygons.
- **Opt-out AI (auto-attach, operator deselects the wrong ones).** Rejected on the ID foundation: silent wrong links pass unnoticed; the cost of a false producteur↔parcelle link outweighs the friction of confirming. Acceptable for low-stakes suggestions, not for the socle.

## Consequences

- [[Correction cartographique]] must carry, on a selected point, both **geometry-editing** actions (déplacer · supprimer · modifier les coordonnées · importer un tracé) and a **rattachement** action (lier à la parcelle).
- The AI suggestion surfaces a **spatial rationale**, not an opaque confidence %. A batch "confirmer les N suggestions sûres" is allowed, but it stays a human action.
- The geo file's backend contract is "raw waypoints/traces (+ optional producteur hint)", not "validated polygons".
- This is **Phase 2** scope. Phase 1 (the [[Bilan du traitement]] + colonne Motif + validity filter, reusing the existing inline edit and [[Finalisation]]) ships without the map — see this session's découpage.
