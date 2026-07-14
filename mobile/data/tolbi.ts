/**
 * TOLBI field-app mock data — ported from the Claude Design prototype's
 * `data-dc-script` (App Terrain.dc.html). Copy is French (tutoiement),
 * Senegal agri context (Kaolack / Ndiaganiao / Nioro).
 */
import type { BadgeColor } from '../components/ds/Badge'
import type { ModuleName } from '../components/ds/ModuleIcon'
import type { Role } from '../store/app'

/* ── Agent (session mock) ─────────────────────────────────────────── */
export const AGENT = {
  firstName: 'Amadou',
  name: 'Amadou Ba',
  init: 'AB',
  phone: '+221 77 123 45 67',
  /** Code personnel de secours pour la démo, si l'activation n'a pas été rejouée dans la session. */
  code: '2468',
}
/**
 * Affectations posées côté web (ADR-0012). Décision produit (13 juil. 2026) :
 * on ne les montre PAS à l'activation — l'écran de reconnaissance ne parle que
 * de l'organisation. Conservées pour l'espace agent (missions).
 */
export const AGENT_AFFECTATIONS = [
  { icon: 'edit', name: 'Recensement Coop Kaolack', sub: 'Formulaire de collecte' },
  { icon: 'sprout', name: 'Crop AI Survey · Maïs', sub: 'Formulaire de collecte · Zone Nioro' },
]

/* ── Onboarding slides ────────────────────────────────────────────── */
export interface Slide {
  icon: string
  tileBg: string
  iconColor: string
  tag: string
  title: string
  body: string
}
export const SLIDES: Slide[] = [
  {
    icon: 'sprout',
    tileBg: '#E6F0EB',
    iconColor: '#066938',
    tag: 'Yield · Crop mapping · Phénologie',
    title: 'Suis tes campagnes depuis le champ',
    body: 'Rendements, stades phénologiques et calendrier de collecte pour tes zones et tes producteurs, du semis à la récolte.',
  },
  {
    icon: 'download',
    tileBg: '#E6F0EB',
    iconColor: '#066938',
    tag: 'Collecte terrain · Hors ligne',
    title: 'Collecte, même sans réseau',
    body: 'Formulaires, photos, points GPS et contours de parcelles sont enregistrés sur le téléphone, puis synchronisés au retour du réseau.',
  },
]

/* ── Organisations ────────────────────────────────────────────────── */
export interface Org {
  name: string
  sub: string
  init: string
  tile: string
  role: string
  /** Affichés sur l'écran de reconnaissance à l'activation (fiche organisation). */
  type?: string
  producteurs?: number
  region?: string
  referent?: string
}
export const ORGS: Org[] = [
  { name: 'Coop. Kaolack', sub: 'Coopérative · 128 producteurs · Yield, Collecte', init: 'CK', tile: '#056033', role: 'agent', type: 'Coopérative', producteurs: 128, region: 'Kaolack, Sénégal', referent: 'Mariama Sow · Resp. opérations' },
  { name: 'Sahel Vert', sub: 'ONG · Projet carbone Ndiaganiao AFR100 · dMRV', init: 'SV', tile: '#0E7A44', role: 'conseiller' },
  { name: 'AgriMaïs SA', sub: 'Agro-industriel · Traçabilité maïs · Trace', init: 'AM', tile: '#B54708', role: 'responsable' },
]

export const ROLE_LABELS: Record<string, string> = {
  agent: 'Agent de terrain',
  conseiller: 'Conseiller agricole',
  responsable: 'Resp. opérations',
}

/* ── Home hub ─────────────────────────────────────────────────────── */
export type ModuleTarget =
  | { kind: 'overlay'; name: string }
  | { kind: 'tab'; name: string }
  | { kind: 'locked' }

export interface HomeModule {
  icon: string
  /** Branded DS module icon — set for tiles that mirror a web Tolbi OS module. */
  moduleIcon?: ModuleName
  label: string
  locked?: boolean
  target: ModuleTarget
}
export const HOME_MODULES: HomeModule[] = [
  { icon: 'sprout', moduleIcon: 'Yield', label: 'Yield', target: { kind: 'overlay', name: 'yield' } },
  { icon: 'grid', label: 'Parcelles', locked: true, target: { kind: 'locked' } },
  { icon: 'edit', moduleIcon: 'Data', label: 'Collecte', target: { kind: 'tab', name: 'collecte' } },
  { icon: 'package', moduleIcon: 'Source', label: 'Procurement', target: { kind: 'overlay', name: 'proc' } },
  { icon: 'credit-card', moduleIcon: 'ID', label: 'ID · INA', target: { kind: 'overlay', name: 'ina' } },
  { icon: 'activity', moduleIcon: 'Carbone', label: 'dMRV', target: { kind: 'overlay', name: 'dmrv' } },
  { icon: 'users', label: 'Producteurs', target: { kind: 'tab', name: 'producers' } },
]

export interface HomeTask {
  n: string
  label: string
  target: ModuleTarget
}
export const HOME_TASKS: Record<string, [HomeTask, HomeTask]> = {
  agent: [
    { n: '3', label: 'Projets en cours', target: { kind: 'overlay', name: 'yield' } },
    { n: '3', label: 'Données en attente de synchronisation', target: { kind: 'tab', name: 'collecte' } },
  ],
  conseiller: [
    { n: '2', label: 'zones en floraison à suivre', target: { kind: 'overlay', name: 'yield' } },
    { n: '14', label: 'parcelles suivies cette semaine', target: { kind: 'tab', name: 'producers' } },
  ],
  responsable: [
    { n: '3', label: 'campagnes actives à superviser', target: { kind: 'overlay', name: 'yield' } },
    { n: '72 %', label: 'taux d’achèvement des collectes', target: { kind: 'tab', name: 'collecte' } },
  ],
}

export interface HomeProject {
  icon: string
  moduleIcon?: ModuleName
  module: string
  name: string
  badge: string
  badgeC: BadgeColor
  m1: string; u1: string; l1: string
  m2: string; u2: string; l2: string
  m3: string; l3: string; m3c: string
  target: ModuleTarget
}
export const HOME_PROJECTS: HomeProject[] = [
  { icon: 'sprout', moduleIcon: 'Yield', module: 'Yield', name: 'Arachide · Hivernale 2026', badge: 'Floraison', badgeC: 'success',
    m1: '1,24', u1: 't/ha', l1: 'Rendement', m2: '128', u2: '', l2: 'Producteurs', m3: '+8 %', l3: 'vs 2025', m3c: '#079455',
    target: { kind: 'overlay', name: 'yield' } },
  { icon: 'sprout', moduleIcon: 'Yield', module: 'Yield', name: 'Maïs · Nioro 2026', badge: 'Maturation', badgeC: 'warning',
    m1: '1,08', u1: 't/ha', l1: 'Rendement', m2: '74', u2: '', l2: 'Producteurs', m3: '+3 %', l3: 'vs 2025', m3c: '#079455',
    target: { kind: 'overlay', name: 'yield' } },
  { icon: 'edit', moduleIcon: 'Data', module: 'Collecte', name: 'Recensement Coop Kaolack', badge: 'En cours', badgeC: 'brand',
    m1: '45', u1: '/ 60', l1: 'Collectes', m2: '75', u2: '%', l2: 'Avancement', m3: '3', l3: 'Sans sync', m3c: '#101828',
    target: { kind: 'tab', name: 'collecte' } },
  { icon: 'package', moduleIcon: 'Source', module: 'Procurement', name: 'Supply chain Maïs · AgriMaïs', badge: 'Étape 4/6', badgeC: 'blue',
    m1: '1 840', u1: '', l1: 'Sacs', m2: '512', u2: '', l2: 'En transit', m3: '1', l3: 'Goulot', m3c: '#DC6803',
    target: { kind: 'overlay', name: 'proc' } },
]

/* ── Producteurs (KYF registry) ───────────────────────────────────── */
export interface Producer {
  init: string
  name: string
  meta: string
  stade: string
  stadeColor: BadgeColor
}
const STADE_COLOR: Record<string, BadgeColor> = {
  Floraison: 'success', Maturation: 'warning', Croissance: 'brand',
}
export const PRODUCERS: Producer[] = [
  { init: 'ID', name: 'Ibrahima Diop', meta: 'Arachide · 2,4 ha · Ndiaganiao', stade: 'Floraison', stadeColor: STADE_COLOR.Floraison },
  { init: 'AN', name: 'Awa Ndiaye', meta: 'Arachide · 1,8 ha · Keur Madior', stade: 'Floraison', stadeColor: STADE_COLOR.Floraison },
  { init: 'MS', name: 'Moussa Sarr', meta: 'Maïs · 3,1 ha · Nioro', stade: 'Maturation', stadeColor: STADE_COLOR.Maturation },
  { init: 'FF', name: 'Fatou Fall', meta: 'Arachide · 1,2 ha · Ndoffane', stade: 'Croissance', stadeColor: STADE_COLOR.Croissance },
]

/* ── Producer ID-card transactions ────────────────────────────────── */
export interface ProducerTx {
  icon: string
  iconBg: string
  iconC: string
  title: string
  sub: string
  amt: string
  amtC: string
  det: [string, string][]
}
export const PRODUCER_TX: ProducerTx[] = [
  { icon: 'grid', iconBg: '#B2D1C1', iconC: '#044B28', title: 'Dépôt de 24 sacs de récolte', sub: 'Arachide · Magasin Ndiaganiao · 7 juil. 09:40', amt: '24 sacs', amtC: '#344054',
    det: [['Opération', 'Dépôt de récolte'], ['Date', 'Lundi 7 juillet 2026 · 09:40'], ['Vers', 'Magasin Coop. Kaolack · Ndiaganiao'], ['Détail', '24 sacs arachide · 50 kg · lot LOT-AR-0142'], ['Agent', 'Amadou Ba (scan carte)'], ['Lieu', 'Ndiaganiao · GPS ±4 m'], ['Référence', 'OP-2026-18452']] },
  { icon: 'download', iconBg: '#B2D1C1', iconC: '#044B28', title: 'Réception de 6 sacs d’intrants', sub: 'NPK 15-15-15 · Coop. Kaolack · 5 juil. 11:20', amt: '6 sacs', amtC: '#344054',
    det: [['Opération', 'Réception d’intrants'], ['Date', 'Samedi 5 juillet 2026 · 11:20'], ['De', 'Coop. Kaolack · Magasin central'], ['Détail', '6 sacs NPK 15-15-15 · 50 kg'], ['Agent', 'Khady Ndour (scan carte)'], ['Lieu', 'Ndiaganiao'], ['Référence', 'OP-2026-18311']] },
  { icon: 'check-circle', iconBg: '#DCFAE6', iconC: '#079455', title: 'Validation travail prestataire', sub: 'Labour · Keur Madior · 2 juil. 16:05', amt: '2,4 ha', amtC: '#079455',
    det: [['Opération', 'Validation de prestation'], ['Date', 'Jeudi 2 juillet 2026 · 16:05'], ['Prestataire', 'GIE Bokk Jom · tractoriste'], ['Détail', 'Labour parcelle Keur Madior · 2,4 ha'], ['Validé par', 'Ibrahima Diop (scan carte)'], ['Lieu', 'Keur Madior'], ['Référence', 'OP-2026-18102']] },
  { icon: 'download', iconBg: '#B2D1C1', iconC: '#044B28', title: 'Réception de 2 sacs d’urée', sub: 'Urée 46% · Coop. Kaolack · 28 juin 08:15', amt: '2 sacs', amtC: '#344054',
    det: [['Opération', 'Réception d’intrants'], ['Date', 'Dimanche 28 juin 2026 · 08:15'], ['De', 'Coop. Kaolack · Magasin central'], ['Détail', '2 sacs urée 46% · 50 kg'], ['Agent', 'Amadou Ba (scan carte)'], ['Lieu', 'Ndiaganiao'], ['Référence', 'OP-2026-17893']] },
  { icon: 'check-circle', iconBg: '#DCFAE6', iconC: '#079455', title: 'Contrôle qualité récolte', sub: 'Humidité conforme · Magasin · 24 juin 10:32', amt: 'Conforme', amtC: '#079455',
    det: [['Opération', 'Contrôle qualité'], ['Date', 'Mercredi 24 juin 2026 · 10:32'], ['Lieu', 'Magasin Coop. Kaolack'], ['Détail', 'Humidité 8,2 % · impuretés 1,1 % · conforme'], ['Agent', 'Khady Ndour (scan carte)'], ['Lot', 'LOT-AR-0119'], ['Référence', 'OP-2026-17701']] },
]

/* ── Notifications ────────────────────────────────────────────────── */
export interface Notif {
  icon: string; iconBg: string; iconC: string; unread: boolean
  title: string; body: string; time: string
}
export const NOTIFS: Notif[] = [
  { icon: 'check-circle', iconBg: '#DCFAE6', iconC: '#079455', unread: true, title: 'Projet terminé', body: 'Yield Kaolack · Hivernale 2026 — les résultats de la S29 sont disponibles.', time: 'Il y a 2 h' },
  { icon: 'alert-triangle', iconBg: '#FEF0C7', iconC: '#DC6803', unread: true, title: 'Alerte phénologie', body: 'Stade maturation atteint sur la zone Kaolack Nord. Collecte possible dès la S30.', time: 'Il y a 5 h' },
  { icon: 'zap', iconBg: '#B2D1C1', iconC: '#044B28', unread: false, title: 'Crédits', body: 'Plus que 240 crédits disponibles sur votre compte.', time: 'Hier' },
  { icon: 'download', iconBg: '#F2F4F7', iconC: '#475467', unread: false, title: 'Synchronisation réussie', body: '12 collectes et 34 photos envoyées vers DataOS.', time: 'Il y a 2 jours' },
]

/* ── Formation ────────────────────────────────────────────────────── */
export const FORM_VIDEOS = [
  { title: 'Créer une collecte terrain', meta: 'Formulaire · GPS · photo · polygone', dur: '4:12', lang: 'FR · Wolof', langC: 'brand' as BadgeColor },
  { title: 'Émettre une carte INA', meta: 'Scan carte · OTP · validation producteur', dur: '3:05', lang: 'FR · Wolof', langC: 'brand' as BadgeColor },
  { title: 'Scanner les sacs (Trace)', meta: 'Scan en rafale et validation d’étape', dur: '2:48', lang: 'FR', langC: 'gray' as BadgeColor },
  { title: 'Lire la carte de rendement', meta: 'Yield · phénologie · fertilisation', dur: '5:30', lang: 'FR', langC: 'gray' as BadgeColor },
]
export const FORM_DOCS = [
  { title: 'Guide de l’agent de terrain', meta: 'PDF · 24 pages · disponible hors ligne' },
  { title: 'Fiche fertilisation raisonnée', meta: 'PDF · 6 pages' },
  { title: 'Procédure supply chain Maïs', meta: 'PDF · 12 pages' },
]

/* ── Collecte projects ────────────────────────────────────────────── */
export const COLLECTE_PROJECTS = [
  { name: 'Recensement Coop Kaolack', sub: 'Template TOLBI Farm · sync KYF', badge: 'En cours', badgeC: 'brand' as BadgeColor, done: 45, total: 60, cta: 'Continuer la collecte', primary: true },
  { name: 'Crop AI Survey · Maïs', sub: 'Point flagging · Zone Nioro', badge: 'Pas commencé', badgeC: 'gray' as BadgeColor, done: 0, total: 24, cta: 'Commencer la collecte', primary: false },
]

/* Collecte form: 5 steps */
export const FORM_STEPS = ['Producteur', 'Stade', 'Photo', 'GPS', 'Parcelle']
export const STADES = ['Semis', 'Levée', 'Croissance', 'Floraison', 'Maturation', 'Récolté']
export const FORM_PRODUCERS = [
  { init: 'ID', name: 'Ibrahima Diop', village: 'Ndiaganiao · INA-SN-04217' },
  { init: 'AN', name: 'Awa Ndiaye', village: 'Keur Madior · INA-SN-04188' },
  { init: 'MS', name: 'Moussa Sarr', village: 'Nioro · INA-SN-04203' },
  { init: 'FF', name: 'Fatou Fall', village: 'Ndoffane · INA-SN-04251' },
]
