import { RootStore } from "@/stores/RootStore";
import {
  action,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { PlayerAnimationSet } from "@/utility/types";
import { Vector2 } from "@/utility/Vec2";

export const PLAYER_TEXT_STRING_DURATION = 3000;

export class PlayerAnimationStore {
  root: RootStore;

  animationSet: PlayerAnimationSet | null = null;
  refiringAnimationSets: {
    set: PlayerAnimationSet;
    remainingRefires: number;
  }[] = [];

  targetIDs: string[] | null = null;
  screenShaker: ((duration?: number) => void) | null = null;
  animationPromiseResolver: (() => void) | null = null;

  textString: string | undefined = undefined;

  usedPass: boolean = false;

  playerOrigin: Vector2;

  constructor({ root }: { root: RootStore }) {
    this.root = root;

    this.playerOrigin = Vector2.from({
      x: this.root.uiStore.dimensions.width / 4,
      y: this.root.uiStore.dimensions.height / 2.5,
    });

    makeObservable(this, {
      animationSet: observable,
      playerOrigin: observable,
      textString: observable,
      usedPass: observable,
      animationPromiseResolver: observable,
      refiringAnimationSets: observable,

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

    reaction(
      () => this.root.uiStore.dimensions,
      () =>
        runInAction(
          () =>
            (this.playerOrigin = Vector2.from({
              x: this.root.uiStore.dimensions.width / 4,
              y: this.root.uiStore.dimensions.height / 2,
            })),
        ),
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
    if (this.animationPromiseResolver) {
      this.animationPromiseResolver();
      this.animationPromiseResolver = null;
    }

    this.animationSet = null;
    this.targetIDs = null;
  }
}
