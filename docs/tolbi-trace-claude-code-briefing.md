# Tolbi Trace — Briefing Prototype Web
### Document de handoff pour Claude Code
> Construit en mai 2026. Contient tout le contexte nécessaire pour prototyper le module Trace de Tolbi OS.

---

## 1. Contexte produit

**Tolbi** est une startup sénégalaise climate-agtech fondée en 2020. Siège à Dakar, présence à Abidjan et San Francisco. Mission : contribuer à la sécurité alimentaire en Afrique via l'agriculture de précision — IA, télédétection satellitaire, données terrain.

**Tolbi OS** est un système modulaire à 8 modules couvrant la chaîne agricole complète. Le module à prototyper est **Tolbi Trace** — la traçabilité supply chain agricole.

---

## 2. Problem Statement

> *Entre le champ du producteur et l'entrepôt de l'agroindustriel, il se passe des dizaines d'événements — pesée, contrôle qualité, transport, déchargement. Aucun de ces événements n'est aujourd'hui capturé de manière structurée, liée et vérifiable. Trace transforme chaque événement en donnée traçable, reliée à un sac, un acteur, un moment.*

**Concrètement :** un agroindustriel qui source auprès de centaines de producteurs dispersés ne peut pas répondre à une question simple — ce sac, d'où il vient, qui l'a touché, dans quel état ? Trace rend cette question répondable à n'importe quel moment de la chaîne.

---

## 3. Benchmark — ce qui existe et ce qui manque

### Acteurs directs
| Acteur | Force | Limite |
|---|---|---|
| **TraceX** (Inde) | End-to-end, offline mobile | Blockchain inutile pour l'user, conçu pour l'Inde |
| **Sourcemap** (MIT) | Visualisation réseau, multi-tiers | Enterprise occidental, pas pensé terrain africain |
| **SourceTrace** (global) | Terrain-first, QR/barcode, batch | UX datée, pas de workflow builder |
| **Mastercard Provenance** (Afrique) | RFID Africa, trail tamper-proof | Propriétaire, non configurable |

### Références UX/UI retenues
| Référence | Ce qu'on prend |
|---|---|
| **n8n / Retool** | Canvas workflow builder — nodes connectables, drag & drop |
| **Kumu / Gephi** | Visualisation graphe — nodes colorés par type, layout force-directed |
| **Linear / Incident.io** | Dashboard opérationnel — état d'abord, données ensuite |
| **ODK Collect / KoboToolbox** | Mobile offline-first — collecte terrain contrainte |

### L'espace à occuper
Aucun acteur ne combine aujourd'hui :
- Workflow builder configurable
- Visualisation graphe temps réel
- Mobile offline-first en contexte africain

C'est l'espace de Tolbi Trace.

---

## 4. Architecture fonctionnelle

Trois zones fonctionnelles reliées par le QR code comme fil conducteur central.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CONFIGURER    │────▶│    EXÉCUTER     │────▶│    OBSERVER     │
│   Web · avant   │     │  Mobile · pdt   │     │  Web · pdt/après│
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ Créer workflow  │     │ Scanner sacs    │     │ Suivi temps réel│
│ Configurer      │     │ Remplir         │     │ Interroger sac  │
│  étapes         │     │  formulaires    │     │ Exporter /      │
│ Assigner agents │     │ Valider étapes  │     │  analyser       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
          │                      │                      │
          └──────────────────────┴──────────────────────┘
                                 │
                    ┌────────────────────────┐
                    │   QR CODE — FIL        │
                    │      CONDUCTEUR        │
                    │                        │
                    │ Chaque scan = 1 nœud   │
                    │ dans le graphe         │
                    │ Sac · étape · agent ·  │
                    │ moment · données       │
                    └────────────────────────┘
```

### Modèle de données — logique graphe
Le cœur du système est un **graphe de données**. Chaque entité est un nœud, chaque interaction est une relation.

**Nœuds principaux :**
- `Sac` — identifié par son QR code, unité de traçabilité centrale
- `Producteur` — origine du sac
- `Coopérative` — regroupe des producteurs
- `Étape` — point du workflow (pesée, contrôle qualité, transport, réception...)
- `Agent` — utilisateur qui valide une étape
- `Événement` — action enregistrée à une étape (scan, formulaire rempli)

**Relations :**
- `Sac → Producteur` : origine
- `Sac → Étape` : via événement de scan
- `Événement → Agent` : qui a fait l'action
- `Événement → Timestamp` : quand
- `Étape → Étape suivante` : séquence du workflow

---

## 5. Matrice utilisateurs × surfaces

| Profil | Zone principale | Surface | Accès |
|---|---|---|---|
| Responsable des opérations | Configurer + Observer | Web | Full |
| Administrateur | Configurer + gestion QR codes | Web | Full |
| Responsable qualité | Observer + valider | Web + Mobile | Lecture + validation |
| Magasinier (agroindustriel) | Exécuter | Mobile | Étapes assignées uniquement |
| Magasinier (coopérative) | Exécuter | Mobile | Étapes assignées uniquement |
| Transporteur | Exécuter | Mobile | Étapes assignées uniquement |
| Producteur | Passif | — | Destinataire QR |

---

## 6. Principes de design

Ces principes sont les règles de décision du produit. Chaque choix d'interface doit pouvoir se justifier par l'un d'eux.

### P1 — Le réseau est une exception, pas un prérequis
L'app mobile fonctionne entièrement offline. La synchronisation est un événement de fond, jamais un bloquant. On n'affiche jamais d'état d'erreur réseau comme bloquant sur mobile — on enregistre localement, on sync silencieusement au retour de connexion.

### P2 — On montre l'état, pas les données
Le dashboard part de ce qui compte — avancement global, alertes, blocages. Le détail est accessible, jamais imposé. Hiérarchie : état → tendance → détail. Pas de tableaux de données brutes en premier écran.

### P3 — On ne bloque jamais le flux pour un cas isolé
Une anomalie est signalée et documentée, elle n'arrête pas le travail. Un QR illisible dans un batch de 40 : on valide les 39, on signale le 1. L'exception ne devient pas un bloquant global.

### P4 — La configuration appartient au web, l'exécution appartient au mobile
Aucune option de modification de workflow sur mobile. Les agents suivent le processus, ils ne le reconfigurent pas. Si problème de configuration → remontée au Responsable.

### P5 — Le processus est le point d'entrée, le sac est le point d'arrivée
Navigation : workflow → étapes → sacs. Jamais l'inverse comme mode principal. La recherche par QR code direct est secondaire.

### P6 — Trace est un moteur, pas un template
Aucun workflow pré-configuré imposé. La plateforme fournit les briques, chaque client assemble son propre processus. Interface de création suffisamment flexible pour couvrir maïs, coton, cacao… sans dérouter l'utilisateur.

---

## 7. Périmètre du prototype web — surface à construire

Le prototype couvre la **surface web** uniquement (pas mobile pour cette phase). Deux grandes sections :

### Section A — Configurer (workflow builder)

**Objectif UX :** permettre au Responsable des opérations de designer son processus de traçabilité sans aide technique.

**Écrans à prototyper :**
1. **Liste des projets / workflows** — vue d'ensemble des processus configurés
2. **Création d'un workflow** — canvas ou liste ordonnée d'étapes
3. **Configuration d'une étape** — panneau latéral : nom, type de validation, questions, agents assignés
4. **Types de questions supportés :**
   - Texte libre
   - Nombre (pesée, quantité)
   - Date / heure
   - Sélection (liste déroulante)
   - Producteur (sélection dans la liste des producteurs)
   - Sac / QR code (interface de scan — batch scanning)
5. **Gestion des QR codes** — génération avec préfixe, attribution à producteur/coopérative

**Interactions clés :**
- Ajouter / réordonner / supprimer une étape
- Ouvrir le panneau de config d'une étape
- Assigner un ou plusieurs agents à une étape
- Sauvegarder le workflow

### Section B — Observer (dashboard + visualisation)

**Objectif UX :** donner au Responsable une lecture immédiate de l'état de sa chaîne, avec la capacité de descendre dans le détail.

**Écrans à prototyper :**
1. **Dashboard principal** — état global du workflow actif : progression par étape, alertes, sacs en attente, agents actifs
2. **Vue graphe** — visualisation réseau des nœuds (sacs, étapes, agents) et leurs relations, mise à jour temps réel
3. **Vue tableau** — même données en format tabulaire filtrable (date, étape, agent, statut)
4. **Détail d'un sac** — panneau ou page : historique complet du sac, tous les événements liés, données collectées à chaque étape
5. **Export** — téléchargement PDF / CSV / GraphML du diagramme ou des données

---

## 8. Direction UI — identité visuelle Tolbi

### Voix et ton
Tolbi parle comme **un partenaire technique africain qui connaît le terrain, maîtrise la donnée, et sait que chaque décision agricole compte.** Concret, précis, orienté décision. Pas corporate, pas condescendant.

**Tutoiement** pour tous les profils métier dans l'interface.

### Direction visuelle
- **Pas un SaaS américain générique** — assumer l'ancrage africain dans les choix de design
- Interface **dense et lisible** — les Responsables ops travaillent sur de vraies données, pas des maquettes vides
- **Couleurs fonctionnelles** — les couleurs encodent du sens (statut sac, type de nœud, niveau d'alerte), pas de la décoration
- **Typographie nette** — interface de travail, pas d'editorial

### Suggestions de palette
- Fond : blanc ou gris très clair (interface de travail)
- Couleur primaire Tolbi : vert agriculture (`#1D9E75` ou approché)
- Statuts : vert (complété), orange (en cours), rouge (bloqué/anomalie), gris (en attente)
- Graphe : nœuds colorés par type d'entité (sac, étape, agent, producteur)

### Composants clés à soigner
- **Node du graphe** : forme + couleur claire selon le type d'entité
- **Card de sac** : QR code visible, statut, dernière étape validée, agent
- **Step indicator** : barre de progression du workflow avec statut par étape
- **Batch scan UI** : interface de scan multiple — compteur, liste des sacs scannés, erreurs en orange

---

## 9. Stack technique recommandée pour le prototype

- **Framework :** React (Vite) ou Next.js
- **Graphe visualization :** React Flow (workflow builder) + Cytoscape.js ou D3-force (visualisation réseau sacs)
- **UI components :** Shadcn/ui ou Radix UI (accessible, composable)
- **State management :** Zustand
- **Données mock :** JSON statique simulant un workflow maïs avec ~50 sacs, 5 étapes, 3 agents
- **Offline simulation :** localStorage pour la démo mobile (si abordé)

---

## 10. Données de démo — scénario fil rouge

Pour rendre le prototype réaliste, utiliser ce scénario concret tout au long :

**Processus :** Collecte de maïs — campagne novembre 2025
**Client :** Agroindustriel fictif "AgroSénégal SA"
**Workflow :** 5 étapes
1. Collecte chez le producteur (agent : magasinier coopérative)
2. Pesée et contrôle humidité (agent : responsable qualité)
3. Chargement transport (agent : transporteur)
4. Réception entrepôt (agent : magasinier agroindustriel)
5. Contrôle qualité final (agent : responsable qualité)

**Données :**
- 12 producteurs (coopérative "Coopérative Kaolack Maïs")
- 48 sacs avec QR codes (préfixe `KLK-2025-`)
- Statuts variés : 20 sacs complétés (étape 5), 15 en cours (étapes 2-3), 10 en attente (étape 1), 3 avec anomalies

---

*Fin du briefing. Ce document couvre tout le contexte nécessaire pour prototyper la surface web de Tolbi Trace.*
