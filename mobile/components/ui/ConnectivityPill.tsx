import { View, Text, StyleSheet } from 'react-native'
import { Wifi, WifiOff } from 'lucide-react-native'
import { colors, radius, fonts } from '../../lib/tokens'

interface Props {
  online: boolean
}

export function ConnectivityPill({ online }: Props) {
  return (
    <View style={[s.pill, online ? s.pillOnline : s.pillOffline]}>
      {online
        ? <Wifi size={10} color={colors.statusCompleted} />
        : <WifiOff size={10} color='#ea580c' />
      }
      <Text style={[s.text, online ? s.textOnline : s.textOffline]}>
        {online ? 'En ligne' : 'Hors ligne'}
      </Text>
    </View>
  )
}

const s = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  pillOnline: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  pillOffline: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  textOnline: {
    color: colors.statusCompleted,
  },
  textOffline: {
    color: '#ea580c',
  },
})
