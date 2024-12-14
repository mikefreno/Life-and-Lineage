import { action, makeObservable, observable, reaction } from "mobx";
import { RootStore } from "./RootStore";
import {
  AccessibilityInfo,
  Dimensions,
  EmitterSubscription,
  Platform,
  ScaledSize,
} from "react-native";
import { storage } from "../utility/functions/storage";
import { Character } from "../entities/character";

export default class UIStore {
  root: RootStore;
  playerStatusIsCompact: boolean;
  dimensions: {
    height: number;
    width: number;
    greater: number;
    lesser: number;
  };
  itemBlockSize: number;
  detailedStatusViewShowing: boolean;
  modalShowing: boolean;
  readonly dimensionsSubscription: EmitterSubscription;
  colorScheme: "system" | "dark" | "light";
  vibrationEnabled: "full" | "minimal" | "none";
  healthWarning: number;
  reduceMotion: boolean;
  colorHeldForDungeon: "system" | "dark" | "light" | undefined;
  isLoading: boolean = false;
  newbornBaby: Character | null = null;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.playerStatusIsCompact = this.root.playerState
      ? !(
          this.root.playerState.unAllocatedSkillPoints > 0 ||
          this.root.playerState.conditions.length > 0
        )
      : true;

    const dimensions = {
      height: Dimensions.get("window").height,
      width: Dimensions.get("window").width,
      greater: Math.max(
        Dimensions.get("window").height,
        Dimensions.get("window").width,
      ),
      lesser: Math.min(
        Dimensions.get("window").height,
        Dimensions.get("window").width,
      ),
    };
    this.dimensions = dimensions;
    this.itemBlockSize = UIStore.calcBlockSize(dimensions);
    this.dimensionsSubscription = Dimensions.addEventListener(
      "change",
      ({ window }: { window: ScaledSize }) => {
        this.handleDimensionChange({ window });
      },
    );

    this.detailedStatusViewShowing = false;
    this.modalShowing = false;

    const {
      vibrationEnabled,
      colorScheme,
      healthWarning,
      reduceMotion,
      colorHeldForDungeon,
    } = this.hydrateUISettings();

    this.vibrationEnabled = vibrationEnabled;
    this.colorScheme = colorScheme ?? "system";
    this.colorHeldForDungeon = colorHeldForDungeon;
    this.healthWarning = healthWarning;

    if (reduceMotion == undefined) {
      this.reduceMotion = false;
      AccessibilityInfo.isReduceMotionEnabled().then(this.setReduceMotion);
    } else {
      this.reduceMotion = reduceMotion;
    }

    makeObservable(this, {
      playerStatusIsCompact: observable,
      setPlayerStatusCompact: action,
      detailedStatusViewShowing: observable,
      setDetailedStatusViewShowing: action,
      dimensions: observable,
      itemBlockSize: observable,
      modalShowing: observable,
      colorScheme: observable,
      vibrationEnabled: observable,
      healthWarning: observable,
      setColorScheme: action,
      modifyVibrationSettings: action,
      setHealthWarning: action,
      handleDimensionChange: action,
      reduceMotion: observable,
      setReduceMotion: action,
      dungeonSetter: action,
      isLoading: observable,
      colorHeldForDungeon: observable,
      clearDungeonColor: action,
      setIsLoading: action,
      newbornBaby: observable,
      setNewbornBaby: action,
    });

    reaction(
      () => [
        this.root.playerState?.unAllocatedSkillPoints,
        this.root.playerState?.conditions.length,
      ],
      () => {
        this.setPlayerStatusCompact(
          !!this.root.playerState &&
            !(
              this.root.playerState.unAllocatedSkillPoints > 0 ||
              this.root.playerState.conditions.length > 0
            ),
        );
      },
    );

    reaction(
      () => [
        this.colorScheme,
        this.healthWarning,
        this.vibrationEnabled,
        this.reduceMotion,
        this.colorHeldForDungeon,
      ],
      () => {
        this.persistUISettings();
      },
    );
  }

  dungeonSetter() {
    this.colorHeldForDungeon = this.colorScheme;
    this.colorScheme = "dark";
  }

  clearDungeonColor() {
    if (this.colorHeldForDungeon) {
      this.colorScheme = this.colorHeldForDungeon;
      this.colorHeldForDungeon = undefined;
    }
  }
  async setIsLoading(state: boolean) {
    this.isLoading = state;
    if (state) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  setNewbornBaby(baby: Character | null) {
    this.newbornBaby = baby;
  }

  public setColorScheme(color: "light" | "dark" | "system") {
    this.colorScheme = color;
  }

  public setReduceMotion(state: boolean) {
    this.reduceMotion = state;
  }

  public modifyVibrationSettings(targetState: "full" | "minimal" | "none") {
    this.vibrationEnabled = targetState;
  }

  public setHealthWarning(desiredValue: number) {
    this.healthWarning = desiredValue;
  }

  public setPlayerStatusCompact(state: boolean) {
    this.playerStatusIsCompact = state;
  }
  public setDetailedStatusViewShowing(state: boolean) {
    this.detailedStatusViewShowing = state;
  }

  public handleDimensionChange({ window }: { window: ScaledSize }) {
    const dimensions = {
      height: window.height,
      width: window.width,
      greater: Math.max(window.height, window.width),
      lesser: Math.min(window.height, window.width),
    };
    this.dimensions = dimensions;
    this.itemBlockSize = UIStore.calcBlockSize(dimensions);
  }

  static calcBlockSize(dimensions: {
    height: number;
    width: number;
    greater: number;
    lesser: number;
  }) {
    let blockSize;
    if (dimensions.width === dimensions.lesser) {
      blockSize = Math.min(dimensions.height / 5, dimensions.width / 7.5);
    } else {
      blockSize = dimensions.width / 14;
    }
    return blockSize;
  }

  hydrateUISettings(): {
    colorScheme: "system" | "dark" | "light";
    vibrationEnabled: "full" | "minimal" | "none";
    healthWarning: number;
    reduceMotion: boolean | undefined;
    colorHeldForDungeon: "system" | "dark" | "light" | undefined;
  } {
    const stored = storage.getString("ui_settings");
    if (!stored) {
      return {
        colorScheme: "system",
        vibrationEnabled: Platform.OS === "ios" ? "full" : "minimal",
        healthWarning: 0.2,
        reduceMotion: undefined,
        colorHeldForDungeon: undefined,
      };
    }
    return JSON.parse(stored);
  }

  persistUISettings() {
    storage.set(
      "ui_settings",
      JSON.stringify({
        colorScheme: this.colorScheme,
        vibrationEnabled: this.vibrationEnabled,
        healthWarning: this.healthWarning,
        reduceMotion: this.reduceMotion,
        colorHeldForDungeon: this.colorHeldForDungeon,
      }),
    );
  }

  destroy() {
    if (this.dimensionsSubscription) {
      this.dimensionsSubscription.remove();
    }
  }
}
