import { useEffect, useState } from 'react'
import Purchases, { PurchasesOfferings } from 'react-native-purchases'

const ENTITLEMENT_ID = 'ad_free_title'

export function useAdFree() {
  const [adFree, setAdFree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null)

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    async function run() {
      try {
        const customer = await Purchases.getCustomerInfo()
        // console.log('CUSTOMER INFO:', JSON.stringify(customer, null, 2))

        const offerings = await Purchases.getOfferings()
        //console.log('OFFERINGS:', JSON.stringify(offerings, null, 2))

        const products = offerings.current?.availablePackages?.map(p => p.product)
        //console.log('PRODUCTS FROM CURRENT OFFERING:', JSON.stringify(products, null, 2))

        const entitlements = customer.entitlements?.all
        // console.log('ENTITLEMENTS:', JSON.stringify(entitlements, null, 2))
      } catch (e) {
        //console.log('RC ERROR:', e)
      }
    }

    run()
  }, [])

  async function init() {
    try {
      const fetched = await Purchases.getOfferings()
      setOfferings(fetched)
      const info = await Purchases.getCustomerInfo()
      setAdFree(!!info.entitlements.active[ENTITLEMENT_ID])
    } catch (e) {
      console.log(e)
    }
  }

  async function buyAdFree() {
    if (!offerings?.current?.lifetime) return false
    setLoading(true)
    try {
      const res = await Purchases.purchasePackage(offerings.current.lifetime)
      const active = !!res.customerInfo.entitlements.active[ENTITLEMENT_ID]
      setAdFree(active)
      return active
    } finally {
      setLoading(false)
    }
  }

  async function restore() {
    setLoading(true)
    try {
      const info = await Purchases.restorePurchases()
      const active = !!info.entitlements.active[ENTITLEMENT_ID]
      setAdFree(active)
      return active
    } finally {
      setLoading(false)
    }
  }

  return { adFree, buyAdFree, restore, loading, offerings }
}
