import { AIPlayerCharacter } from "@/entities/playerCharacterAI";
import { RootStore } from "./RootStore";
import { API_BASE_URL } from "@/config/config";
import { storage } from "@/utility/functions/storage";
import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import DeviceInfo from "react-native-device-info";
import * as Notifications from "expo-notifications";

export class PVPStore {
  root: RootStore;
  linkID: string | undefined = undefined;
  availableOpponents: AIPlayerCharacter[] = [];
  chosenOpponent: AIPlayerCharacter | undefined = undefined;
  notificationsEnabled = true;
  expoPushToken: string | undefined = undefined;

  pvpName: string | undefined = undefined;
  pvpTokens: number = 0;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.hydrate().then(
      ({ linkID, expoPushToken, notificationsEnabled, pvpName }) => {
        runInAction(() => {
          this.linkID = linkID;
          this.expoPushToken = expoPushToken;
          this.notificationsEnabled = notificationsEnabled;
          this.pvpName = pvpName ?? this.root.playerState?.fullName;
        });
      },
    );

    makeObservable(this, {
      availableOpponents: observable,
      chosenOpponent: observable,
      notificationsEnabled: observable,
      expoPushToken: observable,
      linkID: observable,
      pvpTokens: observable,
      pvpName: observable,

      spendPvPTokens: action,
      setExpoPushToken: action,
      playerIsSyncedToJSONService: computed,
      playerCanEngageInPvP: computed,
    });

    reaction(
      () => [
        this.notificationsEnabled,
        this.expoPushToken,
        this.linkID,
        this.pvpTokens,
      ],
      () => this.persist(),
    );
  }

  get playerIsSyncedToJSONService() {
    return this.root.JSONServiceStore.isAllDataRetrieved;
  }

  get playerCanEngageInPvP() {
    //TODO: Remove when implemented
    if (!__DEV__) return false;
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
      const res = await fetch(`http://192.168.0.163:3000/api/lineage/pvp`, {
        method: "POST",
        body: JSON.stringify({
          character: {
            ...asAI,
            resistanceTable: JSON.stringify(asAI.resistanceTable),
            damageTable: JSON.stringify(asAI.damageTable),
            attackStrings: JSON.stringify(asAI.attackStrings),
            knownSpells: JSON.stringify(asAI.knownSpells),
            root: undefined,
            currentHealth: undefined,
            currentMana: undefined,
            currentSanity: undefined,
            conditions: undefined,
            activeAuraConditionIds: undefined,
            minions: undefined,
            rangerPet: undefined,
          },
          linkID: this.linkID,
          pushToken: this.expoPushToken,
        }),
      });
      this.persist(); // make sure we have id stored, so we can link
    }
  }

  async syncPlayerData() {
    if (this.root.playerState) {
      const asAI = AIPlayerCharacter.create(this.root.playerState);
      const res = await fetch(`${API_BASE_URL}/pvp/check`, {
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

  spendPvPTokens(amount: number) {
    this.pvpTokens -= amount;
  }

  private setPVPTokenCount(amount: number) {
    this.pvpTokens = amount;
  }

  persist() {
    storage.set("pvpNotifications", this.notificationsEnabled);
    if (this.expoPushToken) {
      storage.set("expoPushToken", this.expoPushToken);
    }
    if (this.linkID) {
      storage.set("linkID", this.linkID);
    }
    if (this.pvpName) {
      storage.set("pvpName", this.pvpName);
    }
  }

  async hydrate() {
    const notificationsEnabled: boolean =
      storage.getBoolean("pvpNotifications") ??
      (await Notifications.getPermissionsAsync().then((res) => res.granted));
    const expoPushToken = storage.getString("expoPushToken");
    const linkID = storage.getString("linkID") ?? DeviceInfo.getUniqueIdSync();
    const pvpName = storage.getString("pvpName");

    return { notificationsEnabled, expoPushToken, linkID, pvpName };
  }
}
