import { useScaling } from "@/hooks/scaling";
import { useRootStore } from "@/hooks/stores";
import { type EnemyAnimationStore } from "@/stores/EnemyAnimationStore";
import { PlayerVFXImageMap } from "@/utility/animation/player";
import { PlayerSpriteAnimationSet } from "@/utility/types";
import { Vector2 } from "@/utility/Vec2";
import { Canvas, useAnimatedImage, Image } from "@shopify/react-native-skia";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ReactNode } from "react";
import { Animated, type ColorValue, View } from "react-native";

export const VFXWrapper = observer(
  ({
    children,
    headerHeight,
  }: {
    children: ReactNode;
    headerHeight: number;
  }) => {
    const { uiStore, enemyStore, playerAnimationStore } = useRootStore();

    const { enemyAnimationStores, enemyAndPosList } = useMemo(() => {
      const stores: EnemyAnimationStore[] = [];
      const positionalList = [];

      for (const enemy of enemyStore.enemies) {
        const store = enemyStore.getAnimationStore(enemy.id);
        if (store) {
          stores.push(store);
          if (store.spriteMidPoint) {
            positionalList.push({
              enemyID: enemy.id,
              positionMidPoint: store.spriteMidPoint,
            });
          }
        }
      }

      return { enemyAnimationStores: stores, enemyAndPosList: positionalList };
    }, [
      enemyStore.enemies,
      enemyStore.animationStoreMap.entries,
      enemyStore.animationStoreMap.keys,
      enemyStore.midpointUpdater,
      uiStore.orientation,
    ]);

    return (
      <View style={{ flex: 1 }}>
        {/* Debug dots */}
        {__DEV__ && uiStore.showDevDebugUI && (
          <>
            {enemyAnimationStores.map((elem) => (
              <View
                key={`enemy-dot-${elem.spriteMidPoint?.x}-${elem.spriteMidPoint?.y}`}
                style={{
                  position: "absolute",
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "red",
                  top: elem.spriteMidPoint?.y,
                  left: elem.spriteMidPoint?.x,
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
                top: playerAnimationStore.playerOrigin.y,
                left: playerAnimationStore.playerOrigin.x,
                zIndex: 9999,
              }}
            />
          </>
        )}
        {children}
        <PlayerVFX
          enemyPositions={enemyAndPosList}
          playerOrigin={playerAnimationStore.playerOrigin}
          headerHeight={headerHeight}
        />
        {enemyAnimationStores.map((store) => (
          <EnemyVFX
            key={store.id}
            store={store}
            playerOrigin={playerAnimationStore.playerOrigin}
            headerHeight={headerHeight}
          />
        ))}
      </View>
    );
  },
);

const PlayerVFX = observer(
  ({
    enemyPositions,
    playerOrigin,
    headerHeight,
  }: {
    enemyPositions: {
      enemyID: string;
      positionMidPoint: Vector2;
    }[];
    playerOrigin: Vector2;
    headerHeight: number;
  }) => {
    const { playerState, playerAnimationStore } = useRootStore();

    const animation = useMemo(() => {
      if (
        playerAnimationStore.animationSet &&
        "sprite" in playerAnimationStore.animationSet
      ) {
        return PlayerVFXImageMap[playerAnimationStore.animationSet.sprite];
      } else return null;
    }, [playerAnimationStore.animationSet]);

    const targetIDs = useMemo(() => {
      if (
        !playerAnimationStore.animationSet ||
        !("glow" in playerAnimationStore.animationSet) ||
        !playerAnimationStore.animationSet.position
      ) {
        return null;
      }

      const position = playerAnimationStore.animationSet.position;

      if (position === "enemy") {
        return enemyPositions.map((enemy) => enemy.enemyID);
      } else if (position === "self" && playerState) {
        return [playerState.id];
      } else {
        return null;
      }
    }, [playerAnimationStore.animationSet, enemyPositions]);

    if (!playerAnimationStore.animationSet || !playerState) return null;

    return (
      <>
        {animation ? (
          <PlayerSpriteVFX
            animation={animation}
            set={
              toJS(
                playerAnimationStore.animationSet,
              ) as PlayerSpriteAnimationSet
            }
            enemyPositions={enemyPositions}
            playerOrigin={playerOrigin}
            onComplete={() => playerAnimationStore.clearAnimation()}
          />
        ) : (
          "glow" in playerAnimationStore.animationSet && (
            <GlowVFX
              glow={playerAnimationStore.animationSet.glow}
              duration={playerAnimationStore.animationSet.duration}
              onComplete={() => playerAnimationStore.clearAnimation()}
              headerHeight={headerHeight}
              position={playerAnimationStore.animationSet.position}
              targetIDs={targetIDs}
            />
          )
        )}
      </>
    );
  },
);

const missilePlacementHandler = ({
  playerOrigin,
  normalized,
}: {
  playerOrigin: Vector2;
  normalized: { width: number; height: number };
}): Vector2 => {
  const offset = Vector2.fromAngle(-Math.PI / 2, normalized.height * 0.1);
  return playerOrigin
    .add(offset)
    .subtract(new Vector2(normalized.width / 2, normalized.height / 2));
};

const staticPlacementHandler = ({
  playerOrigin,
  normalized,
  targetPosition,
  position,
}: {
  playerOrigin: Vector2;
  normalized: { width: number; height: number };
  targetPosition: Vector2;
  position: "enemy" | "field" | "self";
}): Vector2 => {
  const centerOffset = new Vector2(normalized.width / 2, normalized.height / 2);

  switch (position) {
    case "enemy":
      return targetPosition.subtract(centerOffset);

    case "field":
      return playerOrigin.midpoint(targetPosition).subtract(centerOffset);

    case "self":
    default:
      const selfOffset = Vector2.fromAngle(
        -Math.PI / 2,
        normalized.height * 0.5,
      );
      return playerOrigin.add(selfOffset).subtract(centerOffset);
  }
};

const spanPlacementHandler = ({
  playerOrigin,
  normalized,
}: {
  playerOrigin: Vector2;
  normalized: { width: number; height: number };
}): Vector2 => {
  return playerOrigin.subtract(
    new Vector2(normalized.width / 2, normalized.height / 2),
  );
};

const PlayerSpriteVFX = ({
  animation,
  enemyPositions,
  playerOrigin,
  onComplete,
  set,
}: {
  animation: {
    source: any;
    height: number;
    width: number;
  };
  enemyPositions: {
    enemyID: string;
    positionMidPoint: Vector2;
  }[];
  playerOrigin: Vector2;
  set: PlayerSpriteAnimationSet;
  onComplete: (() => void) | null;
}) => {
  const { uiStore } = useRootStore();
  const animatedImage = useAnimatedImage(animation.source);
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameRef = useRef(0);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const { memoizedCalculateRenderScaling } = useScaling();

  const animXY = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const renderScaleCalc = memoizedCalculateRenderScaling(set.scale);

  const containerSize = uiStore.dimensions.lesser * 0.5;

  const scaleX = (containerSize / animation.width) * renderScaleCalc;
  const scaleY = (containerSize / animation.height) * renderScaleCalc;

  const scale = Math.min(scaleX, scaleY);

  const normalized = useMemo(() => {
    return {
      height: animation.height * scale,
      width: animation.width * scale,
    };
  }, [animation.height, animation.width, scale]);

  const targetPosition = useMemo(() => {
    return enemyPositions.length > 0
      ? enemyPositions[0].positionMidPoint
      : playerOrigin.add(Vector2.fromAngle(-Math.PI / 2, 0));
  }, [enemyPositions, playerOrigin]);

  const initialPosition = useMemo(() => {
    switch (set.style) {
      case "static":
        return staticPlacementHandler({
          playerOrigin,
          normalized,
          targetPosition,
          position: set.position,
        });
      case "missile":
        return missilePlacementHandler({ playerOrigin, normalized });
      case "span":
        return spanPlacementHandler({ playerOrigin, normalized });
    }
  }, [set.style, set.position, playerOrigin, normalized, targetPosition]);

  const spanCalculations = useMemo(() => {
    if (set.style !== "span") return null;

    const direction = targetPosition.subtract(playerOrigin);
    const distance = direction.magnitude();
    const angle = direction.angleDegrees();

    return { distance, angle };
  }, [set.style, playerOrigin, targetPosition]);

  const safeSetCurrentFrame = useCallback((frame: number) => {
    if (isMounted.current) {
      setCurrentFrame(frame);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
      if (animationRef.current) {
        animationRef.current.stop();
      }
      if (animatedImage) {
        animatedImage.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!animatedImage) return;

    frameRef.current = 0;
    safeSetCurrentFrame(0);

    const frameCount = animatedImage.getFrameCount() * (set.repeat ?? 1);
    const frameDuration = animatedImage.currentFrameDuration();

    const advanceFrame = () => {
      if (!animatedImage || !isMounted.current) return;

      try {
        animatedImage.decodeNextFrame();
        frameRef.current = (frameRef.current + 1) % frameCount;
        safeSetCurrentFrame(frameRef.current);

        if (frameRef.current === frameCount - 1) {
          animatedImage.dispose();
          if (onComplete && isMounted.current) {
            onComplete();
            return;
          }
        }

        animationTimerRef.current = setTimeout(advanceFrame, frameDuration);
      } catch (error) {
        console.error("Error in animation frame:", error);
      }
    };

    advanceFrame();
  }, [animatedImage, onComplete, safeSetCurrentFrame]);

  useEffect(() => {
    if (!animatedImage || set.style !== "missile") return;

    const frameCount = animatedImage.getFrameCount();
    const frameDuration = animatedImage.currentFrameDuration();
    const totalDuration =
      (set.reachTargetAtFrame ? set.reachTargetAtFrame : frameCount) *
      frameDuration;

    const dist = targetPosition.subtract(playerOrigin);

    animXY.setValue({ x: 0, y: 0 });

    animationRef.current = Animated.timing(animXY, {
      toValue: dist,
      duration: totalDuration,
      useNativeDriver: true,
    });

    animationRef.current.start();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [animatedImage, set.style, playerOrigin, targetPosition, animXY]);

  if (!animatedImage) {
    return null;
  }

  if (set.style === "span" && spanCalculations) {
    const { distance, angle } = spanCalculations;
    const scaleX = distance / normalized.width;

    return (
      <View
        style={{
          position: "absolute",
          left: playerOrigin.x,
          top: playerOrigin.y,
          width: normalized.width,
          height: normalized.height,
          transform: [
            { translateX: -normalized.width / 2 },
            { translateY: -normalized.height / 2 },
            { rotate: `${angle}deg` },
            { scaleX: scaleX },
            { translateX: normalized.width / 2 },
          ],
        }}
      >
        <Canvas
          style={{
            width: normalized.width,
            height: normalized.height,
            top: set.topOffset ? `${set.topOffset}%` : 0,
            left: set.leftOffset ? `${set.leftOffset}%` : 0,
          }}
        >
          <Image
            image={animatedImage.getCurrentFrame()}
            x={0}
            y={0}
            width={normalized.width}
            height={normalized.height}
            fit="contain"
          />
        </Canvas>
      </View>
    );
  } else if (set.style === "missile") {
    const angle = playerOrigin.angleBetweenDegrees(targetPosition);

    return (
      <Animated.View
        style={{
          position: "absolute",
          left: initialPosition.x,
          top: initialPosition.y,
          width: normalized.width,
          height: normalized.height,
          zIndex: 9999,
          transform: [
            { translateX: animXY.x },
            { translateY: animXY.y },
            { rotate: `${angle}deg` },
          ],
        }}
      >
        <Canvas
          style={{
            width: normalized.width,
            height: normalized.height,
            zIndex: 9999,
            top: set.topOffset ? `${set.topOffset}%` : 0,
            left: set.leftOffset ? `${set.leftOffset}%` : 0,
          }}
        >
          <Image
            image={animatedImage.getCurrentFrame()}
            x={0}
            y={0}
            width={normalized.width}
            height={normalized.height}
            fit="contain"
          />
        </Canvas>
      </Animated.View>
    );
  } else {
    return (
      <View
        style={{
          position: "absolute",
          left: initialPosition.x,
          top: initialPosition.y,
          width: normalized.width,
          height: normalized.height,
          zIndex: 9999,
        }}
      >
        <Canvas
          style={{
            width: normalized.width,
            height: normalized.height,
            top: set.topOffset ? `${set.topOffset}%` : 0,
            left: set.leftOffset ? `${set.leftOffset}%` : 0,
            zIndex: 9999,
          }}
        >
          <Image
            image={animatedImage.getCurrentFrame()}
            x={0}
            y={0}
            width={normalized.width}
            height={normalized.height}
            fit="contain"
          />
        </Canvas>
      </View>
    );
  }
};

const GlowVFX = ({
  glow,
  duration = 1000,
  onComplete,
  headerHeight,
  position = "field",
  targetIDs,
}: {
  glow: ColorValue;
  duration?: number;
  onComplete: (() => void) | null;
  headerHeight: number;
  position: "enemy" | "field" | "self" | undefined;
  targetIDs: string[] | null;
}) => {
  const { uiStore, playerState, playerAnimationStore, enemyStore } =
    useRootStore();
  const opacity = useRef(new Animated.Value(0)).current;

  const targetData = useMemo(() => {
    if (targetIDs == null || position === "field") {
      return null;
    }
    if (playerState?.id === targetIDs[0]) {
      const size = uiStore.dimensions.lesser * 0.3;

      return {
        left: playerAnimationStore.playerOrigin.x - size / 2,
        top: playerAnimationStore.playerOrigin.y - size / 2,
        height: size,
        width: size,
      };
    }

    let top = Number.MAX_SAFE_INTEGER;
    let left = Number.MAX_SAFE_INTEGER;
    let bottom = Number.MIN_SAFE_INTEGER;
    let right = Number.MIN_SAFE_INTEGER;
    let hasValidTarget = false;

    for (const id of targetIDs) {
      const store = enemyStore.getAnimationStore(id);
      if (store?.spriteMidPoint && store.renderedDimensions) {
        hasValidTarget = true;
        const halfHeight = store.renderedDimensions.height / 2;
        const halfWidth = store.renderedDimensions.width / 2;

        const localTop = store.spriteMidPoint.y - halfHeight;
        const localBottom = store.spriteMidPoint.y + halfHeight;
        const localLeft = store.spriteMidPoint.x - halfWidth;
        const localRight = store.spriteMidPoint.x + halfWidth;

        top = Math.min(top, localTop);
        bottom = Math.max(bottom, localBottom);
        left = Math.min(left, localLeft);
        right = Math.max(right, localRight);
      }
    }

    if (hasValidTarget) {
      const width = right - left;
      const height = bottom - top;
      const padding = Math.min(width, height) * 0.2; // 20% padding

      return {
        left: left - padding,
        top: top - padding,
        height: height + padding * 2,
        width: width + padding * 2,
      };
    }

    return null;
  }, [targetIDs, position, playerState?.id, enemyStore.midpointUpdater]);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1.0,
      duration: duration / 3,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished && onComplete) {
              onComplete();
            }
          });
        }, duration / 6);
      }
    });

    return () => {
      opacity.stopAnimation();
      if (onComplete) onComplete();
    };
  }, []);

  if (targetData) {
    return (
      <Animated.View
        style={{
          zIndex: 9999,
          width: targetData.width,
          height: targetData.height,
          position: "absolute",
          left: targetData.left,
          top: targetData.top,
          backgroundColor: glow,
          opacity: opacity,
          borderRadius: Math.max(targetData.width, targetData.height),
        }}
      />
    );
  } else {
    return (
      <Animated.View
        style={{
          zIndex: 9999,
          width: uiStore.dimensions.width,
          height: uiStore.dimensions.height,
          marginTop: -headerHeight,
          position: "absolute",
          backgroundColor: glow,
          opacity: opacity,
        }}
      />
    );
  }
};

const EnemyVFX = observer(
  ({
    store,
    playerOrigin,
    headerHeight,
  }: {
    store: EnemyAnimationStore;
    playerOrigin: Vector2;
    headerHeight: number;
  }) => {
    const { playerState } = useRootStore();

    const targetIDs = useMemo(() => {
      if (!store.activeGlow) return null;

      switch (store.activeGlow.position) {
        case "self":
          return [store.id];
        case "enemy":
          return playerState ? [playerState.id] : null;
        default:
          return null;
      }
    }, [store.activeGlow, store.id, playerState?.id]);

    if (
      (!store.projectileSet && !store.activeGlow) ||
      (!store.spriteMidPoint && store.activeGlow?.position !== "field")
    ) {
      return null;
    }

    return (
      <>
        {store.projectileSet?.projectile && store.spriteMidPoint && (
          <ProjectileEffect
            projectile={store.projectileSet.projectile}
            enemyOrigin={store.spriteMidPoint}
            playerOrigin={playerOrigin}
            splash={store.projectileSet.splash}
            onComplete={() => {
              store.clearProjectileSet();
            }}
          />
        )}
        {store.activeGlow && (
          <GlowVFX
            glow={store.activeGlow.color}
            duration={store.activeGlow.duration}
            onComplete={() => store.clearGlow()}
            headerHeight={headerHeight}
            position={store.activeGlow.position}
            targetIDs={targetIDs}
          />
        )}
      </>
    );
  },
);

const ProjectileEffect = ({
  projectile,
  enemyOrigin,
  playerOrigin,
  splash,
  onComplete,
}: {
  projectile: {
    anim: any;
    height: number;
    width: number;
    scale?: number;
    renderScale?: number;
  };
  enemyOrigin: Vector2;
  playerOrigin: Vector2;
  splash?: {
    anim: any;
    height: number;
    width: number;
    scale?: number;
    renderScale?: number;
    followsProjectile: boolean;
  };
  onComplete: () => void;
}) => {
  const { uiStore } = useRootStore();
  const projectileImage = useAnimatedImage(projectile.anim);
  const [projectileFrame, setProjectileFrame] = useState(0);
  const [showSplash, setShowSplash] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const frameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  const { memoizedCalculateRenderScaling } = useScaling();

  const animXY = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const renderScaleCalc = memoizedCalculateRenderScaling(projectile.scale);

  const containerSize = uiStore.dimensions.lesser * 0.5;

  const scaleX = (containerSize / projectile.width) * renderScaleCalc;
  const scaleY = (containerSize / projectile.height) * renderScaleCalc;

  const scale = Math.min(scaleX, scaleY);

  const normalized = useMemo(() => {
    return {
      height: projectile.height * scale,
      width: projectile.width * scale,
    };
  }, [projectile.height, projectile.width, scale]);

  const centerOffset = new Vector2(normalized.width / 2, normalized.height / 2);
  const [projectilePosition, setProjectilePosition] = useState<Vector2>(
    enemyOrigin.subtract(centerOffset),
  );

  useEffect(() => {
    if (!projectileImage) return;

    isMounted.current = true;

    let frameCount = 0;
    const frameTotal = projectileImage.getFrameCount();
    const frameDuration = projectileImage.currentFrameDuration();

    const animateFrames = () => {
      if (!isMounted.current || !projectileImage) return;

      projectileImage.decodeNextFrame();
      frameCount = frameCount + 1;
      setProjectileFrame(frameCount);

      if (frameCount < frameTotal) {
        frameTimerRef.current = setTimeout(animateFrames, frameDuration);
      }
    };

    animateFrames();

    const totalDuration = frameTotal * frameDuration;

    animXY.setValue({ x: 0, y: 0 });

    setProjectilePosition(enemyOrigin.subtract(centerOffset));

    const moveVector = playerOrigin.subtract(enemyOrigin);

    const distance = moveVector.magnitude();
    const controlPoint = enemyOrigin
      .midpoint(playerOrigin)
      .add(Vector2.fromAngle(-Math.PI / 2, distance * 0.2));

    const steps = 10;
    const path = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const point = Vector2.quadraticBezier(
        new Vector2(0, 0),
        controlPoint.subtract(enemyOrigin),
        moveVector,
        t,
      );
      path.push(point);
    }

    const segmentDuration = totalDuration / steps;

    const animations = path.map((point, index) => {
      return Animated.timing(animXY, {
        toValue: point.toObject(),
        duration: segmentDuration,
        useNativeDriver: true,
      });
    });

    animationRef.current = Animated.sequence(animations);

    animationRef.current.start(({ finished }) => {
      if (finished && isMounted.current) {
        setShowSplash(true);

        if (!splash) {
          setAnimationComplete(true);
        }
      }
    });

    return () => {
      isMounted.current = false;
      if (animationRef.current) {
        animationRef.current.stop();
      }
      if (frameTimerRef.current) {
        clearTimeout(frameTimerRef.current);
        frameTimerRef.current = null;
      }
      projectileImage.dispose();
    };
  }, [
    projectileImage,
    enemyOrigin.x,
    enemyOrigin.y,
    playerOrigin.x,
    playerOrigin.y,
  ]);

  useEffect(() => {
    if (animationComplete && onComplete) {
      onComplete();
    }
  }, [animationComplete, onComplete]);

  if (!projectileImage) return null;

  const angle = enemyOrigin.angleBetweenDegrees(playerOrigin);

  return (
    <>
      <Animated.View
        style={{
          position: "absolute",
          left: projectilePosition.x,
          top: projectilePosition.y,
          width: normalized.width,
          height: normalized.height,
          transform: [
            { translateX: animXY.x },
            { translateY: animXY.y },
            { rotate: `${angle}deg` },
          ],
        }}
      >
        <Canvas style={{ width: normalized.width, height: normalized.height }}>
          <Image
            image={projectileImage.getCurrentFrame()}
            x={0}
            y={0}
            width={normalized.width}
            height={normalized.height}
            fit="contain"
          />
        </Canvas>
      </Animated.View>

      {splash && (showSplash || splash.followsProjectile) && (
        <Animated.View
          style={{
            transform: [{ translateX: animXY.x }, { translateY: animXY.y }],
          }}
        >
          <SplashEffect
            splash={splash}
            projectilePosition={projectilePosition}
            playerOrigin={playerOrigin}
            onComplete={() => {
              setAnimationComplete(true);
            }}
          />
        </Animated.View>
      )}
    </>
  );
};

const SplashEffect = ({
  splash,
  projectilePosition,
  playerOrigin,
  onComplete,
}: {
  splash: {
    anim: any;
    height: number;
    width: number;
    scale?: number;
    followsProjectile: boolean;
  };
  projectilePosition: Vector2;
  playerOrigin: Vector2;
  onComplete: () => void;
}) => {
  const { uiStore } = useRootStore();
  const splashImage = useAnimatedImage(splash.anim);
  const [splashFrame, setSplashFrame] = useState(0);
  const frameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const { memoizedCalculateRenderScaling } = useScaling();

  const renderScaleCalc = memoizedCalculateRenderScaling(splash.scale);

  const containerSize = uiStore.dimensions.lesser * 0.5;

  const scaleX = (containerSize / splash.width) * renderScaleCalc;
  const scaleY = (containerSize / splash.height) * renderScaleCalc;

  const scale = Math.min(scaleX, scaleY);

  const normalized = useMemo(() => {
    return {
      height: splash.height * scale,
      width: splash.width * scale,
    };
  }, [splash.height, splash.width, scale]);

  const centerOffset = new Vector2(normalized.width / 2, normalized.height / 2);
  const splashPosition = splash.followsProjectile
    ? projectilePosition
    : playerOrigin.subtract(centerOffset);

  useEffect(() => {
    if (!splashImage) return;

    isMounted.current = true;

    let frameCount = 0;
    const frameTotal = splashImage.getFrameCount();
    const frameDuration = splashImage.currentFrameDuration();

    const animateFrames = () => {
      if (!isMounted.current || !splashImage) return;

      splashImage.decodeNextFrame();
      frameCount = frameCount + 1;
      setSplashFrame(frameCount);

      if (frameCount < frameTotal) {
        frameTimerRef.current = setTimeout(animateFrames, frameDuration);
      } else {
        if (onComplete) {
          onComplete();
        }
      }
    };

    animateFrames();

    return () => {
      isMounted.current = false;
      if (frameTimerRef.current) {
        clearTimeout(frameTimerRef.current);
        frameTimerRef.current = null;
      }

      splashImage.dispose();
    };
  }, [splashImage, onComplete]);

  if (!splashImage) return null;

  return (
    <View
      style={{
        position: "absolute",
        left: splashPosition.x,
        top: splashPosition.y,
        width: normalized.width,
        height: normalized.height,
      }}
    >
      <Canvas style={{ width: normalized.width, height: normalized.height }}>
        <Image
          image={splashImage.getCurrentFrame()}
          x={0}
          y={0}
          width={normalized.width}
          height={normalized.height}
          fit="contain"
        />
      </Canvas>
    </View>
  );
};
