import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { RootStore } from "./RootStore";
import { AnimationOptions } from "@/utility/enemyHelpers";

export const FPS = 8;
export const MAX_ANIMATION_DURATION = 1000;

export class EnemyAnimationStore {
  textString: string | undefined = undefined;

  spriteMidPoint: {
    x: number;
    y: number;
  } | null = null;

  root: RootStore;

  animationQueue: AnimationOptions[];

  runningRNAnimation = false;
  isIdle: boolean = true;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.animationQueue = ["idle", "spawn"];

    makeObservable(this, {
      textString: observable,
      spriteMidPoint: observable,
      animationQueue: observable,
      runningRNAnimation: observable,
      isIdle: observable,

      addToAnimationQueue: action,
      concludeAnimation: action,
      setSpriteMidPoint: action,
      setTextString: action,

      notIdle: computed,
    });

    reaction(
      () => this.animationQueue,
      () => {
        if (this.animationQueue.length == 1) {
          if (this.animationQueue[0] == "idle") {
            // buffer it
            setTimeout(() => {
              if (
                this.animationQueue.length == 1 &&
                this.animationQueue[0] == "idle"
              ) {
                runInAction(() => (this.isIdle = true));
              }
            }, 250);
          } else {
            throw new Error(
              `animation queue error, got: ${this.animationQueue}`,
            );
          }
        } else {
          if (this.isIdle) {
            runInAction(() => (this.isIdle = false));
          }
        }
      },
    );
  }

  get notIdle() {
    return this.animationQueue.length > 1;
  }

  setTextString(message: string | undefined) {
    this.textString = message;
  }

  addToAnimationQueue(animation: AnimationOptions | AnimationOptions[]) {
    if (Array.isArray(animation)) {
      this.animationQueue = [...this.animationQueue, ...animation];
    } else {
      this.animationQueue = [...this.animationQueue, animation];
    }
  }

  concludeAnimation() {
    if (this.animationQueue.length > 1) {
      this.animationQueue = this.animationQueue.slice(0, -1);
      this.runningRNAnimation = false;
    } else if (this.animationQueue[0] !== "idle") {
      console.log("Animation Queue not as expected: ", this.animationQueue);
    }
  }

  setSpriteMidPoint(pos: { x: number; y: number }) {
    this.spriteMidPoint = pos;
  }
}
