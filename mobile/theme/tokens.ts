/**
 * TOLBI design tokens — ported from the Claude Design project
 * `_ds/tolbi-design-system-8a46d8dd/tokens/*.css`.
 *
 * React Native has no CSS custom properties, so the semantic aliases are
 * resolved to concrete hex values here. Components consume `sem` / `color`
 * / `space` / `radius` / `font` / `shadow` — never raw literals.
 */

/* ── Color primitives ─────────────────────────────────────────────── */
export const color = {
  white: '#FFFFFF',
  black: '#000000',

  gray: {
    25: '#FCFCFD',
    50: '#F9FAFB',
    100: '#F2F4F7',
    200: '#EAECF0',
    300: '#D0D5DD',
    400: '#98A2B3',
    500: '#667085',
    600: '#475467',
    700: '#344054',
    800: '#182230',
    900: '#101828',
    950: '#0C111D',
  },

  /* Brand — TOLBI green (base = 500 #066938) */
  brand: {
    25: '#F6F9F8',
    50: '#E6F0EB',
    100: '#B2D1C1',
    200: '#8CBAA3',
    300: '#589B7A',
    400: '#388760',
    500: '#066938',
    600: '#056033',
    700: '#044B28',
    800: '#033A1F',
    900: '#032C18',
    950: '#022112',
  },

  error: {
    25: '#FFFBFA',
    50: '#FEF3F2',
    100: '#FEE4E2',
    200: '#FECDCA',
    300: '#FDA29B',
    400: '#F97066',
    500: '#F04438',
    600: '#D92D20',
    700: '#B42318',
    800: '#912018',
    900: '#7A271A',
  },

  warning: {
    25: '#FFFCF5',
    50: '#FFFAEB',
    100: '#FEF0C7',
    200: '#FEDF89',
    300: '#FEC84B',
    400: '#FDB022',
    500: '#F79009',
    600: '#DC6803',
    700: '#B54708',
    800: '#93370D',
    900: '#7A2E0E',
  },

  success: {
    25: '#F6FEF9',
    50: '#ECFDF3',
    100: '#DCFAE6',
    200: '#A9EFC5',
    300: '#75E0A7',
    400: '#47CD89',
    500: '#17B26A',
    600: '#079455',
    700: '#067647',
    800: '#085D3A',
    900: '#074D31',
  },

  /* Accent gold used on producer ID card */
  gold: '#F7B71D',
} as const

/* ── Semantic aliases (light theme) — resolved to hex ─────────────── */
export const sem = {
  text: {
    primary: color.gray[900],
    primaryOnBrand: color.white,
    secondary: color.gray[700],
    secondaryOnBrand: color.brand[200],
    tertiary: color.gray[600],
    quarterary: color.gray[500],
    quarteraryOnBrand: color.brand[300],
    white: color.white,
    disabled: color.gray[500],
    placeholder: color.gray[500],
    brandPrimary: color.brand[900],
    brandSecondary: color.brand[700],
    brandTertiary: color.brand[600],
    errorPrimary: color.error[600],
    warningPrimary: color.warning[600],
    successPrimary: color.success[600],
  },
  border: {
    primary: color.gray[300],
    secondary: color.gray[200],
    tertiary: color.gray[100],
    disabled: color.gray[300],
    brand: color.brand[300],
    brandSolid: color.brand[600],
    error: color.error[300],
  },
  fg: {
    primary: color.gray[900],
    secondary: color.gray[700],
    tertiary: color.gray[600],
    quarterary: color.gray[500],
    quinary: color.gray[400],
    senary: color.gray[300],
    white: color.white,
    disabled: color.gray[400],
    brandPrimary: color.brand[600],
    brandSecondary: color.brand[500],
    errorPrimary: color.error[600],
    warningPrimary: color.warning[600],
    successPrimary: color.success[600],
  },
  bg: {
    primary: color.white,
    primaryHover: color.gray[50],
    secondary: color.gray[50],
    secondarySubtle: color.gray[25],
    secondaryHover: color.gray[100],
    tertiary: color.gray[100],
    quaternary: color.gray[200],
    disabled: color.gray[100],
    overlay: color.gray[950],
    brandPrimary: color.brand[50],
    brandSecondary: color.brand[100],
    brandSolid: color.brand[600],
    brandSolidHover: color.brand[700],
    brandSection: color.brand[800],
    errorPrimary: color.error[50],
    errorSecondary: color.error[100],
    errorSolid: color.error[600],
    warningPrimary: color.warning[50],
    warningSecondary: color.warning[100],
    warningSolid: color.warning[600],
    successPrimary: color.success[50],
    successSecondary: color.success[100],
    successSolid: color.success[600],
  },
} as const

/* ── Spacing (px) — semantic t-shirt scale ────────────────────────── */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
  '7xl': 64,
} as const

/* ── Radius (px) — aligned 1:1 with the web DS scale (tokens/src/radius) ── */
export const radius = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
  '3xl': 20,
  '4xl': 24,
  full: 9999,
} as const

/* ── Typography ───────────────────────────────────────────────────── */
export const font = {
  // family keys map to the loaded @expo-google-fonts faces
  poppins: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semibold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },
  inter: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
} as const

/* ── Shadows (Untitled UI scale, approximated for RN) ─────────────── */
export const shadow = {
  xs: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 14,
  },
} as const

export const theme = { color, sem, space, radius, font, shadow }
export type Theme = typeof theme
