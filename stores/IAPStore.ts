import { action, computed, makeObservable, observable, reaction } from "mobx";
import { RootStore } from "@/stores/RootStore";
import Purchases, {
  CustomerInfo,
  MakePurchaseResult,
  PurchasesOffering,
  PurchasesStoreProduct,
  PurchasesStoreTransaction,
} from "react-native-purchases";
import { storage } from "@/utility/functions/storage";
import { API_BASE_URL } from "@/config/config";
import { isEmulatorSync } from "react-native-device-info";
import { stringify } from "flatted";

const NECRO_UNLOCK_IDs = [
  process.env.EXPO_PUBLIC_IOS_NECRO_ID,
  process.env.EXPO_PUBLIC_ANDROID_NECRO_ID,
];
const RANGER_UNLOCK_IDs = [
  process.env.EXPO_PUBLIC_IOS_RANGER_ID,
  process.env.EXPO_PUBLIC_ANDROID_RANGER_ID,
];
const DUAL_CLASS_UNLOCK_IDs = [
  process.env.EXPO_PUBLIC_IOS_DUAL_ID,
  process.env.EXPO_PUBLIC_ANDROID_DUAL_ID,
];
const REMOTE_SAVES_UNLOCK_IDs = [
  process.env.EXPO_PUBLIC_IOS_REMOTE_ID,
  process.env.EXPO_PUBLIC_ANDROID_REMOTE_ID,
];
const MORE_TABS_UNLOCK_IDs = [
  process.env.EXPO_PUBLIC_IOS_STASH_ID,
  process.env.EXPO_PUBLIC_ANDROID_STASH_ID,
];

export class IAPStore {
  root: RootStore;
  hasHydrated = false;

  rangerUnlocked = false;
  necromancerUnlocked = false;
  remoteSaveSpecificUnlock = false;
  purchasedTabs = 0;

  cachedSecret: string | null = null;

  offering: PurchasesOffering | null = null;

  dualClassProduct: PurchasesStoreProduct | null = null;
  necromancerProduct: PurchasesStoreProduct | null = null;
  rangerProduct: PurchasesStoreProduct | null = null;
  remoteSaveProduct: PurchasesStoreProduct | null = null;
  stashProduct: PurchasesStoreProduct | null = null;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.getCustomersIAPs();

    makeObservable(this, {
      rangerUnlocked: observable,
      necromancerUnlocked: observable,
      remoteSaveSpecificUnlock: observable,

      dualClassProduct: observable,
      necromancerProduct: observable,
      rangerProduct: observable,
      remoteSaveProduct: observable,
      stashProduct: observable,

      offering: observable,
      hasHydrated: observable,
      cachedSecret: observable,
      purchasedTabs: observable,

      evaluateTransactions: action,
      evaluateProductIds: action,
      evaluateCustomer: action,
      purchaseHandler: action,

      setOffering: action,
      remoteSavesUnlocked: computed,
    });
    reaction(
      () => this.root.authStore.isConnected,
      () => {
        if (!this.hasHydrated) {
          this.getCustomersIAPs();
        }
      },
    );
  }

  get remoteSavesUnlocked() {
    return (
      this.remoteSaveSpecificUnlock ||
      this.necromancerUnlocked ||
      this.rangerUnlocked ||
      this.purchasedTabs > 0
    );
  }

  setOffering(offering: PurchasesOffering | null) {
    if (offering) {
      this.offering = offering;
      for (const availablePackage of offering.availablePackages) {
        switch (availablePackage.identifier.toLowerCase()) {
          case "dual":
            this.dualClassProduct = availablePackage.product;
            continue;
          case "necromancer":
            this.necromancerProduct = availablePackage.product;
            continue;
          case "ranger":
            this.rangerProduct = availablePackage.product;
            continue;
          case "stash":
            this.stashProduct = availablePackage.product;
            continue;
          case "remote":
            this.remoteSaveProduct = availablePackage.product;
            continue;
          default:
            console.warn(`unknown product: ${availablePackage.product}`);
            continue;
        }
      }
    }
  }

  evaluateTransactions(transactions: PurchasesStoreTransaction[]) {
    const messageReporting = this.evaluateProductIds(
      transactions.map((transaction) => transaction.productIdentifier),
    );

    return messageReporting.length > 0
      ? { messages: messageReporting, messageColor: "#86efac" }
      : {
          messages: ["No transaction records found!"],
          messageColor: "#fca5a5",
        };
  }

  evaluateCustomer(customer: CustomerInfo) {
    this.evaluateProductIds(
      customer.nonSubscriptionTransactions.map(
        (transaction) => transaction.productIdentifier,
      ),
    );
  }

  evaluateProductIds(transactions: string[]) {
    const messageReporting: Set<string> = new Set();
    let tabsPurchaseCounter = 0;
    for (const transaction of transactions) {
      if (DUAL_CLASS_UNLOCK_IDs.includes(transaction)) {
        this.necromancerUnlocked = true;
        this.rangerUnlocked = true;
        messageReporting.add("Ranger Unlocked!");
        messageReporting.add("Necromancer Unlocked!");
        messageReporting.add("Remote Saving Unlocked!");
        continue;
      }
      if (RANGER_UNLOCK_IDs.includes(transaction)) {
        this.rangerUnlocked = true;
        messageReporting.add("Ranger Unlocked!");
        messageReporting.add("Remote Saving Unlocked!");
        continue;
      }
      if (NECRO_UNLOCK_IDs.includes(transaction)) {
        this.necromancerUnlocked = true;
        messageReporting.add("Necromancer Unlocked!");
        messageReporting.add("Remote Saving Unlocked!");
        continue;
      }
      if (REMOTE_SAVES_UNLOCK_IDs.includes(transaction)) {
        this.remoteSaveSpecificUnlock = true;
        messageReporting.add("Remote Saving Unlocked!");
        continue;
      }
      if (MORE_TABS_UNLOCK_IDs.includes(transaction)) {
        tabsPurchaseCounter++;
        continue;
      }
    }
    this.purchasedTabs = tabsPurchaseCounter * 4;
    this.persistForOffline();
    const messagesArray = Array.from(messageReporting);
    for (let i = 0; i < tabsPurchaseCounter; i++) {
      messagesArray.push("4 Stash tabs Added!");
    }
    return messagesArray;
  }

  purchaseHandler(val: MakePurchaseResult) {
    if (RANGER_UNLOCK_IDs.includes(val.productIdentifier)) {
      this.rangerUnlocked = true;
      return "Ranger Unlocked!";
    }
    if (NECRO_UNLOCK_IDs.includes(val.productIdentifier)) {
      this.necromancerUnlocked = true;
      return "Necromancer Unlocked!";
    }
    if (DUAL_CLASS_UNLOCK_IDs.includes(val.productIdentifier)) {
      this.necromancerUnlocked = true;
      this.rangerUnlocked = true;
      return `Ranger Unlocked!\nNecromancer Unlocked!`;
    }
    if (REMOTE_SAVES_UNLOCK_IDs.includes(val.productIdentifier)) {
      this.remoteSaveSpecificUnlock = true;
      return "Remote Saving Unlocked!";
    }
    if (MORE_TABS_UNLOCK_IDs.includes(val.productIdentifier)) {
      this.purchasedTabs += 4;
      return "4 Stash Tabs Added!";
    }
  }

  async persistForOffline() {
    try {
      const currentTime = Date.now();
      const expiryDate = new Date(currentTime + 14 * 24 * 60 * 60 * 1000);

      // Get the secret and generate the validation token
      const secret = await this.getAppSecret();
      const validationToken = this.generateValidationToken(expiryDate, secret);
      storage.set("offlineValidationToken", validationToken);

      const customerInfo = await Purchases.restorePurchases();
      const serializedCustomerInfo = stringify({
        nonSubscriptionTransactions: customerInfo.nonSubscriptionTransactions,
        timestamp: currentTime,
        tokenVersion: validationToken.substring(0, 8),
      });

      storage.set("offlineCustomerInfo", serializedCustomerInfo);
    } catch (error) {
      console.log("Failed to persist offline data:", error);
    }
  }

  async hydrateOffline() {
    try {
      const validationToken = storage.getString("offlineValidationToken");
      if (!validationToken) return;

      const secret = await this.getAppSecret();
      const isValid = this.validateOfflineToken(validationToken, secret);

      if (!isValid) {
        this.clearPersistance();
        return;
      }

      const serializedCustomerInfo = storage.getString("offlineCustomerInfo");
      if (serializedCustomerInfo) {
        const storedData = JSON.parse(serializedCustomerInfo);
        if (!storedData.nonSubscriptionTransactions) return;
        this.evaluateProductIds(
          storedData.nonSubscriptionTransactions.map(
            (transaction: PurchasesStoreTransaction) =>
              transaction.productIdentifier,
          ),
        );
      }
    } catch (error) {
      this.clearPersistance();
    }
  }

  clearPersistance() {
    storage.delete("offlineValidationToken");
    storage.delete("rangerIAP");
    storage.delete("necromancerIAP");
    storage.delete("remoteSaveIAP");
  }

  generateValidationToken(expiryDate: Date, secret: string) {
    const deviceId = this.getDeviceIdentifier();
    const timestamp = expiryDate.getTime();

    const hash = this.simpleHash(`${deviceId}-${timestamp}-${secret}`);
    return `${hash}-${timestamp}-${deviceId.substring(0, 8)}`;
  }

  validateOfflineToken(token: string, secret: string) {
    if (!token) return false;

    const parts = token.split("-");
    if (parts.length < 3) return false;

    const [hash, timestamp, deviceIdPart] = parts;

    const expiryTime = parseInt(timestamp, 10);
    const currentTime = Date.now();

    if (currentTime > expiryTime) {
      return false;
    }

    const deviceId = this.getDeviceIdentifier();
    if (deviceIdPart !== deviceId.substring(0, 8)) {
      return false;
    }

    const expectedHash = this.simpleHash(`${deviceId}-${timestamp}-${secret}`);
    if (hash !== expectedHash) {
      return false;
    }

    return true;
  }

  simpleHash(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  getDeviceIdentifier() {
    const storedId = storage.getString("deviceIdentifier");
    if (storedId) return storedId;

    const newId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    storage.set("deviceIdentifier", newId);
    return newId;
  }

  async getAppSecret(): Promise<string> {
    if (this.cachedSecret) {
      return this.cachedSecret;
    }
    const response = await fetch(`${API_BASE_URL}/offline_secret`);
    if (!response.ok) {
      throw new Error(`Failed to fetch secret: ${response.status}`);
    }

    const secret = await response.text();
    this.cachedSecret = secret;
    return secret;
  }

  getCustomersIAPs() {
    if (!this.hasHydrated) {
      if (isEmulatorSync()) {
        this.hasHydrated = true;
        //console.log("running on emulator");
      } else {
        if (this.root.authStore.isConnected) {
          try {
            Purchases.restorePurchases()
              .then((val) => this.evaluateCustomer(val))
              .catch((e) => {
                if (e.toString() !== "Error: The receipt is not valid.") {
                  console.error(e.toString());
                }
              })
              .finally(() => (this.hasHydrated = true));
          } catch (e) {
            console.log("Error restoring purchases:", e);
          }
        } else {
          this.hydrateOffline();
        }
      }
    }
  }
}
