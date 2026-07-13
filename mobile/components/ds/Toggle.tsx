import { Pressable, View } from 'react-native'
import { color, sem } from '../../theme/tokens'

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange?: (v: boolean) => void
}) {
  return (
    <Pressable
      onPress={() => onChange?.(!checked)}
      hitSlop={8}
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        padding: 2,
        justifyContent: 'center',
        backgroundColor: checked ? sem.bg.brandSolid : color.gray[200],
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          backgroundColor: color.white,
          transform: [{ translateX: checked ? 18 : 0 }],
          shadowColor: '#101828',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 1,
        }}
      />
    </Pressable>
  )
}
