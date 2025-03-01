import { RootStore } from "./RootStore";
import { action, makeObservable, observable } from "mobx";
import { PlayerAnimationSet } from "@/utility/types";

export class PlayerAnimationStore {
  root: RootStore;

  animationSet: PlayerAnimationSet | null = null;
  screenShaker: ((duration?: number) => void) | null = null;

  constructor({ root }: { root: RootStore }) {
    this.root = root;

    makeObservable(this, {
      animationSet: observable,
      setAnimation: action,
    });
  }

  setAnimation(set: PlayerAnimationSet) {
    this.animationSet = set;
  }
}
