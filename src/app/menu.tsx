import { View, Text, StyleSheet, Button } from 'react-native'
import { useRouter } from 'expo-router'
import React from 'react'
import { theme } from '@/constants/theme'

export default function MenuScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Split</Text>
      <Button title="Start Playing" onPress={() => router.push('/question')} />
      <Button title="View Your History" onPress={() => router.push('/history')} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.black, padding: 24 },
  title: { fontSize: 48, fontWeight: '700', color: theme.colors.white, marginBottom: 32 },
})
