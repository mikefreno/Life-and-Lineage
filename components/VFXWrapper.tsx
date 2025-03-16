import { useRootStore } from "@/hooks/stores";
import { normalize } from "@/hooks/styles";
import { type EnemyAnimationStore } from "@/stores/EnemyAnimationStore";
import { PlayerSpriteAnimationSet } from "@/utility/types";
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
      {children}
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
      positionMidPoint: { x: number; y: number };
    }[];
    playerOrigin: { x: number; y: number };
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

    useEffect(() => console.log(animation), [animation]);

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
              placement={playerAnimationStore.animationSet.position}
              onComplete={playerAnimationStore.animationPromiseResolver}
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
  playerOrigin: { x: number; y: number };
  normalized: { width: number; height: number };
}) => {
  return {
    x: playerOrigin.x - normalized.width / 2,
    y: playerOrigin.y - normalized.height / 2,
  };
};

const staticPlacementHandler = ({
  playerOrigin,
  normalized,
  targetPosition,
  position,
}: {
  playerOrigin: { x: number; y: number };
  normalized: { width: number; height: number };
  targetPosition: { x: number; y: number };
  position: "enemy" | "field" | "self";
}) => {
  switch (position) {
    case "enemy":
      // Place on the enemy position
      return {
        x: targetPosition.x - normalized.width / 2,
        y: targetPosition.y - normalized.height / 2,
      };
    case "field":
      // Place in the center between playerOrigin and the target
      return {
        x: (playerOrigin.x + targetPosition.x) / 2 - normalized.width / 2,
        y: (playerOrigin.y + targetPosition.y) / 2 - normalized.height / 2,
      };
    case "self":
    default:
      // Place at playerOrigin (lowered y for better visibility)
      return {
        x: playerOrigin.x - normalized.width / 2,
        y: playerOrigin.y - normalized.height - 20,
      };
  }
};

const spanPlacementHandler = ({
  playerOrigin,
  normalized,
}: {
  playerOrigin: { x: number; y: number };
  normalized: { width: number; height: number };
}) => {
  // For span style, we'll return the position and calculate rotation/scaling separately
  return {
    x: playerOrigin.x - normalized.width / 2,
    y: playerOrigin.y - normalized.height / 2,
  };
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
    frames: number;
    height: number;
    width: number;
    scale?: number;
  };
  enemyPositions: {
    enemyID: string;
    positionMidPoint: {
      x: number;
      y: number;
    };
  }[];
  playerOrigin: {
    x: number;
    y: number;
  };
  set: PlayerSpriteAnimationSet;
  onComplete: (() => void) | null;
}) => {
  const animatedImage = useAnimatedImage(animation.source);
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameRef = useRef(0);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // For missile animation
  const animXY = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const normalized = useMemo(() => {
    return {
      height: normalize(animation.height * (animation.scale ?? 1)),
      width: normalize(animation.width * (animation.scale ?? 1)),
    };
  }, [animation.height, animation.width]);

  const targetPosition = useMemo(() => {
    return enemyPositions.length > 0
      ? enemyPositions[0].positionMidPoint
      : { x: playerOrigin.x, y: playerOrigin.y - 100 };
  }, [enemyPositions, playerOrigin]);

  // Calculate initial position based on style
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

  // Calculate angle and distance for span style
  const spanCalculations = useMemo(() => {
    if (set.style !== "span") return null;

    const dx = targetPosition.x - playerOrigin.x;
    const dy = targetPosition.y - playerOrigin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

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

    const frameCount = animatedImage.getFrameCount();
    const frameDuration = animatedImage.currentFrameDuration();

    const advanceFrame = () => {
      if (!animatedImage || !isMounted.current) return;

      try {
        animatedImage.decodeNextFrame();
        frameRef.current = (frameRef.current + 1) % frameCount;
        safeSetCurrentFrame(frameRef.current);

        if (frameRef.current === 0) {
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

  // Handle missile movement animation
  useEffect(() => {
    if (!animatedImage || set.style !== "missile") return;

    const frameCount = animatedImage.getFrameCount();
    const frameDuration = animatedImage.currentFrameDuration();
    const totalDuration = frameCount * frameDuration;

    const distanceX = targetPosition.x - playerOrigin.x;
    const distanceY = targetPosition.y - playerOrigin.y;

    animXY.setValue({ x: 0, y: 0 });

    animationRef.current = Animated.timing(animXY, {
      toValue: { x: distanceX, y: distanceY },
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
            { translateY: normalized.height / 2 },
          ],
        }}
      >
        <Canvas style={{ width: normalized.width, height: normalized.height }}>
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
    return (
      <Animated.View
        style={{
          position: "absolute",
          left: initialPosition.x,
          top: initialPosition.y,
          width: normalized.width,
          height: normalized.height,
          transform: [{ translateX: animXY.x }, { translateY: animXY.y }],
        }}
      >
        <Canvas style={{ width: normalized.width, height: normalized.height }}>
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
    // Static style
    return (
      <View
        style={{
          position: "absolute",
          left: initialPosition.x,
          top: initialPosition.y,
          width: normalized.width,
          height: normalized.height,
        }}
      >
        <Canvas style={{ width: normalized.width, height: normalized.height }}>
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
  placement,
  onComplete,
}: {
  glow: ColorValue;
  placement: "enemy" | "field" | "self";
  onComplete: (() => void) | null;
}) => {
  return <View></View>;
};

const EnemyVFX = observer(
  ({
    store,
    playerOrigin,
  }: {
    store: EnemyAnimationStore;
    playerOrigin: { x: number; y: number };
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
  };
  enemyOrigin: { x: number; y: number };
  playerOrigin: { x: number; y: number };
  splash?: {
    anim: any;
    height: number;
    width: number;
    scale?: number;
    followsProjectile: boolean;
  };
  onComplete: () => void;
}) => {
  const projectileImage = useAnimatedImage(projectile.anim);
  const [projectileFrame, setProjectileFrame] = useState(0);
  const [projectilePosition, setProjectilePosition] = useState({
    x: enemyOrigin.x,
    y: enemyOrigin.y,
  });
  const [showSplash, setShowSplash] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const frameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  const animXY = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const normalized = useMemo(() => {
    return {
      height: normalize(projectile.height * (projectile.scale ?? 1)),
      width: normalize(projectile.width * (projectile.scale ?? 1)),
    };
  }, [projectile.height, projectile.width]);

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

    setProjectilePosition({
      x: enemyOrigin.x - normalized.width / 2,
      y: enemyOrigin.y - normalized.height / 2,
    });

    const distanceX = playerOrigin.x - enemyOrigin.x;
    const distanceY = playerOrigin.y - enemyOrigin.y;

    animationRef.current = Animated.timing(animXY, {
      toValue: { x: distanceX, y: distanceY },
      duration: totalDuration,
      useNativeDriver: true,
    });

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

  return (
    <>
      <Animated.View
        style={{
          position: "absolute",
          left: projectilePosition.x,
          top: projectilePosition.y,
          width: normalized.width,
          height: normalized.height,
          transform: [{ translateX: animXY.x }, { translateY: animXY.y }],
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
            projectilePosition={{
              x: projectilePosition.x,
              y: projectilePosition.y,
            }}
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
  projectilePosition: { x: number; y: number };
  playerOrigin: { x: number; y: number };
  onComplete: () => void;
}) => {
  const splashImage = useAnimatedImage(splash.anim);
  const [splashFrame, setSplashFrame] = useState(0);
  const frameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const normalized = useMemo(() => {
    return {
      height: normalize(splash.height * (splash.scale ?? 1)),
      width: normalize(splash.width * (splash.scale ?? 1)),
    };
  }, [splash.height, splash.width]);

  const splashPosition = splash.followsProjectile
    ? projectilePosition
    : {
        x: playerOrigin.x - splash.width / 2,
        y: playerOrigin.y - splash.height / 2,
      };

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
