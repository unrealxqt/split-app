import { useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads'

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-2182810282927105/7534592238'
const STORAGE_KEY = 'last_interstitial_impression'
const COOLDOWN_MS = 10 * 60 * 1000

export function useInterstitialAd() {
  const adRef = useRef<InterstitialAd | null>(null)
  const lastShownRef = useRef<number>(0)
  const [loaded, setLoaded] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(v => {
      lastShownRef.current = v ? Number(v) : 0
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready) return

    const ad = InterstitialAd.createForAdRequest(adUnitId)
    adRef.current = ad

    const l1 = ad.addAdEventListener(AdEventType.LOADED, () => setLoaded(true))

    const l2 = ad.addAdEventListener(AdEventType.OPENED, async () => {
      const now = Date.now()
      lastShownRef.current = now
      await AsyncStorage.setItem(STORAGE_KEY, String(now))
    })

    const l3 = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false)
      ad.load()
    })

    ad.load()

    return () => {
      l1()
      l2()
      l3()
    }
  }, [ready])

  const showAd = () => {
    if (!loaded) return
    if (Date.now() - lastShownRef.current < COOLDOWN_MS) return

    adRef.current?.show()
  }

  return { loaded, showAd }
}
