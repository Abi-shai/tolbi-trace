# Finalisation loading state lives as a phase inside ImportMatching, not as a step in FournisseursClient

_Status: superseded by [ADR-0002](./0002-finalisation-overlay-owned-by-fournisseurs-client.md)_

The import de fournisseurs flow is orchestrated by `FournisseursClient` (steps: `empty → import → matching → done`) and `ImportMatching` manages its own internal sub-states (phases: `processing → results`). When we added the finalisation loading screen, we added it as a third phase (`finalizing`) inside `ImportMatching` rather than promoting it to a new step in `FournisseursClient`.

The reason: finalisation is the resolution of the matching journey, not a new top-level step. Keeping it inside `ImportMatching` means the entire import flow's transitions, z-index layering, and Teleport logic stay in one component. Promoting it to `FournisseursClient` would have required passing loading state upward and duplicating the full-screen overlay pattern in a component that has no other reason to know about it.

## Considered Options

**Option B (rejected):** New `'finalizing'` step in `FournisseursClient` with a separate `<ImportFinalizing>` component. Rejected because the finalisation screen is a direct consequence of confirming the matching results — it belongs to that flow, not to the broader navigation shell.
