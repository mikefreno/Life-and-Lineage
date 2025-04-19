import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { RootStore } from "@/stores/RootStore";
import {
  AccessibilityInfo,
  Appearance,
  Dimensions,
  EmitterSubscription,
  NativeEventSubscription,
  Platform,
  ScaledSize,
} from "react-native";
import { storage } from "@/utility/functions/storage";
import { Character } from "@/entities/character";
import { EdgeInsets } from "react-native-safe-area-context";
import {
  addOrientationChangeListener,
  Orientation,
  getOrientationAsync,
} from "expo-screen-orientation";
import { hasNotch, isTablet, getDeviceType } from "react-native-device-info";
import { baseNormalize, baseNormalizeLineHeight } from "@/hooks/scaling";
import { getRandomInt } from "@/utility/functions/misc";

export const LOADING_TIPS: string[] = [
  "Conditions will continue to tick outside of combat",
  "Remember to check your equipment before entering a dungeon",
  "Health potions can save your life in tough battles",
  "Some enemies are weak to certain types of damage",
  "Don't forget to upgrade your skills when you level up",
  "Bosses rarely spawn near the dungeon entry",
  "You can flee from battles if you're outmatched",
  "Selling unused items can provide valuable gold",
  "Some special encounters may have hidden rewards, and dangers",
  "Not all treasures are worth the risk",
  "Keep an eye on your health during exploration",
  "Deactivating an aura returns its mana cost",
  "Old age will lead to dangerous ailments",
];

export const BASE_WIDTH = 400;

export const SCREEN_TRANSITION_TIMING = 500;

export const TABS_PADDING = 8;

export const tabRouteIndexing = [
  "/",
  "/spells",
  "/labor",
  "/shops",
  "/medical",
  "/dungeon",
];
export type LoadingStores =
  | "statusBar"
  //| "inventory"
  | "player"
  | "time"
  | "auth"
  | "shops"
  | "enemy"
  | "dungeon"
  | "character"
  | "tutorial"
  | "stash"
  | "save"
  | "audio"
  //| "ambient"
  | "fonts"
  | "routing"
  | "iaps";

export default class UIStore {
  root: RootStore;
  dimensions: {
    height: number;
    width: number;
    greater: number;
    lesser: number;
  };
  detailedStatusViewShowing: boolean;
  modalShowing: boolean;
  readonly dimensionsSubscription: EmitterSubscription;
  readonly orientationSubscription: NativeEventSubscription;
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
  currentTipIndex: number = getRandomInt(0, LOADING_TIPS.length);
  progressIncrementing: boolean = false;

  iconSizeXL = baseNormalize(28);
  tabHeightBase = baseNormalize(28);

  expansionPadding = baseNormalize(24);
  iconSizeLarge = baseNormalize(22);
  iconSizeSmall = baseNormalize(16);

  webviewURL:
    | "privacy-policy/life-and-lineage"
    | "contact"
    | "marketing/life-and-lineage"
    | null = null;

  playerStatusCompactHeight: number | undefined = undefined;
  playerStatusTop: number | undefined = undefined;

  storeLoadingStatus: Record<LoadingStores, boolean> = {
    statusBar: false,
    //inventory: false,
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
    //ambient: false,
    fonts: false,
    routing: false,
    iaps: false,
  };

  showDevDebugUI: boolean = false;

  hasNotch = hasNotch();
  orientation: Orientation = Orientation.UNKNOWN;

  insets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } | null = null;

  constructor({ root }: { root: RootStore }) {
    this.root = root;

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
    this.dimensionsSubscription = Dimensions.addEventListener(
      "change",
      ({ window }: { window: ScaledSize }) => {
        this.handleDimensionChange({ window });
      },
    );

    getOrientationAsync().then((orientation) => {
      runInAction(() => {
        this.orientation = orientation;
      });
    });

    this.orientationSubscription = addOrientationChangeListener((event) => {
      runInAction(() => {
        this.orientation = event.orientationInfo.orientation;
      });
    });

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

    __DEV__ && this.setupDevActions();

    makeObservable(this, {
      detailedStatusViewShowing: observable,
      dimensions: observable,
      modalShowing: observable,
      preferedColorScheme: observable,
      vibrationEnabled: observable,
      healthWarning: observable,
      storeLoadingStatus: observable.deep,
      totalLoadingSteps: observable,
      completedLoadingSteps: observable,
      systemColorScheme: observable,
      newbornBaby: observable,
      colorHeldForDungeon: observable,
      currentTipIndex: observable,
      showDevDebugUI: observable,
      playerStatusCompactHeight: observable,
      webviewURL: observable,
      playerStatusTop: observable,
      insets: observable,
      orientation: observable,

      setInsets: action,
      setPlayerStatusTop: action,
      startTipCycle: action,
      completeLoading: action,
      setTotalLoadingSteps: action,
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
      setPlayerStatusHeight: action,

      headerHeight: computed,
      tabHeight: computed,
      itemBlockSize: computed,
      playerStatusHeightSecondary: computed,
      playerStatusIsCompact: computed,
      playerStatusHeight: computed,
      colorScheme: computed,
      allResourcesLoaded: computed,
      isLandscape: computed,
      bottomBarHeight: computed,
      onExpandedTab: computed,
      compactRoutePadding: computed,
      playerStatusExpandedOnAllRoutes: computed,
      progress: computed,
    });

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

  setInsets(insets: EdgeInsets) {
    this.insets = { ...insets, bottom: Math.max(insets.bottom, 8) };
    this.storeLoadingStatus["statusBar"] = true;
  }

  private setupDevActions() {
    if (__DEV__) {
      this.root.addDevAction({
        action: () =>
          runInAction(() => {
            if (__DEV__) {
              this.showDevDebugUI = !this.showDevDebugUI;
            }
          }),
        name: "Toggle Debug UI",
      });
    }
  }

  get playerStatusIsCompact() {
    if (
      this.root.pathname === "dungoenlevel" &&
      !(
        tabRouteIndexing.includes(this.root.pathname) ||
        this.root.pathname.includes("options") ||
        this.root.pathname.includes("newgame")
      )
    ) {
      return false;
    }
    if (this.root.playerState) {
      return !(
        this.root.playerState.unAllocatedSkillPoints > 0 ||
        this.root.playerState.conditions.length > 0 ||
        this.onExpandedTab
      );
    } else return true;
  }

  get playerStatusExpandedOnAllRoutes() {
    if (this.root.playerState) {
      return (
        this.root.playerState.unAllocatedSkillPoints > 0 ||
        this.root.playerState.conditions.length > 0
      );
    }
  }

  get compactRoutePadding() {
    return (
      (this.playerStatusCompactHeight ?? 0) +
      this.tabHeight +
      4 +
      (this.playerStatusExpandedOnAllRoutes ? this.expansionPadding : 0)
    );
  }

  get playerStatusHeight() {
    if (this.playerStatusIsCompact) {
      return this.playerStatusCompactHeight ?? 0;
    } else {
      return (this.playerStatusCompactHeight ?? 0) + this.expansionPadding;
    }
  }

  get playerStatusHeightSecondary() {
    return (
      (this.playerStatusCompactHeight ?? 0) +
      this.expansionPadding +
      (this.insets?.bottom ?? 0) / 2
    );
  }

  get bottomBarHeight() {
    return this.playerStatusHeight + this.tabHeight;
  }

  get onExpandedTab() {
    return this.root.pathname === "/medical" || this.root.pathname === "/labor";
  }

  get progress() {
    if (this.totalLoadingSteps === 0) {
      const keys = Object.keys(this.storeLoadingStatus);
      if (keys.length === 0) return 100;
      const done = keys.filter(
        (key) => this.storeLoadingStatus[key as LoadingStores],
      ).length;
      return (done / keys.length) * 100;
    }
    return (this.completedLoadingSteps / this.totalLoadingSteps) * 100;
  }

  debugLoadingStatus() {
    if (__DEV__) {
      console.log("Loading Status:");
      Object.entries(this.storeLoadingStatus).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
      console.log(`Total Progress: ${this.progress}`);
    }
  }

  markStoreAsLoaded(storeName: LoadingStores) {
    this.storeLoadingStatus[storeName] = true;
  }

  get allResourcesLoaded() {
    const storesLoaded = Object.values(this.storeLoadingStatus).every(
      (status) => status,
    );
    const stepsComplete = this.completedLoadingSteps >= this.totalLoadingSteps;
    return storesLoaded && stepsComplete;
  }

  get isLandscape() {
    return this.dimensions.width > this.dimensions.height;
  }

  get isTablet() {
    return isTablet();
  }

  get isDesktop() {
    return getDeviceType() === "Desktop";
  }

  get isLargeDevice() {
    return this.isTablet || this.isDesktop;
  }

  get scale() {
    return this.dimensions.width / BASE_WIDTH;
  }

  get isDark() {
    return this.colorScheme === "dark";
  }

  get tabHeight() {
    return (
      this.tabHeightBase +
      (!this.isLandscape ? baseNormalizeLineHeight(15) : 12) +
      (this.insets?.bottom ?? 0) / 1.5
    );
  }

  get headerHeight() {
    return 44 + (this.insets?.top ?? 0);
  }

  setPlayerStatusHeight(value: number, forceExpansionMod = false) {
    const mod =
      this.playerStatusIsCompact && !forceExpansionMod
        ? 0
        : this.expansionPadding;
    if (this.playerStatusCompactHeight === undefined) {
      this.setPlayerStatusCompactHeight(value - mod);
    }
  }

  setPlayerStatusTop(pY: number, forceExpansionMod = false) {
    const mod =
      this.playerStatusIsCompact && !forceExpansionMod
        ? 0
        : this.expansionPadding;
    if (this.playerStatusTop === undefined) {
      this.playerStatusTop = pY - mod;
    }
  }

  private setPlayerStatusCompactHeight(value: number) {
    this.playerStatusCompactHeight = value;
  }

  startTipCycle() {
    const cycleTips = () => {
      if (!this.progressIncrementing) return;
      runInAction(
        () => (this.currentTipIndex = getRandomInt(0, LOADING_TIPS.length + 1)),
      );
      setTimeout(cycleTips, 3000);
    };
    setTimeout(cycleTips, 3000);
  }

  getCurrentTip() {
    return LOADING_TIPS[this.currentTipIndex];
  }

  setTotalLoadingSteps(steps: number) {
    this.completedLoadingSteps = 0;
    this.totalLoadingSteps = steps;
    this.progressIncrementing = true;
    runInAction(
      () =>
        (this.currentTipIndex = Math.floor(
          Math.random() * LOADING_TIPS.length,
        )),
    );
    this.startTipCycle();
  }

  incrementLoadingStep() {
    runInAction(() => {
      this.completedLoadingSteps = Math.min(
        this.completedLoadingSteps + 1,
        this.totalLoadingSteps,
      );
    });
  }

  completeLoading() {
    this.progressIncrementing = false;
    setTimeout(() => {
      runInAction(() => {
        this.totalLoadingSteps = 0;
        this.completedLoadingSteps = 0;
      });
    }, 500);
  }

  setSystemColorScheme(colorScheme: "light" | "dark") {
    this.systemColorScheme = colorScheme;
  }

  get colorScheme() {
    if (this.preferedColorScheme === "system") {
      return this.systemColorScheme;
    } else {
      return this.preferedColorScheme;
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
  }

  get itemBlockSize() {
    let blockSize: number;

    if (this.dimensions.width === this.dimensions.lesser) {
      blockSize = Math.min(
        this.dimensions.height / 5.5,
        this.dimensions.width / 7.5,
      );
    } else {
      blockSize = this.dimensions.width / 14;
    }
    const dungeonAdjustment = this.root.dungeonStore.isInDungeon ? 0.9 : 1.0;
    const landScapeAdjustment =
      this.isLandscape && this.dimensions.lesser < 500 ? 0.8 : 1.0;

    return blockSize * dungeonAdjustment * landScapeAdjustment;
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
    if (this.orientationSubscription) {
      this.orientationSubscription.remove();
    }
  }
}
