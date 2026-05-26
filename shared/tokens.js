// CJS version — used by tailwind.config.js (Node.js, no TypeScript transform)
// Keep in sync with tokens.ts

const colors = {
  primary:       '#056033',
  primaryHover:  '#044b28',
  brand50:       '#e6f0eb',
  brand700:      '#044b28',
  topbar:        'rgba(6, 105, 56, 0.95)',
  textPrimary:     '#101828',
  textSecondary:   '#344054',
  textTertiary:    '#475467',
  textQuaternary:  '#667085',
  textMuted:       '#667085',
  textPlaceholder: '#667085',
  textDisabled:    '#d0d5dd',
  textNavHover:    '#182230',
  textOnBrand:     '#ffffff',
  overlay:      '#101828',
  modalOverlay: '#0c111d',
  white:         '#ffffff',
  surface:       '#f9fafb',
  surfaceAlt:    '#f2f4f7',
  surfaceActive: '#f9fafb',
  border:       '#eaecf0',
  borderStrong: '#d0d5dd',
  warningBg:     '#fffaeb',
  warningBorder: '#fedf89',
  warningText:   '#b54708',
  statusCompleted:  '#16a34a',
  statusInprogress: '#ea580c',
  statusPending:    '#9ca3af',
  statusAnomaly:    '#d92d20',
  statusOffline:    '#d0d5dd',
}

const spacing = { xs: 4, sm: 6, md: 8, lg: 12, xl: 16, '2xl': 20, '3xl': 24, '4xl': 32 }
const radius  = { sm: 6, md: 8, lg: 12, xl: 16, '4xl': 24, full: 9999 }
const fontSize    = { xs: 12, sm: 14, md: 16, lg: 18, xl: 24, '2xl': 30 }
const lineHeight  = { xs: 18, sm: 20, md: 24, lg: 28, xl: 32, '2xl': 38 }

module.exports = { colors, spacing, radius, fontSize, lineHeight }
