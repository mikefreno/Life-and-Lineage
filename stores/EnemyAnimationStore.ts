import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { RootStore } from "@/stores/RootStore";
import {
  AnimationOptions,
  EnemyImageMap,
  type EnemyImageKeyOption,
} from "@/utility/enemyHelpers";
import * as Crypto from "expo-crypto";
import { Vector2 } from "@/utility/Vec2";

export const FPS = 10;
export const MAX_ANIMATION_DURATION = 1000;

export class EnemyAnimationStore {
  id = Crypto.randomUUID();
  textString: string | undefined = undefined;
  dialogue: { [key: number]: string } | null;

  spriteMidPoint: Vector2 | null = null;

  root: RootStore;
  enemySprite: EnemyImageKeyOption;
  movementDuration: number = 1000;

  animationQueue: AnimationOptions[];
  attacksThatSkipMovement: AnimationOptions[];
  projectileMappings: {
    [key in AnimationOptions]?: {
      projectile?: {
        anim: any;
        height: number;
        width: number;
        scale?: number;
      };
      splash?: {
        anim: any;
        height: number;
        width: number;
        followsProjectile: boolean;
        scale?: number;
      };
    };
  };

  projectileSet: {
    projectile?: {
      anim: any;
      height: number;
      width: number;
      scale?: number;
    };
    splash?: {
      anim: any;
      height: number;
      width: number;
      followsProjectile: boolean;
      scale?: number;
    };
  } | null = null;

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
    this.dialogue = null;
    this.animationQueue = ["idle", "spawn"];

    const attacksThatSkipMovement: AnimationOptions[] = [];
    const projectileMappings: {
      [key in AnimationOptions]?: { projectile?: any; splash?: any };
    } = {};

    Object.entries(EnemyImageMap[sprite].sets).forEach(([k, v]) => {
      if (v.disablePreMovement) {
        attacksThatSkipMovement.push(k as AnimationOptions);
      }
      if (v.projectile) {
        projectileMappings[k as AnimationOptions] = {
          projectile: v.projectile,
          splash: v.splash,
        };
      }
    });

    this.attacksThatSkipMovement = attacksThatSkipMovement;
    this.projectileMappings = projectileMappings;

    makeObservable(this, {
      textString: observable,
      spriteMidPoint: observable,
      animationQueue: observable,
      runningRNAnimation: observable,
      isIdle: observable,
      projectileMappings: observable,
      projectileSet: observable,

      setProjectile: action,
      addToAnimationQueue: action,
      concludeAnimation: action,
      setSpriteMidPoint: action,
      setTextString: action,
      getAttackQueue: action,
      clearProjectileSet: action,

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

  setProjectile(activeAnimationString: AnimationOptions) {
    const projectileSet = this.projectileMappings[activeAnimationString];
    if (projectileSet) {
      this.projectileSet = projectileSet;
    }
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

  addToAnimationQueue(animation: AnimationOptions | AnimationOptions[]) {
    if (Array.isArray(animation)) {
      this.animationQueue = [...this.animationQueue, ...animation];
    } else {
      this.animationQueue = [...this.animationQueue, animation];
    }
  }

  clearProjectileSet() {
    this.projectileSet = null;
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
    this.spriteMidPoint = Vector2.from(pos);
    runInAction(() => (this.root.enemyStore.midpointUpdater += 1));
  }
}
