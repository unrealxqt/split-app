import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ErrorState } from '@/components/error-state'
import { theme } from '@/constants/theme'

export default function ErrorScreen({ message, onRetry }: { message: string, onRetry: () => void }) {
  return (
    <View style={styles.container}>
      <ErrorState message={message} onRetry={onRetry} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.black, justifyContent: 'center', alignItems: 'center' },
})
