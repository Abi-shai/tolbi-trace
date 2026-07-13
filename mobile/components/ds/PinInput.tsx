import { useEffect, useRef } from 'react'
import { Animated, Platform, Pressable, TextInput, View } from 'react-native'
import { Txt } from './Txt'
import { color, sem, font, radius } from '../../theme/tokens'

/**
 * 4–6 digit PIN / OTP entry.
 * Par défaut : clavier numérique système derrière des cases tapables.
 * `readOnly` : cases d'affichage pilotées par un `Keypad` intégré.
 * À 6 chiffres, les cases se resserrent et se groupent en 3 + 3.
 */
export function PinInput({
  value,
  onChange,
  length = 4,
  secure = false,
  autoFocus = false,
  readOnly = false,
  error = false,
  shakeKey = 0,
}: {
  value: string
  onChange?: (v: string) => void
  length?: number
  secure?: boolean
  autoFocus?: boolean
  readOnly?: boolean
  error?: boolean
  shakeKey?: number
}) {
  const ref = useRef<TextInput>(null)
  const shake = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!shakeKey) return
    shake.setValue(0)
    Animated.sequence(
      [-8, 8, -6, 6, -3, 0].map((toValue) =>
        Animated.timing(shake, { toValue, duration: 45, useNativeDriver: Platform.OS !== 'web' }),
      ),
    ).start()
  }, [shakeKey, shake])

  const digits = Array.from({ length }, (_, i) => value[i] ?? '')
  const focusedIndex = Math.min(value.length, length - 1)
  const compact = length >= 6

  const row = (
    <Animated.View
      style={{
        flexDirection: 'row',
        gap: compact ? 8 : 12,
        justifyContent: 'center',
        transform: [{ translateX: shake }],
      }}
    >
      {digits.map((d, i) => {
        const filled = d !== ''
        const isFocus = i === focusedIndex
        return (
          <View
            key={i}
            style={{
              width: compact ? 44 : 54,
              height: compact ? 52 : 58,
              marginLeft: compact && i === length / 2 ? 10 : 0,
              borderRadius: radius.lg,
              borderWidth: 1.5,
              borderColor: error
                ? color.error[400]
                : filled || isFocus
                  ? color.brand[500]
                  : sem.border.primary,
              backgroundColor: error
                ? color.error[25]
                : filled || isFocus
                  ? color.brand[25]
                  : color.white,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Txt
              style={{
                fontFamily: font.poppins.semibold,
                fontSize: compact ? 19 : 22,
                color: sem.text.primary,
              }}
            >
              {secure && filled ? '•' : d}
            </Txt>
          </View>
        )
      })}
      {!readOnly && (
        <TextInput
          ref={ref}
          value={value}
          onChangeText={(t) => onChange?.(t.replace(/[^0-9]/g, '').slice(0, length))}
          keyboardType="number-pad"
          autoFocus={autoFocus}
          maxLength={length}
          style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
        />
      )}
    </Animated.View>
  )

  if (readOnly) return row
  return <Pressable onPress={() => ref.current?.focus()}>{row}</Pressable>
}
