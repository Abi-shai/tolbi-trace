# Agents are org-level; modules do Affectation only

Agents used to be managed **per module**: a Source `Agent` keyed on `workflowId`
(lifecycle in ADR-0005/0007) and a deliberately separate Data OS `DataosAgent`
keyed on `formulaireId` (ADR-0006), each carrying a web-generated [[Code PIN]].
Once the org-level roster arrived this left **three** parallel notions of "agent".
We collapse them: an [[Agent]] now exists **only** in the org roster (`OrgAgent`,
in [[Paramètres]] > Organisation). The modules no longer create or manage agents —
they only **[[Affectation|affecter]]** an existing agent from the roster (Source:
per workflow **step**; Data OS: per **[[Formulaire (Data OS)]]**), which is a
**separate axis from [[Accès (module)]]**. Creation is roster-only; the module
pickers deep-link to Paramètres when the agent you need isn't in the roster yet.

**Supersedes [ADR-0005](./0005-agents-soft-deactivate-not-delete.md),
[ADR-0006](./0006-dataos-agents-separate-store.md),
[ADR-0007](./0007-agents-hard-delete-reintroduced.md)** — the entire per-module
agent-management model (both stores, the `Agent` / `DataosAgent` types, and web
PIN generation) is retired.

## Considered Options

**Keep the two per-module stores (status quo) — rejected.** Leaves three "agent"
concepts (Source, Data OS, org roster) that drift and confuse. ADR-0006 explicitly
deferred unification to "when a real backend unifies agent management" — the org
roster *is* that unification, so the trigger it named has arrived. The module
boundary ADR-0006 protected (a Formulaire is not a workflow) is preserved
differently now: agents belong to **neither** module — they belong to the
Organisation, and each module merely references them by id.

**Store affectations on the agent vs. on the target — chose target-side.**
`step.agentId` already exists on Source's `StepNode`; mirroring it with
`formulaire.agentIds` keeps the change additive and lets "which agents on this
step / formulaire" read locally. "All formulaires an agent sees" is derived by
scanning targets — acceptable at prototype scale.

## Consequences

- The per-module agent pages are removed (Source "Équipe" tab, Data OS Formulaire
  "Agents" tab); the `agents` / `dataos-agents` stores, the `Agent` / `DataosAgent`
  types, and web PIN generation all retire.
- **Provenance carry-over.** ADR-0005's reason for soft-deactivation — the graph
  records `Événement → Agent` ("qui a fait quoi") — now applies to the org roster.
  Removing an org Agent must not orphan historical events, so removal stays
  non-destructive to history (an Agent carries `statut actif | inactif`).
- [[Affectation]] grants **no** web/module access — an Agent affecté to a
  Formulaire still shows an empty [[Accès (module)]] column in the Membres table.
- The [[Code PIN]] is retired in favour of the Agent's **personal** 4-digit code
  (set by the agent on first mobile login, never created or shown on the web).
- In v1 the affectation surfaces show **identity only** (no per-agent activity);
  "who collected what" stays at response level ([[Enquêteur]] in Suivi des réponses).
