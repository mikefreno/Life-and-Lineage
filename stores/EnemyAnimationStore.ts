import { action, computed, makeObservable, observable, reaction } from "mobx";
import { RootStore } from "./RootStore";
import { AnimationOptions } from "@/utility/enemyHelpers";
export const FPS = 4;

export class EnemyAnimationStore {
  textString: string | undefined = undefined;

  spriteMidPoint: {
    x: number;
    y: number;
  } | null = null;

  root: RootStore;

  animationQueue: AnimationOptions[];

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.animationQueue = ["idle"];

    makeObservable(this, {
      textString: observable,
      spriteMidPoint: observable,
      animationQueue: observable,

      addToAnimationQueue: action,
      concludeAnimation: action,
      setSpriteMidPoint: action,

      notIdle: computed,
    });

    reaction(
      () => this.animationQueue,
      () => console.log(this.animationQueue),
    );
  }

  get notIdle() {
    return this.animationQueue.length > 1;
  }

  addToAnimationQueue(animation: AnimationOptions) {
    this.animationQueue.push(animation);
  }

  concludeAnimation() {
    if (this.animationQueue.length > 1) {
      this.animationQueue.pop();
    } else if (this.animationQueue[0] !== "idle") {
      console.log("Animation Queue not as expected: ", this.animationQueue);
    }
  }

  setSpriteMidPoint(pos: { x: number; y: number }) {
    this.spriteMidPoint = pos;
  }
}
