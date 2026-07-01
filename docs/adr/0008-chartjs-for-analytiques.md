# Chart.js pour l'onglet Analytiques — plutôt que du SVG à la main

## Contexte

L'onglet **Analytiques** d'un formulaire Data OS affiche une carte-graphique par question sélectionnée, avec bascule de type (barre, circulaire, ligne), légende, axes, tooltips et export PNG.

Jusqu'ici, le repo n'avait **aucune librairie de graphes** : les rares visualisations sont dessinées en SVG à la main (`dashboard/Sparkline.vue`, une polyline). Ce précédent aurait pu s'étendre ici.

## Décision

On introduit **`chart.js` + `vue-chartjs`** (rendu canvas) comme dépendance, et on l'isole dans `src/components/dataos/charts/AnalyticsChart.vue`. Les briques Chart.js sont enregistrées explicitement (tree-shaking), et un plugin `whiteBackground` peint un fond blanc pour que l'export PNG ne soit pas transparent.

## Pourquoi (le compromis)

Un sparkline est une polyline ; ici il faut des barres groupées avec axes/grille, un camembert avec parts, une courbe, des tooltips et une légende interactive — le tout permutable. Réimplémenter ça en SVG maison représentait un volume de code et de maintenance disproportionné pour une feature de démo. Chart.js les fournit d'emblée, et l'export PNG tombe gratuitement (`toBase64Image()`), ce qui a directement dicté le comportement du bouton de téléchargement.

Contreparties assumées :
- **Une dépendance de plus** (+ bundle) alors que le repo hand-rollait tout jusqu'ici.
- **Canvas, pas SVG** : diverge de l'idiome existant (Sparkline) et n'est pas inspectable dans le DOM.
- **Thémé à la main** vers les tokens Tolbi (couleurs cultures échantillonnées au pixel depuis le Figma ; palette genre/statut choisie côté code, non imposée par le Figma).

Difficile à défaire une fois les cartes-graphiques construites dessus — d'où cette trace. Alternatives écartées : SVG maison (trop coûteux), une lib SVG Vue type unovis/apexcharts (dépendance également, sans l'export PNG trivial du canvas).
