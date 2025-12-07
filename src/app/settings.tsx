import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme'
import { clearDeviceId } from '@/services/device-id'
import * as Sentry from '@sentry/react-native'


export default function SettingsScreen() {
  const router = useRouter();

  const handleResetDevice = async () => {
    Alert.alert(
      'Reset Device ID',
      'This will clear your vote history and create a new anonymous identity. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearDeviceId();
              Alert.alert('Reset complete', 'App will restart with new identity.');
              await Updates.reloadAsync();
            } catch (error) {
              Sentry.captureException(error)
              Alert.alert('Error', 'Failed to reset device ID');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.section}>
          <Button
            title="Reset Device ID"
            onPress={handleResetDevice}
            variant="secondary"
          />
          <Text style={styles.description}>
            Clears your voting history and creates a new anonymous identity
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.version}>Split v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: theme.spacing.xl,
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  description: {
    fontSize: 14,
    color: theme.colors.gray,
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  footer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: theme.colors.gray,
  },
});
