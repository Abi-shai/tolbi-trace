import type { Organisation } from '~/types/organisation'

// Organisations dont le User connecté (Jean Baptiste Saar) est membre.
// La première est l'org active par défaut. Cf. ADR-0014 : chaque membre porte
// exactement UN rôle — natif (proprietaire / super-admin / admin, accès complet
// partout, pouvoirs d'org distincts) ou custom (nom + modules × Lecteur/Éditeur).
// Les agents portent des grants modules BINAIRES (porte mobile, sans niveau).
// Couverture de démo : JBS est Propriétaire de la 1re org, porteur d'un rôle
// custom dans la 2e, Admin natif dans la 3e — les gates varient donc au switch.
export const organisationsMock: Organisation[] = [
  {
    id:             'org-agro',
    name:           'AgroSénégal SA',
    type:           'agroindustriel',
    logoInitials:   'AS',
    logoColor:      '#1D9E75',
    enabledModules: ['id', 'ina', 'scan', 'dataos', 'source', 'yield', 'trace', 'carbone'],
    roles: [
      { id: 'role-qualite',  name: 'Responsable qualité', access: { id: 'editeur', trace: 'lecteur' } },
      { id: 'role-collecte', name: 'Suivi de collecte',   access: { dataos: 'editeur', source: 'lecteur' } },
    ],
    plan: {
      name:            'Business',
      status:          'actif',
      creditsIncluded: 100,
      creditsUsed:     68,
      renewsOn:        '2026-08-01',
      prix:            '150 000 FCFA / mois',
    },
    membres: [
      { id: 'm-jbs', prenom: 'Jean Baptiste', nom: 'Saar', email: 'jeanbaptiste@gmail.com', telephone: '+221 77 397 13 70', roleId: 'proprietaire', status: 'actif', isCurrentUser: true },
      { id: 'm-awa', prenom: 'Awa',      nom: 'Ndiaye', email: 'awa.ndiaye@agrosenegal.sn',   telephone: '+221 77 123 45 67', roleId: 'super-admin',   status: 'actif',  isCurrentUser: false },
      { id: 'm-mou', prenom: 'Moussa',   nom: 'Diop',   email: 'moussa.diop@agrosenegal.sn',   telephone: '+221 70 234 56 78', roleId: 'role-collecte', status: 'actif',  isCurrentUser: false },
      { id: 'm-fat', prenom: 'Fatou',    nom: 'Sarr',   email: 'fatou.sarr@agrosenegal.sn',    telephone: '+221 76 345 67 89', roleId: 'role-collecte', status: 'actif',  isCurrentUser: false },
      { id: 'm-ibr', prenom: 'Ibrahima', nom: 'Fall',   email: 'ibrahima.fall@agrosenegal.sn', telephone: '+221 78 456 78 90', roleId: 'role-qualite',  status: 'actif',  isCurrentUser: false },
      { id: 'm-che', prenom: 'Cheikh',   nom: 'Ba',     email: 'cheikh.ba@agrosenegal.sn',     telephone: '+221 77 567 89 01', roleId: 'admin',         status: 'invite', isCurrentUser: false },
    ],
    agents: [
      { id: 'ag-diallo', prenom: 'Mamadou', nom: 'Diallo', telephone: '+221 77 812 34 56', modules: ['source', 'dataos'], statut: 'actif'   },
      { id: 'ag-sow',    prenom: 'Fatou',   nom: 'Sow',    telephone: '+221 70 823 45 67', modules: ['dataos'],           statut: 'actif'   },
      { id: 'ag-ba',     prenom: 'Ibrahim', nom: 'Bâ',     telephone: '+221 76 834 56 78', modules: ['source', 'ina'],    statut: 'actif'   },
      { id: 'ag-ndiaye', prenom: 'Ousmane', nom: 'Ndiaye', telephone: '+221 78 845 67 89', modules: ['dataos'],           statut: 'inactif' },
    ],
    paymentMethods: [
      { id: 'pm-visa', brand: 'visa', last4: '4242', expMonth: 8, expYear: 2027, isDefault: true },
    ],
    invoices: [
      { id: 'inv-6', numero: 'FCT-2026-0006', date: '2026-06-01', montant: '150 000 FCFA', status: 'payee' },
      { id: 'inv-5', numero: 'FCT-2026-0005', date: '2026-05-01', montant: '150 000 FCFA', status: 'payee' },
      { id: 'inv-4', numero: 'FCT-2026-0004', date: '2026-04-01', montant: '150 000 FCFA', status: 'payee' },
    ],
  },
  {
    id:             'org-kaolack',
    name:           'Coopérative Kaolack Maïs',
    type:           'cooperative',
    logoInitials:   'KM',
    logoColor:      '#E9A23B',
    enabledModules: ['id', 'ina', 'dataos', 'source'],
    roles: [
      { id: 'role-terrain-k', name: 'Coordination terrain', access: { source: 'editeur', dataos: 'lecteur' } },
    ],
    plan: {
      name:            'Découverte',
      status:          'essai',
      trialDaysLeft:   8,
      creditsIncluded: 20,
      creditsUsed:     12,
    },
    membres: [
      { id: 'm-mam',  prenom: 'Mamadou',      nom: 'Sow',    email: 'mamadou.sow@coopkaolack.sn',    telephone: '+221 77 601 22 33', roleId: 'proprietaire',   status: 'actif', isCurrentUser: false },
      { id: 'm-ais',  prenom: 'Aïssatou',     nom: 'Diallo', email: 'aissatou.diallo@coopkaolack.sn', telephone: '+221 70 602 44 55', roleId: 'super-admin',    status: 'actif', isCurrentUser: false },
      { id: 'm-jbs2', prenom: 'Jean Baptiste', nom: 'Saar',  email: 'jeanbaptiste@gmail.com',        telephone: '+221 77 397 13 70', roleId: 'role-terrain-k', status: 'actif', isCurrentUser: true },
    ],
    agents: [
      { id: 'ag-fall',  prenom: 'Awa',   nom: 'Fall',  telephone: '+221 77 601 33 44', modules: ['dataos'],           statut: 'actif' },
      { id: 'ag-gueye', prenom: 'Modou', nom: 'Gueye', telephone: '+221 70 602 55 66', modules: ['source', 'dataos'], statut: 'actif' },
    ],
    paymentMethods: [],
    invoices:       [],
  },
  {
    id:             'org-tolbi-demo',
    name:           'Tolbi Demo',
    type:           'agroindustriel',
    logoInitials:   'TD',
    logoColor:      '#5B7FE0',
    enabledModules: ['id', 'ina', 'dataos', 'source', 'scan'],
    roles:          [],
    plan: {
      name:            'Découverte',
      status:          'essai',
      trialDaysLeft:   14,
      creditsIncluded: 50,
      creditsUsed:     5,
    },
    membres: [
      { id: 'm-jbs3', prenom: 'Jean Baptiste', nom: 'Saar',   email: 'jeanbaptiste@gmail.com', telephone: '+221 77 397 13 70', roleId: 'admin',        status: 'actif', isCurrentUser: true },
      { id: 'm-awa2', prenom: 'Awa',           nom: 'Ndiaye', email: 'awa.ndiaye@tolbi.co',    telephone: '+221 77 700 11 22', roleId: 'proprietaire', status: 'actif', isCurrentUser: false },
    ],
    agents: [
      { id: 'ag-mbaye', prenom: 'Sokhna', nom: 'Mbaye', telephone: '+221 77 700 22 33', modules: ['dataos', 'ina'], statut: 'actif' },
    ],
    paymentMethods: [],
    invoices:       [],
  },
]
