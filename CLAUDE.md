# Tolbi Trace — Contexte projet

Lis ce fichier en entier avant de commencer à travailler. Il contient tout ce qu'il faut savoir sur le produit, les décisions de design, et les conventions du projet.

---

## Ce qu'on construit

**Tolbi Trace** est le module de traçabilité supply chain agricole de Tolbi OS. Il permet à des agroindustriels de suivre le parcours de sacs de produits agricoles (maïs, coton, cacao…) depuis le champ du producteur jusqu'à leur entrepôt.

Le problème central : entre le champ et l'entrepôt, des dizaines d'événements se passent — pesée, contrôle qualité, transport, déchargement. Aucun n'est capturé de manière structurée, liée et vérifiable. Trace transforme chaque événement en donnée traçable, reliée à un sac, un acteur, un moment.

**Le fil conducteur du système : le QR code du sac.** Chaque scan crée un nœud dans le graphe — reliant le sac, l'étape, l'agent, le moment, et les données collectées.

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

## Principes de design

Ces règles gouvernent chaque décision d'interface. En cas de doute sur un choix UI, reviens ici.

1. **Le réseau est une exception, pas un prérequis.** Mobile fonctionne offline. Sync silencieuse au retour du réseau. Jamais d'état bloquant pour cause de réseau.

2. **On montre l'état, pas les données.** Dashboard : état → tendance → détail. Pas de tableaux bruts en premier écran.

3. **On ne bloque jamais le flux pour un cas isolé.** Anomalie = signalée + documentée, pas bloquante. 1 QR illisible sur 40 : on valide les 39.

4. **La configuration appartient au web, l'exécution appartient au mobile.** Aucune modification de workflow possible sur mobile.

5. **Le processus est le point d'entrée, le sac est le point d'arrivée.** Navigation : workflow → étapes → sacs. Jamais l'inverse comme mode principal.

6. **Trace est un moteur, pas un template.** Aucun workflow pré-configuré imposé. Les briques sont flexibles, chaque client assemble son propre processus.

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

## Stack et conventions

```
Framework      Next.js (App Router)
UI components  Shadcn/ui + Radix UI
Styling        Tailwind CSS
Workflow UI    React Flow (builder canvas)
Graph viz      Cytoscape.js ou D3-force (visualisation sacs)
State          Zustand
Data mock      JSON statique dans /data/
```

**Conventions de code :**
- Composants en PascalCase, fichiers en kebab-case
- Un composant par fichier
- Les données mock dans `/data/` — jamais hardcodées dans les composants
- Les types TypeScript dans `/types/`
- Tutoiement dans tous les labels et messages UI (pas "Vous", "Tu")

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

---

## Fichiers de référence

Pour aller plus loin sur un point :

- `/docs/tolbi-trace-briefing.md` — briefing complet (benchmark, architecture détaillée, matrice utilisateurs)
- `/docs/tolbi-project-context.md` — contexte global Tolbi OS (voix, audiences, tous les modules)

---

## Par où commencer

Commence toujours par la **Section A — Configurer** (workflow builder) avant le dashboard. C'est la partie la plus complexe et la plus différenciante du produit. Le dashboard observe des données produites par le workflow builder — construire dans cet ordre est plus cohérent.

Ordre suggéré :
1. Layout global + navigation
2. Liste des projets / workflows
3. Canvas workflow builder (React Flow)
4. Panneau de configuration d'une étape
5. Dashboard principal (Section B)
6. Vue graphe (Cytoscape / D3)
7. Détail d'un sac
