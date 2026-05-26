/**
 * Type shim — lucide-react-native v1.x exposes web SVG types in some builds.
 * This override ensures icon props (color, size) are correctly typed for RN.
 */
declare module 'lucide-react-native' {
  import { FC } from 'react'
  import { SvgProps } from 'react-native-svg'

  export interface LucideProps extends Omit<SvgProps, 'ref'> {
    color?:             string
    size?:              number | string
    strokeWidth?:       number | string
    absoluteStrokeWidth?: boolean
  }

  export type LucideIcon = FC<LucideProps>

  // Common icons used in this project
  export const AlertCircle:    LucideIcon
  export const AlertTriangle:  LucideIcon
  export const ArrowLeft:      LucideIcon
  export const CheckCircle2:   LucideIcon
  export const CheckSquare:    LucideIcon
  export const ChevronRight:   LucideIcon
  export const Clock:          LucideIcon
  export const Download:       LucideIcon
  export const Eye:            LucideIcon
  export const FileText:       LucideIcon
  export const QrCode:         LucideIcon
  export const User:           LucideIcon
  export const X:              LucideIcon
}
