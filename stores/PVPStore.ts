import { AIPlayerCharacter } from "@/entities/playerCharacterAI";
import { RootStore } from "./RootStore";
import { API_BASE_URL } from "@/config/config";
import { storage } from "@/utility/functions/storage";
import { action, computed, makeObservable, observable, reaction } from "mobx";

export class PVPStore {
  root: RootStore;
  availibleOpponents: AIPlayerCharacter[] = [];
  chosenOpponent: AIPlayerCharacter | undefined = undefined;

  notificationsEnabled = true;
  expoPushToken: string | undefined = undefined;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.hydrateSettings();

    makeObservable(this, {
      availibleOpponents: observable,
      chosenOpponent: observable,
      notificationsEnabled: observable,
      expoPushToken: observable,

      setExpoPushToken: action,
      playerIsSyncedToJSONService: computed,
      playerCanEngageInPvP: computed,
    });

    reaction(
      () => [this.notificationsEnabled, this.expoPushToken],
      () => this.persistSettings(),
    );
  }

  get playerIsSyncedToJSONService() {
    return this.root.JSONServiceStore.isAllDataRetrieved;
  }

  get playerCanEngageInPvP() {
    const arena = this.root.dungeonStore.dungeonInstances.find(
      (inst) => inst.name === "ancient arena",
    );
    if (arena) {
      return !arena.levels.some((level) => !!level.unlocked);
    }
    return false;
  }

  setExpoPushToken(expoPushToken: string) {
    this.expoPushToken = expoPushToken;
  }

  async sendPlayerToAPI() {
    if (this.root.playerState) {
      const asAI = AIPlayerCharacter.create(this.root.playerState);
      const res = await fetch(`${API_BASE_URL}/pvp`, {
        method: "POST",
        body: JSON.stringify({
          ...asAI,
          root: undefined,
          token: this.expoPushToken,
        }),
      });
    }
  }

  async retrieveOpponents() {
    const res = await fetch(`${API_BASE_URL}/pvp`, { method: "GET" });
  }

  persistSettings() {
    storage.set("pvpNotifications", this.notificationsEnabled);
    if (this.expoPushToken) {
      storage.set("expoPushToken", this.expoPushToken);
    }
  }
  hydrateSettings() {
    const val = storage.getBoolean("pvpNotifications");
    return val ?? true;
  }
}
