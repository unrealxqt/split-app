import React, { useRef, useEffect, useState } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { PercentageBar } from '@/components/percentage-bar'
import { theme } from '@/constants/theme'

export default function ResultCard({
  option,
  votes,
  percentage,
  selected,
}: {
  option: string
  votes: number
  percentage: number
  selected: boolean
}) {
  const anim = useRef(new Animated.Value(0)).current
  const [displayPercent, setDisplayPercent] = useState(0)

  useEffect(() => {
    anim.setValue(0)
    const listener = anim.addListener(({ value }) => setDisplayPercent(value))
    Animated.timing(anim, { toValue: percentage, duration: 600, useNativeDriver: false }).start()
    return () => anim.removeListener(listener)
  }, [percentage])

  return (
    <View style={[styles.card, selected ? styles.selected : styles.unselected]}>
      <Text style={styles.option}>{option}</Text>
      <Text style={styles.percent}>{Math.round(displayPercent)}%</Text>
      <PercentageBar percentage={displayPercent} animated />
      {votes >= 1000 && <Text style={styles.votes}>{votes.toLocaleString()} votes</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { padding: 24, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', marginBottom: 24 },
  selected: { borderWidth: 3, borderColor: '#3B82F6', transform: [{ scale: 1 }], opacity: 1 },
  unselected: { transform: [{ scale: 0.96 }], opacity: 0.75 },
  option: { fontSize: 16, fontWeight: '500', color: theme.colors.black },
  percent: { fontSize: 36, fontWeight: '700', color: theme.colors.black, marginBottom: 8, textAlign: 'center' },
  votes: { fontSize: 14, color: theme.colors.gray, textAlign: 'center', marginTop: 4 },
})
