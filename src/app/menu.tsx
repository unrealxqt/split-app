import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import React from 'react'
import { theme } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads'
import { useAdFree } from '@/hooks/use-adfree'

export default function MenuScreen() {
  const router = useRouter()
  const { adFree, buyAdFree, restore } = useAdFree()

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.settingsButton}
        onPress={() => router.push('/settings')}>
        <Ionicons
          name="settings-outline"
          size={28}
          color={theme.colors.white}
        />
      </Pressable>

      <Text style={styles.title}>Split</Text>
      <Text style={styles.subtitle}>Make choices. See what others choose.</Text>

      <Pressable style={styles.button} onPress={() => router.push('/question')}>
        <Text style={styles.buttonText}>Start Playing</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.historyButton]}
        onPress={() => router.push('/history')}>
        <Text style={[styles.buttonText, styles.historyButtonText]}>
          View Your History
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.historyButton]}
        onPress={() => router.push('/submit-question-screen')}>
        <Text style={[styles.buttonText, styles.historyButtonText]}>
          Submit your own questions
        </Text>
      </Pressable>

      <Text style={styles.footer}>v0.1 • Enjoy responsibly 😉</Text>
      {!adFree && (
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.FULL_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
    paddingHorizontal: 24,
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    zIndex: 10,
  },
  title: {
    fontSize: 56,
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.gray,
    marginBottom: 48,
    textAlign: 'center',
  },
  button: {
    width: '80%',
    paddingVertical: 18,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.white,
  },
  historyButton: {
    backgroundColor: theme.colors.black,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  historyButtonText: {
    color: '#007AFF',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    fontSize: 12,
    color: theme.colors.gray,
    textAlign: 'center',
  },
})
