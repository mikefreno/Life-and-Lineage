import { action, makeObservable, observable } from "mobx";
import { type RootStore } from "./RootStore";
export const FPS = 12;

export class EnemyAnimationStore {
  textString: string | undefined = undefined;
  textDummy: number = 0;
  attackDummy: number = 0;
  dodgeDummy: number = 0;
  dialogueString: string | undefined = undefined;
  dialogueDummy: number = 0;
  spriteMidPoint: {
    x: number;
    y: number;
  } | null = null;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.root = root;

    makeObservable(this, {
      textString: observable,
      attackDummy: observable,
      textDummy: observable,
      dodgeDummy: observable,
      spriteMidPoint: observable,
      setSpriteMidPoint: action,
      setTextString: action,
      triggerAttack: action,
      triggerText: action,
      triggerDodge: action,
      dialogueString: observable,
      dialogueDummy: observable,
      setDialogueString: action,
      triggerDialogue: action,
    });
  }

  setSpriteMidPoint(pos: { x: number; y: number }) {
    this.spriteMidPoint = pos;
  }

  setDialogueString(text: string | undefined) {
    this.dialogueString = text;
  }

  triggerDialogue() {
    this.dialogueDummy += 1;
  }

  setTextString(text: string | undefined) {
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
