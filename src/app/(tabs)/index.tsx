// app/index.tsx
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { theme } from '@/constants/theme'
import { useApp } from '@/context/app-context'
import { registerDevice } from '@/services/api'
import { getOrCreateDeviceId } from '@/services/device-id'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function WelcomeScreen() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initializeApp() {
      try {
        const deviceUuid = await getOrCreateDeviceId();
        dispatch({ type: 'SET_DEVICE_UUID', payload: deviceUuid });
        await registerDevice(deviceUuid);
      } catch (error) {
        console.error('Failed to initialize device:', error);
      } finally {
        setIsInitializing(false);
      }
    }
    initializeApp();
  }, []);

  const handleGetStarted = () => {
    router.push('/question');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Split</Text>
        <Text style={styles.subtitle}>Would You Rather?</Text>
      </View>

      <View style={styles.buttonContainer}>
        {isInitializing ? (
          <LoadingSpinner />
        ) : (
          <Button title="Get Started" onPress={handleGetStarted} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.gray,
    fontWeight: '400',
  },
  buttonContainer: {
    paddingBottom: theme.spacing.xl * 2,
  },
});
