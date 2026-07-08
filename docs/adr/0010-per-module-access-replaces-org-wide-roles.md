# Per-module access replaces the org-wide rôle model

- Status: accepted (refines ADR-0009)

Permissions inside an Organisation are now granted **per [[Module Tolbi]]**, not as a single org-wide rôle. Each [[Membre]] holds one *niveau d'accès* per module they can reach — **Lecteur** (read/observe), **Éditeur** (create + modify inside that module), **Admin** (full control *within that module*). The only org-wide notion that survives is a single governance flag, **Propriétaire** (the creator): implicitly Admin on every module and sole holder of member management, billing (Abonnement + Paiement), and org deletion.

This replaces ADR-0009's rôle model (Propriétaire / Admin / Responsable ops / Lecteur as one org-wide level per membership). ADR-0009's tenancy claims are untouched — Organisation is still the tenant, Users still belong to many Organisations; only the *shape of a membership's permission* changes.

Forced by the Sprint 16/18 Paramètres design (the "Accès aux modules" column in the Membres table + the add/edit-member module picker), which expresses access per module rather than per org.

## Considered Options

- **Replace org-wide rôles with per-module access (chosen).** Most faithful to the Figma the team designs against; models the real product where a person can be Éditeur in one module and Lecteur in another. Cost: rewrites the rôle type + tab-gating, and concentrates org governance on a single Propriétaire flag.
- **Two axes coexist** — keep a slim org-wide rôle for governance *and* add per-module access. Rejected: two permission vocabularies to reason about, and the org-wide "Admin" collides with the per-module "Admin".
- **Render access display-only, keep org rôles underneath.** Rejected: leaves the model split from the UI and defers the real decision, so the module picker stays a mock.

## Consequences

- The org-wide `Role` enum is retired. A Membre carries a map of module → access level (`lecteur` | `editeur` | `admin`) plus an optional `proprietaire` flag.
- Tab-gating (Abonnement, Paiement) and member management gate on **Propriétaire**, not on a rôle enum. `session.canManageOrg` becomes `session.isProprietaire`.
- "Responsable ops" disappears as a rôle; the archetype survives only in product.md as a persona.
- [[Agent]] is expected (Sprint 18) to become a Membre whose module access mirrors the forms assigned to them — to be confirmed at the cadrage. Until then the `Agent` + `Code PIN` glossary entries stand as-is.
- See CONTEXT.md for the resolved language: **Accès (module)**, **Propriétaire**.
