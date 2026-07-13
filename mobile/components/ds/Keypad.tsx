import { Pressable, View } from 'react-native'
import { Icon } from './Icon'
import { Txt } from './Txt'
import { color, sem, font, radius } from '../../theme/tokens'

const ROWS: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
]

/** Pavé numérique intégré — remplace le clavier système pour OTP et code personnel. */
export function Keypad({
  onKey,
  onDelete,
  disabled = false,
}: {
  onKey: (digit: string) => void
  onDelete: () => void
  disabled?: boolean
}) {
  return (
    <View style={{ gap: 4, opacity: disabled ? 0.35 : 1 }}>
      {ROWS.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 4 }}>
          {row.map((k, i) =>
            k === '' ? (
              <View key={i} style={{ flex: 1 }} />
            ) : (
              <Pressable
                key={i}
                disabled={disabled}
                onPress={() => (k === 'del' ? onDelete() : onKey(k))}
                style={({ pressed }) => ({
                  flex: 1,
                  height: 58,
                  borderRadius: radius['2xl'],
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? color.gray[100] : 'transparent',
                })}
              >
                {k === 'del' ? (
                  <Icon name="delete" size={22} color={sem.fg.tertiary} strokeWidth={1.8} />
                ) : (
                  <Txt style={{ fontFamily: font.poppins.medium, fontSize: 24, color: sem.text.primary }}>{k}</Txt>
                )}
              </Pressable>
            ),
          )}
        </View>
      ))}
    </View>
  )
}
