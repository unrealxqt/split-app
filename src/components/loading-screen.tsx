import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LoadingSpinner } from '@/components/loading-spinner'
import { theme } from '@/constants/theme'

export default function LoadingScreen({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <LoadingSpinner />
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.black, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, color: theme.colors.gray, textAlign: 'center', marginTop: theme.spacing.md },
})
