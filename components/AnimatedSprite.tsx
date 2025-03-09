import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, View } from "react-native";
import { Canvas, useAnimatedImage, Image } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import {
  AnimationOptions,
  AnimationSet,
  EnemyImageMap,
} from "../utility/enemyHelpers";
import { FPS, MAX_ANIMATION_DURATION } from "../stores/EnemyAnimationStore";
import { useRootStore } from "@/hooks/stores";
import { reverseNormalize, useStyles } from "@/hooks/styles";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { Enemy, Minion } from "@/entities/creatures";
import { useHeaderHeight } from "@react-navigation/elements";
import Colors from "@/constants/Colors";

const calculateAdjustedFrameRate = (
  frames: number,
  maxDuration: number = MAX_ANIMATION_DURATION,
) => {
  const normalDuration = (frames / FPS) * 1000;
  if (normalDuration <= maxDuration) {
    return { duration: normalDuration, adjustedFPS: FPS };
  }

  const adjustedFPS = (frames * 1000) / maxDuration;
  return { duration: maxDuration, adjustedFPS };
};

const useReanimatedAnimations = () => {
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

    // Create the death animation sequence
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

    // Create a single flash cycle
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
    targetPosition: { x: number; y: number },
    currentPosition: { x: number; y: number },
    moveFrames: number,
    onComplete: () => void,
  ) => {
    const { duration } = calculateAdjustedFrameRate(moveFrames);
    const moveDuration = duration;

    if (moveX.value === 0 && moveY.value === 0) {
      const dirX = targetPosition.x - currentPosition.x;
      const dirY = targetPosition.y - currentPosition.y;

      const distance = Math.sqrt(dirX * dirX + dirY * dirY);
      const moveDistance = Math.min(distance, 100);

      const normalizedX = distance > 0 ? (dirX / distance) * moveDistance : 0;
      const normalizedY = distance > 0 ? (dirY / distance) * moveDistance : 0;

      // Move to target
      moveX.value = withTiming(
        normalizedX,
        { duration: moveDuration / 2 },
        (finished) => {
          if (finished) {
            runOnJS(onComplete)();
          }
        },
      );
      moveY.value = withTiming(normalizedY, { duration: moveDuration / 2 });
    } else {
      // Return to original position
      moveX.value = withTiming(
        0,
        { duration: moveDuration / 2 },
        (finished) => {
          if (finished) {
            runOnJS(onComplete)();
          }
        },
      );
      moveY.value = withTiming(0, { duration: moveDuration / 2 });
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

/*
 * Scale is from 0-1.0
 */
const calculateRenderScaling = (scale: number | undefined) => {
  if (scale) {
    return reverseNormalize(scale * 10) / 10;
  }
  return 1.0;
};

interface SkiaAnimatedSpriteProps {
  source: any;
  width: number;
  height: number;
  onAnimationComplete?: () => void;
  isLooping?: boolean;
}

const SkiaAnimatedSprite = ({
  source,
  width,
  height,
  onAnimationComplete,
  isLooping = true,
}: SkiaAnimatedSpriteProps) => {
  const animatedImage = useAnimatedImage(source);
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameCount = animatedImage?.getFrameCount() || 0;
  const frameRef = useRef(0);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hasCompletedLoop = useRef(false);

  useEffect(() => {
    if (!animatedImage) return;

    // Reset state when source changes
    frameRef.current = 0;
    setCurrentFrame(0);
    hasCompletedLoop.current = false;
    const frameDuration = animatedImage.currentFrameDuration();

    const advanceFrame = () => {
      if (!animatedImage) return;

      // Decode next frame
      animatedImage.decodeNextFrame();

      // Update current frame
      frameRef.current = (frameRef.current + 1) % frameCount;
      setCurrentFrame(frameRef.current);

      // Check if we've completed a loop
      if (frameRef.current === 0 && !hasCompletedLoop.current) {
        hasCompletedLoop.current = true;
        if (onAnimationComplete && !isLooping) {
          onAnimationComplete();
          return; // Stop animation if not looping
        }
      }

      // Schedule next frame
      animationTimerRef.current = setTimeout(advanceFrame, frameDuration);
    };

    // Start animation
    advanceFrame();

    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };
  }, [animatedImage, frameCount, onAnimationComplete, isLooping]);

  if (!animatedImage) {
    return null;
  }

  return (
    <Canvas style={{ width, height }}>
      <Image
        image={animatedImage.getCurrentFrame()}
        x={0}
        y={0}
        width={width}
        height={height}
        fit="contain"
      />
    </Canvas>
  );
};

export const AnimatedSprite = observer(
  ({ enemy }: { enemy: Enemy | Minion | undefined }) => {
    // measurements for relative positioning
    const spriteContainerRef = useRef<View>(null);
    const headerHeight = useHeaderHeight();
    const measurementAttempts = useRef(0);

    const measureAndUpdatePosition = () => {
      if (spriteContainerRef.current && animationStore) {
        spriteContainerRef.current.measure(
          (x, y, width, height, pageX, pageY) => {
            if (width > 0 && height > 0) {
              animationStore.setSpriteMidPoint({
                x: pageX + width / 2,
                y: pageY - headerHeight + height / 2,
              });
              measurementAttempts.current = 0;
            } else if (measurementAttempts.current < 5) {
              measurementAttempts.current++;
              setTimeout(measureAndUpdatePosition, 100);
            }
          },
        );
      }
    };

    const handleLayout = () => {
      setTimeout(measureAndUpdatePosition, 50);
    };

    // actual sprite handling
    const spriteSet = EnemyImageMap["rat"];
    const { uiStore, playerAnimationStore, enemyStore } = useRootStore();
    const animationStore = enemyStore.getAnimationStore(enemy?.id ?? "");
    const styles = useStyles();

    const {
      animations,
      runMoveAnimation,
      runHurtAnimation,
      runDodgeAnimation,
      runTextAnimation,
      runDeathAnimation,
    } = useReanimatedAnimations();

    const { activeAnimationString, activeSpriteAnimationString } =
      useMemo(() => {
        if (animationStore) {
          const animToQueue =
            animationStore.animationQueue[
              animationStore.animationQueue.length - 1
            ];
          if (animToQueue in spriteSet.sets) {
            return {
              activeAnimationString: animToQueue,
              activeSpriteAnimationString: animToQueue,
            };
          } else {
            return {
              activeAnimationString: animToQueue,
              activeSpriteAnimationString: "idle" as AnimationOptions,
            };
          }
        }
        return {
          activeAnimationString: "idle" as AnimationOptions,
          activeSpriteAnimationString: "idle" as AnimationOptions,
        };
      }, [animationStore?.animationQueue]);

    if (!spriteSet.sets[activeSpriteAnimationString]) {
      throw new Error(
        `no ${activeSpriteAnimationString} animation for: ${enemy?.sprite}`,
      );
    }

    const { currentQueuedAnimation, currentSpriteAnimation } = useMemo(() => {
      const currentSpriteAnimation = spriteSet.sets[
        activeSpriteAnimationString
      ] as AnimationSet;
      return {
        currentQueuedAnimation: spriteSet.sets[activeAnimationString],
        currentSpriteAnimation,
      };
    }, [activeAnimationString, activeSpriteAnimationString]);

    const spriteWidth = spriteSet.width;
    const spriteHeight = spriteSet.height;

    const containerSize = uiStore.dimensions.lesser * 0.5;

    const renderScaleCalc = useMemo(
      () => calculateRenderScaling(spriteSet.renderScale),
      [spriteSet.renderScale],
    );

    const scaleX = (containerSize / spriteWidth) * renderScaleCalc;
    const scaleY = (containerSize / spriteHeight) * renderScaleCalc;

    const scale = Math.min(scaleX, scaleY);
    const mirrorTransform =
      "mirror" in spriteSet && spriteSet.mirror ? [{ scaleX: -1 }] : [];

    const getCurrentAnimationDimensions = () => {
      if (currentSpriteAnimation.sizeOverride) {
        return {
          width: currentSpriteAnimation.sizeOverride.width,
          height: currentSpriteAnimation.sizeOverride.height,
        };
      }
      return {
        width: spriteWidth,
        height: spriteHeight,
      };
    };

    const currentDimensions = getCurrentAnimationDimensions();

    const handleAnimationComplete = () => {
      if (animationStore && !animationStore.runningRNAnimation) {
        animationStore.concludeAnimation();
      }
    };

    useEffect(() => {
      if (
        activeAnimationString !== "idle" &&
        animationStore &&
        !animationStore.runningRNAnimation
      ) {
        const frames = currentSpriteAnimation.frames;
        switch (activeAnimationString) {
          case "move":
            runInAction(() => (animationStore.runningRNAnimation = true));
            runMoveAnimation(
              playerAnimationStore.playerOrigin,
              animationStore.spriteMidPoint!,
              frames,
              () => animationStore.concludeAnimation(),
            );
            return;
          case "death":
            runInAction(() => (animationStore.runningRNAnimation = true));
            runDeathAnimation(frames, () => animationStore.concludeAnimation());
            return;
          case "dodge":
            runInAction(() => (animationStore.runningRNAnimation = true));
            runDodgeAnimation(frames, () => animationStore.concludeAnimation());
            return;

          case "hurt":
            runInAction(() => (animationStore.runningRNAnimation = true));
            runHurtAnimation(frames, false, () =>
              animationStore.concludeAnimation(),
            );
            return;
          //TODO
          case "heal":
            return;
          default:
            return;
        }
      }
    }, [currentQueuedAnimation]);

    useEffect(() => {
      if (animationStore?.textString) {
        runTextAnimation(() => {
          if (animationStore) {
            runInAction(() => {
              animationStore.textString = undefined;
            });
          }
        });
      }
    }, [animationStore?.textString]);

    useEffect(() => {
      console.log(animationStore?.animationQueue);
    }, [animationStore?.animationQueue]);

    const shouldLoop = activeAnimationString === "idle";

    const animatedContainerStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: animations.dodgeX.value + animations.moveX.value },
          { translateY: animations.moveY.value },
          { scale },
          ...(mirrorTransform as any),
        ],
        opacity: animations.flashOpacity.value * animations.damageOpacity.value,
      };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: animations.textTranslate.value }],
        opacity: animations.textFade.value,
      };
    });

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          ref={spriteContainerRef}
          onLayout={handleLayout}
          style={[
            {
              width: currentDimensions.width,
              height: currentDimensions.height,
              overflow: "hidden",
            },
            animatedContainerStyle,
          ]}
        >
          <SkiaAnimatedSprite
            source={currentSpriteAnimation.anim}
            width={currentDimensions.width}
            height={currentDimensions.height}
            onAnimationComplete={handleAnimationComplete}
            isLooping={shouldLoop}
            key={`${enemy?.id}-${activeAnimationString}`}
          />
        </Animated.View>
        {animationStore && animationStore.textString && (
          <Animated.View style={{ position: "absolute" }}>
            <Animated.Text
              style={[
                {
                  textAlign: "center",
                  ...styles["text-2xl"],
                  overflow: "visible",
                  color: Colors.dark.text,
                  fontFamily: "PixelifySans",
                },
                animatedTextStyle,
              ]}
            >
              {animationStore.textString}
            </Animated.Text>
          </Animated.View>
        )}
      </View>
    );
  },
);
