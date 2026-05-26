import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, radius, fontSize, fonts } from '../../lib/tokens'

export default function ProfileScreen() {
  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Profil</Text>
      </View>

      <View style={s.body}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>MD</Text>
        </View>
        <Text style={s.name}>Mamadou Diallo</Text>
        <Text style={s.role}>Agent terrain · AgroSénégal SA</Text>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.topbar,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.textSecondary,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  role: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: 4,
  },
})
