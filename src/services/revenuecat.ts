// revenuecat.ts
import Purchases from 'react-native-purchases'

const PRODUCT_ID = 'adfree'
const ENTITLEMENT_ID = 'Split Pro'

export function initRevenueCat() {
  Purchases.configure({
    apiKey: 'test_KDMQRRpPKjIXWrDbuqVemvnRPNg',
  })
}

export async function isAdFreeUser(): Promise<boolean> {
  const info = await Purchases.getCustomerInfo()
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined
}

export async function purchaseAdFree(): Promise<boolean> {
  const { customerInfo } = await Purchases.purchaseProduct(PRODUCT_ID)
  return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined
}

export async function restorePurchases(): Promise<boolean> {
  const customerInfo = await Purchases.restorePurchases()
  return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined
}
