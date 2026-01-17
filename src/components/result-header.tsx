import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'

export default function ResultHeader({ questionText }: { questionText: string }) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { marginTop: insets.top + 24 }]}>
      <Text style={styles.text} numberOfLines={2}>
        {questionText}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: theme.spacing.lg,
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: 32,
  },
})
