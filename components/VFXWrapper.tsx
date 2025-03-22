import { useScaling } from "@/hooks/scaling";
import { useRootStore } from "@/hooks/stores";
import { type EnemyAnimationStore } from "@/stores/EnemyAnimationStore";
import { PlayerSpriteAnimationSet } from "@/utility/types";
import { Vector2 } from "@/utility/Vec2";
import { VFXImageMap } from "@/utility/vfxmapping";
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

export const VFXWrapper = observer(({ children }: { children: ReactNode }) => {
  const { uiStore, enemyStore, playerAnimationStore } = useRootStore();
  const { memoizedCalculateRenderScaling } = useScaling();

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
      />
      {enemyAnimationStores.map((store) => (
        <EnemyVFX
          key={store.id}
          store={store}
          playerOrigin={playerAnimationStore.playerOrigin}
        />
      ))}
    </View>
  );
});

const PlayerVFX = observer(
  ({
    enemyPositions,
    playerOrigin,
  }: {
    enemyPositions: {
      enemyID: string;
      positionMidPoint: Vector2;
    }[];
    playerOrigin: Vector2;
  }) => {
    const { playerAnimationStore } = useRootStore();

    const animation = useMemo(() => {
      if (
        playerAnimationStore.animationSet &&
        "sprite" in playerAnimationStore.animationSet
      ) {
        return VFXImageMap[playerAnimationStore.animationSet.sprite];
      } else return null;
    }, [playerAnimationStore.animationSet]);

    if (!playerAnimationStore.animationSet) return null;
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
            <PlayerGlowVFX
              glow={playerAnimationStore.animationSet.glow}
              duration={playerAnimationStore.animationSet.duration}
              onComplete={() => playerAnimationStore.clearAnimation()}
            />
          )
        )}
      </>
    );
  },
);

// Updated placement handlers using enhanced Vector2 methods
const missilePlacementHandler = ({
  playerOrigin,
  normalized,
}: {
  playerOrigin: Vector2;
  normalized: { width: number; height: number };
}): Vector2 => {
  // Create an offset vector pointing up (for better visual alignment)
  const offset = Vector2.fromAngle(-Math.PI / 2, normalized.height * 0.1);
  // Add the offset to player origin and then adjust for sprite center
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
      // Place on the enemy position
      return targetPosition.subtract(centerOffset);

    case "field":
      // Place in the center between playerOrigin and the target using midpoint
      return playerOrigin.midpoint(targetPosition).subtract(centerOffset);

    case "self":
    default:
      // Place at playerOrigin with a slight upward offset for better visibility
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

  // For missile animation
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

  // Clean up resources
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

  // Handle frame animation
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

  // Handle missile movement animation using Vector2
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

const PlayerGlowVFX = ({
  glow,
  duration = 1000,
  onComplete,
}: {
  glow: ColorValue;
  duration?: number;
  onComplete: (() => void) | null;
}) => {
  const { uiStore } = useRootStore();
  const opacity = useRef(new Animated.Value(0)).current;

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

  return (
    <Animated.View
      style={{
        zIndex: 9999,
        width: uiStore.dimensions.width,
        height: uiStore.dimensions.height,
        position: "absolute",
        backgroundColor: glow,
        opacity: opacity,
      }}
    />
  );
};

const EnemyVFX = observer(
  ({
    store,
    playerOrigin,
  }: {
    store: EnemyAnimationStore;
    playerOrigin: Vector2;
  }) => {
    if (!store.projectileSet || !store.spriteMidPoint) return null;

    return (
      <>
        {store.projectileSet.projectile && (
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

  // Apply the same scaling logic as in AnimatedSprite
  const renderScaleCalc = memoizedCalculateRenderScaling(projectile.scale);

  // Calculate container size based on screen dimensions
  const containerSize = uiStore.dimensions.lesser * 0.5;

  // Calculate scale factors
  const scaleX = (containerSize / projectile.width) * renderScaleCalc;
  const scaleY = (containerSize / projectile.height) * renderScaleCalc;

  // Use the smaller scale to maintain aspect ratio
  const scale = Math.min(scaleX, scaleY);

  // Calculate normalized dimensions with proper scaling
  const normalized = useMemo(() => {
    return {
      height: projectile.height * scale,
      width: projectile.width * scale,
    };
  }, [projectile.height, projectile.width, scale]);

  // Use Vector2 for projectile position with center offset
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

    // Update projectile position with proper scaling
    setProjectilePosition(enemyOrigin.subtract(centerOffset));

    // Calculate movement vector using Vector2
    const moveVector = playerOrigin.subtract(enemyOrigin);

    // Create a bezier curve path for projectile
    const distance = moveVector.magnitude();
    const controlPoint = enemyOrigin
      .midpoint(playerOrigin)
      .add(Vector2.fromAngle(-Math.PI / 2, distance * 0.2)); // Arc upward

    // Calculate points along the bezier curve
    const steps = 10; // Number of points to sample
    const path = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Use quadratic bezier curve for smooth arc motion
      const point = Vector2.quadraticBezier(
        new Vector2(0, 0), // Start at origin (relative to current position)
        controlPoint.subtract(enemyOrigin), // Control point (relative)
        moveVector, // End point (relative)
        t,
      );
      path.push(point);
    }

    // Create a sequence of animations following the bezier path
    const segmentDuration = totalDuration / steps;

    // Create the animation sequence
    const animations = path.map((point, index) => {
      return Animated.timing(animXY, {
        toValue: point.toObject(),
        duration: segmentDuration,
        useNativeDriver: true,
      });
    });

    // Run the sequence
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

  // Calculate rotation angle to face the direction of movement
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
            // For sprites that face right by default, use the angle directly
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

  // Apply the same scaling logic as in AnimatedSprite
  const renderScaleCalc = memoizedCalculateRenderScaling(splash.scale);

  // Calculate container size based on screen dimensions
  const containerSize = uiStore.dimensions.lesser * 0.5;

  // Calculate scale factors
  const scaleX = (containerSize / splash.width) * renderScaleCalc;
  const scaleY = (containerSize / splash.height) * renderScaleCalc;

  // Use the smaller scale to maintain aspect ratio
  const scale = Math.min(scaleX, scaleY);

  // Calculate normalized dimensions with proper scaling
  const normalized = useMemo(() => {
    return {
      height: splash.height * scale,
      width: splash.width * scale,
    };
  }, [splash.height, splash.width, scale]);

  // Use Vector2 for splash position with center offset
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

    // Setup frame animation
    const animateFrames = () => {
      if (!isMounted.current || !splashImage) return;

      splashImage.decodeNextFrame();
      frameCount = frameCount + 1;
      setSplashFrame(frameCount);

      // Continue animation until we've gone through all frames
      if (frameCount < frameTotal) {
        frameTimerRef.current = setTimeout(animateFrames, frameDuration);
      } else {
        // Animation complete
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
