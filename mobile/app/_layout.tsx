import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { ExplorationProvider } from '../context/ExplorationContext'

function RootLayoutNav() {
  const { isLoggedIn } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    const onLoginScreen = segments[0] === 'login'
    const onProtectedRoute = !onLoginScreen

    if (!isLoggedIn && onProtectedRoute) {
      router.replace('/login')
    } else if (isLoggedIn && onLoginScreen) {
      router.replace('/')
    }
  }, [isLoggedIn, segments])

  return <Stack screenOptions={{ headerShown: false }} />
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      {/* @ts-ignore — backgroundColor is valid on expo-status-bar but typing lags */}
      <StatusBar style="dark" backgroundColor="#f2f4f7" />
      <AuthProvider>
        <ExplorationProvider>
          <RootLayoutNav />
        </ExplorationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
