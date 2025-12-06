import { useEffect } from 'react';
import { registerDevice } from '../services/api';
import { useApp } from '@/context/app-context'
import { getOrCreateDeviceId } from '@/services/device-id'


export function useDeviceId() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    async function initDevice() {
      const uuid = await getOrCreateDeviceId();
      dispatch({ type: 'SET_DEVICE_UUID', payload: uuid });
      await registerDevice(uuid);
    }
    initDevice();
  }, []);

  return state.deviceUuid;
}