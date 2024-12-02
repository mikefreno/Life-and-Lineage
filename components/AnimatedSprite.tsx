import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { EnemyImageValueOption } from "../utility/enemyHelpers";

interface AnimatedSpriteProps {
  spriteSet: EnemyImageValueOption;
  currentAnimationState: string | undefined;
  setCurrentAnimationState: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  displayHeight?: number;
  displayWidth?: number;
  fps?: number;
}

export const AnimatedSprite: React.FC<AnimatedSpriteProps> = ({
  spriteSet,
  currentAnimationState,
  setCurrentAnimationState,
  fps = 8,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [activeAnimation, setActiveAnimation] = useState(
    "spawn" in spriteSet.sets ? "spawn" : "idle",
  );
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

  useEffect(() => console.log(activeAnimation),[activeAnimation]);

  useEffect(() => {
    const runAnimation = () => {
      animationRef.current = setInterval(() => {
        setCurrentFrame((prevFrame) => {
          const currentSet = spriteSet.sets[activeAnimation];
          const nextFrame = (prevFrame + 1) % currentSet.frames;

          if (nextFrame === 0) {
            frameCompletionCounter.current += 1;
          }
          return nextFrame;
        });
      }, 1000 / fps);
    };

    // Handle spawn animation completion
    if (
      activeAnimation === "spawn" &&
      frameCompletionCounter.current > 0 &&
      !hasSpawnAnimationPlayed.current
    ) {
      hasSpawnAnimationPlayed.current = true;
      setActiveAnimation("idle");
      setCurrentAnimationState(undefined);
      frameCompletionCounter.current = 0;
      return;
    }

    // Handle other animation state changes
    if (currentAnimationState && currentAnimationState !== activeAnimation) {
      setActiveAnimation(currentAnimationState);
      frameCompletionCounter.current = 0;
      setCurrentFrame(0);
    }

    // Handle animation completion
    if (frameCompletionCounter.current > 0 && activeAnimation !== "idle") {
      setCurrentAnimationState(undefined);
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
    fps,
    setCurrentAnimationState,
    spriteSet.sets,
  ]);

  const validAnimation = spriteSet.sets[activeAnimation]
    ? activeAnimation
    : "idle";

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
          width: spriteWidth * spriteSet.sets[validAnimation].frames,
          height: spriteHeight,
          left: -currentFrame * spriteWidth,
        }}
        source={spriteSet.sets[validAnimation].anim}
      />
    </View>
  );
};
