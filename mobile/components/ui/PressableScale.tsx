import { useRef } from 'react'
import { Animated, TouchableWithoutFeedback } from 'react-native'

interface Props {
  children: React.ReactNode
  onPress?: () => void
  style?: object | object[]
  disabled?: boolean
  scale?: number
}

export function PressableScale({ children, onPress, style, disabled, scale = 0.97 }: Props) {
  const anim = useRef(new Animated.Value(1)).current

  const pressIn = () =>
    Animated.spring(anim, { toValue: scale, useNativeDriver: true, speed: 60, bounciness: 0 }).start()

  const pressOut = () =>
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 3 }).start()

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  )
}
