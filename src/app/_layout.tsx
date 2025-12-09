// app/_layout.tsx
import { AppProvider, useApp } from '@/context/app-context'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { PostHogProvider, usePostHog } from 'posthog-react-native'
import * as Sentry from '@sentry/react-native'
import { HapticProvider } from '@/context/haptic-context'

function RootLayoutNav() {
  Sentry.init({
    dsn: 'https://0bf4c4639de3dd903b64a2c0f3cc8524@o4510494581915648.ingest.de.sentry.io/4510494591746128',

    // Adds more context data to events (IP address, cookies, user, etc.)
    // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,

    // Enable Logs
    enableLogs: true,

    // Configure Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
    ],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  })
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
