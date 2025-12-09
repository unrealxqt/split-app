import { useEffect, useState } from 'react'
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads'

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-2182810282927105/7534592238'

export function useInterstitialAd() {
  const [loaded, setLoaded] = useState(false)

  const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: false
  })

  useEffect(() => {
    const loadedListener = interstitial.addAdEventListener(AdEventType.LOADED, () => setLoaded(true))
    const closedListener = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false)
      interstitial.load()
    })

    interstitial.load()

    return () => {
      loadedListener()
      closedListener()
    }
  }, [])

  const showAd = () => {
    if (loaded) interstitial.show()
  }

  return { loaded, showAd }
}
