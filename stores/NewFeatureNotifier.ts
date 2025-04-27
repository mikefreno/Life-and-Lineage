import { storage } from "@/utility/functions/storage";
import Constants from "expo-constants";
import { RootStore } from "./RootStore";
import { action, computed, makeObservable, observable } from "mobx";
import { ExternalPathString, RelativePathString } from "expo-router";

export type NewFeaturePage = {
  title: string;
  body: string;
  link?: { path: RelativePathString | ExternalPathString; string: string };
};

export class NewFeatureNotifier {
  root: RootStore;
  lastSeenAppVersion: string | null;
  currentAppVersion: string;
  shownCurrentMessage = false;
  getNotified: boolean;
  isModalVisible = false;

  constructor({ root }: { root: RootStore }) {
    this.root = root;

    const { lastSeenAppVersion, getNotified } = this.hydrate();

    this.getNotified = getNotified;
    this.currentAppVersion = Constants.expoConfig?.version!;

    this.lastSeenAppVersion =
      lastSeenAppVersion ??
      (this.root.playerState ? "1.1.0" : this.currentAppVersion);

    makeObservable(this, {
      getNotified: observable,
      shownCurrentMessage: observable,
      lastSeenAppVersion: observable,

      isModalVisible: observable,
      messages: computed,

      setGetNotified: action,
      handleModalClose: action,
      serialize: action,
      hydrate: action,
    });
  }

  setGetNotified(arg0: boolean): void {
    this.getNotified = arg0;
    this.serialize();
  }

  get messages(): NewFeaturePage[] {
    if (
      this.lastSeenAppVersion === this.currentAppVersion ||
      !this.getNotified
    ) {
      this.serialize();
      return [];
    }

    let messages: NewFeaturePage[] = [];

    // Structure to add messages based on the version they were introduced.
    // Use proper version comparison if your versions get complex (e.g., '1.10.0' vs '1.9.0')
    // Simple string comparison works for basic sequential versions like '1.0.4', '1.0.5'.

    if (compareVersions(this.lastSeenAppVersion, "1.1.0") < 0) {
      messages.push({
        title: "The Codex is Here!",
        body: "It contains all sorts of information about how the game works, so if are into that kinda thing, or need help, you can find it within the options screen.",
        link: { path: "/Options/Codex", string: "Check it out" },
      });
      messages.push({
        title: "Time Indication",
        body: "A time change indication was added, indicating the number of weeks the game clock has moved ahead every time it happens.",
      });
    }

    if (compareVersions(this.lastSeenAppVersion, "1.1.3") < 0) {
      let pointsToGive = 0;
      this.root.dungeonStore.dungeonInstances.forEach((inst) =>
        inst.levels.forEach((level) => {
          if (level.bossDefeated) {
            pointsToGive += 2;
          }
        }),
      );
      this.root.playerState?.addSkillPoint({ amount: pointsToGive });

      messages.push({
        title: "Player Power Update",
        body: "The player's damage scaling from Strength/Dexterity/Intelligence has been increased significantly. Additionally, the skill point reward for boss kills has been increased from 3->5. You have been been credited the difference for any previously defeated boss.",
      });
    }

    if (compareVersions(this.lastSeenAppVersion, "1.1.4") < 0) {
      this.root.dungeonStore.dungeonInstances.forEach((inst) => {
        if (inst.name === "bandit hideout" || inst.name === "goblin cave") {
          if (inst.levels.every((level) => level.bossDefeated)) {
            console.log("all cleared");
            this.root.dungeonStore.openNextDungeonLevel(inst);
          } else {
            console.log("no unlocks");
          }
        }
      });
    }

    this.isModalVisible = true;
    this.serialize();
    return messages;
  }

  handleModalClose() {
    this.shownCurrentMessage = true;
    this.isModalVisible = false;
    this.lastSeenAppVersion = this.currentAppVersion;
    this.serialize();
  }

  hydrate(): { lastSeenAppVersion: string | null; getNotified: boolean } {
    let lastSeenAppVersion: string | null = null;
    let getNotified: boolean = true;
    try {
      lastSeenAppVersion = storage.getString("lastSeenAppVersion") ?? null;
      getNotified = storage.getBoolean("getNewFeatureNotified") ?? true;
    } catch (error) {
      console.error("Failed to hydrate NewFeatureNotifier:", error);
    }
    return { lastSeenAppVersion, getNotified };
  }

  serialize() {
    try {
      storage.set("lastSeenAppVersion", this.currentAppVersion);
      storage.set("getNewFeatureNotified", this.getNotified);
    } catch (error) {
      console.error("Failed to serialize NewFeatureNotifier state:", error);
    }
  }
}
/**
 * Compares two semantic version strings (e.g., "1.0.1", "1.10.0").
 * Handles Major.Minor.Patch components.
 *
 * @param v1 First version string.
 * @param v2 Second version string.
 * @returns -1 if v1 < v2, 1 if v1 > v2, 0 if v1 === v2
 */
export const compareVersions = (
  v1: string | null,
  v2: string | null,
): number => {
  // Handle null or identical inputs first
  if (v1 === v2) return 0;
  if (v1 === null) return -1; // null is considered less than any version
  if (v2 === null) return 1; // any version is considered greater than null

  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  const len = Math.max(parts1.length, parts2.length);

  console.log(parts1);
  console.log(parts2);
  for (let i = 0; i < len; i++) {
    const p1 = parts1[i] || 0; // Default to 0 if part is missing
    const p2 = parts2[i] || 0; // Default to 0 if part is missing

    if (isNaN(p1) || isNaN(p2)) {
      // Handle non-numeric parts if necessary, or treat as error/equal
      // For simplicity here, we treat non-numeric as potentially equal or skip
      console.warn(
        `Non-numeric part encountered in version comparison: ${v1} vs ${v2}`,
      );
      continue; // Or return 0 if non-numeric should halt comparison
    }

    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }

  return 0; // All comparable parts were equal
};
