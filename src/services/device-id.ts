// src/services/device-id.ts
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_UUID_KEY = 'split_device_uuid';

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    // Try to retrieve existing UUID
    let deviceUuid = await SecureStore.getItemAsync(DEVICE_UUID_KEY);
    
    // If not found, generate and store new UUID
    if (!deviceUuid) {
      deviceUuid = uuidv4();
      await SecureStore.setItemAsync(DEVICE_UUID_KEY, deviceUuid);
    }
    
    return deviceUuid;
  } catch (error) {
    // Fallback to in-memory UUID if SecureStore fails
    console.error('SecureStore error:', error);
    return uuidv4();
  }
}

export async function clearDeviceId(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(DEVICE_UUID_KEY);
  } catch (error) {
    console.error('Failed to clear device ID:', error);
  }
}
