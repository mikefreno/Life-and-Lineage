import { AIPlayerCharacter } from "@/entities/AIPlayerCharacter";
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
import { getUniqueIdSync } from "react-native-device-info";
import { parse, stringify } from "flatted";

export class PVPStore {
  root: RootStore;
  linkID: string | undefined = undefined;
  availableOpponents: AIPlayerCharacter[] = [];
  chosenOpponent: AIPlayerCharacter | undefined = undefined;
  notificationsEnabled = true;
  expoPushToken: string | undefined = undefined;

  record: { winCount: number; lossCount: number } = {
    winCount: 0,
    lossCount: 0,
  };

  tokenRedemptionCount: number;

  pvpName: string | undefined = undefined;
  pvpTokens: number = 0;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    const {
      linkID,
      expoPushToken,
      notificationsEnabled,
      tokenRedemptionCount,
    } = this.hydrate();

    this.linkID = linkID ?? getUniqueIdSync();
    this.expoPushToken = expoPushToken;
    this.notificationsEnabled = notificationsEnabled;
    this.tokenRedemptionCount = tokenRedemptionCount ?? 0;

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
      if (this.root.authStore.isConnected) {
        return !arena.levels.some((level) => !!level.unlocked);
      }
    }
    return false;
  }

  setExpoPushToken(expoPushToken: string) {
    this.expoPushToken = expoPushToken;
  }

  async sendPlayerToAPI() {
    if (this.root.playerState) {
      const asAI = AIPlayerCharacter.create(this.root.playerState);
      this.root.uiStore.incrementLoadingStep();
      const res = await fetch(`${API_BASE_URL}/pvp`, {
        method: "POST",
        body: JSON.stringify({
          character: {
            ...asAI,
            resistanceTable: stringify(asAI.resistanceTable),
            damageTable: stringify(asAI.damageTable),
            attackStrings: stringify(asAI.attackStrings),
            knownSpells: stringify(asAI.knownSpells),
            threatTable: undefined,
            root: undefined,
            currentHealth: undefined,
            currentMana: undefined,
            currentSanity: undefined,
            conditions: undefined,
            activeAuraConditionIds: undefined,
            minions: undefined,
            rangerPet: undefined,
          },
          linkID: this.linkID ?? null,
          pushToken: this.expoPushToken ?? null,
          pushCurrentlyEnabled: this.notificationsEnabled,
        }),
      });
      this.root.uiStore.incrementLoadingStep();
      const { winCount, lossCount, tokenRedemptionCount } = await res.json();

      this.record = { winCount, lossCount };
      this.tokenRedemptionCount = tokenRedemptionCount;

      this.root.uiStore.incrementLoadingStep();
      this.persist(); // make sure we have id stored, so we can link
    }
  }

  async retrieveOpponents() {
    const res = await fetch(`${API_BASE_URL}/pvp`, { method: "GET" });
    const { characters } = await res.json();
    this.root.uiStore.incrementLoadingStep();
    const localChars: AIPlayerCharacter[] = [];
    for (const char of characters) {
      localChars.push(
        new AIPlayerCharacter({
          ...char,
          resistanceTable: parse(char.resistanceTable),
          damageTable: parse(char.damageTable),
          attackStrings: parse(char.attackStrings),
          knownSpells: parse(char.knownSpells),
          root: this.root,
        }),
      );
      // TODO calc reward per char
    }
    runInAction(() => (this.availableOpponents = localChars));
    this.root.uiStore.incrementLoadingStep();
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
    if (this.tokenRedemptionCount) {
      storage.set("tokenRedemptionCount", this.tokenRedemptionCount);
    }
  }

  hydrate() {
    const notificationsEnabled: boolean =
      storage.getBoolean("pvpNotifications") ?? false;

    const expoPushToken = storage.getString("expoPushToken");
    const linkID = storage.getString("linkID");
    const tokenRedemptionCount = storage.getNumber("tokenRedemptionCount");

    return {
      notificationsEnabled,
      expoPushToken,
      linkID,
      tokenRedemptionCount,
    };
  }
}
