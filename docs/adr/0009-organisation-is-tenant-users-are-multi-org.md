# Organisation is the tenant; Users belong to many Organisations

- Status: accepted (supersedes ADR-0003)

The tenant of the platform is now the **Organisation**, not the Fournisseur. "Fournisseur" becomes one *type* of Organisation (the agroindustrial type), alongside Coopérative and Hedge Fund/Banque. A **User** is a person with a personal account who can be a member of **several** Organisations and switch between them, holding a **rôle** per membership (Propriétaire, Admin, Responsable ops, Lecteur). The User↔Organisation relationship is therefore many-to-many — replacing the previous implicit assumption that each user works for exactly one tenant.

This was forced by Sprint 16's goal: let a user have and manage multiple organisations. It underpins the Paramètres redesign, whose "Organisation" scope reflects the *currently-active* Organisation (switched from a selector in the topbar).

## Considered Options

- **Organisation as the umbrella tenant (chosen).** Fournisseur/Coopérative/Hedge become types; cleanest fit with product.md's 3 client segments (each segment is a tenant).
- **Organisation as a sub-unit under a Fournisseur tenant** (multi-entity within one company). Rejected — it keeps Fournisseur as tenant and models a narrower "filiales" case, not the multi-account reality Sprint 16 needs.
- **Organisation as a mere synonym of Fournisseur.** Rejected — it doesn't express that a Coopérative can itself be a tenant, and hides the many-to-many User↔tenant shift.

## Consequences

- ADR-0003's architectural claim still holds: the tenant is **not** a graph node, and workspace data (Producteurs, Sacs, workflows) implicitly belongs to the tenant. Only two things change — the tenant is renamed Organisation, and one-tenant-per-user is no longer a constant.
- The web "profils" (Responsable ops, Admin) become concrete per-Organisation **rôles**; a User can hold different rôles in different Organisations.
- [[Agent]] is unaffected — an Agent is not a User and never logs into the web.
- See CONTEXT.md for the resolved language: Organisation, User, Membre, Rôle, Paramètres, Crédit.
