import { View, Text, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { theme } from '@/constants/theme'

interface Props {
  optionA: string
  optionB: string
  onVote: (option: 'A' | 'B') => void
}

export const QuestionOptions = ({ optionA, optionB, onVote }: Props) => {
  const renderOption = (label: string, option: 'A' | 'B') => (
    <Pressable
      style={({ pressed }) => [
        styles.optionContainer,
        pressed && { transform: [{ scale: 0.96 }], backgroundColor: '#e0e0e0' },
      ]}
      onPress={() => onVote(option)}
    >
      <Text style={styles.optionText}>{label}</Text>
    </Pressable>
  )

  return (
    <View style={styles.optionsWrapper}>
      {renderOption(optionA, 'A')}
      {renderOption(optionB, 'B')}
    </View>
  )
}

const styles = StyleSheet.create({
  optionsWrapper: { flex: 3, justifyContent: 'space-evenly', paddingHorizontal: 16 },
  optionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  optionText: { fontSize: 28, fontWeight: '700', color: theme.colors.black, textAlign: 'center', paddingHorizontal: 16 },
})
