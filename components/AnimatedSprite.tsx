import React, { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { Canvas, useAnimatedImage, Image } from "@shopify/react-native-skia";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  AnimationOptions,
  AnimationSet,
  EnemyImageMap,
} from "../utility/enemyHelpers";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { useHeaderHeight } from "@react-navigation/elements";
import Colors from "@/constants/Colors";
import { useReanimatedAnimations } from "@/hooks/animation";
import { Being } from "@/entities/being";
import { useScaling } from "@/hooks/scaling";

export const AnimatedSprite = observer(
  ({ enemy, glow }: { enemy: Being; glow?: SharedValue<number> }) => {
    const spriteContainerRef = useRef<View>(null);
    const headerHeight = useHeaderHeight();
    const measurementAttempts = useRef(0);
    const [frameCount, setFrameCount] = useState(0);
    const { uiStore, playerAnimationStore, enemyStore } = useRootStore();

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

    useEffect(() => {
      handleLayout();
    }, [uiStore.dimensions.height, uiStore.dimensions.width]);

    const animationStore = enemyStore.getAnimationStore(enemy?.id ?? "");
    const styles = useStyles();
    const { memoizedCalculateRenderScaling } = useScaling();

    const enemyData =
      enemy && enemy.sprite
        ? EnemyImageMap[enemy.sprite]
        : EnemyImageMap["bat"];

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
          if (animToQueue in enemyData.sets) {
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
      }, [animationStore?.animationQueue, enemyData.sets]);

    const moveAnimationImage = enemyData.sets.move?.anim
      ? useAnimatedImage(enemyData.sets.move.anim)
      : null;

    useEffect(() => {
      if (moveAnimationImage && animationStore) {
        const duration =
          moveAnimationImage.getFrameCount() *
          moveAnimationImage.currentFrameDuration();
        animationStore.setMovementDuration(duration);
      }

      return () => {
        if (moveAnimationImage) {
          moveAnimationImage.dispose();
        }
      };
    }, [moveAnimationImage, animationStore]);

    if (!enemyData.sets[activeSpriteAnimationString]) {
      throw new Error(
        `no ${activeSpriteAnimationString} animation for: ${enemy?.sprite}`,
      );
    }

    const { currentQueuedAnimation, currentSpriteAnimation } = useMemo(() => {
      const currentSpriteAnimation = enemyData.sets[
        activeSpriteAnimationString
      ] as AnimationSet;
      return {
        currentQueuedAnimation: enemyData.sets[activeAnimationString],
        currentSpriteAnimation,
      };
    }, [activeAnimationString, activeSpriteAnimationString, enemyData.sets]);

    const spriteWidth = enemyData.width;
    const spriteHeight = enemyData.height;

    const containerSize = uiStore.dimensions.lesser * 0.5;

    const renderScaleCalc = memoizedCalculateRenderScaling(
      enemyData.renderScale,
    );

    const scaleX = (containerSize / spriteWidth) * renderScaleCalc;
    const scaleY = (containerSize / spriteHeight) * renderScaleCalc;

    const scale = Math.min(scaleX, scaleY);
    const mirrorTransform =
      "mirror" in enemyData && enemyData.mirror ? [{ scaleX: -1 }] : [];

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

    const handleFrameCountReady = (count: number) => {
      setFrameCount(count);
    };

    useEffect(() => {
      if (
        activeAnimationString !== "idle" &&
        animationStore &&
        !animationStore.runningRNAnimation &&
        frameCount > 0
      ) {
        switch (activeAnimationString) {
          case "attack_1":
          case "attack_2":
          case "attack_3":
          case "attack_4":
          case "attack_5":
            animationStore.setProjectile(activeAnimationString);
            return;

          case "move":
            runInAction(() => (animationStore.runningRNAnimation = true));

            if (
              playerAnimationStore.playerOrigin &&
              animationStore.spriteMidPoint
            ) {
              runMoveAnimation(
                playerAnimationStore.playerOrigin,
                animationStore.spriteMidPoint,
                frameCount,
                () => animationStore.concludeAnimation(),
              );
            } else {
              __DEV__ &&
                console.warn("Missing position data for move animation");
              animationStore.concludeAnimation();
            }
            return;

          case "death":
            runInAction(() => (animationStore.runningRNAnimation = true));
            runDeathAnimation(frameCount, () =>
              animationStore.concludeAnimation(),
            );
            return;

          case "dodge":
            runInAction(() => (animationStore.runningRNAnimation = true));
            runDodgeAnimation(frameCount, () =>
              animationStore.concludeAnimation(),
            );
            return;

          case "hurt":
            runInAction(() => (animationStore.runningRNAnimation = true));
            runHurtAnimation(frameCount, false, () =>
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
    }, [currentQueuedAnimation, frameCount]);

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

    const glowStyle = useAnimatedStyle(() => {
      if (!glow) return {};

      return {
        shadowColor: "#7fff00",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glow.value,
        shadowRadius: 10,
        elevation: glow.value * 8,
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
        <View
          style={{
            padding: 20,
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
              glowStyle,
            ]}
          >
            <SpriteAnimationManager
              spriteSet={enemyData.sets}
              currentAnimation={activeSpriteAnimationString}
              width={currentDimensions.width}
              height={currentDimensions.height}
              onAnimationComplete={handleAnimationComplete}
              isLooping={shouldLoop}
              onFrameCountReady={handleFrameCountReady}
              key={`${enemy?.id}`}
              topOffset={enemyData.topOffset}
            />
          </Animated.View>
        </View>

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

interface SingleAnimationSpriteProps {
  source: any;
  width: number;
  height: number;
  isActive: boolean;
  onAnimationComplete?: () => void;
  isLooping?: boolean;
  onFrameCountReady?: (count: number) => void;
  animationOption: AnimationOptions;
}

const SingleAnimationSprite = React.memo(
  ({
    source,
    width,
    height,
    isActive,
    onAnimationComplete,
    isLooping,
    onFrameCountReady,
    animationOption,
  }: SingleAnimationSpriteProps) => {
    const animatedImage = useAnimatedImage(source);
    const [currentFrame, setCurrentFrame] = useState(0);
    const frameRef = useRef(0);
    const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const hasCompletedLoop = useRef(false);
    const firstFrameHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isFirstFrameHeld = useRef(false);
    const isMounted = useRef(true);

    useEffect(() => {
      isMounted.current = true;
      return () => {
        animatedImage?.dispose();
        isMounted.current = false;
      };
    }, []);

    const safeSetCurrentFrame = (frame: number) => {
      if (isMounted.current) {
        setCurrentFrame(frame);
      }
    };

    useEffect(() => {
      if (!animatedImage) return;

      const frameCount = animatedImage.getFrameCount();
      if (onFrameCountReady && frameCount > 0 && isMounted.current) {
        onFrameCountReady(frameCount);
      }

      // Only start animation if this is the active animation
      if (!isActive) return;

      // Reset animation state
      frameRef.current = 0;
      safeSetCurrentFrame(0);
      hasCompletedLoop.current = false;
      isFirstFrameHeld.current = false;

      const frameDuration = animatedImage.currentFrameDuration();

      const advanceFrame = () => {
        if (!animatedImage || !isActive || !isMounted.current) return;

        try {
          // Special handling for spawn animation (short hold)
          if (
            animationOption === "spawn" &&
            frameRef.current === 0 &&
            !isFirstFrameHeld.current
          ) {
            isFirstFrameHeld.current = true;
            firstFrameHoldTimerRef.current = setTimeout(() => {
              if (!isMounted.current) return;

              try {
                animatedImage.decodeNextFrame();
                frameRef.current = 1;
                safeSetCurrentFrame(1);
                animationTimerRef.current = setTimeout(
                  continueAnimation,
                  frameDuration,
                );
              } catch (error) {
                console.error("Error in spawn animation first frame:", error);
              }
            }, 350);
            return;
          }

          animatedImage.decodeNextFrame();
          frameRef.current = (frameRef.current + 1) % frameCount;
          safeSetCurrentFrame(frameRef.current);

          if (frameRef.current === 0 && !hasCompletedLoop.current) {
            hasCompletedLoop.current = true;
            if (onAnimationComplete && !isLooping && isMounted.current) {
              onAnimationComplete();
              return;
            }
          }

          animationTimerRef.current = setTimeout(advanceFrame, frameDuration);
        } catch (error) {
          console.error("Error in animation frame:", error);
        }
      };

      const continueAnimation = () => {
        if (!animatedImage || !isActive || !isMounted.current) return;

        try {
          animatedImage.decodeNextFrame();
          frameRef.current = (frameRef.current + 1) % frameCount;
          safeSetCurrentFrame(frameRef.current);

          if (
            frameRef.current === frameCount - 1 &&
            !hasCompletedLoop.current
          ) {
            hasCompletedLoop.current = true;
            if (onAnimationComplete && !isLooping && isMounted.current) {
              onAnimationComplete();
              return;
            }
          }

          animationTimerRef.current = setTimeout(advanceFrame, frameDuration);
        } catch (error) {
          console.error("Error in continue animation:", error);
        }
      };

      advanceFrame();

      return () => {
        if (animationTimerRef.current) {
          clearTimeout(animationTimerRef.current);
          animationTimerRef.current = null;
        }
        if (firstFrameHoldTimerRef.current) {
          clearTimeout(firstFrameHoldTimerRef.current);
          firstFrameHoldTimerRef.current = null;
        }
      };
    }, [
      animatedImage,
      onAnimationComplete,
      isLooping,
      onFrameCountReady,
      isActive,
      animationOption,
    ]);

    useEffect(() => {
      return () => {
        if (animationTimerRef.current) {
          clearTimeout(animationTimerRef.current);
          animationTimerRef.current = null;
        }
        if (firstFrameHoldTimerRef.current) {
          clearTimeout(firstFrameHoldTimerRef.current);
          firstFrameHoldTimerRef.current = null;
        }
      };
    }, []);

    if (!animatedImage || !isActive) {
      return null;
    }

    try {
      return (
        <Canvas style={{ width, height, position: "absolute" }}>
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
    } catch (error) {
      console.error("Error rendering animation frame:", error);
      return null;
    }
  },
);

interface SpriteAnimationManagerProps {
  spriteSet: {
    [key in AnimationOptions]?: AnimationSet;
  };
  currentAnimation: AnimationOptions;
  width: number;
  height: number;
  onAnimationComplete?: () => void;
  isLooping?: boolean;
  topOffset?: number;
  onFrameCountReady?: (count: number) => void;
}

const SpriteAnimationManager = React.memo(
  ({
    spriteSet,
    currentAnimation,
    width,
    height,
    topOffset,
    onAnimationComplete,
    isLooping,
    onFrameCountReady,
  }: SpriteAnimationManagerProps) => {
    const validAnimations = useMemo(() => {
      return Object.entries(spriteSet).map(([key]) => key as AnimationOptions);
    }, [spriteSet]);

    return (
      <View
        style={{ width, height, marginTop: topOffset ? `${topOffset}%` : 0 }}
      >
        {validAnimations.map((animKey) => (
          <SingleAnimationSprite
            key={animKey}
            animationOption={currentAnimation}
            source={spriteSet[animKey]?.anim}
            width={width}
            height={height}
            isActive={animKey === currentAnimation}
            onAnimationComplete={
              animKey === currentAnimation ? onAnimationComplete : undefined
            }
            isLooping={isLooping}
            onFrameCountReady={
              animKey === currentAnimation ? onFrameCountReady : undefined
            }
          />
        ))}
      </View>
    );
  },
);
