# Protocole de production et de diffusion des vidéos d'apprentissage

Alors ce doc, c'est le protocole complet des vidéos d'apprentissage : le référentiel qu'on met dans les mains d'un prestataire vidéo ou d'un nouveau dans l'équipe le jour du premier tournage. Il cadre quatre sujets : qu'est-ce qui fait qu'une vidéo mérite d'être produite, comment la production se déroule de bout en bout, comment on l'exploite dans le produit après production, et est-ce que le mobile et le web SaaS c'est la même chose (spoiler : non).

La forme suit ce qui se fait dans l'industrie : un pipeline en gates — on ne passe pas à l'étape suivante sans validation — et une spec de livraison avec des critères mesurables. Une vidéo qui n'est pas conforme à la spec, elle n'est pas publiée, point.

Dernière chose avant de rentrer dedans : les scripts de voix off, c'est de la copy produit. Donc le vocabulaire du domaine s'applique pareil que dans l'app — on dit « Code PIN », on dit « Parcelle », et on ne dit jamais « champ » pour une parcelle.

---

## 1. Qu'est-ce qui fait qu'une vidéo mérite d'être produite ? C'est quoi les critères ?

En fait, tout part toujours d'un ressenti : quelqu'un se dit « il faudrait une vidéo pour ça ». Le protocole est là pour transformer ce ressenti en décision. Parce que le vrai risque du format, c'est la bibliothèque de vidéos mortes — chères à produire, jamais regardées.

### D'où vient le besoin

Les déclencheurs légitimes, c'est :

- une nouvelle capacité mobile qui arrive (module, type de formulaire, geste nouveau) ;
- un signal terrain : des questions qui reviennent chez les référents, des erreurs récurrentes dans les collectes, une étape systématiquement lente ou ratée ;
- un signal produit : une feature critique que personne n'utilise ;
- un déploiement : une nouvelle organisation qui embarque ses agents.

### Les critères

Une vidéo est la bonne réponse si **tous** les critères passent :

| # | Critère | Le test |
|---|---|---|
| 1 | Gestuel / visuel | La tâche se montre mieux qu'elle ne s'explique (cadrer une photo, dessiner le polygone d'une parcelle, scanner en rafale). Une info ponctuelle, c'est une micro-instruction ou un tooltip, pas une vidéo. |
| 2 | Fréquence × criticité | La tâche est exécutée souvent, ou elle a un fort enjeu (une transaction INA confirmée par code PIN, par exemple). |
| 3 | Stabilité | L'écran et le geste vont survivre à 2-3 releases. Sinon on attend — pas la peine de produire un truc périmé dans un mois. |
| 4 | Audience | Assez d'agents concernés pour amortir un tournage terrain et une voix off wolof. |
| 5 | Non-doublon | Aucun tuto ni chapitre existant ne couvre déjà le besoin. |

### Avant de dire oui, on épuise les alternatives

Dans l'ordre :

1. **Corriger l'écran.** Si une vidéo est nécessaire pour comprendre un écran, c'est peut-être l'écran le problème. « On ne produit pas, on améliore l'UI » est une sortie légitime — et prioritaire — de cette étape.
2. **Ajouter un chapitre** à une vidéo existante.
3. **Une micro-instruction d'étape** dans le formulaire (illustration + consignes + audio wolof).
4. **Une vidéo complète** — seulement si le reste ne suffit pas.

Si on arrive au bout : on remplit une **fiche de production** (une issue sur le tracker) — la tâche, le module, l'audience, le déclencheur, les critères cochés, l'alternative écartée et pourquoi. Le owner produit valide → feu vert.

---

## 2. Comment se déroule la production, de bout en bout ?

Huit étapes, huit gates. La règle : on ne saute pas une gate, et chaque gate a un livrable et un valideur.

| # | Étape | Livrable | Qui valide |
|---|---|---|---|
| 0 | Fiche de production | L'issue complète (cf. section 1) | Owner produit |
| 1 | Script de voix off (français) | Le script chapitre par chapitre — tutoiement, vocabulaire du domaine | Owner produit + relecture par un agent ou référent terrain |
| 2 | Storyboard | Le découpage click par click ; chaque séquence marquée « geste app » (screencast) ou « geste métier » (tournage) | Owner produit |
| 3 | Captation | Screencasts via des flows scriptés rejouables — jamais de capture à la main. Terrain : checklist de tournage (annexe C.1), avec des pairs réels, un décor local, du matériel réel | Le monteur revoit les rushes |
| 4 | Montage V1 (français) | La vidéo montée : ouverture ≤ 10 s, signaling sur chaque action, pauses après chaque geste, cartons de chapitre, récap de 15 s, rien de décoratif | Owner produit |
| 5 | Adaptation wolof | Draft de traduction (l'IA a le droit) → révision par un locuteur natif, obligatoire → enregistrement de la voix → calage sur la timeline française verrouillée | Le locuteur natif référent |
| 6 | QA | La checklist complète (annexe C.2) **+ le test terrain éclair** : 2-3 agents regardent la vidéo puis refont le geste sans aide | Ça passe = publiable ; ça casse = retour gate 4 ou 5 |
| 7 | Encodage et dépôt | Les assets conformes à la spec de livraison (annexe A ou B) + les métadonnées complètes | Contrôle automatique |
| 8 | Publication | L'entrée au catalogue + les mappings (cf. section 3) + la notification | Owner produit |

Le test terrain éclair de la gate 6, c'est le vrai juge de paix : si l'agent ne peut pas refaire le geste après avoir vu la vidéo, la vidéo a raté — peu importe qu'elle soit belle.

---

## 3. Après production, comment on l'exploite dans le produit ?

### La publication

Publier, ce n'est pas juste déposer un fichier. C'est créer l'entrée au catalogue **et** ses mappings, sinon la vidéo est introuvable :

- **Les écrans** : sur quels écrans de l'app le panel d'aide doit la proposer, et quels chapitres.
- **Les affectations** : quels formulaires et quelles étapes de workflow la concernent — c'est ce qui alimente « Ta formation » et le pré-téléchargement du pack à la connexion.
- **Le parcours** : sa position éventuelle dans le parcours du nouvel agent.
- **La notification** : les agents affectés reçoivent « Nouveau tuto disponible ». Les autres, rien — on ne notifie jamais les non-concernés.

### La vie

- Les déclencheurs qui ramènent vers les vidéos : la notification à l'affectation, le badge « Mis à jour », la remontée saisonnière (avant campagne).
- La mesure : la complétion par vidéo et **par chapitre**, croisée avec la qualité des collectes, visible du Responsable ops côté web. C'est cette mesure qui nourrit la section 1 (une étape ratée partout = un besoin identifié) et les décisions de re-tournage.

### La fin de vie

À chaque release d'un module, on passe la revue de péremption (annexe C.3) et on classe chaque tuto du module :

- **À jour** — rien à faire.
- **À re-capturer** — l'UI a changé : on rejoue les flows scriptés, on ré-encode, on régénère la ou les phrases de voix off touchées. Badge « Mis à jour » à la republication.
- **Déprécié** — la tâche n'existe plus ou a trop changé : on retire du catalogue, on archive le master.

Une chose à retenir : un tuto périmé visible, c'est pire que pas de tuto. Il enseigne le mauvais geste.

---

## 4. Sur le mobile et sur le web SaaS, c'est la même chose ?

Non. Et c'est même un point structurant : l'audience, le contexte et donc la spec diffèrent presque en tout. Du coup le protocole définit deux profils :

| | Profil MOBILE (Agent) | Profil WEB (Collaborateur) |
|---|---|---|
| Audience | Agent terrain, lettrisme partiel, wolof/français | Responsable ops, Admin — back-office, français |
| Contexte | Debout, soleil, une main, hors ligne | Bureau, desktop, en ligne, souvent le son coupé |
| Tâches | Gestes courts répétés | Configurations longues et rares |
| Place de la vidéo | Format central | Format d'appoint — un collaborateur lit et cherche ; un guide interactif ou une doc structurée fait souvent mieux |
| Sous-titres | Jamais | Souhaitables (le son est coupé au bureau) |
| Texte incrusté | Zéro texte porteur de sens | Autorisé |
| Langues | Français + wolof obligatoires | Français seul |
| Format image | Vertical 9:16 | Paysage 16:9 |
| Diffusion | Pré-téléchargé (packs, poids affiché, partage de proximité) | Streaming, intégré au panneau d'aide web et aux empty states |
| Spec de livraison | Annexe A | Annexe B |

À noter : les deux profils sont quasiment opposés sur les sous-titres et le texte incrusté, parce que le contexte d'écoute est inversé — l'agent n'a que l'oreille, le collaborateur n'a souvent que l'œil.

Côté web, la section 1 penche donc différemment : la cascade d'alternatives s'arrête presque toujours avant la vidéo. Les vrais candidats vidéo web, ce sont les workflows démonstratifs — la correction cartographique, typiquement.

Ce qui reste commun aux deux profils : le catalogue (module × tâche), le vocabulaire du domaine, le pipeline en gates, la mesure de complétion.

---

## 5. Qui fait quoi

Les rôles sont posés, les noms restent à mettre :

| Rôle | Responsabilités | Qui |
|---|---|---|
| Owner produit | Gates 0, 1, 2, 4, 8 ; les arbitrages de la cascade | _à nommer_ |
| Référent terrain | Relecture du script (gate 1), recrutement des pairs au tournage, test éclair (gate 6) | _à nommer_ |
| Monteur / prestataire vidéo | Gates 3, 4, 7 ; garant de la spec de livraison | _à nommer_ |
| Locuteur natif wolof référent | Gate 5 : révision de l'adaptation + voix off (ou validation d'une voix tierce) | _à nommer_ |

---

## Annexe A — Spec de livraison MOBILE (v1)

Un asset non conforme n'entre pas au catalogue. Tout est contrôlable automatiquement.

**Vidéo**
- Codec : H.264 baseline profile, conteneur MP4
- Résolution : 480p vertical (480×854), 30 fps max
- Débit : ~700 kbps (soit ≈ 5 Mo/min ; un tuto de 3 min ≈ 15 Mo ; un pack module < 60 Mo)
- Format : 9:16 pour les screencasts ; les séquences terrain sont recadrées
- Durée : ≤ 6 min (la cible c'est 2-4 min)
- Zéro texte incrusté porteur de sens (les cartons de chapitre — pictogramme + numéro — sont tolérés)

**Audio**
- Une piste par langue : `fr`, `wo` — jamais de vidéo bilingue, jamais de sous-titres
- Loudness normalisée : −16 LUFS, true peak ≤ −1 dBTP
- La voix seule — pas de musique sous la narration

**Master (archivage)**
- 720p, H.264 high profile, pistes audio séparées, projet de montage conservé

**Métadonnées obligatoires** (l'asset est rejeté s'il en manque une)
`id` · `module` · `tache` · `chapitres[]` (titre + timecode, alignés sur les étapes) · `langue` · `tailleMo` · `versionApp` · `affectations[]` · `ordreParcours?`

**Nommage** : `tuto_<module>_<tache-kebab>_<langue>_v<versionApp>.mp4` (ex. `tuto_collecte_creer-collecte-terrain_wo_v1.4.mp4`)

## Annexe B — Spec de livraison WEB (v1)

- Codec : H.264 main profile, MP4, 720p paysage 16:9, ~1,5 Mbps
- Durée : ≤ 6 min ; mêmes règles de montage (signaling, chapitres, récap)
- Audio : français seul, −16 LUFS ; sous-titres français fournis en fichier `.vtt` séparé, jamais incrustés — c'est le lecteur qui les active
- Texte incrusté autorisé s'il sert l'apprentissage
- Métadonnées : identiques à l'annexe A, sans `affectations` (remplacé par le mapping des écrans web)

## Annexe C — Checklists

### C.1 Tournage terrain
- [ ] Le présentateur est un agent ou un producteur réel ; consentement écrit (image + voix), rémunération convenue
- [ ] Décor reconnaissable (la coop, le magasin, une parcelle de la zone) ; matériel réel (téléphone d'entrée de gamme)
- [ ] Audio : micro-cravate, prise témoin ; environnement contrôlé (attention au vent)
- [ ] Chaque geste filmé en entier + un gros plan par geste (le zoom se fait au montage)
- [ ] Plans de coupe : les mains, l'écran, le contexte

### C.2 QA avant publication
- [ ] Durée ≤ 6 min ; ouverture ≤ 10 s avec l'objectif énoncé ; récap final présent
- [ ] Chapitres alignés sur les étapes de la tâche, timecodes corrects
- [ ] Signaling présent sur chaque action d'écran (zoom, halo, tap)
- [ ] Aucun texte incrusté porteur de sens (profil mobile)
- [ ] Vocabulaire conforme au glossaire du domaine (passe automatisée + relecture)
- [ ] Loudness mesurée à −16 LUFS ±1
- [ ] Voix off wolof validée par le locuteur natif référent
- [ ] Test terrain éclair réussi : 2-3 agents refont le geste sans aide
- [ ] Spec de livraison (annexe A ou B) : contrôle automatique passé

### C.3 Revue de péremption (à chaque release de module)
- [ ] Diff visuel : les captures des flows scriptés comparées aux plans d'UI des tutos publiés du module
- [ ] Chaque tuto classé : à jour / à re-capturer / déprécié
- [ ] Les re-captures planifiées (fiche de production allégée — gates 3, 4, 7, 8)
- [ ] Les tutos dépréciés retirés du catalogue et archivés
