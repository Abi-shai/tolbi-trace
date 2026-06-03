import type { Scenario } from '~/types/scenario'

export const fournisseursScenarios: Scenario[] = [
  {
    id:          'fournisseurs-erreur-concordance',
    label:       'Erreur de concordance',
    description: '1 colonne manquante après traitement',
    group:       'Fournisseurs',
    state: {
      fournisseurs: {
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
      },
    },
  },
]
