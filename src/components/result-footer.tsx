import React from 'react'
import { View, Pressable, Text, StyleSheet } from 'react-native'
import { theme } from '@/constants/theme'

export default function ResultFooter({
  totalVotes,
  onNext,
  insets,
}: {
  totalVotes: number
  onNext: () => void
  insets: { bottom: number }
}) {
  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 20 }]}>
      {totalVotes >= 1000 && <Text style={styles.totalVotes}>{totalVotes.toLocaleString()} total votes</Text>}
      <Pressable style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextButtonText}>Next Question</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 16,
    backgroundColor: theme.colors.black,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#222',
  },
  totalVotes: { fontSize: 16, color: theme.colors.gray, textAlign: 'center', fontWeight: '500', marginBottom: 8 },
  nextButton: { backgroundColor: theme.colors.white, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 10 },
  nextButtonText: { fontSize: 20, fontWeight: '700', color: theme.colors.black },
})
