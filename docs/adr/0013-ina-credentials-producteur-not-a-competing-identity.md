# INA credentials the Producteur — it is not a competing identity

The INA spec calls INA "la couche d'identité transverse" of Tolbi OS. Taken
literally that would demote [[TOLBI ID]], which product.md names the identity
**socle** ("aucun module ne fonctionne sans identité producteur"). We resolve the
tension the other way: **[[TOLBI INA]] is a distinct module layered *on top of*
[[TOLBI ID]]**, not a replacement. ID keeps *who the producteur is* (profil +
[[Parcelle]]s); INA owns the *verifiable credential and money/traceability layer*
— the [[Carte INA]], the [[Numéro INA]], the [[Wallet TOLBI]] and INA
[[Transaction (INA)|transactions]] — and references the [[Producteur]] by id. INA
is a **new entry** in the catalogue (not one of the original 11 in product.md).

## Decisions

- **Producteur `1 — 0..1` [[Identité INA]]; an Identité INA cannot exist without a
  Producteur.** A producteur can live in ID with no INA. The [[Numéro INA]] is
  minted at **INA enrolment** (from a producteur already in the ID list, or one
  freshly collected in the field), **not** at producteur creation — even though
  the mock currently fills `Producteur.ina` for everyone.
- **Numéro INA is stable per producteur (Model A), never re-issued.** The
  [[Carte INA]] is the revocable QR-token layer, relation **`1..N`** on the
  identity: revoking a lost/stolen card and issuing a new one preserves the
  Numéro, the identity and the full history.
- **Cards are pre-provisioned blank (option A2).** Blank [[Carte INA]]s are printed
  in a [[Lot INA]] with a QR token + a per-card [[Serial de carte]] *before* any
  producteur is known (this is what enables offline field enrolment). The
  **Numéro INA stays logical** (shown in-app / USSD / [[Woma]]), never pre-printed;
  the card's printed human fallback is the Serial de carte, which changes on
  reissue while the Numéro does not.
- **Émission lives in the client web app (option B).** Generating a [[Lot INA]] +
  print-export is operated by the [[Organisation]]'s [[Propriétaire]]/Admin. The
  spec's "Administrateur TOLBI" persona is mapped to a **client-side** org admin —
  Tolbi has no internal users (product.md). Global token uniqueness is assumed
  handled behind the seam.
- **Wallet + transactions are observation-only on web (option S2).** Transaction
  creation, USSD and [[Woma]] are mobile / non-web by nature. Web shows a
  read-only [[Transaction (INA)|registre]], a per-producteur [[Wallet TOLBI]]
  balance, and dashboard KPIs. **Planned↔realized correlation stays in
  [[TOLBI Source]]** (ex-Procurement): INA supplies the transactions bound to the
  ina_id, Source correlates them.

## Considered Options

- **INA absorbs TOLBI ID (one unified identity module) — rejected.** The spec
  header ("Module : INA / TOLBI ID") invites it, but it would rewrite the already-
  built ID module and contradict "ID is the socle". Keeping two modules with a
  clean id-reference boundary is cheaper and truer to the existing product.
- **Numéro printed per-card (Model B, faithful to the spec's jeton↔numéro
  pairing) — rejected** for a stable per-producteur Numéro (better UX, matches the
  existing `Producteur.ina` field). Cost: two readable identifiers coexist (stable
  Numéro INA vs per-card Serial), accepted as an audit-level detail.
- **Correlation engine inside INA (option S3) — rejected.** It overlaps and
  muddies the TOLBI Source boundary just drawn. Correlation is a Source concern.

## Consequences

- INA joins `src/data/modules.ts` and the module nav as a new module; it needs a
  brand icon (`DsModuleIcon` has no `INA` yet — fallback until one exists).
- `Producteur.ina` becomes genuinely optional (empty = no INA); UI must handle the
  no-INA state, not assume every producteur is carded.
- INA reuses the existing access model: it is a [[Module Tolbi]] with per-module
  [[Accès (module)]] levels (ADR-0010); émission is a sensitive action gated to
  Admin/[[Propriétaire]]. No new RBAC machinery.
- New INA entities are additive: [[Identité INA]], [[Carte INA]], [[Serial de
  carte]], [[Lot INA]], [[Wallet TOLBI]], [[Transaction (INA)]]. The credential is
  `1..N` on the identity; the Numéro/`ina_id` is the stable pivot.
