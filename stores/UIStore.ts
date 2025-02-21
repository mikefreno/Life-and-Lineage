import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { RootStore } from "./RootStore";
import {
  AccessibilityInfo,
  Appearance,
  Dimensions,
  EmitterSubscription,
  Platform,
  ScaledSize,
} from "react-native";
import { storage } from "../utility/functions/storage";
import { Character } from "../entities/character";

export const LOADING_TIPS: string[] = [
  "Remember to check your equipment before entering a dungeon",
  "Health potions can save your life in tough battles",
  "Some enemies are weak to certain types of damage",
  "Don't forget to upgrade your skills when you level up",
  "Bosses rarely spawn near the dungeon entry",
  "You can flee from battles if you're outmatched",
  "Selling unused items can provide valuable gold",
  "Some special encounters may have hidden rewards",
  "Not all treasures are worth the risk",
  "Keep an eye on your health during exploration",
];

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
  preferedColorScheme: "system" | "dark" | "light";
  systemColorScheme: "light" | "dark";
  vibrationEnabled: "full" | "minimal" | "none";
  healthWarning: number;
  reduceMotion: boolean;
  colorHeldForDungeon: "system" | "dark" | "light" | undefined;
  newbornBaby: Character | null = null;

  constructed: boolean = false;
  totalLoadingSteps: number = 0;
  completedLoadingSteps: number = 0;
  displayedProgress: number = 0;
  currentTipIndex: number = 0;
  progressIncrementing: boolean = false;

  storeLoadingStatus: Record<string, boolean> = {
    player: false,
    time: false,
    auth: false,
    shops: false,
    enemy: false,
    dungeon: false,
    character: false,
    tutorial: false,
    stash: false,
    save: false,
    audio: false,
    ambient: false,
    fonts: false,
    routing: false,
  };

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

    this.systemColorScheme = Appearance.getColorScheme() || "light";

    const {
      vibrationEnabled,
      preferedColorScheme,
      healthWarning,
      reduceMotion,
      colorHeldForDungeon,
    } = this.hydrateUISettings();

    this.vibrationEnabled = vibrationEnabled;
    this.preferedColorScheme = preferedColorScheme ?? "system";
    this.colorHeldForDungeon = colorHeldForDungeon;
    this.healthWarning = healthWarning;

    Appearance.addChangeListener(({ colorScheme }) => {
      this.setSystemColorScheme((colorScheme as "light" | "dark") || "light");
    });

    if (reduceMotion == undefined) {
      this.reduceMotion = false;
      AccessibilityInfo.isReduceMotionEnabled().then(this.setReduceMotion);
    } else {
      this.reduceMotion = reduceMotion;
    }

    makeObservable(this, {
      playerStatusIsCompact: observable,
      detailedStatusViewShowing: observable,
      dimensions: observable,
      itemBlockSize: observable,
      modalShowing: observable,
      preferedColorScheme: observable,
      vibrationEnabled: observable,
      healthWarning: observable,
      storeLoadingStatus: observable,
      totalLoadingSteps: observable,
      completedLoadingSteps: observable,
      systemColorScheme: observable,
      newbornBaby: observable,
      colorHeldForDungeon: observable,
      currentTipIndex: observable,

      startTipCycle: action,
      completeLoading: action,
      setTotalLoadingSteps: action,
      setPlayerStatusCompact: action,
      setDetailedStatusViewShowing: action,
      setPreferedColorScheme: action,
      modifyVibrationSettings: action,
      setHealthWarning: action,
      handleDimensionChange: action,
      reduceMotion: observable,
      setReduceMotion: action,
      setNewbornBaby: action,
      setSystemColorScheme: action,
      dungeonSetter: action,
      clearDungeonColor: action,
      markStoreAsLoaded: action,

      colorScheme: computed,
      allResourcesLoaded: computed,
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
        this.preferedColorScheme,
        this.colorHeldForDungeon,
        this.healthWarning,
        this.vibrationEnabled,
        this.reduceMotion,
        this.colorHeldForDungeon,
      ],
      () => {
        this.persistUISettings();
      },
    );

    reaction(
      () => this.completedLoadingSteps,
      (completedSteps) => {
        if (completedSteps > 0 && completedSteps === this.totalLoadingSteps) {
          setTimeout(() => {
            runInAction(() => {
              this.completedLoadingSteps = 0;
              this.totalLoadingSteps = 0;
            });
          }, 500);
        }
      },
    );
  }

  debugLoadingStatus() {
    if (__DEV__) {
      console.log("Loading Status:");
      Object.entries(this.storeLoadingStatus).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
      console.log(`Total Progress: ${this.displayedProgress}`);
    }
  }

  markStoreAsLoaded(storeName: keyof typeof this.storeLoadingStatus) {
    this.storeLoadingStatus[storeName] = true;
    const loadedCount = Object.values(this.storeLoadingStatus).filter(
      Boolean,
    ).length;
    const totalCount = Object.keys(this.storeLoadingStatus).length;
    this.displayedProgress = (loadedCount / totalCount) * 100;
  }

  get allResourcesLoaded() {
    const storesLoaded = Object.values(this.storeLoadingStatus).every(
      (status) => status,
    );
    const stepsComplete = this.completedLoadingSteps >= this.totalLoadingSteps;
    return storesLoaded && stepsComplete;
  }

  startTipCycle() {
    const cycleTips = () => {
      if (!this.progressIncrementing) return;
      runInAction(
        () =>
          (this.currentTipIndex =
            (this.currentTipIndex + 1) % LOADING_TIPS.length),
      );
      setTimeout(cycleTips, 3000);
    };
    setTimeout(cycleTips, 3000);
  }

  getCurrentTip() {
    return LOADING_TIPS[this.currentTipIndex];
  }

  setTotalLoadingSteps(steps: number) {
    this.displayedProgress = 0;
    this.completedLoadingSteps = 0;
    this.totalLoadingSteps = steps;
    this.progressIncrementing = true;
    runInAction(
      () =>
        (this.currentTipIndex = Math.floor(
          Math.random() * LOADING_TIPS.length,
        )),
    );
    this.startProgressAnimation();
    this.startTipCycle();
  }

  incrementLoadingStep() {
    runInAction(() => {
      this.completedLoadingSteps = Math.min(
        this.completedLoadingSteps + 1,
        this.totalLoadingSteps,
      );

      if (this.totalLoadingSteps > 0) {
        this.displayedProgress =
          (this.completedLoadingSteps / this.totalLoadingSteps) * 100;
      }
    });
  }

  private startProgressAnimation() {
    const animate = () => {
      if (!this.progressIncrementing) return;

      runInAction(() => {
        if (this.totalLoadingSteps === 0) {
          this.displayedProgress = 100;
          return;
        }

        const targetProgress =
          (this.completedLoadingSteps / this.totalLoadingSteps) * 100;

        // Smoothly animate to the target progress
        if (this.displayedProgress < targetProgress) {
          const distance = targetProgress - this.displayedProgress;
          const increment = Math.max(1, distance * 0.1);
          this.displayedProgress = Math.min(
            this.displayedProgress + increment,
            targetProgress,
          );
        }

        if (this.completedLoadingSteps >= this.totalLoadingSteps) {
          // If all steps are complete, finish the animation
          if (this.displayedProgress >= 100) {
            this.completeLoading();
          } else {
            requestAnimationFrame(animate);
          }
        } else {
          requestAnimationFrame(animate);
        }
      });
    };

    animate();
  }

  completeLoading() {
    this.progressIncrementing = false;
    this.displayedProgress = 100;
    setTimeout(() => {
      runInAction(() => {
        this.displayedProgress = 0;
        this.totalLoadingSteps = 0;
        this.completedLoadingSteps = 0;
      });
    }, 500);
  }

  setSystemColorScheme(colorScheme: "light" | "dark") {
    this.systemColorScheme = colorScheme;
  }

  get colorScheme(): "light" | "dark" {
    if (this.preferedColorScheme === "system") {
      return this.systemColorScheme;
    } else {
      return this.preferedColorScheme as "light" | "dark";
    }
  }

  dungeonSetter() {
    this.colorHeldForDungeon = this.preferedColorScheme;
    this.preferedColorScheme = "dark";
  }

  clearDungeonColor() {
    if (this.colorHeldForDungeon) {
      this.preferedColorScheme = this.colorHeldForDungeon;
    }
  }

  setNewbornBaby(baby: Character | null) {
    this.newbornBaby = baby;
  }

  public setPreferedColorScheme(color: "light" | "dark" | "system") {
    this.preferedColorScheme = color;
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
    preferedColorScheme: "system" | "dark" | "light";
    vibrationEnabled: "full" | "minimal" | "none";
    healthWarning: number;
    reduceMotion: boolean | undefined;
    colorHeldForDungeon: "system" | "dark" | "light" | undefined;
  } {
    const stored = storage.getString("ui_settings");
    if (!stored) {
      return {
        preferedColorScheme: "system",
        vibrationEnabled: Platform.OS === "ios" ? "full" : "minimal",
        healthWarning: 0.2,
        reduceMotion: undefined,
        colorHeldForDungeon: undefined,
      };
    }
    return JSON.parse(stored);
  }

  hydrateShaderSettings() {
    const curvature = storage.getNumber("curvature");
    const scanlineIntensity = storage.getNumber("scanlineIntensity");
    const noiseIntensity = storage.getNumber("noiseIntensity");
    const flickerIntensity = storage.getNumber("flickerIntensity");
    const vignetteIntensity = storage.getNumber("vignetteIntensity");
    const rgbOffset = storage.getNumber("rgbOffset");
    const brightness = storage.getNumber("brightness");
    const contrast = storage.getNumber("contrast");
    const blooming = storage.getNumber("blooming");
    const ghostIntensity = storage.getNumber("ghost");

    return {
      curvature: curvature ?? 2.0,
      scanlineIntensity: scanlineIntensity ?? 0.04,
      noiseIntensity: noiseIntensity ?? 0.02,
      flickerIntensity: flickerIntensity ?? 0.01,
      vignetteIntensity: vignetteIntensity ?? 0.5,
      rgbOffset: rgbOffset ?? 0.002,
      brightness: brightness ?? 1.1,
      contrast: contrast ?? 1.2,
      blooming: blooming ?? 0.002,
      ghostIntensity: ghostIntensity ?? 0.15,
    };
  }

  persistUISettings() {
    storage.set(
      "ui_settings",
      JSON.stringify({
        preferedColorScheme: this.preferedColorScheme,
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
