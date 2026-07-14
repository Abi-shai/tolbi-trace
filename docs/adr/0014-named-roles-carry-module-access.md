# Named rôles carry module access; agents get binary module gates

- Status: accepted (refines ADR-0010, amends ADR-0012)

A membership's permission is now a **[[Rôle]]** — a named, reusable bundle — instead of a per-member module map. **Rôles natifs** ship with the product, non-editable, three rungs with one-sentence-distinct powers: **Propriétaire** (everything; one per org, transferable) > **Super-admin** (manages membres + rôles custom + agents, full access on every module; no billing, no org deletion/transfer) > **Admin** (full access on every module; no team management, no billing). **Rôles custom** are an org-authored *name + module → niveau map*, nothing else — never org powers. The niveaux shrink to **Lecteur | Éditeur**: the module-Admin niveau is retired so that « Admin » only ever names a native rôle. The rôle is the **sole** source of a Collaborateur's access — no per-member overrides, rôle required at invitation. [[Agent]]s don't take rôles: they get **direct binary module grants** (no niveau) gating their *mobile* capabilities; [[Affectation]] survives as the fine work-routing axis inside Source/Data OS and now **requires** the module grant.

Grounded in a Mobbin benchmark (Remote, Airwallex, Vanta, Wix, Teachable, Clerk — all converge on "member points to a rôle; natives and customs in one list, natives badged and locked; custom editor = product areas × View/Edit"). The agent decision is forced by a real gap: INA has **no** affectation concept, yet an org must be able to authorize an agent to record transactions — the binary module gate is that missing link, and it finally fills the Agent's empty « Accès » column (module badges without niveau).

## Considered Options

- **Rôle as invite-time preset + per-member overrides — rejected.** Two sources of truth ("his rôle says Lecteur but he was bumped to Éditeur"), plus a reconciliation UI to design.
- **Two coexisting axes (member map + rôle label) — rejected**, same verdict as ADR-0010: two permission vocabularies that drift.
- **Keeping three niveaux (incl. module-Admin) — rejected.** An org rôle named Admin next to a module niveau named Admin is the exact collision that made ADR-0010 ban named rôles; dropping the niveau (Remote's View/Edit pattern) dissolves it instead of renaming around it.
- **Module access replacing Affectation for agents — rejected.** "Accès Data OS = sees every formulaire" loses the fine routing ADR-0012 just built.
- **Custom rôles carrying team-management powers (Remote's "Company management" area) — rejected for v1.** It would blur Super-admin's raison d'être; the "restricted HR manager" scenario is served by granting Super-admin, and adding a team-powers section later is additive.

## Consequences

- ADR-0010's *"no named rôles"* stance is superseded, but its core survives: access stays per-module — the map just moves from the Membre to the Rôle. `Membre.access` gives way to a rôle reference; badges and pickers show two niveaux.
- The member-management gate widens from Propriétaire alone to Propriétaire ∪ Super-admin; billing and org deletion/transfer stay Propriétaire-only (existing tab-gating logic keeps its shape, the predicate changes).
- ADR-0012's *"Affectation grants no module access"* is amended, not reversed: affectation still grants nothing — it now *requires* the agent's binary grant, which is a new, separate object.
- Lifecycle guardrails: editing a rôle custom hits all carriers instantly; deleting a carried rôle demands choosing the carriers' destination rôle **in the delete dialog** (no silent fallback — an automatic fallback to a native rôle would be accidental privilege escalation).
- Default rule, not yet stress-tested: a Super-admin can assign any rôle except Propriétaire (that is a *transfer*, a dedicated Propriétaire-only action).
- UI: Paramètres > Organisation grows a **Membres · Rôles** sub-navigation (one list, natives badged, carrier counts); the Membres « Accès » column shows the rôle badge for Collaborateurs and module badges for Agents.
- See CONTEXT.md for the resolved language: **Rôle**, **Rôle natif**, **Rôle custom**, and the revised **Accès (module)**, **Propriétaire**, **Agent**, **Affectation**.
