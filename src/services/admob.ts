import mobileAds, { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads'
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency'

let initialized = false

export async function initAdMob() {
  if (initialized) return
  initialized = true
  console.log("AdMob initialization started")
  await requestTrackingPermissionsAsync()

  const consent = await AdsConsent.requestInfoUpdate()

  if (
    consent.isConsentFormAvailable &&
    consent.status === AdsConsentStatus.REQUIRED
  ) {
    await AdsConsent.showForm()
  }

  await mobileAds().initialize()
  console.log("AdMob initialization finished")
}
