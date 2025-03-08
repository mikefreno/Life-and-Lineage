import React, { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { EnemyImageValueOption } from "../utility/enemyHelpers";
import { EnemyAnimationStore, FPS } from "../stores/EnemyAnimationStore";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";

export const AnimatedSprite = ({
  spriteSet,
  animationStore,
}: {
  spriteSet: EnemyImageValueOption;
  animationStore: EnemyAnimationStore;
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef<NodeJS.Timeout>();
  const { animationQueue } = animationStore;
  const { uiStore } = useRootStore();
  const styles = useStyles();

  const activeAnimation = useMemo(
    () => animationQueue[animationQueue.length - 1],
    [animationQueue],
  );

  const spriteWidth = spriteSet.width;
  const spriteHeight = spriteSet.height;
  const topOffset = "topOffset" in spriteSet ? spriteSet.topOffset : 0;
  const leftOffset = "leftOffset" in spriteSet ? spriteSet.leftOffset : 0;

  const containerSize = uiStore.dimensions.lesser * 0.5;

  const scaleX = (containerSize / spriteWidth) * spriteSet.renderScale ?? 1.0;
  const scaleY = (containerSize / spriteHeight) * spriteSet.renderScale ?? 1.0;
  const scale = Math.min(scaleX, scaleY);
  const mirrorTransform =
    "mirror" in spriteSet && spriteSet.mirror ? [{ scaleX: -1 }] : [];

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

  // Main animation loop
  useEffect(() => {
    const runAnimation = () => {
      animationRef.current = setInterval(() => {
        setCurrentFrame((prevFrame) => {
          const totalFrames = spriteSet.sets[activeAnimation].frames;

          const nextFrame = (prevFrame + 1) % totalFrames;

          if (nextFrame === 0) {
            animationStore.concludeAnimation();
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
  }, [animationQueue, FPS, spriteSet.sets]);

  return (
    <View style={{ flex: 1, ...styles.debugBorder }}>
      <View
        style={{
          borderColor: "blue",
          borderWidth: 1,
          width: currentDimensions.width,
          height: currentDimensions.height,
          transform: [{ scale }, ...mirrorTransform],
          overflow: "hidden",
          top: containerSize / 2 + topOffset,
          left: (containerSize - currentDimensions.width) / 2 + leftOffset,
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
            right: -currentFrame * currentDimensions.width,
          }}
          source={
            activeAnimation in spriteSet.sets && spriteSet.sets[activeAnimation]
              ? spriteSet.sets[activeAnimation].anim
              : spriteSet.sets.idle.anim
          }
        />
      </View>
    </View>
  );
};
