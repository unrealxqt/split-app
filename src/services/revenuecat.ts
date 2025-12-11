import Purchases from 'react-native-purchases'
import Constants from 'expo-constants'

const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_REVENUECAT_API_KEY ?? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY

export function initRevenueCat() {
  if (!apiKey) throw new Error('Missing RevenueCat API key')
  Purchases.configure({ apiKey })

}
