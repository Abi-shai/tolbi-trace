# Data OS agents get their own store, not a generalization of Source's

The Data OS "Agents" tab (inside a [[Formulaire (Data OS)]]) duplicates the Source
agents page — same functionality: PIN generation, regenerate, soft-deactivate /
reactivate (see 0005), WhatsApp share, copy PIN. Rather than share the existing
`useAgentsStore`, we introduce a **parallel** `useDataosAgentsStore` +
`DataosAgent` type keyed on `formulaireId`, with its own mock file. Source's
`agents` store / `agent` type / `data/agents.ts` are left untouched.

The reason: the two modules speak deliberately separated languages (see CONTEXT.md
— a Data OS Formulaire must not be called a "workflow"). Keying the shared store
on a generic `ownerId` would erase that boundary in code, and migrating Source's
`workflowId` field ripples into a working, shipped page for no functional gain.
Data OS agents are also scoped to a Formulaire, which — unlike Source's fixed
`wf-001` mock — has a **runtime-generated id**, so the Data OS store seeds its demo
roster lazily per `formulaireId` on first access. That seeding logic has no analog
in the Source store and would have to be bolted onto a shared store as a special
case anyway.

The cost is ~85 lines of near-identical store logic (PIN generation, regenerate,
deactivate/reactivate) that can drift between the two modules. We accept that: at
mock-data / prototype stage the blast radius of a bug is one demo, and the module
boundary is worth more than the DRY saving. If a real backend later unifies agent
management, this is the point to revisit.

## Considered Options

**Generalize the shared store (`workflowId` → `ownerId` + `scope`) — rejected:**
One store for both modules, tenant-wide PIN uniqueness for free. Rejected because
it touches a working Source page (rename + migrate every `workflowId` reference)
for a task meant to be purely additive, and it dissolves the Source/Data OS
vocabulary boundary that CONTEXT.md deliberately maintains.

**Reuse the store as-is, storing `formId` in the `workflowId` field — rejected:**
Cheapest, but literally naming a Formulaire id `workflowId` is exactly the
cross-context leak the glossary warns against. A future reader would be actively
misled.
