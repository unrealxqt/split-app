import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native'
import React from 'react'
import { theme } from '@/constants/theme'
import * as Haptics from 'expo-haptics'
import { useHaptic } from '@/context/haptic-context'
import { useAdFree } from '@/hooks/use-adfree'
import Purchases from 'react-native-purchases'
import { clearDeviceId, getOrCreateDeviceId } from '@/services/device-id'
import { useApp } from '@/context/app-context'
import { initRevenueCat } from '@/services/revenuecat'

export default function SettingsScreen() {
  const { enabled: hapticEnabled, setEnabled } = useHaptic()
  const toggleHaptic = (value: boolean) => {
    setEnabled(value)
    if (value) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  const { adFree, buyAdFree, restore } = useAdFree()

  const { loading } = useAdFree()
  const { dispatch } = useApp()

  const handleBuy = async () => {
    try {
      const success = await buyAdFree()
      if (success) Alert.alert('Thank you!', 'Ad-Free experience unlocked.')
    } catch (e: any) {
      Alert.alert('Purchase Failed', e.message || 'Please try again later.')
    }
  }

  const handleRestore = async () => {
    try {
      const restored = await restore()
      Alert.alert(restored ? 'Restored' : 'No purchases found')
    } catch (e: any) {
      Alert.alert('Restore Failed', e.message || 'Please try again later.')
    }
  }

  const handleLogout = async () => {
    try {
      await Purchases.logOut()

      await clearDeviceId()
      const newUuid = await getOrCreateDeviceId()
      dispatch({ type: 'SET_DEVICE_UUID', payload: newUuid })
      await Purchases.logIn(newUuid)

      Alert.alert('Logged out', 'Your device has been reset.')
    } catch (e: any) {
      Alert.alert('Logout Failed', e.message || 'Please try again later.')
    }
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

      <View style={{ marginTop: 40 }}>
        <Text style={[styles.optionText, { marginBottom: 12 }]}>
          Ad-Free Experience: {adFree ? 'Unlocked ✅' : 'Locked ❌'}
        </Text>

        {loading ? (
          <ActivityIndicator color="#007AFF" />
        ) : !adFree ? (
          <>
            <Pressable style={styles.button} onPress={handleBuy}>
              <Text style={styles.buttonText}>Buy Ad-Free</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.restoreButton]}
              onPress={handleRestore}>
              <Text style={styles.buttonText}>Restore Purchase</Text>
            </Pressable>
          </>
        ) : null}
      </View>
      {__DEV__ && (
        <Pressable
          style={{
            width: '100%',
            paddingVertical: 16,
            backgroundColor: '#FF3B30',
            borderRadius: 12,
            marginTop: 20,
            alignItems: 'center',
          }}
          onPress={handleLogout}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            Logout / Reset Device
          </Text>
        </Pressable>
      )}
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
  restoreButton: {
    backgroundColor: theme.colors.black,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonText: { color: theme.colors.white, fontWeight: '700', fontSize: 16 },
})
