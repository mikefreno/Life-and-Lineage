import { FPS } from "@/stores/EnemyAnimationStore";
import { calculateAdjustedFrameRate } from "@/utility/functions/misc";
import { Vector2 } from "@/utility/Vec2";
import { Dimensions } from "react-native";
import {
  runOnJS,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export const useReanimatedAnimations = () => {
  const flashOpacity = useSharedValue(1);
  const damageOpacity = useSharedValue(1);
  const textFade = useSharedValue(1);
  const textTranslate = useSharedValue(0);
  const dodgeX = useSharedValue(0);
  const moveX = useSharedValue(0);
  const moveY = useSharedValue(0);

  const runDodgeAnimation = (
    dodgeFrames: number = FPS,
    onComplete: () => void,
  ) => {
    const { duration } = calculateAdjustedFrameRate(dodgeFrames);
    const dodgeDuration = duration;

    // Reset values
    dodgeX.value = 0;
    flashOpacity.value = 1;

    // Create the dodge animation sequence
    dodgeX.value = withSequence(
      withTiming(30, { duration: dodgeDuration / 4 }),
      withTiming(30, { duration: dodgeDuration / 4 }),
      withTiming(0, { duration: dodgeDuration / 4 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      }),
    );

    // Flash animation
    flashOpacity.value = withSequence(
      withDelay(
        dodgeDuration / 4,
        withTiming(0.3, { duration: dodgeDuration / 8 }),
      ),
      withTiming(1, { duration: dodgeDuration / 8 }),
    );
  };

  const runDeathAnimation = (
    deathFrames: number = FPS,
    onComplete: () => void,
  ) => {
    const { duration } = calculateAdjustedFrameRate(deathFrames);
    const deathDuration = duration;

    // Reset value
    damageOpacity.value = 1;

    damageOpacity.value = withSequence(
      withTiming(0.5, { duration: deathDuration / 2 }),
      withTiming(0, { duration: deathDuration / 2 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      }),
    );
  };

  const runHurtAnimation = (
    hurtFrames: number = FPS,
    isDeathAnimation: boolean = false,
    onComplete: () => void,
  ) => {
    const { duration } = calculateAdjustedFrameRate(hurtFrames);
    const animationDuration = duration;

    // Reset value
    damageOpacity.value = 1;

    const iterations = isDeathAnimation
      ? Math.ceil(animationDuration / 400)
      : 2;

    const flashDuration = isDeathAnimation
      ? 200
      : Math.min(200, animationDuration / 4);

    const createFlashCycle = () => {
      return withSequence(
        withTiming(0.5, { duration: flashDuration }),
        withTiming(1, { duration: flashDuration }),
      );
    };

    // Chain multiple flash cycles together
    let animation = createFlashCycle();
    for (let i = 1; i < iterations; i++) {
      animation = withSequence(animation, createFlashCycle());
    }

    // Run the animation
    damageOpacity.value = animation;

    // Set up completion callback
    setTimeout(
      () => {
        onComplete();
      },
      flashDuration * 2 * iterations,
    );
  };

  const runTextAnimation = (onComplete: () => void) => {
    // Reset values
    textFade.value = 1;
    textTranslate.value = 0;

    // Create the text animation
    textFade.value = withTiming(0, { duration: 2000 });
    textTranslate.value = withTiming(
      -Dimensions.get("screen").height * 0.2,
      { duration: 2000 },
      (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      },
    );
  };

  const runMoveAnimation = (
    isForwardMovement: boolean,
    targetPosition: Vector2,
    currentPosition: Vector2,
    moveFrames: number,
    onComplete: () => void,
  ) => {
    const { duration } = calculateAdjustedFrameRate(moveFrames);

    if (isForwardMovement) {
      const direction = targetPosition.subtract(currentPosition);
      const distance = direction.magnitude();
      const moveDistance = Math.max(distance * 0.75, 75);

      const moveVector =
        distance > 0
          ? direction.normalize().multiply(moveDistance)
          : new Vector2(0, 0);

      moveX.value = withTiming(
        moveVector.x,
        { duration: duration / 2 },
        (finished) => {
          if (finished) {
            runOnJS(onComplete)();
          }
        },
      );
      moveY.value = withTiming(moveVector.y, { duration: duration / 2 });
    } else {
      // Return to original position
      moveX.value = withTiming(0, { duration: duration / 2 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      });
      moveY.value = withTiming(0, { duration: duration / 2 });
    }
  };

  return {
    animations: {
      flashOpacity,
      damageOpacity,
      textFade,
      textTranslate,
      dodgeX,
      moveX,
      moveY,
    },
    runHurtAnimation,
    runDodgeAnimation,
    runTextAnimation,
    runDeathAnimation,
    runMoveAnimation,
  };
};
