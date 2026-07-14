# Stratégie des tutos d'apprentissage — app mobile Tolbi

> **Périmètre.** L'app terrain Tolbi (`mobile/`, Expo / React Native) et ses [[Agent]]s : debout, sous le soleil, téléphone d'entrée de gamme, connectivité intermittente, français/wolof, lettrisme partiel (cf. `.claude/context/product.md`). Décision produit posée en amont : **le tuto vidéo est le format d'apprentissage central** — c'est ce qui fonctionne le mieux avec nos utilisateurs. Ce document couvre les quatre volets de la stratégie : le produit (où vivent les tutos), la production (comment on les fabrique), l'outillage IA (avec quoi), et l'organisation/diffusion (comment ils circulent).
>
> Vocabulaire : les termes de domaine utilisés ici suivent le glossaire `CONTEXT.md`. « Tutoriel » et « Formation » sont déjà la copy de l'app mobile mais pas encore des entrées du glossaire — les y ajouter fait partie des prochaines étapes.

---

## 1. Produit — la pile en couches

L'apprentissage in-app n'est pas un dispositif unique mais une pile, chaque couche servant un moment différent. Le benchmark (Mobbin, NN/g, Duolingo) montre que les apps de référence empilent ces patterns — elles ne choisissent pas entre eux.

| Couche | État dans l'app | Contenu |
|---|---|---|
| **Onboarding** (slides) | Existe (`SLIDES`, `mobile/data/tolbi.ts`) | Découverte produit à l'activation ; rejouable depuis le Profil |
| **Bibliothèque Formation** | Existe (`mobile/app/agent/formation.tsx`), à approfondir | Le catalogue de tutos ; « Ta formation » (filtrée par [[Affectation]]) en tête |
| **Panel d'aide contextuel** | À créer | Bottom-sheet « ? » sur les écrans de tâche : les tutos/chapitres pertinents pour l'écran courant + escalade « Appeler mon référent » |
| **Micro-instructions par étape** | À créer | Pattern des captures KYC (Turo, N26, Chime) : illustration + 2-3 consignes + audio wolof, par étape de formulaire (`FORM_STEPS`) |
| **Collecte d'entraînement** | À créer | Simulation guidée sur la vraie UI, façon DoorDash Dasher (« Ceci n'est pas une vraie collecte », étape 1/6) — l'outil de formation initiale principal, devant la vidéo |

Fondements : l'aide « just-in-time » est la seule qui est effectivement lue ([NN/g](https://www.nngroup.com/videos/just-in-time-help/)) ; Duolingo a remplacé le tour frontal par des tips au moment du geste — le *learn-by-doing* comme onboarding.

Écrans de référence (Mobbin) : [Beside — troubleshooting sheet contextuelle avec escalade humaine](https://mobbin.com/screens/54d7c728-46da-4d07-b36f-ba0558374a05) · [Instagram — explainer 3 puces iconographiques](https://mobbin.com/screens/4d14e12e-e576-4810-b67e-3ca29bf52f3c) · [DoorDash Dasher — mode entraînement](https://mobbin.com/screens/7850aac1-1da6-4f8b-a6a6-a2ce9e002fc7) · [Turo — capture guidée avec Help persistant](https://mobbin.com/screens/1594b20c-076b-4efd-b458-8692b7de05a0) · [Pinterest — réentrée après dismissal](https://mobbin.com/screens/72d4e2e7-94e3-468d-8fe1-091c1b1ee27c).

---

## 2. Production des vidéos — le guide en 8 volets

### A. Format canonique

- **1 vidéo = 1 tâche** (jamais « tout le module »). Cible **2-4 min**, plafond dur **6 min** : la plus grande étude d'engagement vidéo ([Guo, Kim & Rubin 2014](https://up.csail.mit.edu/other-pubs/las2014-pguo-engagement.pdf), 6,9 M de sessions) montre que l'engagement s'effondre au-delà, et que la durée pèse plus que la qualité de production.
- **Chapitrage aligné sur les étapes** de la tâche (ex. `FORM_STEPS` : Producteur → Stade → Photo → GPS → Parcelle) — les tutoriels se re-regardent par morceaux, pas linéairement.
- Deux genres à distinguer au storyboard : **geste app** (screencast du téléphone) et **geste métier** (tournage terrain réel). La plupart des tutos mélangent les deux.

### B. Des pairs à l'écran

Leçon centrale du corpus agricole Sud-Sud ([Digital Green](https://digitalgreen.org/tag/agriculture-extension/), [Access Agriculture / Van Mele 2018](https://assets.accessagriculture.org/s3fs-public/upload/files/Publications/Access%20Agriculture%20-%20Quality%20farmer%20training%20videos%20to%20support%20South-South%20learning%20-%20Van%20Mele%20et%20al%202018.pdf) — 6 000+ vidéos, 50+ langues locales) : les vidéos sont portées par **des agents et producteurs locaux réels**, pas des acteurs ni des formateurs urbains. Décor reconnaissable (Kaolack, Nioro, le magasin de la coop), matériel réel (téléphone d'entrée de gamme). La confiance vient de la reconnaissance d'un pair.

### C. Une langue = une version — jamais de sous-titres

- Chaque vidéo existe en **une version par langue** (VO française, VO wolof) — le modèle Digital Green / Access Agriculture, justifié par les principes de *modalité* et de *redondance* de [Mayer](https://educationaltechnology.net/mayers-principles-of-multimedia-learning/), et par un public partiellement lettré pour qui le sous-titre est inopérant.
- Conséquence de production : **zéro texte incrusté porteur de sens** dans l'image. Le sens passe par la voix ; le visuel montre. La version wolof = même piste vidéo, nouvelle piste audio — la localisation devient bon marché.

### D. Voice-over

- **Script écrit d'abord** (standard [TechSmith](https://www.techsmith.com/blog/voice-over/)) ; audio et écran enregistrés **séparément**, assemblés au montage.
- **Le script de VO est de la copy UI** : la gate lexicale de `CLAUDE.md` s'y applique intégralement — tutoiement (aligné sur le principe de *personnalisation* de Mayer), « Code PIN » jamais « code d'accès », « Parcelle » jamais « champ », vocabulaire vérifié dans `CONTEXT.md`.
- **La version wolof est une adaptation par un locuteur natif**, pas une traduction littérale.
- La voix dit ce que l'écran ne montre pas (l'intention, le piège), en même temps que l'action (*contiguïté temporelle*).

### E. Montage

- Ouverture ≤ 10 s : l'objectif en une phrase (« À la fin, tu sauras… »). Pas de jingle, pas de sommaire.
- **Signaling systématique** : zoom sur la zone active, halo/flèche sur le bouton, indicateur de tap visible — l'écran est regardé en plein soleil.
- **Rythme lent, pause après chaque action** : l'agent refait le geste en parallèle, téléphone dans une main.
- Cartons de chapitre (re-visionnables individuellement), **récap final de 15 s** avec les 2-3 points critiques.
- Rien de décoratif (principe de *cohérence*) : pas de musique sous la voix, pas d'animations gratuites.

### F. Specs techniques

| Paramètre | Valeur | Justification |
|---|---|---|
| Codec | **H.264 baseline profile** | Compatibilité maximale entrée de gamme ([réf.](https://www.lighterra.com/papers/videoencodingh264/)) |
| Distribution | **480p, ~700 kbps ≈ 5 Mo/min** | Tuto de 3 min ≈ 15 Mo ; pack module < 60 Mo ([réf.](https://www.videoproc.com/media-converter/bitrate-setting-for-h264.htm)) |
| Master | 720p | Archivage, réencodage futur |
| Format | Vertical 9:16 (screencasts) ; terrain 16:9 recadrable | Consommation in-app, téléphone vertical |

### G. Anti-péremption

La vidéo d'app se périme à chaque refonte d'écran. Parades : découpage par tâche (on ne re-tourne que la vidéo touchée) ; plans d'UI concentrés sur les écrans stables, générique porté par les séquences terrain ; **chaque vidéo porte la version d'app en métadonnée** ; la revue des tutos fait partie de la checklist de release d'un module.

### H. Modèle de données

`FORM_VIDEOS` (`mobile/data/tolbi.ts`) évolue vers un vrai catalogue :

```ts
interface Tutoriel {
  id: string
  module: string            // Collecte, INA, Trace, Yield…
  tache: string             // « Créer une collecte terrain »
  chapitres: Chapitre[]     // alignés sur les étapes de la tâche
  assets: Record<'fr' | 'wo', VideoAsset>  // une VO par langue
  tailleMo: number
  versionApp: string        // anti-péremption
  affectations?: string[]   // formulaires / étapes Source concernés
  ordreParcours?: number    // place dans le parcours nouvel agent
}
```

État local par agent : `{ téléchargé, progression par chapitre, terminé, qualitéPréférée }`. Les trois surfaces (Formation, panel d'aide, suivi web) consomment ce même catalogue.

---

## 3. Outillage IA — accélérer sans toucher aux invariants de confiance

Principe directeur : l'IA partout où elle accélère l'écriture, le montage et la maintenance — **jamais là où elle toucherait aux deux invariants** : des pairs réels à l'écran, une voix wolof crédible.

| Étape | Outil IA | Garde-fou |
|---|---|---|
| Script + storyboard | Claude, skill du repo (`.claude/skills/tuto-script/` à créer) avec en contexte les écrans réels, `CONTEXT.md`, `voice-and-tone.md` | Relecture humaine ; gate lexicale |
| Captation app | Flows scriptés rejouables (Maestro) → ré-capture en minutes après un changement d'UI | — |
| VO française | TTS / clonage de voix (ElevenLabs, Descript Overdub) — régénérer une phrase sans re-studio | Consentement écrit + rémunération si clonage |
| Traduction wolof | LLM en premier jet **seulement** | Révision native obligatoire |
| **VO wolof** | **Humaine** (agent/formateur reconnu — cohérent avec « des pairs à l'écran »). Offre TTS émergente ([Intron, 24 langues africaines dont wolof, mars 2026](https://www.itnewsafrica.com/2026/03/intron-launches-voice-ai-for-africa-with-24-languages/) ; [XTTS-v2 fine-tuné wolof](https://arxiv.org/html/2507.17578v1)) mais non prouvée au niveau d'une vidéo de formation | Pilote d'intelligibilité auprès de vrais agents avant toute adoption ; réévaluer sous 12-18 mois |
| Montage | [Descript](https://www.descript.com/) : édition par transcript, Studio Sound, sous-titres auto | Monter la version FR d'abord (transcript fiable), conformer le wolof sur la même timeline |
| QA | Passe LLM de conformité (lexique, durée, texte incrusté) + diff visuel flows Maestro vs tutos publiés, à chaque release | Intégrée à la checklist de release |

**Interdits** : avatars IA (Synthesia/HeyGen) à la place des pairs — contredit frontalement l'enseignement Digital Green ; wolof généré non validé par un natif ; B-roll généré décoratif (principe de cohérence).

**Économie de la chaîne** : l'IA écrase le coût de l'écriture, de la VO française, du montage et de la QA — ce qui libère le budget pour les deux étapes qui doivent rester chères parce qu'elles portent la confiance : le tournage terrain et la voix wolof.

---

## 4. Organisation & diffusion in-app

### Trois contextes d'usage, un même catalogue

1. **La session de groupe médiatisée** à la coopérative — un médiateur (référent, agent senior) projette, met pause, revient en arrière, fait discuter. Modèle Digital Green rigoureusement évalué : **85 % d'adoption des pratiques contre 11 % en contrôle, coût par adoption 10× meilleur** que la vulgarisation classique ([Gandhi et al.](https://www.microsoft.com/en-us/research/wp-content/uploads/2009/03/322-797-2-PB.pdf), [Evidence Review](https://digitalgreen.org/wp-content/uploads/2023/12/DG-Evidence-Review_Final-Report.pdf)). La vidéo est le point de focalisation ; ce sont les dynamiques sociales qui font l'apprentissage. C'est le contexte le plus exigeant — l'UI du player se dimensionne pour lui.
2. **Le self-service pré-mission** — l'agent seul, sur wifi : l'onglet Formation.
3. **Le juste-à-temps au champ** — le chapitre précis, via le panel d'aide contextuel.

### Organisation du catalogue

- Taxonomie **module × tâche** (jamais par format — vidéo/PDF est un détail de rendu).
- **« Ta formation » en tête** : les tutos des [[Affectation]]s de l'agent — l'Affectation route le travail, elle route aussi la formation. Le reste du catalogue en dessous.
- **Parcours nouvel agent** : 3-4 vidéos ordonnées + la collecte d'entraînement. Chemin à coches sobre (pattern [Noom](https://mobbin.com/screens/1d5b0f77-9643-4d4c-8366-23cf138ab0e7)) — sans streaks ni pièces, sans sens pour un outil de travail.
- Reprise là où on s'est arrêté (« smart resume ») ; progression **par chapitre**, pas seulement par vidéo.

### Player

Pattern [Udemy](https://mobbin.com/screens/2ed38ef5-3af7-45c3-ad0c-c6bf41805091) / [Khan Academy](https://mobbin.com/screens/9fefe566-3695-42e9-bb70-6b564579015c) : la liste des chapitres vit **sous** la vidéo — durée, coche « terminé », téléchargement par item, item courant surligné, ±15 s. Actions sous le player : Télécharger · Partager. Le contexte hiérarchique (module › tâche) visible.

### Diffusion offline

Leçons de [YouTube Go](https://design.google/library/making-youtube-go) (Google, conçu pour ce marché exact) + patterns [Prime Video](https://mobbin.com/screens/26f3d0d3-c3ce-43b6-aef1-3d5de0a7a925) / [YouTube](https://mobbin.com/screens/517082c8-d4c5-445e-a6b6-f66749318344) / WhatsApp :

- **Poids affiché avant téléchargement** ; choix de qualité en langage simple (registre WhatsApp : « plus rapide, moins de stockage »), **mémorisé par agent**.
- **Auto-download du pack tuto à l'Affectation** : posée côté web, le mobile pré-télécharge à la connexion — « le web configure, le mobile exécute », appliqué à la formation. Automatisme **visible et débrayable** (« Téléchargement auto : activé »).
- Écran **Données locales** (Profil) : agrégat en tête (à la Prime Video : n vidéos · durée · Go), packs par module, suppression par item.
- **Partage de proximité agent-à-agent** (Wi-Fi Direct / Bluetooth) : la formation circule offline dans l'équipe — le multiplicateur observé et outillé par YouTube Go. Ces vidéos n'ont aucune raison d'être verrouillées.

### Déclencheurs de redécouverte

- Notification à l'Affectation (« Nouveau formulaire affecté — 2 tutos à regarder »).
- Badge « Mis à jour » quand un tuto est re-tourné.
- Remontée saisonnière (avant l'hivernale : tutos de collecte ; avant une distribution d'intrants : scan carte INA).
- Plus tard, sur signal d'usage : étape systématiquement ratée/lente → suggestion du chapitre dans le panel d'aide.

### Mesure (web, Responsable ops)

Complétion par vidéo et **par chapitre**, croisée avec la qualité des collectes. Sert le médiateur de session de groupe (qui a vu quoi) et l'argument commercial (« vos agents sont formés, et vous le voyez »). Surface web = observation, cohérent avec la règle fondamentale.

---

## Prochaines étapes

1. **Glossaire** : ajouter « Tutoriel » et « Formation » à `CONTEXT.md` (termes canoniques, blocs `_Avoid_`).
2. **Skill `tuto-script`** dans `.claude/skills/` : script VO + storyboard générés depuis les écrans réels, conformes à la gate lexicale.
3. **Tranche verticale mobile** : catalogue enrichi (`Tutoriel`), player à chapitres, « Ta formation », panel d'aide contextuel sur `collecte-form` et `ina-scan`.
4. **Pilote production** : un tuto complet (« Créer une collecte terrain ») FR + wolof selon ce guide, testé en session de groupe médiatisée.

---

## Sources

**Recherche pédagogique** : [Guo, Kim & Rubin 2014 — How Video Production Affects Student Engagement](https://up.csail.mit.edu/other-pubs/las2014-pguo-engagement.pdf) · [Mayer — principes du multimédia learning](https://educationaltechnology.net/mayers-principles-of-multimedia-learning/) · [Mayer 2021 — Evidence-Based Principles for Instructional Videos](https://www.sciencedirect.com/science/article/abs/pii/S2211368121000231) · [NN/g — Just-in-Time Help](https://www.nngroup.com/videos/just-in-time-help/)

**Corpus agricole Sud-Sud** : [Digital Green — Evidence Review 2023](https://digitalgreen.org/wp-content/uploads/2023/12/DG-Evidence-Review_Final-Report.pdf) · [Gandhi et al. — Participatory Video and Mediated Instruction](https://www.microsoft.com/en-us/research/wp-content/uploads/2009/03/322-797-2-PB.pdf) · [Access Agriculture / Van Mele et al. 2018](https://assets.accessagriculture.org/s3fs-public/upload/files/Publications/Access%20Agriculture%20-%20Quality%20farmer%20training%20videos%20to%20support%20South-South%20learning%20-%20Van%20Mele%20et%20al%202018.pdf) · [GFRAS — Video for Agricultural Extension](https://www.g-fras.org/en/good-practice-notes/6-video-for-agricultural-extension.html?showall=1) · [CommCare / Dimagi](https://dimagi.com/commcare/) · [Google Next Billion Users](https://uxspot.io/nbu)

**Production & outillage** : [TechSmith — voice over](https://www.techsmith.com/blog/voice-over/) · [TechSmith — storyboarding & scripting](https://www.techsmith.com/learn/webinars/storyboarding-scripting-screen-recordings-that-actually-teach/) · [Descript](https://www.descript.com/) · [Intron — voice AI africaine](https://www.itnewsafrica.com/2026/03/intron-launches-voice-ai-for-africa-with-24-languages/) · [arXiv — Synthetic Voice Data for African Languages](https://arxiv.org/html/2507.17578v1) · [VideoProc — bitrates H.264](https://www.videoproc.com/media-converter/bitrate-setting-for-h264.htm) · [Lighterra — encodage H.264](https://www.lighterra.com/papers/videoencodingh264/)

**Diffusion** : [Google Design — Making YouTube Go](https://design.google/library/making-youtube-go)

**Benchmark Mobbin (écrans)** : [Beside](https://mobbin.com/screens/54d7c728-46da-4d07-b36f-ba0558374a05) · [Instagram](https://mobbin.com/screens/4d14e12e-e576-4810-b67e-3ca29bf52f3c) · [Meta AI](https://mobbin.com/screens/8135c995-afb2-4132-a5ea-3860c2cf22e5) · [Pinterest](https://mobbin.com/screens/72d4e2e7-94e3-468d-8fe1-091c1b1ee27c) · [DoorDash Dasher](https://mobbin.com/screens/7850aac1-1da6-4f8b-a6a6-a2ce9e002fc7) · [Turo](https://mobbin.com/screens/1594b20c-076b-4efd-b458-8692b7de05a0) · [N26](https://mobbin.com/screens/f5c4c352-7144-4c1d-b37d-f08ff71f83d0) · [Chime](https://mobbin.com/screens/23fc60fb-9d3a-4a62-9908-a69827fdd37f) · [Otter.ai](https://mobbin.com/screens/f51c9316-2044-4069-9c64-5016ccac2ce5) · [Udemy — player](https://mobbin.com/screens/2ed38ef5-3af7-45c3-ad0c-c6bf41805091) · [Udemy — downloads](https://mobbin.com/screens/1e8be1db-eca5-460f-b5aa-aa2a06060c7d) · [Khan Academy](https://mobbin.com/screens/9fefe566-3695-42e9-bb70-6b564579015c) · [Prime Video](https://mobbin.com/screens/26f3d0d3-c3ce-43b6-aef1-3d5de0a7a925) · [Netflix](https://mobbin.com/screens/35b17773-bae4-4e1b-a95c-63accb72e0bd) · [YouTube](https://mobbin.com/screens/517082c8-d4c5-445e-a6b6-f66749318344) · [WhatsApp](https://mobbin.com/screens/70ecc460-cb26-4bc9-91c3-2b533f78ab50) · [Noom](https://mobbin.com/screens/1d5b0f77-9643-4d4c-8366-23cf138ab0e7) · [Mimo](https://mobbin.com/screens/27a887e2-e968-4117-997f-4ce126f12fef) · [Woolworths](https://mobbin.com/screens/8f864c78-afeb-4c5e-96e1-5b7a0208fb4f) · [Shipt](https://mobbin.com/screens/1f07af59-9959-48dc-8a52-49db7a16bb2d)
