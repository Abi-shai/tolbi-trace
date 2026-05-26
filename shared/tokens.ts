/**
 * Tolbi OS — Design tokens partagés web + mobile
 * Source de vérité unique. Importé par :
 *   - mobile/global.css  (@theme — tailwindcss v4)
 *   - composants RN directement   (StyleSheet fallback)
 */

// ── Couleurs ─────────────────────────────────────────────────────────────────

export const colors = {
  // Brand
  primary:       '#056033',
  primaryHover:  '#044b28',
  brand50:       '#e6f0eb',
  brand700:      '#044b28',

  // Topbar
  topbar:        'rgba(6, 105, 56, 0.95)',

  // Texte
  textPrimary:     '#101828',
  textSecondary:   '#344054',
  textTertiary:    '#475467',
  textQuaternary:  '#667085',
  textMuted:       '#667085',
  textPlaceholder: '#667085',
  textDisabled:    '#d0d5dd',
  textNavHover:    '#182230',
  textOnBrand:     '#ffffff',

  // Overlay
  overlay:      '#101828',
  modalOverlay: '#0c111d',

  // Backgrounds
  white:         '#ffffff',
  surface:       '#f9fafb',
  surfaceAlt:    '#f2f4f7',
  surfaceActive: '#f9fafb',

  // Borders
  border:       '#eaecf0',
  borderStrong: '#d0d5dd',

  // Warning
  warningBg:     '#fffaeb',
  warningBorder: '#fedf89',
  warningText:   '#b54708',

  // Statuts
  statusCompleted:  '#16a34a',
  statusInprogress: '#ea580c',
  statusPending:    '#9ca3af',
  statusAnomaly:    '#d92d20',
  statusOffline:    '#d0d5dd',

  // Graph nodes (Trace module)
  nodeCooperative: '#7c3aed',
  nodeStep:        '#056033',
  nodeAgent:       '#475467',
  nodeProducer:    '#2563eb',
  nodeBag:         '#ea580c',
} as const

// ── Espacement ───────────────────────────────────────────────────────────────

export const spacing = {
  xs:   4,
  sm:   6,
  md:   8,
  lg:   12,
  xl:   16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
} as const

// ── Border radius ─────────────────────────────────────────────────────────────

export const radius = {
  sm:   6,
  md:   8,
  lg:   12,
  xl:   16,
  '4xl': 24,
  full: 9999,
} as const

// ── Typographie ───────────────────────────────────────────────────────────────

export const fontSize = {
  xs:  12,
  sm:  14,
  md:  16,
  lg:  18,
  xl:  24,
  '2xl': 30,
} as const

export const lineHeight = {
  xs:  18,
  sm:  20,
  md:  24,
  lg:  28,
  xl:  32,
  '2xl': 38,
} as const

export const fontWeight = {
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
}

export const fontFamily = {
  sans: 'Poppins',
  mono: 'Inter',
} as const

// ── Ombres (iOS / Android) ────────────────────────────────────────────────────

export const shadows = {
  xs: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
} as const

// ── Export groupé ─────────────────────────────────────────────────────────────

const tokens = { colors, spacing, radius, fontSize, lineHeight, fontWeight, fontFamily, shadows }
export default tokens
