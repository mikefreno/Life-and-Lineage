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
  process.env.EXPO_PUBLIC_IOS_TABS_ID,
  process.env.EXPO_PUBLIC_ANDROID_TABS_ID,
];

export class IAPStore {
  root: RootStore;
  rangerUnlocked = false;
  necromancerUnlocked = false;
  remoteSaveSpecificUnlock = false;
  hasHydrated = false;
  cachedSecret: string | null = null;

  purchasedTabs = 0;

  offering: PurchasesOffering | null = null;
  necromancerProduct: PurchasesStoreProduct | null = null;
  rangerProduct: PurchasesStoreProduct | null = null;
  dualClassProduct: PurchasesStoreProduct | null = null;
  remoteSaveProduct: PurchasesStoreProduct | null = null;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.getCustomersIAPs();

    makeObservable(this, {
      rangerUnlocked: observable,
      necromancerUnlocked: observable,
      dualClassProduct: observable,
      remoteSaveProduct: observable,
      offering: observable,
      hasHydrated: observable,
      remoteSaveSpecificUnlock: observable,
      cachedSecret: observable,
      purchasedTabs: observable,

      evaluateTransactions: action,
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
      this.rangerUnlocked
    );
  }

  setOffering(offering: PurchasesOffering | null) {
    this.offering = offering;
    if (NECRO_UNLOCK_IDs.includes(offering?.lifetime?.product.identifier)) {
      this.necromancerProduct = offering?.lifetime?.product ?? null;
    }
    if (RANGER_UNLOCK_IDs.includes(offering?.lifetime?.product.identifier)) {
      this.rangerProduct = offering?.lifetime?.product ?? null;
    }
    if (
      REMOTE_SAVES_UNLOCK_IDs.includes(offering?.lifetime?.product.identifier)
    ) {
      this.remoteSaveProduct = offering?.lifetime?.product ?? null;
    }
    if (
      DUAL_CLASS_UNLOCK_IDs.includes(offering?.lifetime?.product.identifier)
    ) {
      this.dualClassProduct = offering?.lifetime?.product ?? null;
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
    this.evaluateProductIds(customer.allPurchasedProductIdentifiers);
  }

  private evaluateProductIds(transactions: string[]) {
    const messageReporting = [];
    for (const transaction of transactions) {
      if (DUAL_CLASS_UNLOCK_IDs.includes(transaction)) {
        this.necromancerUnlocked = true;
        this.rangerUnlocked = true;
        messageReporting.push("Ranger Unlocked!");
        messageReporting.push("Necromancer Unlocked!");
        messageReporting.push("Remote Saving Unlocked!");
        continue;
      }
      if (RANGER_UNLOCK_IDs.includes(transaction)) {
        this.rangerUnlocked = true;
        messageReporting.push("Ranger Unlocked!");
        messageReporting.push("Remote Saving Unlocked!");
        continue;
      }
      if (NECRO_UNLOCK_IDs.includes(transaction)) {
        this.necromancerUnlocked = true;
        messageReporting.push("Necromancer Unlocked!");
        messageReporting.push("Remote Saving Unlocked!");
        continue;
      }
      if (REMOTE_SAVES_UNLOCK_IDs.includes(transaction)) {
        this.remoteSaveSpecificUnlock = true;
        messageReporting.push("Remote Saving Unlocked!");
        continue;
      }
    }
    this.persistForOffline();
    return messageReporting;
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
    if (REMOTE_SAVES_UNLOCK_IDs.includes(val.productIdentifier)) {
      this.remoteSaveSpecificUnlock = true;
      return "Remote Saving Unlocked!";
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

      if (this.rangerUnlocked) {
        storage.set(
          "rangerIAP",
          JSON.stringify({
            unlocked: true,
            timestamp: currentTime,
            tokenVersion: validationToken.substring(0, 8),
          }),
        );
      }

      if (this.necromancerUnlocked) {
        storage.set(
          "necromancerIAP",
          JSON.stringify({
            unlocked: true,
            timestamp: currentTime,
            tokenVersion: validationToken.substring(0, 8),
          }),
        );
      }

      if (this.remoteSaveSpecificUnlock) {
        storage.set(
          "remoteSaveIAP",
          JSON.stringify({
            unlocked: true,
            timestamp: currentTime,
            tokenVersion: validationToken.substring(0, 8),
          }),
        );
      }
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

      const rangerData = storage.getString("rangerIAP");
      const necromancerData = storage.getString("necromancerIAP");
      const remoteSaveData = storage.getString("remoteSaveIAP");

      if (rangerData) {
        const ranger = JSON.parse(rangerData);
        this.rangerUnlocked = ranger.unlocked;
      }

      if (necromancerData) {
        const necromancer = JSON.parse(necromancerData);
        this.necromancerUnlocked = necromancer.unlocked;
      }

      if (remoteSaveData) {
        const remoteSave = JSON.parse(remoteSaveData);
        this.remoteSaveSpecificUnlock = remoteSave.unlocked;
      }
    } catch (error) {
      console.log("Failed to hydrate offline data:", error);
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

  async getCustomersIAPs() {
    if (this.root.authStore.isConnected) {
      try {
        const val = await Purchases.restorePurchases();
        this.evaluateCustomer(val);
        this.hasHydrated = true;
      } catch (e) {
        console.log("Error restoring purchases:", e);
      }
    } else {
      await this.hydrateOffline();
    }
  }
}
