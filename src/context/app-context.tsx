// src/context/app-context.tsx
import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useEffect,
} from 'react'
import { getOrCreateDeviceId } from '@/services/device-id'
import { registerDevice } from '@/services/api'
import * as Sentry from '@sentry/react-native'
import { usePostHog } from 'posthog-react-native'

interface Question {
  question_id: string
  question_text: string
  option_a: string
  option_b: string
}

interface AppState {
  deviceUuid: string | null
  isOnline: boolean
  currentQuestion: Question | null
  isLoading: boolean
  hasStartedGame: boolean
}

type AppAction =
  | { type: 'SET_DEVICE_UUID'; payload: string }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_CURRENT_QUESTION'; payload: Question | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_HAS_STARTED_GAME'; payload: boolean }

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_DEVICE_UUID':
      return { ...state, deviceUuid: action.payload }
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload }
    case 'SET_CURRENT_QUESTION':
      return { ...state, currentQuestion: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_HAS_STARTED_GAME':
      return { ...state, hasStartedGame: action.payload }
    default:
      return state
  }
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const posthog = usePostHog()
  const [state, dispatch] = useReducer(appReducer, {
    deviceUuid: null,
    isOnline: true,
    currentQuestion: null,
    isLoading: false,
    hasStartedGame: false,
  })

  useEffect(() => {
    async function initializeDevice() {
      try {
        const deviceUuid = await getOrCreateDeviceId()
        dispatch({ type: 'SET_DEVICE_UUID', payload: deviceUuid })
        await registerDevice(deviceUuid)
        console.log('Device initialized:', deviceUuid)
        Sentry.setUser({
          id: deviceUuid,
          username: `device-${deviceUuid}`,
        })

        posthog.identify(`device-${deviceUuid}`)
      } catch (error) {
        Sentry.captureException(error)
        console.error('Failed to initialize device:', error)
      }
    }
    initializeDevice()
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
