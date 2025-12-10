import { useEffect, useState } from 'react'
import { isAdFreeUser, purchaseAdFree, restorePurchases, initRevenueCat } from '@/services/revenuecat'

export function useAdFree() {
  const [adFree, setAdFree] = useState(false)

  useEffect(() => {
    initRevenueCat()
    checkAdFree()
  }, [])

  const checkAdFree = async () => {
    const active = await isAdFreeUser()
    setAdFree(active)
  }

  const buyAdFree = async (): Promise<boolean> => {
    const active = await purchaseAdFree()
    setAdFree(active)
    return active
  }

  const restore = async (): Promise<boolean> => {
    const active = await restorePurchases()
    setAdFree(active)
    return active
  }


  return { adFree, buyAdFree, restore }
}
