import {
  View,
  Text,
  StyleSheet,
  Switch,
} from 'react-native'
import React from 'react'
import { theme } from '@/constants/theme'
import * as Haptics from 'expo-haptics'
import { useHaptic } from '@/context/haptic-context'

export default function SettingsScreen() {
  const { enabled: hapticEnabled, setEnabled } = useHaptic()
  const toggleHaptic = (value: boolean) => {
    setEnabled(value)
    if (value) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.optionRow}>
        <Text style={styles.optionText}>Haptic Feedback</Text>
        <Switch
          value={hapticEnabled}
          onValueChange={toggleHaptic}
          trackColor={{ false: '#767577', true: '#007AFF' }}
          thumbColor={hapticEnabled ? '#fff' : '#f4f3f4'}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.black,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: 40,
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  optionText: { fontSize: 18, color: theme.colors.white },
  button: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: { color: theme.colors.white, fontWeight: '700', fontSize: 16 },
})
