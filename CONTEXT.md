# Tolbi Trace

Tolbi Trace is the web platform for managing and tracing agricultural supply chains. It provides tools for onboarding farmers, mapping parcels, and auditing data quality across cooperatives.

## Language

### Actors

**Organisation**:
The tenant of the platform — the account that owns all data in a workspace (Coopératives-as-data, Producteurs, Sacs, workflows). "Organisation" is the user-facing term for what this glossary previously called the tenant. Comes in *types* matching the client segments: Agroindustriel (a [[Fournisseur]]), Coopérative, Hedge Fund/Banque. A [[User]] belongs to one or more Organisations and switches between them; each membership carries per-module [[Accès (module)]] (and possibly the [[Propriétaire]] flag). Everything under [[Paramètres]] that is not personal (members, abonnement, paiement, crédits) is scoped to the *currently-active* Organisation.
_Avoid_: workspace (code/internal only), entreprise, société, tenant (code-only); Fournisseur (that is now just one *type* of Organisation)

**User** (EN: User):
A person with a personal Tolbi account — email, password, profil, langue. Distinct from the [[Organisation]]: the same User can be a member of several Organisations and switch between them, carrying per-module [[Accès (module)]] (and possibly the [[Propriétaire]] flag) per membership. "Compte" in [[Paramètres]] = this User's personal account, identical across all their Organisations. The product "profils" in product.md are archetypes; concrete permission is the per-module [[Accès (module)]] plus the [[Propriétaire]] governance flag, not a separate login identity. A User's membership in an Organisation is a [[Collaborateur]]; the other [[Membre]] type, [[Agent]], is **not** a User (no personal account, mobile-only login).
_Avoid_: compte (that is the account, not the person), membre (that is now the umbrella; a User's membership is a [[Collaborateur]]), utilisateur as the entity name (ok in UI copy)

**Membre**:
The **umbrella** actor — anyone who belongs to an [[Organisation]]. Every Membre has a **type**: **[[Collaborateur]]** (logs into the web) or **[[Agent]]** (logs into the mobile app only). Agents *are* Membres — the type is what differentiates them (benchmarked against Deel/Zendesk, where "agents" are just team members with a type/role). Managed from [[Paramètres]] > Organisation as one **single "Membres" list** with a *Type* column + filter (Tous / Collaborateurs / Agents), not two separate rosters. US13-15.
_Avoid_: using "Membre" for the web type only (it is the umbrella — the web type is [[Collaborateur]]); "collaborateur" as a synonym of the umbrella; treating [[Agent]] as "not a Membre"

**Collaborateur**:
A [[Membre]] of type **web** — backed by a [[User]] (personal account: email, password). Logs into the **web** platform, holds per-module [[Accès (module)]] (and possibly the [[Propriétaire]] flag), works in the back-office (configures workflows, imports, observes). Identified by **email**, the login identifiant: set at invitation and **immutable** afterwards. The edit panel greys the email field out; to change it, remove the Collaborateur and re-invite. The same [[User]] is a Collaborateur of each Organisation they belong to. One of the two Membre types, alongside [[Agent]].
_Avoid_: membre (that is the umbrella — a Collaborateur is *one type* of Membre); utilisateur (that is the [[User]] entity behind the Collaborateur)

**Accès (module)**:
The permission model for a [[Collaborateur]] (web [[Membre]]) in an [[Organisation]], granted **per [[Module Tolbi]]** (not org-wide). [[Agent]]s have no module access (they are put on field work via [[Affectation]], a separate axis). For each module a Membre can reach, they hold exactly one *niveau d'accès* — **Lecteur** (read/observe only), **Éditeur** (create + modify inside that module), **Admin** (full control *within that module* — no org-wide power). Rendered in the Membres table as one badge per module (module identified by its icon, level by label + colour: Lecteur green, Éditeur amber, Admin red). A module the Organisation's plan doesn't include renders disabled in the access picker. This *replaces* the earlier single org-wide "Rôle" (Propriétaire/Admin/Responsable ops/Lecteur) — only [[Propriétaire]] survives, as a separate governance flag.
_Avoid_: rôle (retired as an org-wide level — access is per-module now); permission, droit; conflating module-**Admin** (in-module control) with [[Propriétaire]] (org governance)

**Affectation** (EN: Assignment):
Routes mobile collection work to an [[Agent]]: which [[Formulaire (Data OS)]]s (Data OS) and which workflow **steps** ([[TOLBI Source]]) show up in that agent's mobile app. A **separate axis from [[Accès (module)]]** — Accès is the *web/back-office* permission of a [[Collaborateur]]; Affectation is *field-work routing* for an [[Agent]], and never shows in the Membres "Accès" column. An Agent is affecté **from inside the module** (at a Source workflow step, or at a Data OS Formulaire), always by **selecting an existing agent from the org roster** — agents are never created there (creation stays in [[Paramètres]] > Organisation). Org-wide reusable: the same Agent can be affecté to many Formulaires and steps across modules.
_Avoid_: accès / permission / droit (Affectation is not the access axis); rôle; applying it to [[Collaborateur]]s (they hold [[Accès (module)]], not Affectation)

**Propriétaire**:
The single governance flag on an [[Organisation]] — its creator. Implicitly holds **Admin** [[Accès (module)]] on every module, and is the **sole** holder of org-level power: managing/inviting [[Membre]]s, billing (Abonnement + Paiement), and deleting the Organisation. One per org, transferable. Everyone else is defined purely by their per-module [[Accès (module)]] — a module-Admin has full control in that module but no org governance. Gates the Membres management actions and the Abonnement/Paiement tabs in [[Paramètres]].
_Avoid_: owner (UI copy is Propriétaire), Admin (that is now only a per-module access level, not an org rôle)

**Producteur** (EN: Farmer):
A farmer registered in the KYF module, linked to a cooperative. Represents one row in an imported file.
_Avoid_: fournisseur (different profile — see below), agriculteur, supplier

**Parcelle** (EN: Plot):
The agricultural plot linked to a [[Producteur]] — the "terre" of the producteur-terre link that [[TOLBI ID]] exists to map. A producteur has **1..N parcelles**; each parcelle is a **polygone** (a closed ring of points/sommets) carrying a surface in ha. The fichier géographique is the source of parcelle geometry at import, and fixing/attaching it is the job of [[Correction cartographique]]. ⚠️ **Never call a parcelle a "champ"** — in this codebase *champ* already means a **form field** (the "champs supplémentaires" of the manual-add form). The deck's "champ A" = **Parcelle A**.
_Avoid_: champ (that is a form field — hard collision), terrain, exploitation (the whole farm/holding, not one plot), plot (EN only)

**Fournisseur** (EN: Buyer):
One *type* of [[Organisation]] — the agroindustrial tenant (e.g. AgroSénégal SA) that receives agricultural sacs at the warehouse end and uses the platform to observe and verify the supply chain. No longer "the tenant" in the generic sense: the tenant concept is now [[Organisation]], and Fournisseur is one of its types (alongside Coopérative-as-tenant and Hedge Fund/Banque). Not a graph node. All data in its workspace (Producteurs, Sacs, workflows) belongs to the Organisation; the [[User]]s who log in hold a rôle (Responsable ops, Admin) within it.
_Avoid_: client, acheteur (in domain context), producteur; using as the generic tenant term (use [[Organisation]])

**Coopérative**:
The organization that submits producteur data to the platform on behalf of its members.
_Avoid_: client, partenaire (in domain context)

**Agent** (EN: Field agent):
A [[Membre]] of type **field** — a field worker who executes collection from the **mobile app only** (weighing, scanning, filling forms) and **never logs into the web**. Identified by their **phone number** (login), the identifiant: set at creation and **immutable** afterwards. The edit panel greys the phone field out; to change an agent's number, remove the Agent and re-add them. The **code à 4 chiffres** is **personal**: the agent creates it themselves on first mobile login — the web never sets it, generates it, nor shows it (so the Agent's "Accès" column stays empty in the Membres table). Sprint 18 shift: **one Agent = one person across the whole Organisation** (no longer one profile per form) who sees *all* the formulaires assigned to them — replacing the old per-execution-unit model (one Agent per [[TOLBI Source]] workflow / [[Formulaire (Data OS)]], each with its own [[Code PIN]]). Created/managed **only** by the [[Propriétaire]] from Paramètres > Organisation, in the same "Membres" list as [[Collaborateur]]s (type = Agent) — the per-module agent-management pages (Source "Équipe", Data OS Formulaire "Agents") are **removed**. Putting an agent on work is an [[Affectation]] (to Data OS [[Formulaire (Data OS)]]s and Source workflow steps), a separate axis from [[Accès (module)]].
_Avoid_: utilisateur, opérateur, collecteur; enquêteur (see [[Enquêteur]]); treating Agent as "not a Membre" (it is a Membre *type* now)

**Enquêteur**:
Not a separate actor — a display label used in Data OS's "Suivi des réponses" table for the [[Agent]] who collected a given response (columns "Nom / Prénom de l'enquêteur"). The canonical, page-level noun everywhere else (sidebar tab, header, empty states, `Projet.agents`) is **Agent**.
_Avoid_: promoting to a first-class entity, or using as the Agents-page title

**Code PIN** (retiré):
> ⚠️ **Retiré** (cf. ADR-0012) — remplacé par le **code personnel à 4 chiffres** de l'[[Agent]] : l'agent le crée lui-même à sa première connexion mobile, le web ne le génère, ne le régénère ni ne l'affiche jamais (cf. entrée [[Agent]]). Le paragraphe ci-dessous décrit l'**ancien** modèle (PIN géré depuis le web, unique tenant-wide), conservé pour comprendre l'historique.

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
The foundation module. Creates digital identities for producteurs and maps the link between each farmer and their land — it owns the **profil** (nom, téléphone, matricule…) and the [[Parcelle]]s. Required by all other modules. The *credential* layer that makes that identity portable and verifiable in the field (the physical [[Carte INA]], the [[Wallet TOLBI]], the transaction registry) is **not** ID: it is the separate [[TOLBI INA]] module, which references the [[Producteur]] by id.
_Avoid_: KYF (internal/legacy name), fournisseur module; treating the carte/wallet/transaction as an ID feature (that is [[TOLBI INA]])

**TOLBI INA** (Identité Numérique Agricole):
The identity-**credential** module, and a new entry in the Tolbi OS catalogue (not one of the original 11). Issues enrolled [[Producteur]]s an [[Identité INA]] — a [[Numéro INA]], a physical [[Carte INA]] (opaque QR token + [[Serial de carte]]) and a [[Wallet TOLBI]] — that proves their identity in the field, online or offline, and unlocks a traceable transaction registry. Distinct from [[TOLBI ID]]: ID owns *who the producteur is* (profil + [[Parcelle]]s), INA owns *the verifiable credential and the money/traceability layer* on top, referencing the Producteur by id. Does **not** introduce a competing identity — the [[Producteur]] stays the identity, INA credentials it, and a Producteur may have **no** INA at all.
_Avoid_: TOLBI ID (that owns the profil, not the carte); KYF; calling INA "the identity" in a way that demotes ID (ID stays the identity socle, INA credentials it); Wallet/Procurement as separate modules (they are surfaces of INA here)

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

**Bilan du traitement**:
The single, progressively-disclosed review surface shown when a [[Traitement]] completes — *état then détail on one screen, not two* (the benchmarked norm: HubSpot, Salesforce, Clay, ClickUp, Rox all do this). Leads with the état — a headline proportion (producteurs prêts vs à corriger) + a ventilation bucketed by fichier (Concordance · Géo · Excel), each carrying its own severities — sitting above the correction [[Détails du traitement|détail]]. From this same surface the operator corrects and triggers [[Finalisation]]. Replaces the old behaviour where a finished Traitement dropped the user straight into raw tables.
_Avoid_: tableau de bord (loaded — the Data OS row-level view and the Crédits surface); calling it a separate screen from the détail (it is one surface)

**Détails du traitement**:
The correction *détail* of the [[Bilan du traitement]] surface (below the état, same screen — not a place you navigate to). The fichier tables, filterable by validity (Tout / À corriger / Avertissements — the ClickUp/Rox pattern) so the operator isn't buried under every row. Column concordance and the Géo/Excel tables live here. The one thing that *does* leave this surface is map correction, which opens as a focused full-screen mode from a geo row.
_Avoid_: résultats du traitement; treating it as a screen navigated to from the Bilan

**Correction cartographique**:
The one focused, full-screen mode that leaves the [[Bilan du traitement]] surface — reached from a geo row that is *à corriger*. Hybrid, leaning **assign-and-clean** (not just shape-editing): the fichier géographique arrives as points/tracés that must be both **nettoyés** (aberrant sommets, invalid geometry) and **rattachés** to the right [[Parcelle]] / [[Producteur]], the IA suggesting the rattachement. Interaction modelled on Felt: a floating tool palette + a selected-point action menu (déplacer · importer un tracé · supprimer · lier à la parcelle · modifier les coordonnées) + a side properties panel.
_Avoid_: éditeur de carte; dessin/cartographie (that is the manual-add ManuelAjout flow — a different surface)

**Finalisation**:
The terminal step of an import de producteurs, triggered when the user confirms after reviewing the traitement results. Represents the point of no return — data is committed to KYF.
_Avoid_: confirmation, validation, import final

**MatchingResult**:
The output of a traitement: a column concordance table, row-level errors and warnings, and aggregate counts (matched producteurs, surface area).
_Avoid_: résultat, rapport

**Bloquant · À corriger · Avertissement · Information**:
The four severity levels a [[Traitement]] assigns to what it finds, surfaced in the [[Bilan du traitement]] ventilation (which is bucketed **by fichier**: Concordance · Géo · Excel, each carrying its own severities). **Bloquant** — a structural error (an expected column is missing) that stops *all* [[Finalisation]] until fixed. **À corriger** — a row-level rejet: the producteur can't be created as-is, but the valid producteurs finalise without it (set aside for correction). **Avertissement** — non-blocking (e.g. an empty field); the data imports as-is. **Information** — contextual, no effect (e.g. an unrecognised extra column). Severity is independent of fichier — a single fichier can carry both erreurs and avertissements.
_Avoid_: rejet (too harsh/technical for screen copy — it survives only in the export filename `rejets-import-….csv`); using erreur/avertissement interchangeably (severity is the whole point)

**Paramètres** (EN: Settings):
The single settings surface, reached from one entry point. Presented as **one flat tab bar** (Compte · Organisation · Abonnement · Paiement · **Préférences**). Two *scopes* still coexist underneath — **Personnel** tabs follow the [[User]] (Compte, Préférences — identical across all their Organisations) and **Organisation** tabs follow the currently-active [[Organisation]] (Organisation, Abonnement, Paiement — their contents change on org switch) — but the scope is conveyed by the self-explanatory tab labels and by the active org name shown in the Organisation section header, not by splitting the tab bar into two zones. (Supersedes the earlier "never a flat tab bar" rule — the flat bar is the accepted design as of Sprint 16/18.) **Préférences** is the personal 5th tab (notification + langue preferences); the two Figma frames disagreed (Compte frame said "Notifications") and Préférences won.
_Avoid_: Réglages, Settings (UI copy is Paramètres)

**Crédit**:
The consumption unit an [[Organisation]] spends to use Tolbi OS modules. Held as a per-Organisation balance (surfaced in the topbar pill, e.g. "32 crédits"), consumed per module. Two concerns, deliberately split: *consumption* monitoring (per-module breakdown, trend, metrics per projet/module) lives on a dedicated **Crédits** surface reached from the topbar pill — it is a dashboard, not a réglage; the *plan* (balance purchased, top-up) lives under Abonnement in [[Paramètres]] > Organisation.
_Avoid_: jeton, token, points; putting the consumption dashboard under Paramètres

### INA — carte, credential & flux

**Identité INA** (that a user calls "un INA"):
The identity-credential record [[TOLBI INA]] attaches to a [[Producteur]]: the stable pivot `ina_id` surfaced as a [[Numéro INA]], its [[Carte INA]](s) and its [[Wallet TOLBI]]. **1-1 with a Producteur and cannot exist without one**, while a Producteur has **0..1** Identité INA — a producteur can exist in [[TOLBI ID]] with no INA. Created either from a producteur **already in the ID list**, or from a producteur **freshly collected in the field** ([[Recensement de producteurs]]) then linked.
_Avoid_: treating an INA as independent of its [[Producteur]] (it needs one to exist); giving one Producteur several Identités INA (multiplicity lives on [[Carte INA]] 1..N, never on the identity)

**Numéro INA**:
The stable, human-readable public identifier of a [[Producteur]]'s [[Identité INA]] (e.g. `20054112`) — the surfaced form of the internal pivot `ina_id`. **Not assigned at producteur creation**: a Producteur can exist with no INA, and the numéro is minted only when the producteur is **enrolled into INA**. Once assigned it **never changes**, even across card reissues. A **logical** identifier: shown in the web/app, dictated over USSD/Woma — but **not** pre-printed on the card (the QR's printed fallback is the [[Serial de carte]]). This is the existing `Producteur.ina` field (empty for producteurs without INA).
_Avoid_: ina_id (internal name — the user-facing term is Numéro INA); [[Serial de carte]] (that is per-card and pre-printed; the Numéro is per-producteur, stable, logical); matricule (that is a coopérative-side code)

**Carte INA**:
The physical card bound to a [[Producteur]]: an **opaque QR token** (resolvable only via Tolbi OS, no personal data on the card) plus a pre-printed [[Serial de carte]] as the human fallback. **Pre-provisioned blank** inside a [[Lot INA]] — QR + serial printed at manufacture, before any producteur is known — then bound to a producteur at activation, which is what makes offline field enrolment possible. A producteur has **1..N cartes over time but one active at a time**: revoking a lost/stolen/damaged card and issuing a new one keeps the [[Numéro INA]], the identity and the full history intact (new QR token, new serial, **same** Numéro INA).
_Avoid_: credential (internal entity name — user-facing is Carte INA); badge; "QR code" for the whole card (the QR is only one part); printing the [[Numéro INA]] on the blank card (impossible — producteur unknown at print time)

**Serial de carte**:
The per-card, human-readable code pre-printed on a blank [[Carte INA]] at manufacture, alongside the opaque QR token. The fallback for resolving a card when its QR is unreadable. **Per-card, not per-producteur** — it changes every time a card is reissued, unlike the stable [[Numéro INA]]. Lives in the lot/carte inventory and the audit trail, rarely surfaced to end users.
_Avoid_: [[Numéro INA]] (that is the stable per-producteur identity number); token/jeton (the serial is the readable form; the jeton is the opaque QR payload)

**Lot INA**:
A batch of pre-provisioned blank [[Carte INA]]s generated together (a quantity + a préfixe on the [[Serial de carte]]s), then printed and distributed to the field. Each card in a lot carries a lifecycle status: *générée → imprimée → distribuée → associée → activée → révoquée*.
_Avoid_: calling the whole lot a "carte" (a lot holds many cartes); Administrateur TOLBI as its operator (Tolbi has no internal users — here the émission operator is the [[Organisation]]'s [[Propriétaire]]/Admin)

**Wallet TOLBI**:
The producteur's financial account, opened automatically when their [[Identité INA]] is activated (one Wallet per Identité INA). Holds a balance plus the traceable flows of a campaign (déboursements, intrants, prestations, transport, revente). Consulted by the producteur on mobile, over USSD (`#2222#`) or by [[Woma]] voice; on **web it is observation-only** — a per-producteur balance + totals by catégorie.
_Avoid_: portefeuille (UI copy is Wallet TOLBI, a brand term); compte bancaire (it is not one); [[Crédit]] (that is the Organisation's Tolbi-OS consumption unit — unrelated to a producteur's money)

**Transaction (INA)**:
A financial flow recorded against an [[Identité INA]]: carries `ina_id` (scoring/history) + `credential_id` (audit trail), a contrepartie, a montant, a catégorie (ressources agricoles / prestations / dépenses), a date, a géolocalisation and optionally a `qr_lot`. Created on mobile (online/offline, PIN-confirmed for critical ones); on **web it is observation-only** — a read-only registre feeding the [[Wallet TOLBI]] and the INA dashboard. Correlating *planned* vs *realized* transactions is **not** INA: that is [[TOLBI Source]]'s workflow engine (ex-Procurement); INA merely supplies the transactions rattachées to the ina_id.
_Avoid_: événement (the [[TOLBI Source]] graph-node concept — Sac/Étape/Agent — a different model); paiement (a Transaction is broader: intrants, prestations, transport…); putting planned/realized correlation in INA (that is Source)

**Woma**:
The voice channel a producteur uses to consult their [[Wallet TOLBI]] and services in wolof (for non-literate or smartphone-less producteurs). A **non-web consultation channel** like USSD — referenced by INA, not a surface this web repo builds.
_Avoid_: confusing with [[TOLBI Call]] (outbound automated voice messages — Woma is producteur-initiated consultation); treating it as a web screen
