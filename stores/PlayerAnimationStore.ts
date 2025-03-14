import { RootStore } from "@/stores/RootStore";
import {
  action,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { PlayerAnimationSet } from "@/utility/types";

export const PLAYER_TEXT_STRING_DURATION = 3000;

export class PlayerAnimationStore {
  root: RootStore;

  animationSet: PlayerAnimationSet | null = null;
  targetIDs: string[] | null = null;
  screenShaker: ((duration?: number) => void) | null = null;
  animationEndCallBack: (() => void) | null = null;
  animationPromiseResolver: (() => void) | null = null;

  textString: string | undefined = undefined;

  usedPass: boolean = false;

  playerOrigin: { x: number; y: number };

  constructor({ root }: { root: RootStore }) {
    this.root = root;

    this.playerOrigin = {
      x: root.uiStore.dimensions.width / 4,
      y: root.uiStore.dimensions.height / 2,
    };

    makeObservable(this, {
      animationSet: observable,
      playerOrigin: observable,
      textString: observable,
      usedPass: observable,

      setAnimation: action,
      clearAnimation: action,
      setTextString: action,
      setPassed: action,
    });

    reaction(
      () => this.textString,
      () => {
        if (this.textString) {
          setTimeout(
            () => runInAction(() => (this.textString = undefined)),
            PLAYER_TEXT_STRING_DURATION,
          );
        }
      },
    );
    reaction(
      () => this.usedPass,
      () => {
        if (this.usedPass) {
          setTimeout(() => {
            if (this.usedPass) {
              this.setPassed(false);
            }
          }, 1000);
        }
      },
    );
  }

  setPassed(state: boolean) {
    this.usedPass = state;
  }

  setTextString(message: string) {
    this.textString = message;
  }

  setAnimation({
    set,
    enemyIDs,
  }: {
    set: PlayerAnimationSet;
    enemyIDs: string[];
  }): Promise<void> {
    this.animationSet = set;
    this.targetIDs = enemyIDs;

    return new Promise<void>((resolve) => {
      this.animationPromiseResolver = resolve;
    });
  }

  clearAnimation() {
    this.animationSet = null;
    this.targetIDs = null;

    // Resolve the promise if it exists
    if (this.animationPromiseResolver) {
      this.animationPromiseResolver();
      this.animationPromiseResolver = null;
    }
  }
}
