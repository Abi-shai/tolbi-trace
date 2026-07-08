import type { Scenario } from '~/types/scenario'
import { atelierGeoDemo } from '~/scenarios/producteurs-geo'

const STANDARD_COLUMNS = [
  { yourColumn: 'code_nat_producteur',            tolbiColumn: 'CODE NAT PRODUCTEUR' },
  { yourColumn: 'code_coop',                      tolbiColumn: 'CODE COOP PRODUCTEUR' },
  { yourColumn: 'code_producteur',                tolbiColumn: 'CODE PRODUCTEUR PARTENAIRE' },
  { yourColumn: 'nom_et_prénom',                  tolbiColumn: 'NOM ET PRENOM' },
  { yourColumn: 'genre',                          tolbiColumn: 'GENRE' },
  { yourColumn: 'age',                            tolbiColumn: 'AGE' },
  { yourColumn: 'préfecture',                     tolbiColumn: 'PREFECTURE' },
  { yourColumn: 'sous_préfecture',                tolbiColumn: 'SOUS PREFECTURE' },
  { yourColumn: 'sections',                       tolbiColumn: 'SECTIONS' },
  { yourColumn: 'localités',                      tolbiColumn: 'LOCALITES' },
  { yourColumn: 'villages',                       tolbiColumn: 'VILLAGES' },
  { yourColumn: 'cni',                            tolbiColumn: 'PIECES IDENTITEES CNI/AUTRES' },
  { yourColumn: 'téléphone',                      tolbiColumn: 'TELEPHONE PRODUCTEUR' },
  { yourColumn: 'cultures_pratiquées',            tolbiColumn: 'CULTURES PRATIQUEES' },
  { yourColumn: "superficie_de_l'exploitation",   tolbiColumn: "SURPERFICIE DE L'EXPLOITATION" },
]

const GEO_COLS   = ['FID', 'CODE_WAYPT', 'SURF_HA', 'DATE_GPS', 'PR_GPS', 'WKT_GEOM']
const EXCEL_COLS = ['ID_INTERNE', 'Ref_Waypoint', 'Nom', 'Prénom', 'Village', 'CNI']

// Lignes toutes valides (aucune erreur/avertissement) — pour montrer du contenu propre
// quand le traitement est bon, au lieu d'une table vide.
const VALID_ROWS = [
  { index: 0, geoCells: [{ value: '0' }, { value: 'ZN1_WP042' }, { value: '2.45' }, { value: '2025-11-14' }, { value: '1.2m' }, { value: 'POLYGON((…))' }], excelCells: [{ value: 'AGRI-042' }, { value: 'ZN1_WP042' }, { value: 'Diop' }, { value: 'Moussa' }, { value: 'Tivaouane' }, { value: '17420011' }] },
  { index: 1, geoCells: [{ value: '1' }, { value: 'ZN1_WP043' }, { value: '1.80' }, { value: '2025-11-14' }, { value: '0.9m' }, { value: 'POLYGON((…))' }], excelCells: [{ value: 'AGRI-043' }, { value: 'ZN1_WP043' }, { value: 'Ndiaye' }, { value: 'Fatou' }, { value: 'Tivaouane' }, { value: '17420012' }] },
  { index: 2, geoCells: [{ value: '2' }, { value: 'ZN1_WP044' }, { value: '3.10' }, { value: '2025-11-15' }, { value: '1.5m' }, { value: 'POLYGON((…))' }], excelCells: [{ value: 'AGRI-044' }, { value: 'ZN1_WP044' }, { value: 'Cissé' }, { value: 'Babacar' }, { value: 'Kolda' }, { value: '17420013' }] },
  { index: 3, geoCells: [{ value: '3' }, { value: 'ZN1_WP045' }, { value: '0.95' }, { value: '2025-11-15' }, { value: '2.1m' }, { value: 'POLYGON((…))' }], excelCells: [{ value: 'AGRI-045' }, { value: 'ZN1_WP045' }, { value: 'Diallo' }, { value: 'Ibrahim' }, { value: 'Kolda' }, { value: '17420014' }] },
  { index: 4, geoCells: [{ value: '4' }, { value: 'ZN1_WP046' }, { value: '5.00' }, { value: '2025-11-16' }, { value: '1.0m' }, { value: 'POLYGON((…))' }], excelCells: [{ value: 'AGRI-046' }, { value: 'ZN1_WP046' }, { value: 'Kouassi' }, { value: 'Jean' }, { value: 'Kolda' }, { value: '17420015' }] },
  { index: 5, geoCells: [{ value: '5' }, { value: 'ZN1_WP047' }, { value: '2.10' }, { value: '2025-11-16' }, { value: '1.2m' }, { value: 'POLYGON((…))' }], excelCells: [{ value: 'AGRI-047' }, { value: 'ZN1_WP047' }, { value: 'Sene' }, { value: 'Mohamed' }, { value: 'Kolda' }, { value: '17420016' }] },
]

const cleanRowResult = {
  totalMatched:  2400,
  totalExpected: 2400,
  surfaceHa:     534,
  errorCount:    0,
  warningCount:  0,
  geoColumns:    GEO_COLS,
  excelColumns:  EXCEL_COLS,
  rows:          VALID_ROWS,
}

// Les 4 anomalies GÉOMÉTRIQUES du fichier géo, alignées 1:1 sur les items de la
// carte-atelier (Correction cartographique). L'erreur porte sur la géométrie
// (WKT_GEOM), pas sur une colonne tabulaire — et chaque ligne porte son motif en
// clair (Quoi·Conséquence), car une anomalie de tracé ne tient pas dans une cellule.
const GEO_ERROR_ROWS = [
  { index: 0, motif: { quoi: 'Sommet aberrant.', cons: 'Un point du tracé sort de la parcelle et gonfle la surface à 12,7 ha.' },
    geoCells: [{ value: '3' }, { value: 'ZN1_WP045' }, { value: '12,70' }, { value: '2025-11-15' }, { value: '2.1m' }, { value: 'POLYGON((…))', hasError: true }],
    excelCells: [{ value: 'AGRI-045' }, { value: 'ZN1_WP045' }, { value: 'Diallo' }, { value: 'Ibrahim' }, { value: 'Tivaouane' }, { value: '17420014' }] },
  { index: 1, motif: { quoi: 'Contour non refermé.', cons: 'La parcelle ne peut pas être calculée tant que le tracé reste ouvert.' },
    geoCells: [{ value: '4' }, { value: 'ZN1_WP046' }, { value: '—' }, { value: '2025-11-16' }, { value: '1.0m' }, { value: 'POLYGON((…', hasError: true }],
    excelCells: [{ value: 'AGRI-046' }, { value: 'ZN1_WP046' }, { value: 'Kouassi' }, { value: 'Jean' }, { value: 'Tivaouane' }, { value: '17420015' }] },
  { index: 2, motif: { quoi: 'Géométrie manquante.', cons: 'Aucune parcelle rattachée à ce producteur.' },
    geoCells: [{ value: '5' }, { value: 'ZN1_WP047' }, { value: '—' }, { value: '2025-11-16' }, { value: '1.2m' }, { value: '—', hasError: true }],
    excelCells: [{ value: 'AGRI-047' }, { value: 'ZN1_WP047' }, { value: 'Sene' }, { value: 'Mohamed' }, { value: 'Tivaouane' }, { value: '17420016' }] },
  { index: 3, motif: { quoi: 'Tracé non rattaché.', cons: 'Ce relevé n’est associé à aucun producteur.' },
    geoCells: [{ value: '99' }, { value: 'ZN9_ORPH' }, { value: '1,30' }, { value: '2025-11-14' }, { value: '1.1m' }, { value: 'POLYGON((…))', hasError: true }],
    excelCells: [{ value: '—' }, { value: 'ZN9_ORPH' }, { value: '—' }, { value: '—' }, { value: '—' }, { value: '—' }] },
]

// Lignes de contexte valides (aucune anomalie) affichées sous les à-corriger.
const GEO_CLEAN_ROWS = [
  { index: 4, geoCells: [{ value: '0' }, { value: 'ZN1_WP042' }, { value: '1,50' }, { value: '2025-11-14' }, { value: '1.2m' }, { value: 'POLYGON((…))' }], excelCells: [{ value: 'AGRI-042' }, { value: 'ZN1_WP042' }, { value: 'Diop' }, { value: 'Moussa' }, { value: 'Tivaouane' }, { value: '17420011' }] },
  { index: 5, geoCells: [{ value: '1' }, { value: 'ZN1_WP043' }, { value: '1,20' }, { value: '2025-11-14' }, { value: '0.9m' }, { value: 'POLYGON((…))' }], excelCells: [{ value: 'AGRI-043' }, { value: 'ZN1_WP043' }, { value: 'Ndiaye' }, { value: 'Fatou' }, { value: 'Tivaouane' }, { value: '17420012' }] },
  { index: 6, geoCells: [{ value: '2' }, { value: 'ZN1_WP044' }, { value: '1,60' }, { value: '2025-11-15' }, { value: '1.5m' }, { value: 'POLYGON((…))' }], excelCells: [{ value: 'AGRI-044' }, { value: 'ZN1_WP044' }, { value: 'Cissé' }, { value: 'Babacar' }, { value: 'Tivaouane' }, { value: '17420013' }] },
]

// Même contexte, mais avec 2 avertissements Excel (Ref_Waypoint vide) — pour le
// scénario « Erreurs combinées » qui cumule erreurs géo et avertissements Excel.
const GEO_CLEAN_ROWS_WARN = [
  { index: 4, geoCells: [{ value: '0' }, { value: 'ZN1_WP042' }, { value: '1,50' }, { value: '2025-11-14' }, { value: '1.2m' }, { value: 'POLYGON((…))' }], excelCells: [{ value: 'AGRI-042' }, { value: 'Champ vide', hasWarning: true }, { value: 'Diop' }, { value: 'Moussa' }, { value: 'Tivaouane' }, { value: '17420011' }] },
  { index: 5, geoCells: [{ value: '1' }, { value: 'ZN1_WP043' }, { value: '1,20' }, { value: '2025-11-14' }, { value: '0.9m' }, { value: 'POLYGON((…))' }], excelCells: [{ value: 'AGRI-043' }, { value: 'Champ vide', hasWarning: true }, { value: 'Ndiaye' }, { value: 'Fatou' }, { value: 'Tivaouane' }, { value: '17420012' }] },
  { index: 6, geoCells: [{ value: '2' }, { value: 'ZN1_WP044' }, { value: '1,60' }, { value: '2025-11-15' }, { value: '1.5m' }, { value: 'POLYGON((…))' }], excelCells: [{ value: 'AGRI-044' }, { value: 'ZN1_WP044' }, { value: 'Cissé' }, { value: 'Babacar' }, { value: 'Tivaouane' }, { value: '17420013' }] },
]

export const producteurScenarios: Scenario[] = [
  {
    id:          'producteurs-chargement-succes',
    label:       'Chargement réussi',
    description: 'Les deux fichiers se chargent normalement',
    group:       'Producteurs',
    folder:      'Loading cases',
    scope:       'import',
    state: {
      producteurs: {},
    },
  },

  {
    id:          'producteurs-erreur-chargement-fichier',
    label:       'Erreur de chargement fichier',
    description: 'Échec du chargement du fichier .shp',
    group:       'Producteurs',
    folder:      'Loading cases',
    scope:       'import',
    state: {
      producteurs: {
        fileUploadError: true,
      },
    },
  },

  {
    id:          'producteurs-succes-clean',
    label:       'Succès — tout est bon',
    description: 'Toutes les colonnes matchées, aucune anomalie',
    group:       'Producteurs',
    folder:      'Files treatment scenarios',
    scope:       'matching',
    state: {
      producteurs: {
        matchingResult: {
          totalMatched:  2400,
          totalExpected: 2400,
          surfaceHa:     534,
          columns:       STANDARD_COLUMNS,
        },
        rowMatchingResult: cleanRowResult,
      },
    },
  },

  {
    id:          'producteurs-succes-extra-colonnes',
    label:       'Succès avec données supplémentaires',
    description: '1 colonne supplémentaire détectée',
    group:       'Producteurs',
    folder:      'Files treatment scenarios',
    scope:       'matching',
    state: {
      producteurs: {
        matchingResult: {
          totalMatched:  2400,
          totalExpected: 2400,
          surfaceHa:     534,
          columns: [
            { yourColumn: 'couleur_sac_récolte', tolbiColumn: '', isNewEntry: true },
            ...STANDARD_COLUMNS,
          ],
        },
        rowMatchingResult: cleanRowResult,
      },
    },
  },

  {
    id:          'producteurs-erreurs-combinees',
    label:       'Erreurs combinées',
    description: '1 colonne manquante + 4 erreurs + 2 avertissements',
    group:       'Producteurs',
    folder:      'Files treatment scenarios',
    scope:       'matching',
    state: {
      producteurs: {
        matchingResult: {
          totalMatched:  2394,
          totalExpected: 2400,
          surfaceHa:     534,
          columns: [
            { yourColumn: null,                             tolbiColumn: 'CODE NAT PRODUCTEUR' },
            { yourColumn: 'code_coop',                      tolbiColumn: 'CODE COOP PRODUCTEUR' },
            { yourColumn: 'code_producteur',                tolbiColumn: 'CODE PRODUCTEUR PARTENAIRE' },
            { yourColumn: 'nom_et_prénom',                  tolbiColumn: 'NOM ET PRENOM' },
            { yourColumn: 'genre',                          tolbiColumn: 'GENRE' },
            { yourColumn: 'age',                            tolbiColumn: 'AGE' },
            { yourColumn: 'préfecture',                     tolbiColumn: 'PREFECTURE' },
            { yourColumn: 'sous_préfecture',                tolbiColumn: 'SOUS PREFECTURE' },
            { yourColumn: 'sections',                       tolbiColumn: 'SECTIONS' },
            { yourColumn: 'localités',                      tolbiColumn: 'LOCALITES' },
            { yourColumn: 'villages',                       tolbiColumn: 'VILLAGES' },
            { yourColumn: 'cni',                            tolbiColumn: 'PIECES IDENTITEES CNI/AUTRES' },
            { yourColumn: 'téléphone',                      tolbiColumn: 'TELEPHONE PRODUCTEUR' },
            { yourColumn: 'cultures_pratiquées',            tolbiColumn: 'CULTURES PRATIQUEES' },
            { yourColumn: "superficie_de_l'exploitation",   tolbiColumn: "SURPERFICIE DE L'EXPLOITATION" },
          ],
        },
        rowMatchingResult: {
          totalMatched:  2396,
          totalExpected: 2400,
          surfaceHa:     534,
          errorCount:    4,
          warningCount:  2,
          geoColumns:    GEO_COLS,
          excelColumns:  EXCEL_COLS,
          rows:          [...GEO_ERROR_ROWS, ...GEO_CLEAN_ROWS_WARN],
        },
        atelierGeo: atelierGeoDemo,
      },
    },
  },

  {
    id:          'producteurs-finalisation-partielle',
    label:       'Finalisation partielle — valides + rejets',
    description: '2 396 producteurs prêts, 4 en erreur mis de côté',
    group:       'Producteurs',
    folder:      'Files treatment scenarios',
    scope:       'matching',
    state: {
      producteurs: {
        matchingResult: {
          totalMatched:  2394,
          totalExpected: 2400,
          surfaceHa:     534,
          columns:       STANDARD_COLUMNS,
        },
        rowMatchingResult: {
          totalMatched:  2396,
          totalExpected: 2400,
          surfaceHa:     534,
          errorCount:    4,
          warningCount:  0,
          geoColumns:    GEO_COLS,
          excelColumns:  EXCEL_COLS,
          rows:          [...GEO_ERROR_ROWS, ...GEO_CLEAN_ROWS],
        },
        atelierGeo: atelierGeoDemo,
      },
    },
  },

  {
    id:          'producteurs-erreur-fichiers',
    label:       'Avertissements fichiers',
    description: '2 avertissements dans le fichier Excel',
    group:       'Producteurs',
    folder:      'Files treatment scenarios',
    scope:       'matching',
    state: {
      producteurs: {
        rowMatchingResult: {
          totalMatched:  2394,
          totalExpected: 2400,
          surfaceHa:     534,
          errorCount:    0,
          warningCount:  2,
          geoColumns:    ['FID', 'CODE_WAYPT', 'SURF_HA', 'DATE_GPS', 'PR_GPS', 'WKT_GEOM'],
          excelColumns:  ['ID_INTERNE', 'Ref_Waypoint', 'Nom', 'Prénom', 'Village', 'CNI'],
          rows: [
            {
              index: 0,
              geoCells: [
                { value: '0' },
                { value: 'ZN1_WP042' },
                { value: '2.45' },
                { value: '17541992012' },
                { value: '1.2m' },
                { value: 'POLYGON((' },
              ],
              excelCells: [
                { value: 'AGRI-042' },
                { value: 'Champ vide', hasWarning: true },
                { value: 'Diop' },
                { value: 'Moussa' },
                { value: 'Tivaouane' },
                { value: '17420011' },
              ],
            },
            {
              index: 1,
              geoCells: [
                { value: '1' },
                { value: 'ZN1_WP043' },
                { value: '1.80' },
                { value: '17541992012' },
                { value: '0.9m' },
                { value: 'POLYGON((' },
              ],
              excelCells: [
                { value: 'AGRI-043' },
                { value: 'Champ vide', hasWarning: true },
                { value: 'Ndiaye' },
                { value: 'Fatou' },
                { value: 'Tivaouane' },
                { value: '17420012' },
              ],
            },
            {
              index: 2,
              geoCells: [
                { value: '2' },
                { value: 'ZN1_WP044' },
                { value: '3.10' },
                { value: '-16.4790, 14.5937' },
                { value: '1.5m' },
                { value: 'POLYGON((' },
              ],
              excelCells: [
                { value: 'AGRI-044' },
                { value: 'ZN1_WP044' },
                { value: 'Cissé' },
                { value: 'Babacar' },
                { value: 'Kolda' },
                { value: '17420013' },
              ],
            },
            {
              index: 3,
              geoCells: [
                { value: '3' },
                { value: 'ZN1_WP045' },
                { value: '0.95' },
                { value: '-16.9201, 14.7012' },
                { value: '2.1m' },
                { value: 'POLYGON((' },
              ],
              excelCells: [
                { value: 'AGRI-045' },
                { value: 'ZN1_WP045' },
                { value: 'Diallo' },
                { value: 'Ibrahim' },
                { value: 'Kolda' },
                { value: '17420014' },
              ],
            },
            {
              index: 4,
              geoCells: [
                { value: '4' },
                { value: 'ZN1_WP046' },
                { value: '5.00' },
                { value: '-16.9850, 14.6937' },
                { value: '1.0m' },
                { value: 'POLYGON((' },
              ],
              excelCells: [
                { value: 'AGRI-046' },
                { value: 'ZN1_WP046' },
                { value: 'Kouassi' },
                { value: 'Jean' },
                { value: 'Kolda' },
                { value: '17420015' },
              ],
            },
            {
              index: 5,
              geoCells: [
                { value: '5' },
                { value: 'ZN1_WP047' },
                { value: '2.10' },
                { value: '-16.9850, 14.5937' },
                { value: '1.2m' },
                { value: 'POLYGON((' },
              ],
              excelCells: [
                { value: 'AGRI-047' },
                { value: 'ZN1_WP047' },
                { value: 'Sene' },
                { value: 'Mohamed' },
                { value: 'Kolda' },
                { value: '17420016' },
              ],
            },
            {
              index: 6,
              geoCells: [
                { value: '6' },
                { value: 'ZN1_WP048' },
                { value: '1.50' },
                { value: '-16.4790, 14.5937' },
                { value: '2.0m' },
                { value: 'POLYGON((' },
              ],
              excelCells: [
                { value: 'AGRI-048' },
                { value: 'ZN1_WP048' },
                { value: 'Ba' },
                { value: 'Aminata' },
                { value: 'Kolda' },
                { value: '17420017' },
              ],
            },
          ],
        },
      },
    },
  },

  {
    id:          'producteurs-erreur-traitement',
    label:       'Erreur de traitement',
    description: 'Erreur inattendue lors de l\'analyse des données',
    group:       'Producteurs',
    folder:      'Files treatment scenarios',
    scope:       'matching',
    state: {
      producteurs: {
        processingError: true,
      },
    },
  },

  {
    id:          'producteurs-erreur-concordance',
    label:       'Erreur de concordance',
    description: '1 colonne manquante après traitement',
    group:       'Producteurs',
    folder:      'Files treatment scenarios',
    scope:       'matching',
    state: {
      producteurs: {
        matchingResult: {
          totalMatched:  2394,
          totalExpected: 2400,
          surfaceHa:     534,
          columns: [
            { yourColumn: null,                             tolbiColumn: 'CODE NAT PRODUCTEUR' },
            { yourColumn: 'code_coop',                      tolbiColumn: 'CODE COOP PRODUCTEUR' },
            { yourColumn: 'code_producteur',                tolbiColumn: 'CODE PRODUCTEUR PARTENAIRE' },
            { yourColumn: 'nom_et_prénom',                  tolbiColumn: 'NOM ET PRENOM' },
            { yourColumn: 'genre',                          tolbiColumn: 'GENRE' },
            { yourColumn: 'age',                            tolbiColumn: 'AGE' },
            { yourColumn: 'préfecture',                     tolbiColumn: 'PREFECTURE' },
            { yourColumn: 'sous_préfecture',                tolbiColumn: 'SOUS PREFECTURE' },
            { yourColumn: 'sections',                       tolbiColumn: 'SECTIONS' },
            { yourColumn: 'localités',                      tolbiColumn: 'LOCALITES' },
            { yourColumn: 'villages',                       tolbiColumn: 'VILLAGES' },
            { yourColumn: 'cni',                            tolbiColumn: 'PIECES IDENTITEES CNI/AUTRES' },
            { yourColumn: 'téléphone',                      tolbiColumn: 'TELEPHONE PRODUCTEUR' },
            { yourColumn: 'cultures_pratiquées',            tolbiColumn: 'CULTURES PRATIQUEES' },
            { yourColumn: "superficie_de_l'exploitation",   tolbiColumn: "SURPERFICIE DE L'EXPLOITATION" },
          ],
        },
        rowMatchingResult: {
          totalMatched:  2394,
          totalExpected: 2400,
          surfaceHa:     534,
          errorCount:    0,
          warningCount:  0,
          geoColumns:    ['FID', 'CODE_WAYPT', 'SURF_HA', 'DATE_GPS', 'PR_GPS', 'WKT_GEOM'],
          excelColumns:  ['ID_INTERNE', 'Ref_Waypoint', 'Nom', 'Prénom', 'Village', 'CNI'],
          rows: [
            { index: 0, geoCells: [{ value: '0' }, { value: 'ZN1_WP042' }, { value: '2.45' }, { value: '-16.9850, 14.6937' }, { value: '1.2m' }, { value: 'POLYGON((' }], excelCells: [{ value: 'AGRI-042' }, { value: 'ZN1_WP042' }, { value: 'Diop' }, { value: 'Moussa' }, { value: 'Tivaouane' }, { value: '17420011' }] },
            { index: 1, geoCells: [{ value: '1' }, { value: 'ZN1_WP043' }, { value: '1.80' }, { value: '-16.9850, 14.5937' }, { value: '0.9m' }, { value: 'POLYGON((' }], excelCells: [{ value: 'AGRI-043' }, { value: 'ZN1_WP043' }, { value: 'Ndiaye' }, { value: 'Fatou' }, { value: 'Tivaouane' }, { value: '17420012' }] },
            { index: 2, geoCells: [{ value: '2' }, { value: 'ZN1_WP044' }, { value: '3.10' }, { value: '-16.4790, 14.5937' }, { value: '1.5m' }, { value: 'POLYGON((' }], excelCells: [{ value: 'AGRI-044' }, { value: 'ZN1_WP044' }, { value: 'Cissé' }, { value: 'Babacar' }, { value: 'Kolda' }, { value: '17420013' }] },
            { index: 3, geoCells: [{ value: '3' }, { value: 'ZN1_WP045' }, { value: '0.95' }, { value: '-16.9201, 14.7012' }, { value: '2.1m' }, { value: 'POLYGON((' }], excelCells: [{ value: 'AGRI-045' }, { value: 'ZN1_WP045' }, { value: 'Diallo' }, { value: 'Ibrahim' }, { value: 'Kolda' }, { value: '17420014' }] },
            { index: 4, geoCells: [{ value: '4' }, { value: 'ZN1_WP046' }, { value: '5.00' }, { value: '-16.9850, 14.6937' }, { value: '1.0m' }, { value: 'POLYGON((' }], excelCells: [{ value: 'AGRI-046' }, { value: 'ZN1_WP046' }, { value: 'Kouassi' }, { value: 'Jean' }, { value: 'Kolda' }, { value: '17420015' }] },
            { index: 5, geoCells: [{ value: '5' }, { value: 'ZN1_WP047' }, { value: '2.10' }, { value: '-16.9850, 14.5937' }, { value: '1.2m' }, { value: 'POLYGON((' }], excelCells: [{ value: 'AGRI-047' }, { value: 'ZN1_WP047' }, { value: 'Sene' }, { value: 'Mohamed' }, { value: 'Kolda' }, { value: '17420016' }] },
            { index: 6, geoCells: [{ value: '6' }, { value: 'ZN1_WP048' }, { value: '1.50' }, { value: '-16.4790, 14.5937' }, { value: '2.0m' }, { value: 'POLYGON((' }], excelCells: [{ value: 'AGRI-048' }, { value: 'ZN1_WP048' }, { value: 'Ba' }, { value: 'Aminata' }, { value: 'Kolda' }, { value: '17420017' }] },
          ],
        },
      },
    },
  },
]
