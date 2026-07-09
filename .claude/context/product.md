# Tolbi OS — Contexte produit

> **Rôle de ce fichier — la vision produit (le _quoi_ et le _pourquoi_).** Vision, positionnement, architecture fonctionnelle, profils, principes de design, scénario de démo. Le *vocabulaire canonique* (définition exacte de chaque terme et module) vit dans le glossaire [`CONTEXT.md`](../../CONTEXT.md) ; les *règles* d'ingénierie dans [`CLAUDE.md`](../../CLAUDE.md). En cas de divergence sur un terme, **le glossaire fait foi** : ce fichier décrit, il ne définit pas le vocabulaire.

## Ce qu'on construit

**Tolbi OS** est une plateforme de données agricoles couvrant l'intégralité de la chaîne de valeur agricole — de l'identité du producteur aux crédits carbone. On construit l'ensemble du produit, module par module. Le point de départ a été Source et ID ; d'autres modules suivront.

**Le problème central que Tolbi résout :** entre le champ du producteur et les décisions des acteurs agricoles (coopératives, agroindustriels, banques), il n'y a aujourd'hui aucune donnée structurée, liée et vérifiable. Tolbi OS transforme chaque événement terrain en donnée traçable, exploitable et conforme.

## Modules en cours dans ce repo

| Module | Focus actuel |
|---|---|
| **TOLBI ID** | Identités numériques producteurs, import, matching, KYF |
| **TOLBI Source** | Premier kilomètre : workflows, QR codes, sacs, étapes terrain |

> Note : Le repo a démarré sous le nom "Tolbi Trace" — c'est TOLBI Source qui a été prototypé en premier. TOLBI Trace (conformité EUDR, analyse déforestation) est un module distinct, à venir.

## Fil conducteur de Source : le QR code du sac

Chaque scan crée un nœud dans le graphe — reliant le sac, l'étape, l'agent, le moment, et les données collectées.

## Position de Source dans l'OS

Source collecte les données opérationnelles qui alimentent les autres modules :
- **TOLBI Trace** — analyse le risque déforestation (EUDR) sur ces parcelles
- **TOLBI Yield** — prédit les volumes de production
- **TOLBI Carbone / Forest+** — mesure l'impact environnemental

---

## Positionnement & différenciation

**Ce que Tolbi OS est :** un data layer agricole — pas un outil de gestion.

**La différenciation :** Tolbi est le seul acteur qui combine des données enrichies par satellite (cultures, rendements, fertilité, déforestation) et les restitue sous forme exploitable à des acteurs radicalement différents — du gestionnaire de coopérative au hedge fund qui arbitre sur les marchés agricoles.

**Ce que Tolbi n'est pas :** un ERP agricole, un outil de collecte générique, un dashboard RSE.

---

## Tolbi OS — vue d'ensemble

Tolbi OS est une plateforme de données agricoles à 11 modules, vendue à 3 segments de clients.

| Module | Proposition de valeur | Catégorie |
|---|---|---|
| **TOLBI ID** | Identités numériques des producteurs, lien producteur-terre | 🏗️ Socle |
| **TOLBI INA** | Credential producteur au-dessus de ID : carte QR, Wallet TOLBI, registre de transactions | 🪪 Credential |
| **TOLBI Scan** | Visualisation satellite des cultures (quoi, où, quelle surface) | 🗺️ Visibilité |
| **TOLBI Data OS** | Collecte de données terrain mobile, offline-first (ex-Survey) | 📱 Terrain |
| **TOLBI Yield** | Prévision volumes de production via satellites | 📈 Performance |
| **TOLBI Call** | Messages vocaux automatisés aux producteurs (conseils, météo, alertes) | 📞 Communication |
| **TOLBI Source** | Premier kilomètre : pesée, paiement, conformité bord-champ | ⚙️ Opérations |
| **TOLBI Trace** | Analyse risque déforestation pour conformité EUDR | 🌳 Conformité |
| **TOLBI Monitor** | Fertilité des sols, anticipation des risques de maladie | 🔬 Agronomie |
| **TOLBI Carbone** | MRV (mesure, report, vérification) émissions — crédits carbone | 🌍 Environnement |
| **TOLBI Forest+** | REDD+ crédits carbone forestiers | 🌍 Environnement |

> **Data OS = ex-Survey.** Survey et l'ancien concept « DataOS — API de données brutes pour la finance » ont fusionné en un seul module (`Data OS`) ; le nom courant en UI est **Data OS**, « Survey » ne survit qu'en code/liste de modules. **INA** est un ajout récent (couche credential sur ID), il ne faisait pas partie des 11 modules d'origine. Définitions canoniques : voir [`CONTEXT.md`](../../CONTEXT.md).

**TOLBI ID est le socle.** Aucun autre module ne fonctionne sans identité producteur.

### Segments clients

| Segment | Modules clés | Mode de consommation |
|---|---|---|
| **Coopératives** | ID, Scan, Data OS, Yield, Call, Source, Trace, Carbone, Forest+ | SaaS — gestion des membres |
| **Agroindustriels** | ID, Scan, Source, Trace, Yield, Monitor, Data OS, Call, Impact, Forest+ | SaaS — supply chain & conformité |
| **Hedge Funds / Banques** | Yield, Scan, Trace, Source | API — données alternatives pour trading & risque |

---

## Architecture fonctionnelle — 3 zones

| Zone | Surface | Qui | Quoi |
|---|---|---|---|
| **Configurer** | Web | Responsable ops, Admin | Créer workflows, configurer étapes, assigner agents |
| **Exécuter** | Mobile | Agents terrain | Scanner sacs, remplir formulaires, valider étapes |
| **Observer** | Web | Responsable ops | Suivre en temps réel, visualiser graphe, exporter |

**Règle fondamentale :** le web configure et observe. Le mobile exécute. Ces deux surfaces ne se mélangent pas.

---

## Modèle de données — logique graphe

Les données sont structurées en graphe (GraphML). Pas des formulaires qui s'enregistrent en base relationnelle — des événements qui créent des relations entre nœuds.

**Nœuds :** `Sac` · `Producteur` · `Coopérative` · `Étape` · `Agent` · `Événement`

**Relations :** `Sac → Producteur` (origine) · `Sac → Étape` (via scan) · `Événement → Agent` (qui) · `Événement → Timestamp` (quand) · `Étape → Étape` (séquence workflow)

---

## Profils utilisateurs — interface web

Tolbi n'a pas d'utilisateurs internes (pas d'admin Tolbi). Tous les utilisateurs sont côté client.

| Profil | Peut venir de | Surface principale | Question permanente |
|---|---|---|---|
| **Responsable des opérations** | Coopérative ou Agroindustriel | Web — configure + observe | "Est-ce qu'il y a un problème quelque part ?" |
| **Administrateur** | Coopérative ou Agroindustriel | Web — gestion des accès, imports | "Les données sont-elles à jour ?" |
| **Agent terrain** | Coopérative ou Agroindustriel | Mobile uniquement | "Quelle est ma prochaine action ?" |
| **Producteur** | — | Passif (destinataire QR, Call) | — |

**Le Responsable ops** surveille plusieurs workflows en parallèle depuis un bureau, consulte l'interface plusieurs fois par jour. Son besoin premier : détecter les anomalies et blocages sans chercher. Il ne saisit pas de données — il observe, valide, et remonte les problèmes.

**L'Agent terrain** est debout, souvent sous le soleil, avec un téléphone d'entrée de gamme, parfois une seule main disponible. Il revient à l'écran uniquement pour valider une étape. La connectivité est intermittente — l'app doit fonctionner offline.

---

## Principes de design

1. **Le réseau est une exception, pas un prérequis.** Mobile fonctionne offline. Sync silencieuse au retour du réseau. Jamais d'état bloquant pour cause de réseau.
2. **On montre l'état, pas les données.** Dashboard : état → tendance → détail. Pas de tableaux bruts en premier écran.
3. **On ne bloque jamais le flux pour un cas isolé.** Anomalie = signalée + documentée, pas bloquante.
4. **La configuration appartient au web, l'exécution appartient au mobile.** Aucune modification de workflow possible sur mobile.
5. **Le processus est le point d'entrée, le sac est le point d'arrivée.** Navigation : workflow → étapes → sacs.
6. **Trace est un moteur, pas un template.** Aucun workflow pré-configuré imposé.

---

## Périmètre actuel — surface web uniquement

### Section A — Configurer (workflow builder)
- Liste des projets et workflows
- Canvas de création de workflow (étapes ordonnées, connectables)
- Panneau de configuration d'une étape (nom, questions, agents assignés)
- Types de questions : texte, nombre, date, sélection, producteur, sac/QR (batch scan)
- Gestion des QR codes (génération avec préfixe, attribution producteur/coopérative)

### Section B — Observer (dashboard + visualisation)
- Dashboard principal : progression par étape, alertes, sacs en attente, agents actifs
- Vue graphe : visualisation réseau nœuds/relations, temps réel
- Vue tableau : données filtrables (date, étape, agent, statut)
- Détail d'un sac : historique complet, tous les événements liés
- Export : PDF / CSV / GraphML

---

## Scénario de démo — fil rouge

Toutes les données mock doivent correspondre à ce scénario :

**Processus :** Collecte maïs — campagne novembre 2025
**Client :** AgroSénégal SA
**Coopérative :** Coopérative Kaolack Maïs (12 producteurs)
**QR codes :** préfixe `KLK-2025-` · 48 sacs au total

**Workflow — 5 étapes :**
1. Collecte chez le producteur → agent : magasinier coopérative
2. Pesée et contrôle humidité → agent : responsable qualité
3. Chargement transport → agent : transporteur
4. Réception entrepôt → agent : magasinier agroindustriel
5. Contrôle qualité final → agent : responsable qualité

**Répartition des sacs :**
- 20 sacs → complétés (étape 5 validée)
- 15 sacs → en cours (étapes 2-3)
- 10 sacs → en attente (étape 1)
- 3 sacs → anomalies signalées

---

## Direction UI

- Interface de **travail**, pas de vitrine. Dense, lisible, fonctionnelle.
- **Couleur primaire Tolbi :** vert `#1D9E75`
- **Statuts sac :** vert (complété) · orange (en cours) · rouge (anomalie) · gris (en attente)
- **Nœuds graphe :** couleur par type d'entité — sac, étape, agent, producteur
- Pas de gradients décoratifs. Pas de glassmorphism. Interface plate et nette.
- Langue de l'interface : **français**. Tutoiement.
