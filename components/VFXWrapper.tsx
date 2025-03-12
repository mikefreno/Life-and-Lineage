import { useRootStore } from "@/hooks/stores";
import { normalize } from "@/hooks/styles";
import { type EnemyAnimationStore } from "@/stores/EnemyAnimationStore";
import { VFXImageMap } from "@/utility/vfxmapping";
import { Canvas, Image, useAnimatedImage } from "@shopify/react-native-skia";
import { observer } from "mobx-react-lite";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ReactNode } from "react";
import { Animated, View } from "react-native";

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
  }, [enemyStore.animationStoreMap.entries, enemyStore.animationStoreMap.keys]);

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
        <EnemySourcedVFX
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
    const { uiStore, playerAnimationStore } = useRootStore();

    const [currentFrame, setCurrentFrame] = useState(0);
    const [sourceImage, setSourceImage] = useState<any>(null);
    const [animationDimensions, setAnimationDimensions] = useState({
      width: 0,
      height: 0,
    });
    const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });
    const [isAnimating, setIsAnimating] = useState(false);
    const [opacity, setOpacity] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState(1);

    const animatedImage = useAnimatedImage(sourceImage);
    const frameTimerRef = useRef<NodeJS.Timeout | null>(null);
    const positionTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isMounted = useRef(true);

    const completeAnimation = useCallback(() => {
      if (!isMounted.current) return;

      if (frameTimerRef.current) {
        clearTimeout(frameTimerRef.current);
        frameTimerRef.current = null;
      }
      if (positionTimerRef.current) {
        clearTimeout(positionTimerRef.current);
        positionTimerRef.current = null;
      }

      setIsAnimating(false);
      setCurrentFrame(0);
      setOpacity(0);

      if (playerAnimationStore.animationPromiseResolver) {
        playerAnimationStore.animationPromiseResolver();
        playerAnimationStore.animationPromiseResolver = null;
      }
      playerAnimationStore.clearAnimation();

      if (animatedImage) {
        animatedImage.dispose();
      }
    }, [playerAnimationStore, animatedImage]);

    useEffect(() => {
      if (!playerAnimationStore.animationSet || enemyPositions.length === 0)
        return;

      let targetPos: { x: number; y: number };

      if ("glow" in playerAnimationStore.animationSet) {
        // Handle glow animation (simplified for now)
        const position = playerAnimationStore.animationSet.position;

        if (position === "enemy" && playerAnimationStore.target) {
          const targetEnemy = enemyPositions.find(
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
          targetPos = {
            x: uiStore.dimensions.width / 2,
            y: uiStore.dimensions.height / 2,
          };
        }

        setTimeout(() => {
          completeAnimation();
        }, 1000);

        return;
      }

      const animSet = playerAnimationStore.animationSet;
      const position = animSet.position;

      if (position === "enemy" && playerAnimationStore.target) {
        const targetEnemy = enemyPositions.find(
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
        targetPos = {
          x: uiStore.dimensions.width / 2,
          y: uiStore.dimensions.height / 2,
        };
      }

      const vfx = VFXImageMap[animSet.sprite];

      setSourceImage(vfx.source);
      setAnimationDimensions({
        width: vfx.width,
        height: vfx.height,
      });

      const frames = animatedImage?.getFrameCount() ?? 5;
      const frameDuration = animatedImage?.currentFrameDuration() ?? 100;
      const animationDuration = frames * frameDuration;

      switch (animSet.style) {
        case "missile":
          const angle =
            Math.atan2(
              targetPos.y - playerOrigin.y,
              targetPos.x - playerOrigin.x,
            ) *
            (180 / Math.PI);

          setRotation(angle);
          setAnimationPosition({
            x: playerOrigin.x - vfx.width / 2,
            y: playerOrigin.y - vfx.height / 2,
          });
          setOpacity(1);
          setIsAnimating(true);

          const steps = 20;
          const stepDuration = animationDuration / steps;
          let currentStep = 0;

          const moveStep = () => {
            if (!isMounted.current) return;

            currentStep++;
            const progress = currentStep / steps;

            const newX =
              playerOrigin.x +
              (targetPos.x - playerOrigin.x) * progress -
              vfx.width / 2;
            const newY =
              playerOrigin.y +
              (targetPos.y - playerOrigin.y) * progress -
              vfx.height / 2;

            setAnimationPosition({ x: newX, y: newY });

            if (progress < 0.1) {
              setOpacity(progress * 10);
            } else if (progress > 0.9) {
              setOpacity((1 - progress) * 10);
            }

            if (currentStep < steps) {
              positionTimerRef.current = setTimeout(moveStep, stepDuration);
            }
          };

          positionTimerRef.current = setTimeout(moveStep, stepDuration);
          break;

        case "static":
          setAnimationPosition({
            x: targetPos.x - vfx.width / 2,
            y: targetPos.y - vfx.height / 2,
          });
          setRotation(0);
          setOpacity(1);
          setIsAnimating(true);
          break;

        case "span":
          const distance = Math.sqrt(
            Math.pow(targetPos.x - playerOrigin.x, 2) +
              Math.pow(targetPos.y - playerOrigin.y, 2),
          );

          const spanAngle =
            Math.atan2(
              targetPos.y - playerOrigin.y,
              targetPos.x - playerOrigin.x,
            ) *
            (180 / Math.PI);

          setAnimationPosition({
            x: playerOrigin.x,
            y: playerOrigin.y - vfx.height / 2,
          });
          setRotation(spanAngle);
          setOpacity(1);
          setIsAnimating(true);

          const scaleSteps = 20;
          const scaleStepDuration = animationDuration / scaleSteps;
          let currentScaleStep = 0;

          const scaleStep = () => {
            if (!isMounted.current) return;

            currentScaleStep++;
            const progress = currentScaleStep / scaleSteps;

            if (progress <= 0.5) {
              setScale(progress * 2 * (distance / vfx.width));
            } else {
              setScale((1 - (progress - 0.5) * 2) * (distance / vfx.width));
            }

            if (progress < 0.2) {
              setOpacity(progress * 5);
            } else if (progress > 0.8) {
              setOpacity((1 - progress) * 5);
            }

            if (currentScaleStep < scaleSteps) {
              positionTimerRef.current = setTimeout(
                scaleStep,
                scaleStepDuration,
              );
            }
          };

          positionTimerRef.current = setTimeout(scaleStep, scaleStepDuration);
          break;
      }

      let frameCount = 0;

      const animateFrame = () => {
        if (!isMounted.current) return;

        frameCount++;
        setCurrentFrame(frameCount);

        if (frameCount >= frames - 1) {
          setTimeout(completeAnimation, 50);
          return;
        }

        frameTimerRef.current = setTimeout(animateFrame, frameDuration);
      };

      frameTimerRef.current = setTimeout(animateFrame, frameDuration);

      return () => {
        if (frameTimerRef.current) {
          clearTimeout(frameTimerRef.current);
        }
        if (positionTimerRef.current) {
          clearTimeout(positionTimerRef.current);
        }
        animatedImage?.dispose();
      };
    }, [playerAnimationStore.animationSet, enemyPositions, completeAnimation]);

    useEffect(() => {
      isMounted.current = true;

      return () => {
        isMounted.current = false;
        if (frameTimerRef.current) {
          clearTimeout(frameTimerRef.current);
        }
        if (positionTimerRef.current) {
          clearTimeout(positionTimerRef.current);
        }
        if (animatedImage) {
          animatedImage.dispose();
        }
      };
    }, []);

    if (!isAnimating || !sourceImage || !animatedImage) {
      return null;
    }

    return (
      <View
        style={{
          position: "absolute",
          left: animationPosition.x,
          top: animationPosition.y,
          width: animationDimensions.width,
          height: animationDimensions.height,
          opacity: opacity,
          transform: [{ rotate: `${rotation}deg` }, { scaleX: scale }],
        }}
      >
        <Canvas
          style={{
            width: animationDimensions.width,
            height: animationDimensions.height,
          }}
        >
          <Image
            image={animatedImage.getCurrentFrame()}
            x={0}
            y={0}
            width={animationDimensions.width}
            height={animationDimensions.height}
            fit="contain"
          />
        </Canvas>
      </View>
    );
  },
);

const EnemySourcedVFX = observer(
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
    const animXY = new Animated.ValueXY({
      x: enemyOrigin.x - normalized.width / 2,
      y: enemyOrigin.y - normalized.height / 2,
    });

    animXY.addListener(({ x, y }) => {
      if (isMounted.current) {
        setProjectilePosition({ x, y });
      }
    });

    animationRef.current = Animated.timing(animXY, {
      toValue: {
        x: playerOrigin.x - normalized.width / 2,
        y: playerOrigin.y - normalized.height / 2,
      },
      duration: totalDuration,
      useNativeDriver: false,
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
      animXY.removeAllListeners();

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
      <View
        style={{
          position: "absolute",
          left: projectilePosition.x,
          top: projectilePosition.y,
          width: normalized.width,
          height: normalized.height,
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
      </View>

      {splash && (showSplash || splash.followsProjectile) && (
        <SplashEffect
          splash={splash}
          projectilePosition={projectilePosition}
          playerOrigin={playerOrigin}
          onComplete={() => {
            setAnimationComplete(true);
          }}
        />
      )}
    </>
  );
};

// Separate component for splash animation
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
