import { action, makeObservable, observable } from "mobx";
import { RootStore } from "@/stores/RootStore";
import { Platform } from "react-native";

export class IAPStore {
  root: RootStore;
  remoteBackups = false;
  rangerUnlocked = false;
  necromancerUnlocked = false;

  constructor({ root }: { root: RootStore }) {
    this.root = root;

    makeObservable(this, {
      remoteBackups: observable,
      rangerUnlocked: observable,
      necromancerUnlocked: observable,
      unlockRemoteBackups: action,
    });
  }

  syncWithAppStore() {
    if (this.root.authStore.isConnected) {
      if (Platform.OS == "ios" || Platform.OS == "macos") {
        //talk to app store
      } else if (Platform.OS == "android") {
        //talk to google play
      } else {
        //talk to stripe
      }
    }
  }

  unlockRemoteBackups() {
    this.remoteBackups = true;
  }
}
