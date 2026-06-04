# Tolbi Trace

Tolbi Trace is the web platform for managing and tracing agricultural supply chains. It provides tools for onboarding farmers, mapping parcels, and auditing data quality across cooperatives.

## Language

### Actors

**Producteur** (EN: Farmer):
A farmer registered in the KYF module, linked to a cooperative. Represents one row in an imported file.
_Avoid_: fournisseur (different profile — see below), agriculteur, supplier

**Fournisseur**:
A distinct user profile in the product — not a farmer. _(Definition to be completed.)_

**Coopérative**:
The organization that submits producteur data to the platform on behalf of its members.
_Avoid_: client, partenaire (in domain context)

### Modules & Features

**Module Tolbi**:
A self-contained business capability within the Tolbi platform (ex: KYF, Source). Each module has a distinct domain and entry point. Operators navigate between modules from the top navigation bar.
_Avoid_: section, onglet, page

**KYF (Know Your Farmer)**:
The Tolbi module that stores, manages, and traces producteurs. The ID module is the entry point for populating KYF.
_Avoid_: ID module (that is the UI section name, not the domain concept)

**Liste de producteurs de KYF**:
The populated state of KYF — the full list of producteurs registered after one or more imports. What an operator consults to view, search, and manage their producteur base.
_Avoid_: registre de fournisseurs, base KYF, base de données

**Import de producteurs**:
The multi-step flow for adding producteurs via file upload. Steps: choose method → upload files → traitement → finalisation.
_Avoid_: import de fournisseurs, onboarding, ingestion

**Traitement**:
The automated step where uploaded files are matched against the Tolbi data model (column concordance + row-level validation). Produces a MatchingResult.
_Avoid_: processing, analyse, matching (use only when referring specifically to column mapping)

**Finalisation**:
The terminal step of an import de producteurs, triggered when the user confirms after reviewing the traitement results. Represents the point of no return — data is committed to KYF.
_Avoid_: confirmation, validation, import final

**MatchingResult**:
The output of a traitement: a column concordance table, row-level errors and warnings, and aggregate counts (matched producteurs, surface area).
_Avoid_: résultat, rapport
