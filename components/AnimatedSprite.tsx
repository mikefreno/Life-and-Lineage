import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { EnemyImageValueOption } from "../utility/enemyHelpers";
import { FPS } from "../stores/EnemyAnimationStore";
import { useHeaderHeight } from "@react-navigation/elements";

interface AnimatedSpriteProps {
  spriteSet: EnemyImageValueOption;
  currentAnimationState: string | undefined;
  setCurrentAnimationState?: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  displayHeight?: number;
  displayWidth?: number;
  fps?: number;
  positionSetter?: (pos: { x: number; y: number }) => void;
}

export const AnimatedSprite = ({
  spriteSet,
  currentAnimationState,
  setCurrentAnimationState,
  positionSetter,
}: AnimatedSpriteProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [activeAnimation, setActiveAnimation] = useState("idle");
  const animationRef = useRef<NodeJS.Timeout>();
  const frameCompletionCounter = useRef(0);
  const hasSpawnAnimationPlayed = useRef(false);
  const measurementAttempts = useRef(0);
  const pendingAnimationChange = useRef<string | undefined>(undefined);
  const pendingStateUpdate = useRef<(() => void) | null>(null);

  // Original sprite dimensions
  const spriteWidth = spriteSet.width;
  const spriteHeight = spriteSet.height;
  const topOffset = "topOffset" in spriteSet ? spriteSet.topOffset : 0;
  const leftOffset = "leftOffset" in spriteSet ? spriteSet.leftOffset : 0;

  const displayWidthActual =
    "displayWidth" in spriteSet
      ? spriteSet.displayWidth
      : Math.max(150, spriteWidth);
  const displayHeightActual =
    "displayWidth" in spriteSet
      ? spriteSet.displayHeight
      : Math.max(150, spriteHeight);

  // Get current animation's size override if it exists
  const getCurrentAnimationSizeOverride = () => {
    if (
      activeAnimation in spriteSet.sets &&
      spriteSet.sets[activeAnimation] &&
      "sizeOverride" in spriteSet.sets[activeAnimation]
    ) {
      return spriteSet.sets[activeAnimation].sizeOverride;
    }
    return null;
  };

  // Get current animation's dimensions, accounting for size overrides
  const getCurrentAnimationDimensions = () => {
    const sizeOverride = getCurrentAnimationSizeOverride();
    if (sizeOverride) {
      return {
        width: sizeOverride.width,
        height: sizeOverride.height,
      };
    }
    return {
      width: spriteWidth,
      height: spriteHeight,
    };
  };

  // Get current animation dimensions
  const currentDimensions = getCurrentAnimationDimensions();

  // Scale factors
  const scaleX = displayWidthActual / spriteWidth;
  const scaleY = displayHeightActual / spriteHeight;
  const scale = Math.min(scaleX, scaleY);
  const mirrorTransform =
    "mirror" in spriteSet && spriteSet.mirror ? [{ scaleX: -1 }] : [];

  // Handle animation state changes from props
  useEffect(() => {
    if (
      currentAnimationState !== undefined &&
      currentAnimationState !== activeAnimation
    ) {
      setActiveAnimation(currentAnimationState);
      frameCompletionCounter.current = 0;
      setCurrentFrame(0);
    }
  }, [currentAnimationState, activeAnimation]);

  // Process any pending state updates
  useEffect(() => {
    if (pendingStateUpdate.current) {
      pendingStateUpdate.current();
      pendingStateUpdate.current = null;
    }
  });

  // Main animation loop
  useEffect(() => {
    const runAnimation = () => {
      animationRef.current = setInterval(() => {
        setCurrentFrame((prevFrame) => {
          const totalFrames =
            activeAnimation in spriteSet.sets && spriteSet.sets[activeAnimation]
              ? spriteSet.sets[activeAnimation].frames
              : spriteSet.sets.idle.frames;

          const nextFrame = (prevFrame + 1) % totalFrames;

          // If we've reached the end of the animation
          if (nextFrame === 0) {
            frameCompletionCounter.current += 1;

            // Schedule state update for next tick instead of during render
            if (
              activeAnimation !== "idle" &&
              currentAnimationState === undefined
            ) {
              pendingAnimationChange.current = "idle";
            }
          }

          return nextFrame;
        });
      }, 1000 / FPS);
    };

    runAnimation();

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [activeAnimation, currentAnimationState, FPS, spriteSet.sets]);

  // Handle animation completion and state transitions
  useEffect(() => {
    // Special handling for spawn animation
    if (
      activeAnimation === "spawn" &&
      frameCompletionCounter.current > 0 &&
      !hasSpawnAnimationPlayed.current
    ) {
      hasSpawnAnimationPlayed.current = true;
      setActiveAnimation("idle");

      if (setCurrentAnimationState) {
        pendingStateUpdate.current = () => {
          setCurrentAnimationState(undefined);
        };
      }
      frameCompletionCounter.current = 0;
      return;
    }

    // Handle animation completion
    if (frameCompletionCounter.current > 0 && activeAnimation !== "idle") {
      if (setCurrentAnimationState) {
        pendingStateUpdate.current = () => {
          setCurrentAnimationState(undefined);
        };
      }
      setActiveAnimation("idle");
      frameCompletionCounter.current = 0;
    }

    // Handle pending animation changes
    if (pendingAnimationChange.current !== undefined) {
      setActiveAnimation(pendingAnimationChange.current);
      if (setCurrentAnimationState) {
        pendingStateUpdate.current = () => {
          setCurrentAnimationState(pendingAnimationChange.current);
        };
      }
      pendingAnimationChange.current = undefined;
    }
  }, [activeAnimation, currentFrame, setCurrentAnimationState]);

  const parentRef = useRef<View>(null);
  const headerHeight = useHeaderHeight();

  // Function to measure and update position
  const measureAndUpdatePosition = () => {
    if (parentRef.current && positionSetter) {
      parentRef.current.measure((x, y, width, height, pageX, pageY) => {
        if (width > 0 && height > 0) {
          // Only update if we have valid measurements
          positionSetter({
            x: pageX + width / 2,
            y: pageY - headerHeight + height / 2,
          });
          measurementAttempts.current = 0; // Reset attempts on success
        } else if (measurementAttempts.current < 5) {
          // Try again a few times if measurement failed
          measurementAttempts.current++;
          setTimeout(measureAndUpdatePosition, 100);
        }
      });
    }
  };

  // Measure on mount and when animation frame changes
  useEffect(() => {
    // Use a small delay to ensure the component is rendered
    const timer = setTimeout(measureAndUpdatePosition, 100);
    return () => clearTimeout(timer);
  }, [currentFrame, activeAnimation, headerHeight]);

  // Measure when layout changes
  const handleLayout = () => {
    // Use a small delay to ensure the layout is complete
    setTimeout(measureAndUpdatePosition, 50);
  };

  return (
    <View
      ref={parentRef}
      onLayout={handleLayout}
      style={{
        width: currentDimensions.width,
        height: currentDimensions.height,
        transform: [{ scale }, ...mirrorTransform],
        overflow: "hidden",
        top: -currentDimensions.height / 2 + topOffset,
        left: leftOffset,
      }}
    >
      <Image
        style={{
          position: "absolute",
          width:
            currentDimensions.width *
            (activeAnimation in spriteSet.sets &&
            spriteSet.sets[activeAnimation]
              ? spriteSet.sets[activeAnimation].frames
              : spriteSet.sets.idle.frames),
          height: currentDimensions.height,
          left: -currentFrame * currentDimensions.width,
        }}
        source={
          activeAnimation in spriteSet.sets && spriteSet.sets[activeAnimation]
            ? spriteSet.sets[activeAnimation].anim
            : spriteSet.sets.idle.anim
        }
      />
    </View>
  );
};
