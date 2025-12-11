import '@/sentry'
import { AppProvider, useApp } from '@/context/app-context'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { PostHogProvider, usePostHog } from 'posthog-react-native'
import * as Sentry from '@sentry/react-native'
import { HapticProvider } from '@/context/haptic-context'
import { initAdMob } from '@/services/admob'

function RootLayoutNav() {
  const { dispatch } = useApp()
  const posthog = usePostHog()
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch({
        type: 'SET_ONLINE_STATUS',
        payload: state.isConnected ?? false,
      })
    })
    posthog.capture('app_opened')
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    initAdMob()
  }, [])

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'fade',
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="question" />
        <Stack.Screen name="result" />
        <Stack.Screen name="history" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="submit-question-screen" />
      </Stack>
    </>
  )
}

function RootLayout() {
  return (
    <PostHogProvider
      apiKey="phc_dDqCkuCghhsDq3Ad71d6unoiTUB1Eq5XzUrEpEKDbz1"
      options={{
        host: 'https://eu.i.posthog.com',
        enableSessionReplay: true,
      }}
      autocapture>
      <HapticProvider>
        <AppProvider>
          <RootLayoutNav />
        </AppProvider>
      </HapticProvider>
    </PostHogProvider>
  )
}
export default Sentry.wrap(RootLayout)
