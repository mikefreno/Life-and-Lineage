import { useRootStore } from "@/hooks/stores";
import { VFXImageMap } from "@/utility/functions/vfxmapping";
import { observer } from "mobx-react-lite";
import React, { useRef, useCallback } from "react";
import { ReactNode, useEffect, useState } from "react";
import { View, Animated, Easing } from "react-native";
import { Image } from "expo-image";

export const VFXWrapper = observer(({ children }: { children: ReactNode }) => {
  const { uiStore, enemyStore, playerAnimationStore } = useRootStore();

  const [enemyAndPosList, setEnemyAndPosList] = useState<
    {
      enemyID: string;
      positionMidPoint: {
        x: number;
        y: number;
      };
    }[]
  >([]);

  const [playerOrigin, setPlayerOrigin] = useState<{ x: number; y: number }>({
    x: uiStore.dimensions.width / 4,
    y: uiStore.dimensions.height / 2,
  });

  const [currentFrame, setCurrentFrame] = useState(0);
  const animationInterval = useRef<NodeJS.Timeout>();
  const positionAnimValue = useRef(new Animated.Value(0)).current;
  const animationComplete = useRef(false);

  const [activeVFX, setActiveVFX] = useState<{
    source: any;
    style: "static" | "missile" | "span";
    startPos: { x: number; y: number };
    endPos: { x: number; y: number };
    width: number;
    height: number;
    rotate?: number;
    frames: number;
    duration: number;
  } | null>(null);

  const positionUpdateTrigger = enemyStore.enemies
    .map((enemy) => {
      const animStore = enemyStore.getAnimationStore(enemy.id);
      const pos = animStore?.spriteMidPoint;
      return `${enemy.id}:${pos?.x ?? 0},${pos?.y ?? 0}`;
    })
    .join("|");

  useEffect(() => {
    let localList = [];
    for (const enemy of enemyStore.enemies) {
      const animationStore = enemyStore.getAnimationStore(enemy.id);
      if (animationStore && animationStore.spriteMidPoint) {
        localList.push({
          enemyID: enemy.id,
          positionMidPoint: animationStore.spriteMidPoint,
        });
      }
    }
    setEnemyAndPosList(localList);
  }, [enemyStore.enemies, positionUpdateTrigger]);

  // Handle animation completion
  const completeAnimation = useCallback(() => {
    // Clear any running animation interval
    if (animationInterval.current) {
      clearInterval(animationInterval.current);
      animationInterval.current = undefined;
    }

    setActiveVFX(null);
    setCurrentFrame(0);
    animationComplete.current = false;

    if (playerAnimationStore.animationPromiseResolver) {
      playerAnimationStore.animationPromiseResolver();
      playerAnimationStore.animationPromiseResolver = null;
    }
    playerAnimationStore.clearAnimation();
  }, [playerAnimationStore]);

  // Process new animation sets
  useEffect(() => {
    if (playerAnimationStore.animationSet && enemyAndPosList.length > 0) {
      // Find target position based on animation position setting
      let targetPos: { x: number; y: number };

      if ("glow" in playerAnimationStore.animationSet) {
        // Handle glow animation
        const position = playerAnimationStore.animationSet.position;

        if (position === "enemy" && playerAnimationStore.target) {
          const targetEnemy = enemyAndPosList.find(
            (e) => e.enemyID === playerAnimationStore.target,
          );

          if (!targetEnemy) {
            console.warn("Target enemy not found for glow animation");
            completeAnimation();
            return;
          }

          targetPos = targetEnemy.positionMidPoint;
        } else if (position === "self") {
          targetPos = playerOrigin;
        } else {
          // Field position - center of screen
          targetPos = {
            x: uiStore.dimensions.width / 2,
            y: uiStore.dimensions.height / 2,
          };
        }

        // Handle glow animation (not fully implemented)
        setTimeout(() => {
          completeAnimation();
        }, 1000);

        return;
      }

      // Handle sprite-based animation
      const animSet = playerAnimationStore.animationSet;
      const position = animSet.position;

      if (position === "enemy" && playerAnimationStore.target) {
        const targetEnemy = enemyAndPosList.find(
          (e) => e.enemyID === playerAnimationStore.target,
        );

        if (!targetEnemy) {
          console.warn("Target enemy not found for animation");
          completeAnimation();
          return;
        }

        targetPos = targetEnemy.positionMidPoint;
      } else if (position === "self") {
        targetPos = playerOrigin;
      } else {
        // Field position - center of screen
        targetPos = {
          x: uiStore.dimensions.width / 2,
          y: uiStore.dimensions.height / 2,
        };
      }

      const vfx = VFXImageMap[animSet.sprite];

      // Reset animation values
      positionAnimValue.setValue(0);
      setCurrentFrame(0);
      animationComplete.current = false;

      // Calculate animation duration using the same formula for all types
      const animationDuration = Math.min(vfx.frames * 100, 1000);

      // Calculate frame duration based on total animation duration
      const frameDuration = Math.floor(animationDuration / vfx.frames);

      // Set up the VFX
      setActiveVFX({
        source: vfx.source,
        style: animSet.style,
        startPos: playerOrigin,
        endPos: targetPos,
        width: vfx.width,
        height: vfx.height,
        rotate: "rotate" in vfx ? vfx.rotate : 0,
        frames: vfx.frames,
        duration: animationDuration,
      });

      // Start position animation for all types
      Animated.timing(positionAnimValue, {
        toValue: 1,
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      // Start frame animation using interval
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }

      // Frame animation using setInterval - play exactly once
      let frameCount = 0;
      animationInterval.current = setInterval(() => {
        if (frameCount >= vfx.frames - 1) {
          // We've reached the last frame, complete the animation
          clearInterval(animationInterval.current);
          animationInterval.current = undefined;

          // Add a small delay before completing to ensure the last frame is visible
          setTimeout(completeAnimation, 50);
          return;
        }

        // Advance to next frame
        frameCount++;
        setCurrentFrame(frameCount);
      }, frameDuration);
    }

    return () => {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
    };
  }, [playerAnimationStore.animationSet, enemyAndPosList, completeAnimation]);

  // Calculate animation styles based on the animation type
  const getAnimationStyle = () => {
    if (!activeVFX) return {};

    const { startPos, endPos, style, width, height, rotate } = activeVFX;
    const baseRotation = rotate ? `${rotate}deg` : "0deg";

    switch (style) {
      case "missile":
        // Move from player to target
        const angle =
          Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x) *
          (180 / Math.PI);

        return {
          transform: [
            {
              translateX: positionAnimValue.interpolate({
                inputRange: [0, 1],
                outputRange: [startPos.x, endPos.x - width / 2],
              }),
            },
            {
              translateY: positionAnimValue.interpolate({
                inputRange: [0, 1],
                outputRange: [startPos.y, endPos.y - height / 2],
              }),
            },
            {
              rotate: rotate ? baseRotation : `${angle}deg`,
            },
          ],
          opacity: positionAnimValue.interpolate({
            inputRange: [0, 0.1, 0.9, 1],
            outputRange: [0, 1, 1, 0],
          }),
        };

      case "static":
        // Appear at target position
        return {
          transform: [
            { translateX: endPos.x - width / 2 },
            { translateY: endPos.y - height / 2 },
            { rotate: baseRotation },
          ],
          opacity: positionAnimValue.interpolate({
            inputRange: [0, 0.1, 0.9, 1],
            outputRange: [0, 1, 1, 0],
          }),
        };

      case "span":
        // Stretch from player to target
        const distance = Math.sqrt(
          Math.pow(endPos.x - startPos.x, 2) +
            Math.pow(endPos.y - startPos.y, 2),
        );
        const spanAngle =
          Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x) *
          (180 / Math.PI);

        return {
          transform: [
            { translateX: startPos.x },
            { translateY: startPos.y - height / 2 },
            { rotate: rotate ? `${spanAngle + rotate}deg` : `${spanAngle}deg` },
            {
              scaleX: positionAnimValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, distance / width, 0],
              }),
            },
          ],
          opacity: positionAnimValue.interpolate({
            inputRange: [0, 0.2, 0.8, 1],
            outputRange: [0, 1, 1, 0],
          }),
        };

      default:
        return {};
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Debug dots */}
      {__DEV__ && (
        <>
          {enemyAndPosList.map((elem) => (
            <View
              key={`enemy-dot-${elem.enemyID}`}
              style={{
                position: "absolute",
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "red",
                top: elem.positionMidPoint.y,
                left: elem.positionMidPoint.x,
                zIndex: 9999,
              }}
            />
          ))}
          <View
            style={{
              position: "absolute",
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "green",
              top: playerOrigin.y,
              left: playerOrigin.x,
              zIndex: 9999,
            }}
          />
        </>
      )}

      {/* Active VFX */}
      {activeVFX && (
        <Animated.View
          style={[
            {
              position: "absolute",
              width: activeVFX.width,
              height: activeVFX.height,
              zIndex: 9000,
              overflow: "hidden",
            },
            getAnimationStyle(),
          ]}
        >
          <Image
            style={{
              position: "absolute",
              width: activeVFX.width * activeVFX.frames,
              height: activeVFX.height,
              left: -currentFrame * activeVFX.width,
            }}
            source={activeVFX.source}
            contentFit="cover"
          />
        </Animated.View>
      )}

      {children}
    </View>
  );
});
