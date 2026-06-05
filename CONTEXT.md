# Tolbi Trace

Tolbi Trace is the web platform for managing and tracing agricultural supply chains. It provides tools for onboarding farmers, mapping parcels, and auditing data quality across cooperatives.

## Language

### Actors

**Producteur** (EN: Farmer):
A farmer registered in the KYF module, linked to a cooperative. Represents one row in an imported file.
_Avoid_: fournisseur (different profile — see below), agriculteur, supplier

**Fournisseur** (EN: Buyer):
The agroindustrial organization (e.g. AgroSénégal SA) that receives agricultural sacs at the warehouse end and uses the platform to observe and verify the supply chain. A Fournisseur is the tenant of a workspace — not a graph node. All data in a workspace (Coopératives, Producteurs, Sacs, workflows) implicitly belongs to its Fournisseur. The users who log in (Responsable ops, Admin) work on behalf of the Fournisseur.
_Avoid_: client, acheteur (in domain context), producteur

**Coopérative**:
The organization that submits producteur data to the platform on behalf of its members.
_Avoid_: client, partenaire (in domain context)

### Modules & Features

**Module Tolbi**:
A self-contained business capability within Tolbi OS (ex: ID, Source, Trace). Each module has a distinct domain and entry point. Operators navigate between modules from the top navigation bar.
_Avoid_: section, onglet, page

**Tolbi OS**:
The full product platform — 11 modules covering the agricultural value chain from farmer identity to carbon credits. Sold to three segments: Coopératives, Agroindustriels, and Hedge Funds/Banques (via API).
_Avoid_: app, plateforme (trop générique)

**TOLBI ID** (ex: KYF — Know Your Farmer):
The foundation module. Creates digital identities for producteurs and maps the link between each farmer and their land. Required by all other modules — no other module works without it.
_Avoid_: KYF (internal/legacy name), fournisseur module

**TOLBI Source** (ex: Procurement):
The "premier kilomètre" operations module. Makes every field-side transaction visible, tamper-proof and compliant — from weighing to producer payment. Built around configurable workflows, QR-coded sacs, and mobile offline execution by field agents.
_Avoid_: Trace (that is a different module), procurement

**TOLBI Trace** (ex: EUDR):
The compliance module. Automatically analyses deforestation risk on parcelles to guarantee access to the European market (EUDR regulation). Distinct from Source — Trace analyses the data, Source collects it.
_Avoid_: confusing with Source; they are different modules with different purposes_

**KYF (Know Your Farmer)**:
Legacy internal name for what is now TOLBI ID. Still used in code and database references.
_Avoid_: using in new UI copy or documentation — use "TOLBI ID" or "producteurs" instead

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
