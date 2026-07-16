# Protocole de production & diffusion des tutos vidéo

> **Rôle de ce document.** Le compagnon opérationnel de la [stratégie des tutos d'apprentissage](./tutos-apprentissage-strategie.md) : la stratégie dit *pourquoi et quoi*, ce protocole dit *quand, comment et qui*. C'est le document à mettre dans les mains d'un prestataire vidéo ou d'un nouveau membre de l'équipe le jour du premier tournage. Il suit la forme normée de l'industrie : une **SOP en gates** (pipeline étape par étape avec validations) + une **delivery specification** interne (critères d'acceptation mesurables, à la manière des specs de livraison Netflix/DPP — un asset non conforme n'est pas publié).
>
> Vocabulaire : les termes de domaine suivent le glossaire `CONTEXT.md` ([[Agent]], [[Affectation]], [[Collaborateur]], [[Organisation]]…). Le script de voice-over est de la copy UI : la gate lexicale de `CLAUDE.md` s'y applique intégralement.

---

## 1. Gate zéro — qu'est-ce qui mérite une vidéo ?

Aucune production ne démarre sans passer cette gate. Elle protège contre le vrai risque du format : la bibliothèque de vidéos mortes, chères à produire et jamais regardées.

### 1.1 Déclencheurs légitimes

La question « faut-il un tuto ? » se pose quand survient l'un de ces signaux :

- **Livraison** : une nouvelle capacité mobile arrive (module, type de formulaire, geste nouveau).
- **Signal terrain** : questions récurrentes aux référents ; erreurs récurrentes dans les collectes ; étape systématiquement lente ou ratée (mesure par chapitre, cf. §3.2).
- **Signal produit** : une feature critique est sous-utilisée.
- **Déploiement** : une nouvelle [[Organisation]] embarque ses [[Agent]]s.

### 1.2 Critères d'éligibilité

Une *vidéo* est la bonne réponse si **tous** les critères passent :

| # | Critère | Le test |
|---|---|---|
| 1 | **Gestuel / visuel** | La tâche se *montre* mieux qu'elle ne se *dit* (cadrer une photo, dessiner un polygone de [[Parcelle]], scanner en rafale). Une information ponctuelle relève d'une micro-instruction ou d'un tooltip, pas d'une vidéo. |
| 2 | **Fréquence × criticité** | Tâche exécutée souvent, **ou** à fort enjeu (ex. transaction INA confirmée par [[Code PIN]]). |
| 3 | **Stabilité** | L'écran et le geste survivront à 2-3 releases. Sinon : attendre (anti-péremption, cf. stratégie §2.G). |
| 4 | **Audience** | Assez d'agents concernés pour amortir tournage terrain + VO wolof. |
| 5 | **Non-doublon** | Le catalogue n'a ni tuto ni chapitre qui couvre déjà le besoin — même discipline que la gate d'inventaire des composants. |

### 1.3 Cascade d'alternatives (à épuiser avant le « go »)

1. **Corriger l'UI.** Si une vidéo est nécessaire pour comprendre un écran, c'est peut-être l'écran qui a un problème. La réponse « on ne produit pas, on améliore la copy/le flux » est un résultat légitime — et prioritaire — de cette gate.
2. **Ajouter un chapitre** à un tuto existant plutôt qu'une vidéo nouvelle.
3. **Micro-instruction d'étape** (illustration + consignes + audio wolof dans le formulaire).
4. **Vidéo complète** — seulement si 1-3 ne suffisent pas.

**Sortie de la gate 0** : une *fiche de production* (issue sur le tracker) — tâche, module, audience, déclencheur, critères cochés, alternative écartée et pourquoi. Validée par le owner produit → GO.

---

## 2. Pipeline de production — huit étapes, huit gates

Règle de forme : on ne saute pas une gate ; chaque gate a un livrable et un valideur nommé. Les *owners* ci-dessous sont des rôles — le RACI nominal est à compléter par l'équipe (§5).

| # | Étape | Livrable | Validation (gate) |
|---|---|---|---|
| 0 | **Fiche de production** | Issue complète (cf. §1.3) | Owner produit |
| 1 | **Script VO française** | Script chapitre par chapitre, généré (skill `tuto-script`) puis retravaillé — tutoiement, gate lexicale `CONTEXT.md` | Owner produit **+ relecture par un agent/référent terrain** |
| 2 | **Storyboard** | Découpage click-par-click ; chaque séquence marquée *geste app* (screencast) ou *geste métier* (tournage) | Owner produit |
| 3 | **Captation** | Screencasts : flows scriptés rejouables (Maestro) — jamais de capture à la main. Terrain : checklist de tournage (annexe C.1) — pairs réels, décor local, matériel réel | Rushes revus par le monteur |
| 4 | **Montage V1 (FR)** | Vidéo montée selon les règles de la stratégie §2.E : ouverture ≤ 10 s, signaling, pauses après action, cartons de chapitre, récap 15 s, rien de décoratif | Owner produit |
| 5 | **Adaptation wolof** | Draft de traduction (LLM autorisé) → **révision par locuteur natif obligatoire** → enregistrement VO → conformation sur la timeline FR verrouillée | Locuteur natif référent |
| 6 | **QA** | Checklist mesurable (annexe C.2) **+ test terrain éclair** : 2-3 agents regardent puis refont le geste sans aide | Passe = publiable ; échec = retour gate 4 ou 5 |
| 7 | **Encodage & dépôt** | Assets conformes à la delivery spec (annexe A ou B) + métadonnées complètes | Contrôle automatique (spec) |
| 8 | **Publication** | Entrée au catalogue + mappings (cf. §3.1) + notification | Owner produit |

Le **test terrain éclair** (gate 6) est le critère d'acceptation ultime : si l'agent ne peut pas refaire le geste après visionnage, la vidéo a échoué, quelle que soit sa qualité formelle.

---

## 3. Exploitation dans le produit — le cycle de vie

### 3.1 Publication

Publier = créer l'entrée de catalogue **et** ses mappings, sinon la vidéo est introuvable :

- **Écrans** : sur quels écrans de l'app le panel d'aide contextuel doit la proposer (et quels chapitres).
- **[[Affectation]]s** : quels formulaires / étapes Source la concernent → alimente « Ta formation » et l'auto-download du pack à la connexion.
- **Parcours** : position éventuelle dans le parcours nouvel agent.
- **Notification** : les agents affectés reçoivent « Nouveau tuto disponible » ; jamais de notification aux non-concernés.

### 3.2 Vie

- **Déclencheurs de redécouverte** : notification à l'Affectation, badge « Mis à jour », remontée saisonnière (avant campagne).
- **Mesure** : complétion par vidéo et **par chapitre**, croisée avec la qualité des collectes ; visible du Responsable ops côté web (observation). C'est cette mesure qui alimente les déclencheurs de la gate 0 (étape ratée → besoin identifié) et les décisions de re-tournage.

### 3.3 Fin de vie

À chaque release d'un module, la **revue de péremption** (checklist annexe C.3) classe chaque tuto du module :

- **À jour** — rien à faire.
- **À re-capturer** — l'UI a changé : rejouer les flows scriptés, ré-encoder, régénérer la ou les phrases de VO touchées (TTS/Overdub côté FR ; re-prise ciblée côté wolof). Badge « Mis à jour » à la republication.
- **Déprécié** — la tâche n'existe plus ou a trop changé : retrait du catalogue, archivage du master. **Un tuto périmé visible est pire que pas de tuto : il enseigne le mauvais geste.**

---

## 4. Deux profils de diffusion — mobile ≠ web SaaS

Le protocole définit deux profils, parce que l'audience, le contexte et donc la spec diffèrent presque en tout :

| | **Profil MOBILE ([[Agent]])** | **Profil WEB ([[Collaborateur]])** |
|---|---|---|
| Audience | Agent terrain, lettrisme partiel, wolof/FR | Responsable ops, Admin — back-office, FR |
| Contexte | Debout, soleil, une main, hors ligne | Bureau, desktop, en ligne, souvent **son coupé** |
| Tâches | Gestes courts répétés | Configurations longues et rares |
| Place de la vidéo | **Format central** (décision produit) | **Format d'appoint** — un Collaborateur lit et cherche ; privilégier guide interactif, empty state éducatif, doc texte *searchable* |
| Sous-titres | **Jamais** (modalité/redondance, lettrisme) | **Souhaitables** (son coupé au bureau) |
| Texte incrusté | Zéro texte porteur de sens | Autorisé |
| Langues | FR + wolof obligatoires | FR seul |
| Format image | Vertical 9:16 | Paysage 16:9 desktop |
| Diffusion | Pré-téléchargé (packs, poids affiché, partage de proximité) | Streaming, intégré au panneau d'aide web et aux empty states |
| Delivery spec | Annexe A | Annexe B |

Côté web, la gate 0 penche donc différemment : la cascade d'alternatives s'arrête presque toujours avant la vidéo. Les candidats vidéo web légitimes sont les workflows réellement démonstratifs — la [[Correction cartographique]] est l'exemple type.

Ce qui reste **commun** aux deux profils : le catalogue conceptuel (module × tâche), la gate lexicale, le pipeline en gates (§2), la mesure de complétion.

---

## 5. Rôles (RACI à compléter)

| Rôle | Responsabilités | Qui |
|---|---|---|
| **Owner produit** | Gates 0, 1, 2, 4, 8 ; arbitrages de la cascade | _à nommer_ |
| **Référent terrain** | Relecture script (gate 1), recrutement des pairs au tournage, test éclair (gate 6) | _à nommer_ |
| **Monteur / prestataire vidéo** | Gates 3, 4, 7 ; garant de la delivery spec | _à nommer_ |
| **Locuteur natif wolof référent** | Gate 5 : révision de l'adaptation + VO (ou validation d'une VO tierce) | _à nommer_ |

---

## Annexe A — Delivery spec MOBILE (v1)

Un asset non conforme n'entre pas au catalogue. Contrôles automatisables en CI de contenu.

**Vidéo**
- Codec : H.264 **baseline profile**, conteneur MP4
- Résolution : 480p vertical (854×480 → 480×854), 30 fps max
- Débit : ~700 kbps (cible ≈ 5 Mo/min ; tuto de 3 min ≈ 15 Mo ; pack module < 60 Mo)
- Format : 9:16 pour les screencasts ; séquences terrain recadrées
- Durée : ≤ 6 min (cible 2-4 min)
- **Zéro texte incrusté porteur de sens** (cartons de chapitre : pictogramme + numéro tolérés)

**Audio**
- Une piste par langue : `fr`, `wo` — jamais de vidéo bilingue, jamais de sous-titres
- Loudness normalisée : **−16 LUFS** (standard streaming mobile), true peak ≤ −1 dBTP
- Voix seule — pas de musique sous la narration

**Master (archivage)**
- 720p, H.264 high profile, pistes audio séparées, projet de montage conservé

**Métadonnées obligatoires** (l'asset est rejeté si une manque)
`id` · `module` · `tache` · `chapitres[]` (titre + timecode, alignés sur les étapes) · `langue` · `tailleMo` · `versionApp` · `affectations[]` · `ordreParcours?`

**Nommage** : `tuto_<module>_<tache-kebab>_<langue>_v<versionApp>.mp4` (ex. `tuto_collecte_creer-collecte-terrain_wo_v1.4.mp4`)

## Annexe B — Delivery spec WEB (v1)

- Codec : H.264 main profile, MP4, 720p paysage 16:9, ~1,5 Mbps
- Durée : ≤ 6 min ; mêmes règles de montage (signaling, chapitres, récap)
- Audio : FR seul, −16 LUFS ; **sous-titres FR fournis** (fichier `.vtt` séparé, jamais incrustés — le lecteur les active)
- Texte incrusté autorisé s'il sert l'apprentissage
- Métadonnées : identiques à l'annexe A, sans `affectations` (remplacé par le mapping écrans web)

## Annexe C — Checklists

### C.1 Tournage terrain
- [ ] Présentateur = agent/producteur réel, consentement écrit (image + voix), rémunération convenue
- [ ] Décor reconnaissable (coop, magasin, parcelle de la zone) ; matériel réel (téléphone d'entrée de gamme)
- [ ] Audio : micro-cravate, prise témoin ; environnement contrôlé (vent !)
- [ ] Gestes filmés en entier + gros plan par geste (zoom au montage)
- [ ] Plans de coupe : mains, écran, contexte

### C.2 QA avant publication
- [ ] Durée ≤ 6 min ; ouverture ≤ 10 s avec objectif énoncé ; récap final présent
- [ ] Chapitres alignés sur les étapes de la tâche, timecodes corrects
- [ ] Signaling présent sur chaque action d'écran (zoom/halo/tap)
- [ ] Aucun texte incrusté porteur de sens (profil mobile)
- [ ] Lexique conforme `CONTEXT.md` (passe automatisée + relecture)
- [ ] Loudness mesurée à −16 LUFS ±1
- [ ] VO wolof validée par le locuteur natif référent
- [ ] **Test terrain éclair réussi** : 2-3 agents refont le geste sans aide
- [ ] Delivery spec (annexe A/B) : contrôle automatique passé

### C.3 Revue de péremption (à chaque release de module)
- [ ] Diff visuel : captures des flows scriptés vs plans d'UI des tutos publiés du module
- [ ] Chaque tuto classé : à jour / à re-capturer / déprécié
- [ ] Re-captures planifiées (fiche de production allégée — gates 3, 4, 7, 8)
- [ ] Tutos dépréciés retirés du catalogue et archivés
