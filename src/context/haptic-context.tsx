// src/context/haptic-context.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getOrCreateDeviceId } from '@/services/device-id'
import { getDeviceSettings, setHapticFeedback } from '@/services/api'

type HapticContextType = {
  enabled: boolean
  setEnabled: (value: boolean) => void
}

const HapticContext = createContext<HapticContextType>({
  enabled: true,
  setEnabled: () => {},
})

export const HapticProvider = ({ children }: { children: ReactNode }) => {
  const [enabled, setEnabledState] = useState(true)
  const [deviceUuid, setDeviceUuid] = useState<string>('')

  useEffect(() => {
    (async () => {
      const uuid = await getOrCreateDeviceId()
      setDeviceUuid(uuid)
      const setting = await getDeviceSettings(uuid)
      setEnabledState(setting)
    })()
  }, [])

  const setEnabled = async (value: boolean) => {
    setEnabledState(value)
    if (deviceUuid) {
      try {
        await setHapticFeedback(deviceUuid, value)
      } catch (err) {
        console.error('Failed to save haptic setting:', err)
      }
    }
  }

  return <HapticContext.Provider value={{ enabled, setEnabled }}>{children}</HapticContext.Provider>
}

export const useHaptic = () => useContext(HapticContext)
