import { Text, TextProps } from 'react-native'
import { font, sem } from '../../theme/tokens'

/** Base text: Inter regular, primary color, no OS font-scaling drift. */
export function Txt({ style, ...rest }: TextProps) {
  return (
    <Text
      allowFontScaling={false}
      {...rest}
      style={[{ fontFamily: font.inter.regular, color: sem.text.primary }, style]}
    />
  )
}

/** fontFamily helpers so screens read like the design's `font:600 15px Poppins`. */
export const ff = {
  poppins: font.poppins,
  inter: font.inter,
}
