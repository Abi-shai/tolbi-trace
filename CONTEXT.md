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

**Agent** (EN: Field agent):
A field worker who executes the steps of one workflow from the mobile app (weighing, scanning, filling forms). An Agent is scoped to a single workflow: the same person working on two workflows has two distinct Agent profiles. Created and managed from the web by the Responsable ops; never logs into the web.
_Avoid_: utilisateur, opérateur, collecteur

**Code PIN**:
A 4-digit code attached to a workflow-agent, unique across the whole Fournisseur (tenant) so it alone identifies the agent at mobile login. Used as the agent's personal credential to open their form on mobile without handling a URL. Belongs to exactly one Agent profile; can be regenerated from the web by the Responsable ops.
_Avoid_: mot de passe, code d'accès, token

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

**Projet (Data OS)**:
A generic data-collection container in Data OS. Holds one or more Formulaires and the data collected against them by field agents. **Untyped** — every Projet is a blank form-builder; there is no "recensement vs generic" kind at creation. Producteur-ness emerges purely from how the operator builds the form. **A Projet has no status of its own** — status lives on the [[Formulaire (Data OS)]]s it contains. The Data OS landing page is the list of Projets.
_Avoid_: workflow (that is a Source concept), campagne, conflating with Source "projet"

**Formulaire (Data OS)**:
The configurable form an operator builds inside a Projet to define what field agents collect. A Projet can hold several. **Status lives here, not on the Projet** — each Formulaire carries its own lifecycle/status.
_Avoid_: questionnaire, form, étape (Source concept)

**Analytiques (Data OS)**:
A tab inside a [[Formulaire (Data OS)]] that visualises the collected data as charts — one chart per question the operator selects from a multi-select "Questions" control. Each analysable question renders with its own default chart type (barre, circulaire, ligne), switchable per chart. Shows aggregate distributions and trends over the collection period, not individual rows.
_Avoid_: dashboard / tableau de bord (that is the row-level "Suivi des réponses" view), statistiques, reporting

**Recensement de producteurs**:
The Data OS use case where a Projet's Formulaire(s) collect producteur identity + parcelle mapping in the field. Collected data stays in Data OS until the Responsable ops explicitly **pushes** it into TOLBI ID — the two modules are decoupled, not a live write. Because a [[Projet (Data OS)]] is untyped, the push must map which collected fields are producteur identity / parcelle (a field-concordance step at push time, analogous to the import's [[Traitement]] — but on structured form data, not file columns). Entered from the [[Import de producteurs]] flow via "Lancer une collecte terrain".
_Avoid_: enregistrement, onboarding terrain

**TOLBI Data OS** (ex: Survey):
The field data-collection module — mobile, offline-first collection deployed to register producteurs and map their parcelles. Survey and the former "DataOS raw-data API" concept have merged into one module: Data OS *is* Tolbi Survey, same functionality and objective. Reached from the [[Import de producteurs]] flow via "Lancer une collecte terrain". "Survey" remains a legacy entry in the module list but the operator-facing name is now Data OS.
_Avoid_: Survey (legacy name — use in code/module-list only, never in new UI copy), DataOS as "raw-data API for finance" (that concept is gone)

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
