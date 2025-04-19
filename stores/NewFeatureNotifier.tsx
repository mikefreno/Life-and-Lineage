import { storage } from "@/utility/functions/storage";
import Constants from "expo-constants";
import { RootStore } from "./RootStore";
import React, { Component, ReactNode } from "react";
import FeatureUpdateModal, {
  NewFeaturePage,
} from "@/components/NewFeaturesModal";
import { action, computed, makeObservable, observable } from "mobx";

interface NewFeatureNotifierProps {
  root: RootStore;
  children?: ReactNode;
}

interface NewFeatureNotifierState {
  isModalVisible: boolean;
  messagesToGive: NewFeaturePage[];
}

export class NewFeatureNotifier extends Component<
  NewFeatureNotifierProps,
  NewFeatureNotifierState
> {
  lastSeenAppVersion: string | null;
  currentAppVersion: string;
  shownCurrentMessage = false;
  getNotified: boolean;

  constructor(props: NewFeatureNotifierProps) {
    super(props);
    props.root.setNewFeatureNotifier(this);

    const { lastSeenAppVersion, getNotified } = this.hydrate();

    this.getNotified = getNotified;
    this.currentAppVersion = Constants.expoConfig?.version!;

    this.lastSeenAppVersion =
      lastSeenAppVersion ??
      (this.props.root.playerState ? "1.0.4" : this.currentAppVersion);

    this.handleModalClose = this.handleModalClose.bind(this);
    this.serialize = this.serialize.bind(this);

    makeObservable(this, {
      getNotified: observable,
      setGetNotified: action,
      isModalVisible: computed,
      messages: computed,
      handleModalClose: action,
    });
  }

  setGetNotified(arg0: boolean): void {
    this.getNotified = arg0;
    this.serialize();
  }

  get messages(): NewFeaturePage[] {
    if (this.lastSeenAppVersion === this.currentAppVersion) {
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
    }

    // --- Features added in v1.1.0 ---
    // if (lastVersion < "1.0.6") {
    //     messages.push({ title: "New Feature X", body: "Details about X..." });
    //     messages.push({ title: "Another Feature Y", body: "Details about Y..." });
    // }

    // --- Add blocks for future versions below ---

    return messages;
  }

  handleModalClose() {
    this.shownCurrentMessage = true;
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
      this.lastSeenAppVersion = this.currentAppVersion;
    } catch (error) {
      console.error("Failed to serialize NewFeatureNotifier state:", error);
    }
  }

  get isModalVisible() {
    return (
      !this.shownCurrentMessage &&
      this.getNotified &&
      this.messages.length > 0 &&
      this.lastSeenAppVersion !== this.currentAppVersion
    );
  }

  render(): ReactNode {
    if (!this.isModalVisible || this.messages.length === 0) {
      return null;
    }

    return (
      <FeatureUpdateModal
        isVisible={this.isModalVisible}
        pages={this.messages}
        onClose={this.handleModalClose}
      />
    );
  }
}
/**
 * Compares two semantic version strings (e.g., "1.0.1", "1.10.0").
 * Handles Major.Minor.Patch components.
 * Ignores pre-release tags or build metadata for simplicity in this context.
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
