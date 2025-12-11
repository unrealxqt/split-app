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
import Purchases from 'react-native-purchases'
import { initRevenueCat } from '@/services/revenuecat'
import { initAdMob } from '@/services/admob'

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
  streak: number
}

type AppAction =
  | { type: 'SET_DEVICE_UUID'; payload: string }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_CURRENT_QUESTION'; payload: Question | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_HAS_STARTED_GAME'; payload: boolean }
  | { type: 'INCREMENT_STREAK' }
  | { type: 'RESET_STREAK' }

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
    case 'INCREMENT_STREAK':
      return { ...state, streak: state.streak + 1 }
    case 'RESET_STREAK':
      return { ...state, streak: 0 }

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
    streak: 0,
  })

  // App initialization: device ID, Sentry, analytics
  useEffect(() => {
    async function initializeApp() {
      try {
        const deviceUuid = await getOrCreateDeviceId()
        dispatch({ type: 'SET_DEVICE_UUID', payload: deviceUuid })

        await registerDevice(deviceUuid)

        Sentry.setUser({ id: deviceUuid, username: `device-${deviceUuid}` })
        posthog.identify(`device-${deviceUuid}`)

        console.log('App initialized for device:', deviceUuid)
        console.log('Sentry initialized for device:', deviceUuid)
        console.log('Posthog initialized for device:', deviceUuid)
      } catch (error) {
        Sentry.captureException(error)
        console.error('Failed to initialize app:', error)
      }
    }

    initializeApp()
  }, [posthog])

  const initializeRevenueCat = async (userId: string) => {
    try {
      initRevenueCat()
      await Purchases.logIn(userId)
      console.log('RevenueCat initialized for user:', userId)
    } catch (error) {
      Sentry.captureException(error)
      console.error('RevenueCat initialization failed:', error)
    }
  }

  useEffect(() => {
    initAdMob()
  }, [])

  useEffect(() => {
    if (state.deviceUuid) {
      initializeRevenueCat(state.deviceUuid)
    }
  }, [state.deviceUuid])

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
