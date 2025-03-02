import { RootStore } from "./RootStore";
import { action, makeObservable, observable } from "mobx";
import { PlayerAnimationSet } from "@/utility/types";

export class PlayerAnimationStore {
  root: RootStore;

  animationSet: PlayerAnimationSet | null = null;
  target: string | null = null;
  screenShaker: ((duration?: number) => void) | null = null;
  animationEndCallBack: (() => void) | null = null;
  animationPromiseResolver: (() => void) | null = null;

  constructor({ root }: { root: RootStore }) {
    this.root = root;

    makeObservable(this, {
      animationSet: observable,
      setAnimation: action,
      clearAnimation: action,
    });
  }

  setAnimation(set: PlayerAnimationSet, enemyID: string): Promise<void> {
    this.animationSet = set;
    this.target = enemyID;

    // Return a promise that will be resolved when the animation completes
    return new Promise<void>((resolve) => {
      this.animationPromiseResolver = resolve;
    });
  }

  clearAnimation() {
    this.animationSet = null;
    this.target = null;

    // Resolve the promise if it exists
    if (this.animationPromiseResolver) {
      this.animationPromiseResolver();
      this.animationPromiseResolver = null;
    }
  }
}
