import { Platform } from 'react-native';
import Purchases, { PurchasesError, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '';

let configured = false;

// RevenueCat/StoreKit only applies on iOS — Android and web keep the
// existing Stripe Checkout flow (see app/(main)/subscription.tsx).
const isSupported = () => Platform.OS === 'ios' && !!REVENUECAT_IOS_KEY;

export function configurePurchases() {
  if (!isSupported() || configured) return;
  Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
  configured = true;
}

export async function loginPurchases(userId: string) {
  if (!isSupported()) return;
  configurePurchases();
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error('RevenueCat login error:', error);
  }
}

export async function logoutPurchases() {
  if (!isSupported() || !configured) return;
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('RevenueCat logout error:', error);
  }
}

// Chains identity changes onto a single queue so a quick logout->login (or
// a double-render) can't fire loginPurchases/logoutPurchases in parallel —
// unqueued, the network calls could resolve out of order and leave
// RevenueCat's identity pointed at the wrong user.
let identityQueue: Promise<void> = Promise.resolve();

export function syncPurchasesIdentity(userId: string | null) {
  identityQueue = identityQueue.then(() => (userId ? loginPurchases(userId) : logoutPurchases()));
  return identityQueue;
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!isSupported()) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg: PurchasesPackage) {
  try {
    const result = await Purchases.purchasePackage(pkg);
    return { success: true as const, customerInfo: result.customerInfo };
  } catch (error) {
    const purchasesError = error as PurchasesError;
    if (purchasesError.userCancelled) {
      return { success: false as const, userCancelled: true };
    }
    throw error;
  }
}

export async function restorePurchases() {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo;
}
