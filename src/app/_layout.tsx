// app/_layout.tsx
import { AppProvider, useApp } from '@/context/app-context'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'

function RootLayoutNav() {
  const { dispatch } = useApp()

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: state.isConnected ?? false })
    })
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
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="question" />
        <Stack.Screen name="result" />
        <Stack.Screen name="history" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  )
}
