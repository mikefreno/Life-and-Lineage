import { action, makeObservable, observable, reaction } from "mobx";
import { RootStore } from "./RootStore";
import {
  Dimensions,
  EmitterSubscription,
  Platform,
  ScaledSize,
} from "react-native";
import { storage } from "../utility/functions/storage";

export default class UIStore {
  root: RootStore;
  playerStatusIsCompact: boolean;
  dimensions: {
    window: {
      height: number;
      width: number;
      greater: number;
      lesser: number;
    };
    screen: {
      height: number;
      width: number;
      greater: number;
      lesser: number;
    };
  };
  itemBlockSize: number;
  detailedStatusViewShowing: boolean;
  modalShowing: boolean;
  readonly dimensionsSubscription: EmitterSubscription;
  colorScheme: "system" | "dark" | "light";
  vibrationEnabled: "full" | "minimal" | "none";
  healthWarning: number;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.playerStatusIsCompact = true;
    const dimensions = {
      window: {
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
      },
      screen: {
        height: Dimensions.get("screen").height,
        width: Dimensions.get("screen").width,
        greater: Math.max(
          Dimensions.get("screen").height,
          Dimensions.get("screen").width,
        ),
        lesser: Math.min(
          Dimensions.get("screen").height,
          Dimensions.get("screen").width,
        ),
      },
    };
    this.dimensions = dimensions;
    this.itemBlockSize = UIStore.calcBlockSize(dimensions);
    this.dimensionsSubscription = Dimensions.addEventListener(
      "change",
      ({ window, screen }: { window: ScaledSize; screen: ScaledSize }) => {
        this.handleDimensionChange({ window, screen });
      },
    );

    this.detailedStatusViewShowing = false;
    this.modalShowing = false;

    const { vibrationEnabled, colorScheme, healthWarning } =
      this.hydrateUISettings();

    this.vibrationEnabled =
      vibrationEnabled ?? Platform.OS == "ios" ? "full" : "minimal";

    this.colorScheme = colorScheme ?? "system";
    this.healthWarning = healthWarning ?? 0.2;

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
    });

    reaction(
      () => [this.colorScheme, this.healthWarning, this.vibrationEnabled],
      () => {
        this.persistUISettings();
      },
    );
  }

  public setColorScheme(color: "light" | "dark" | "system") {
    this.colorScheme = color;
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

  public handleDimensionChange({
    window,
    screen,
  }: {
    window: ScaledSize;
    screen: ScaledSize;
  }) {
    const dimensions = {
      window: {
        height: window.height,
        width: window.width,
        greater: Math.max(window.height, window.width),
        lesser: Math.min(window.height, window.width),
      },
      screen: {
        height: screen.height,
        width: screen.width,
        greater: Math.max(screen.height, screen.width),
        lesser: Math.min(screen.height, screen.width),
      },
    };
    this.dimensions = dimensions;
    this.itemBlockSize = UIStore.calcBlockSize(dimensions);
  }

  static calcBlockSize(dimensions: {
    window: {
      height: number;
      width: number;
      greater: number;
      lesser: number;
    };
    screen: {
      height: number;
      width: number;
      greater: number;
      lesser: number;
    };
  }) {
    let blockSize;
    if (dimensions.window.width === dimensions.window.lesser) {
      blockSize = Math.min(
        dimensions.window.height / 5,
        dimensions.window.width / 7.5,
      );
    } else {
      blockSize = dimensions.window.width / 14;
    }
    return blockSize;
  }

  hydrateUISettings(): {
    colorScheme: "system" | "dark" | "light" | undefined;
    vibrationEnabled: "full" | "minimal" | "none" | undefined;
    healthWarning: number | undefined;
  } {
    const stored = storage.getString("ui_settings");
    if (!stored) {
      return {
        colorScheme: undefined,
        vibrationEnabled: undefined,
        healthWarning: undefined,
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
      }),
    );
  }
}
