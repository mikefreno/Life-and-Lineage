import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { RootStore } from "./RootStore";
import {
  AnimationOptions,
  EnemyImageMap,
  type EnemyImageKeyOption,
} from "@/utility/enemyHelpers";

export const FPS = 8;
export const MAX_ANIMATION_DURATION = 1000;

export class EnemyAnimationStore {
  textString: string | undefined = undefined;
  dialogueString: string;

  spriteMidPoint: {
    x: number;
    y: number;
  } | null = null;

  root: RootStore;
  enemySprite: EnemyImageKeyOption;
  projectile: any | null = null;
  movementDuration: number = 500;

  animationQueue: AnimationOptions[];
  attacksThatSkipMovement: AnimationOptions[];
  attacksThatUseProjectiles: AnimationOptions[];

  runningRNAnimation = false;
  isIdle: boolean = true;

  constructor({
    root,
    sprite,
  }: {
    root: RootStore;
    sprite: EnemyImageKeyOption;
  }) {
    this.root = root;
    this.enemySprite = sprite;
    this.dialogueString = "";
    this.animationQueue = ["idle", "spawn"];

    const attacksThatSkipMovement: AnimationOptions[] = [];
    const attacksThatUseProjectiles: AnimationOptions[] = [];

    Object.entries(EnemyImageMap[sprite].sets).forEach(([k, v]) => {
      if (v.disablePreMovement) {
        attacksThatSkipMovement.push(k as AnimationOptions);
      }
      if (v.projectile) {
        attacksThatUseProjectiles.push(k as AnimationOptions);
      }
    });

    this.attacksThatSkipMovement = attacksThatSkipMovement;
    this.attacksThatUseProjectiles = attacksThatUseProjectiles;

    makeObservable(this, {
      textString: observable,
      spriteMidPoint: observable,
      animationQueue: observable,
      runningRNAnimation: observable,
      isIdle: observable,
      projectile: observable,

      addToAnimationQueue: action,
      concludeAnimation: action,
      setSpriteMidPoint: action,
      setTextString: action,
      getAttackQueue: action,

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

  getAttackQueue(anim: AnimationOptions): AnimationOptions[] {
    if (this.attacksThatSkipMovement.includes(anim)) {
      return [anim];
    } else {
      return ["move", anim, "move"];
    }
  }
  setMovementDuration(duration: number) {
    this.movementDuration = duration;
  }

  setTextString(message: string | undefined) {
    this.textString = message;
  }

  setDialogueString(message: string) {
    this.dialogueString = message;
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
