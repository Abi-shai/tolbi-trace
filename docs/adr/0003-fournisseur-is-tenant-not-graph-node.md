# Fournisseur is the workspace tenant, not a graph node

- Status: superseded by ADR-0009 — the tenant is now the **Organisation** (Fournisseur is one *type* of Organisation), and a User can belong to many Organisations. The "tenant is not a graph node" claim below still holds.

The word "fournisseur" (buyer/agroindustrial) might suggest an actor in the supply chain graph alongside Producteur, Coopérative, and Agent. We decided against this: Fournisseur is the tenant of the workspace — all data (Coopératives, Producteurs, Sacs, workflows) implicitly belongs to the Fournisseur. There is no Fournisseur node in the graph, no Fournisseur relationship to traverse, and no need to model it explicitly in domain data.

The alternative (Fournisseur as a graph node with a Fournisseur → Coopérative edge) was rejected because in the current scope every workspace belongs to exactly one Fournisseur, making the relationship a constant rather than a variable — modelling it as a node would add indirection with no query benefit.
