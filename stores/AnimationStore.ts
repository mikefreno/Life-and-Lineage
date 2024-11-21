import { action, makeObservable, observable } from "mobx";
import { type RootStore } from "./RootStore";

export class AnimationStore {
  textString: string | undefined = undefined;
  attackDummy: number = 0;
  textDummy: number = 0;
  dodgeDummy: number = 0;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    makeObservable(this, {
      textString: observable,
      attackDummy: observable,
      textDummy: observable,
      dodgeDummy: observable,
      setTextString: action,
      triggerAttack: action,
      triggerText: action,
      triggerDodge: action,
    });
  }

  setTextString(text: string | undefined) {
    if (this.root.uiStore.reduceMotion) return;
    this.textString = text;
  }

  triggerAttack() {
    if (this.root.uiStore.reduceMotion) return;
    this.attackDummy += 1;
  }

  triggerText() {
    if (this.root.uiStore.reduceMotion) return;
    this.textDummy += 1;
  }

  triggerDodge() {
    if (this.root.uiStore.reduceMotion) return;
    this.dodgeDummy += 1;
  }
}
