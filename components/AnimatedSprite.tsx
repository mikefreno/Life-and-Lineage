import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { EnemyImageMap, EnemyImageValueOption } from "../utility/enemyHelpers";
import { FPS } from "../stores/AnimationStore";

interface AnimatedSpriteProps {
  spriteSet: EnemyImageValueOption;
  currentAnimationState: string | undefined;
  setCurrentAnimationState?: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  displayHeight?: number;
  displayWidth?: number;
  fps?: number;
}

export const AnimatedSprite: React.FC<AnimatedSpriteProps> = ({
  spriteSet = EnemyImageMap["zombie"],
  currentAnimationState,
  setCurrentAnimationState,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [activeAnimation, setActiveAnimation] = useState("idle");
  const animationRef = useRef<NodeJS.Timeout>();
  const frameCompletionCounter = useRef(0);
  const hasSpawnAnimationPlayed = useRef(false);

  // Original sprite dimensions
  const spriteWidth = spriteSet.width;
  const spriteHeight = spriteSet.height;
  const topOffset = spriteSet.topOffset ?? 0;
  const leftOffset = spriteSet.leftOffset ?? 0;

  const displayWidthActual =
    spriteSet.displayWidth ?? Math.max(150, spriteWidth);
  const displayHeightActual =
    spriteSet.displayHeight ?? Math.max(150, spriteHeight);

  // Scale factors
  const scaleX = displayWidthActual / spriteWidth;
  const scaleY = displayHeightActual / spriteHeight;
  const scale = Math.min(scaleX, scaleY);
  const mirrorTransform = spriteSet.mirror ? [{ scaleX: -1 }] : [];

  useEffect(() => {
    const runAnimation = () => {
      animationRef.current = setInterval(() => {
        setCurrentFrame((prevFrame) => {
          const nextFrame =
            (prevFrame + 1) %
            (activeAnimation in spriteSet.sets &&
            spriteSet.sets[activeAnimation]
              ? spriteSet.sets[activeAnimation].frames
              : spriteSet.sets.idle.frames);

          if (nextFrame === 0) {
            frameCompletionCounter.current += 1;

            if (
              activeAnimation !== "idle" &&
              currentAnimationState === undefined
            ) {
              setActiveAnimation("idle");
            }
          }
          return nextFrame;
        });
      }, 1000 / FPS);
    };

    // Handle spawn animation completion
    if (
      activeAnimation === "spawn" &&
      frameCompletionCounter.current > 0 &&
      !hasSpawnAnimationPlayed.current
    ) {
      hasSpawnAnimationPlayed.current = true;
      setActiveAnimation("idle");

      if (setCurrentAnimationState) {
        setCurrentAnimationState(undefined);
      }
      frameCompletionCounter.current = 0;
      return;
    }

    if (currentAnimationState && currentAnimationState !== activeAnimation) {
      setActiveAnimation(currentAnimationState);
      frameCompletionCounter.current = 0;
      setCurrentFrame(0);
    }

    // Handle animation completion
    if (frameCompletionCounter.current > 0 && activeAnimation !== "idle") {
      if (setCurrentAnimationState) {
        setCurrentAnimationState(undefined);
      }
      setActiveAnimation("idle");
    }

    runAnimation();

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [
    activeAnimation,
    currentAnimationState,
    FPS,
    setCurrentAnimationState,
    spriteSet.sets,
  ]);

  return (
    <View
      style={{
        width: spriteWidth,
        height: spriteHeight,
        transform: [{ scale }, ...mirrorTransform],
        overflow: "hidden",
        top: -spriteHeight / 2 + topOffset,
        left: leftOffset,
      }}
    >
      <Image
        style={{
          position: "absolute",
          width:
            spriteWidth *
            (activeAnimation in spriteSet.sets &&
            spriteSet.sets[activeAnimation]
              ? spriteSet.sets[activeAnimation].frames
              : spriteSet.sets.idle.frames),
          height: spriteHeight,
          left: -currentFrame * spriteWidth,
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
