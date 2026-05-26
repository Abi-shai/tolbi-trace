import { useEffect, useRef, useState } from 'react'
import { Animated, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CheckCircle2 } from 'lucide-react-native'
import { useConnectivity } from '../../context/ConnectivityContext'
import { colors, radius, fonts, fontSize } from '../../lib/tokens'

export function SyncBanner() {
  const { syncFeedback, clearSyncFeedback } = useConnectivity()
  const insets = useSafeAreaInsets()
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const translateY = useRef(new Animated.Value(-72)).current

  useEffect(() => {
    if (!syncFeedback) return

    setCount(syncFeedback)
    setVisible(true)

    Animated.sequence([
      Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.delay(2400),
      Animated.timing(translateY, { toValue: -72, duration: 240, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false)
      clearSyncFeedback()
    })
  }, [syncFeedback])

  if (!visible) return null

  return (
    <Animated.View
      style={[
        s.banner,
        { top: insets.top + 10, transform: [{ translateY }] },
      ]}
    >
      <CheckCircle2 size={16} color={colors.statusCompleted} />
      <Text style={s.text}>
        {count} validation{count > 1 ? 's' : ''} synchronisée{count > 1 ? 's' : ''} ✓
      </Text>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  banner: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
    borderWidth: 1,
    borderColor: `${colors.statusCompleted}30`,
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
})
