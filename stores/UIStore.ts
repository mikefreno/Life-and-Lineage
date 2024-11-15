import { action, makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore";
import { Dimensions, EmitterSubscription, ScaledSize } from "react-native";

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

    makeObservable(this, {
      playerStatusIsCompact: observable,
      setPlayerStatusCompact: action,
      detailedStatusViewShowing: observable,
      setDetailedStatusViewShowing: action,
      dimensions: observable,
      itemBlockSize: observable,
      modalShowing: observable,
    });
  }

  public setPlayerStatusCompact(state: boolean) {
    this.playerStatusIsCompact = state;
  }
  public setDetailedStatusViewShowing(state: boolean) {
    this.detailedStatusViewShowing = state;
  }

  private handleDimensionChange({
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
}
