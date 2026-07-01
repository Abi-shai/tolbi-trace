# Agents are soft-deactivated, never hard-deleted

TOQ-565 asks the Responsable ops to "créer, modifier, **désactiver**" agents — deliberately not "supprimer". We introduce a `statut: 'actif' | 'inactif'` on `Agent`. Deactivating flips the agent to `inactif`, which invalidates their Code PIN (mobile login is refused) and removes them from active rosters, but preserves the agent node and every event that references it. Agents are reactivatable; on reactivation the old PIN stays dead and the Responsable ops regenerates a fresh one. The previous hard-delete `removeAgent` action is retired in favour of `deactivateAgent` / `reactivateAgent`.

The reason: the graph model records `Événement → Agent` ("who did it") for every field event. Hard-deleting an agent would orphan their historical events and destroy the "qui" of the trace — antithetical to a traceability product. A `statut` flag keeps history intact while still removing operational access.

## Considered Options

**Hard delete (rejected):** The pre-existing `removeAgent` simply dropped the agent from the list. Rejected because it silently breaks event provenance; once real events exist, deletion is unrecoverable and the trace can no longer answer "which agent weighed this sac?".
