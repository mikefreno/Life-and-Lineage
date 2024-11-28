import React, { useEffect, useRef, useState } from "react";
import { Dimensions, View } from "react-native";
import { Image } from "expo-image";
import { EnemyImageValueOption } from "../utility/enemyHelpers";

interface AnimatedSpriteProps {
  spriteSet: EnemyImageValueOption;
  initialAnimationState: string;
  defaultAnimationState: string;
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
  initialAnimationState,
  defaultAnimationState,
  currentAnimationState,
  setCurrentAnimationState,
  fps = 8,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [activeAnimation, setActiveAnimation] = useState(initialAnimationState);
  const animationRef = useRef<NodeJS.Timeout>();
  const frameCompletionCounter = useRef(0);

  // Original sprite dimensions
  const spriteWidth = spriteSet.width;
  const spriteHeight = spriteSet.height;

  // Display dimensions (use original if not provided)
  const displayWidthActual = spriteSet.displayWidth ?? spriteWidth;
  const displayHeightActual = spriteSet.displayHeight ?? spriteHeight;

  // Scale factors
  const scaleX = displayWidthActual / spriteWidth;
  const scaleY = displayHeightActual / spriteHeight;
  const scale = Math.min(scaleX, scaleY);
  const mirrorTransform = spriteSet.mirror ? [{ scaleX: -1 }] : [];

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

    const handleAnimationCompletion = () => {
      if (activeAnimation === currentAnimationState) {
        setCurrentAnimationState(undefined);
        setActiveAnimation(defaultAnimationState);
      }
    };

    if (currentAnimationState && currentAnimationState !== activeAnimation) {
      setActiveAnimation(currentAnimationState);
      frameCompletionCounter.current = 0;
      setCurrentFrame(0);
    }

    if (frameCompletionCounter.current > 0) {
      handleAnimationCompletion();
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
    defaultAnimationState,
    setCurrentAnimationState,
  ]);

  return (
    <View
      style={{
        width: displayWidthActual,
        height: displayHeightActual,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: -displayHeightActual / 2 - Dimensions.get("window").width / 4,
        top: -displayHeightActual / 2,
      }}
    >
      <View
        style={{
          width: spriteWidth,
          height: spriteHeight,
          transform: [{ scale }, ...mirrorTransform],
          overflow: "hidden",
        }}
      >
        <Image
          style={{
            position: "absolute",
            width: spriteWidth * spriteSet.sets[activeAnimation].frames,
            height: spriteHeight,
            left: -currentFrame * spriteWidth,
          }}
          source={spriteSet.sets[activeAnimation].anim}
        />
      </View>
    </View>
  );
};
