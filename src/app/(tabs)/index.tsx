import { View, Text, StyleSheet, Button } from 'react-native'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { theme } from '@/constants/theme'
import { useApp } from '@/context/app-context'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function WelcomeScreen() {
  const router = useRouter()
  const { state, dispatch } = useApp()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (state.deviceUuid) setReady(true)
  }, [state.deviceUuid])

  // If user already started game, go to /menu automatically
  useEffect(() => {
    if (state.hasStartedGame && ready) {
      router.replace('/screens/menu')
    }
  }, [state.hasStartedGame, ready])

  const handleGetStarted = () => {
    dispatch({ type: 'SET_HAS_STARTED_GAME', payload: true })
    router.replace('/screens/menu')
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Split</Text>
        <Text style={styles.subtitle}>Would You Rather?</Text>
      </View>

      <View style={styles.buttonContainer}>
        {!ready ? <LoadingSpinner /> : <Button title="Get Started" onPress={handleGetStarted} />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.black, paddingHorizontal: theme.spacing.lg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 48, fontWeight: '700', color: theme.colors.white, marginBottom: theme.spacing.sm, letterSpacing: 2 },
  subtitle: { fontSize: 18, color: theme.colors.gray, fontWeight: '400' },
  buttonContainer: { paddingBottom: theme.spacing.xl * 2 },
})
