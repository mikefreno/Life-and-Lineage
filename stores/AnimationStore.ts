import { makeAutoObservable } from "mobx";

export class AnimationStore {
  textString?: string;
  attackDummy: number = 0;
  textDummy: number = 0;
  dodgeDummy: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setTextString(text?: string) {
    this.textString = text;
  }

  triggerAttack() {
    this.attackDummy += 1;
  }

  triggerText() {
    this.textDummy += 1;
  }

  triggerDodge() {
    this.dodgeDummy += 1;
  }
}
