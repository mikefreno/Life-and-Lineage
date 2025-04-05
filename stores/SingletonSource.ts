import { RootStore } from "./RootStore";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

const rootStore = new RootStore();

export { rootStore };
export const jsonServiceStore = rootStore.JSONServiceStore;
export const authStore = rootStore.authStore;
export const iapStore = rootStore.iapStore;

export const initializePurchases = async () => {
  try {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_RC_IOS as string });
    } else if (Platform.OS === "android") {
      Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_RC_ANDROID as string,
      });
    }

    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
      iapStore.setOffering(offerings.current);
    }

    return true;
  } catch (error) {
    console.error("Failed to initialize purchases:", error);
    return false;
  }
};
