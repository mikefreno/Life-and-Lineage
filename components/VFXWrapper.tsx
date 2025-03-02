import { useRootStore } from "@/hooks/stores";
import { VFXImageMap } from "@/utility/functions/vfxmapping";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
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

  const animationValue = useRef(new Animated.Value(0)).current;
  const frameAnimValue = useRef(new Animated.Value(0)).current;
  const [activeVFX, setActiveVFX] = useState<{
    source: any;
    style: "static" | "missile" | "span";
    startPos: { x: number; y: number };
    endPos: { x: number; y: number };
    width: number;
    height: number;
    rotate?: number;
    frames: number;
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
  const completeAnimation = () => {
    setActiveVFX(null);
    if (playerAnimationStore.animationPromiseResolver) {
      playerAnimationStore.animationPromiseResolver();
      playerAnimationStore.animationPromiseResolver = null;
    }
    playerAnimationStore.clearAnimation();
  };

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
      animationValue.setValue(0);
      frameAnimValue.setValue(0);

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
      });

      // Calculate animation duration based on frames
      // Assuming each frame should be visible for about 100ms
      const frameDuration = 100;
      const animationDuration = vfx.frames * frameDuration;

      // Configure and start position animation
      Animated.timing(animationValue, {
        toValue: 1,
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      // Configure and start frame animation
      Animated.timing(frameAnimValue, {
        toValue: vfx.frames - 1,
        duration: animationDuration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          completeAnimation();
        }
      });
    }
  }, [playerAnimationStore.animationSet, enemyAndPosList]);

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
              translateX: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [startPos.x, endPos.x - width / 2],
              }),
            },
            {
              translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [startPos.y, endPos.y - height / 2],
              }),
            },
            {
              rotate: rotate ? baseRotation : `${angle}deg`,
            },
          ],
          opacity: animationValue.interpolate({
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
            {
              scale: animationValue.interpolate({
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [0.5, 1.2, 1.2, 0.8],
              }),
            },
          ],
          opacity: animationValue.interpolate({
            inputRange: [0, 0.2, 0.8, 1],
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
              scaleX: animationValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, distance / width, 0],
              }),
            },
          ],
          opacity: animationValue.interpolate({
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
          <Animated.View
            style={{
              width: activeVFX.width * activeVFX.frames,
              height: activeVFX.height,
              transform: [
                {
                  translateX: frameAnimValue.interpolate({
                    inputRange: [0, activeVFX.frames - 1],
                    outputRange: [
                      0,
                      -(activeVFX.width * (activeVFX.frames - 1)),
                    ],
                  }),
                },
              ],
            }}
          >
            <Image
              style={{
                width: activeVFX.width * activeVFX.frames,
                height: activeVFX.height,
              }}
              source={activeVFX.source}
              contentFit="cover"
            />
          </Animated.View>
        </Animated.View>
      )}

      {children}
    </View>
  );
});
