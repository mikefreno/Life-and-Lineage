import { RootStore } from "@/stores/RootStore";
import {
  action,
  computed,
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

  targetPoint: Vector2 | null = null;
  animationPromiseResolver: (() => void) | null = null;

  textString: string | undefined = undefined;

  playerTurnOngoing = false;
  playerTurnOngoingTimeout: NodeJS.Timeout | undefined;

  playerOrigin: Vector2;

  constructor({ root }: { root: RootStore }) {
    this.root = root;

    this.playerOrigin = Vector2.from({
      x: this.root.uiStore.dimensions.width / 2.5,
      y: this.root.uiStore.dimensions.height / 2.5,
    });

    makeObservable(this, {
      animationSet: observable,
      playerOrigin: observable,
      textString: observable,
      animationPromiseResolver: observable,
      refiringAnimationSets: observable,
      targetPoint: observable,

      safetyClear: action,
      setAnimation: action,
      clearAnimation: action,
      setTextString: action,

      playerTurnOngoing: observable,
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
      () => this.root.uiStore.dimensions,
      () =>
        runInAction(
          () =>
            (this.playerOrigin = Vector2.from({
              x: this.root.uiStore.dimensions.width / 4,
              y: this.root.uiStore.dimensions.height / 2.5,
            })),
        ),
    );
    reaction(
      () => this.animationSet,
      () => {
        if (this.animationSet) {
          this.playerTurnOngoing = true;
        }
      },
    );
  }

  setTextString(message: string) {
    this.textString = message;
  }

  safetyClear() {
    this.animationSet = null;
  }

  setAnimation({
    set,
    targetMidpoints,
  }: {
    set: PlayerAnimationSet;
    targetMidpoints: Vector2[];
  }): Promise<void> {
    this.animationSet = set;
    this.targetPoint = Vector2.multiMidpoint(targetMidpoints);

    if (
      this.animationSet?.triggersScreenShake &&
      this.animationSet.triggersScreenShake.when == "start"
    ) {
      this.root.dungeonStore.screenShaker &&
        this.root.dungeonStore.screenShaker(
          this.animationSet.triggersScreenShake.duration,
        );
    }

    return new Promise<void>((resolve) => {
      this.animationPromiseResolver = resolve;
    });
  }

  clearAnimation() {
    if (this.animationPromiseResolver) {
      this.animationPromiseResolver();
      this.animationPromiseResolver = null;
    }

    if (
      this.animationSet?.triggersScreenShake &&
      this.animationSet.triggersScreenShake.when == "end"
    ) {
      this.root.dungeonStore.screenShaker &&
        this.root.dungeonStore.screenShaker(
          this.animationSet.triggersScreenShake.duration,
        );
    }

    this.animationSet = null;
    this.targetPoint = null;
  }
}
