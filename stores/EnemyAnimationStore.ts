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
  AnimationSet,
} from "@/utility/animation/enemy";
import { Vector2 } from "@/utility/Vec2";
import { ColorValue } from "react-native";

export const FPS = 10;
export const MAX_ANIMATION_DURATION = 1000;

export class EnemyAnimationStore {
  id: string;
  textString: string | undefined = undefined;
  dialogue: { [key: number]: string } | null;

  spriteMidPoint: Vector2 | null = null;

  root: RootStore;
  enemySprite: EnemyImageKeyOption;
  movementDuration: number = 1000;

  animationQueue: AnimationOptions[];
  attacksThatSkipMovement: AnimationOptions[];

  animationDetails: {
    [key in AnimationOptions]?: AnimationSet;
  };

  currentAnimationDetails: AnimationSet | null = null;

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

  activeGlow: {
    color: ColorValue;
    position: "enemy" | "field" | "self";
    duration: number;
  } | null = null;

  runningRNAnimation = false;
  isIdle: boolean = true;

  renderedDimensions: { width: number; height: number };

  constructor({
    root,
    sprite,
    id,
  }: {
    root: RootStore;
    sprite: EnemyImageKeyOption;
    id: string;
  }) {
    this.root = root;
    this.enemySprite = sprite;
    this.id = id;
    this.dialogue = null;
    this.animationQueue = ["idle", "spawn"];
    const { width, height } = EnemyImageMap[sprite];
    this.renderedDimensions = { width, height };

    const attacksThatSkipMovement: AnimationOptions[] = [];
    const animationDetails: {
      [key in AnimationOptions]?: AnimationSet;
    } = {};

    Object.entries(EnemyImageMap[sprite].sets).forEach(([k, v]) => {
      const animKey = k as AnimationOptions;
      const animSet = v as AnimationSet;

      if (animSet.disablePreMovement) {
        attacksThatSkipMovement.push(animKey);
      }

      // Store the animation set directly
      animationDetails[animKey] = animSet;
    });

    this.attacksThatSkipMovement = attacksThatSkipMovement;
    this.animationDetails = animationDetails;

    makeObservable(this, {
      textString: observable,
      spriteMidPoint: observable,
      animationQueue: observable,
      runningRNAnimation: observable,
      isIdle: observable,
      projectileSet: observable,
      activeGlow: observable,
      currentAnimationDetails: observable,

      setRenderedDimensions: action,
      setCurrentAnimation: action,
      addToAnimationQueue: action,
      concludeAnimation: action,
      setSpriteMidPoint: action,
      setTextString: action,
      getAttackQueue: action,
      clearProjectileSet: action,
      clearGlow: action,
      handleScreenShake: action,

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

  setRenderedDimensions(arg0: { width: number; height: number }) {
    this.renderedDimensions = arg0;
  }

  setCurrentAnimation(activeAnimationString: AnimationOptions) {
    const animSet = this.animationDetails[activeAnimationString];

    if (!animSet) return;

    this.currentAnimationDetails = animSet;

    if ("projectile" in animSet || "splash" in animSet) {
      this.projectileSet = {
        projectile: animSet.projectile,
        splash: animSet.splash,
      };
    }

    if ("glow" in animSet) {
      this.activeGlow = {
        ...animSet.glow,
        duration: animSet.glow.duration || 1000,
      };

      if (this.activeGlow.duration) {
        setTimeout(() => {
          this.clearGlow();
        }, this.activeGlow.duration);
      }
    }

    this.handleScreenShake("start"); // check if we should run a screen shake
  }

  handleScreenShake(timing: "start" | "end") {
    if (
      this.currentAnimationDetails?.triggersScreenShake &&
      this.currentAnimationDetails.triggersScreenShake.when === timing //is this the correct timing?
    ) {
      this.root.dungeonStore.screenShaker &&
        this.root.dungeonStore.screenShaker(
          this.currentAnimationDetails.triggersScreenShake.duration,
        );
    }
  }

  clearGlow() {
    this.activeGlow = null;
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
    this.handleScreenShake("end");

    runInAction(() => {
      if (this.animationQueue.length > 1) {
        this.animationQueue = this.animationQueue.slice(0, -1);
        this.runningRNAnimation = false;
        this.currentAnimationDetails = null;
      } else if (this.animationQueue[0] !== "idle") {
        console.warn("Animation Queue not as expected: ", this.animationQueue);
        // Reset to safe state
        this.animationQueue = ["idle"];
        this.runningRNAnimation = false;
        this.currentAnimationDetails = null;
      }
    });
  }

  setSpriteMidPoint(pos: { x: number; y: number }) {
    this.spriteMidPoint = Vector2.from(pos);
    runInAction(() => (this.root.enemyStore.midpointUpdater += 1));
  }
}
