import { toJS } from "mobx";
import React, { type ReactNode, useCallback, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  cancelAnimation,
  Easing,
  type SharedValue,
} from "react-native-reanimated";
import { Image, ImageStyle } from "expo-image";
import { TILE_SIZE } from "@/stores/DungeonStore";
import { useRootStore } from "@/hooks/stores";
import { observer } from "mobx-react-lite";

const backgroundImages = {
  AbandonedValley: {
    imageSet: {
      0: require("@/assets/backgrounds/AbandonedValley/0.png"),
      1: require("@/assets/backgrounds/AbandonedValley/1.png"),
      2: require("@/assets/backgrounds/AbandonedValley/2.png"),
      3: require("@/assets/backgrounds/AbandonedValley/3.png"),
      4: require("@/assets/backgrounds/AbandonedValley/4.png"),
      5: require("@/assets/backgrounds/AbandonedValley/5.png"),
      6: require("@/assets/backgrounds/AbandonedValley/6.png"),
      7: require("@/assets/backgrounds/AbandonedValley/7.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.25,
  },
  AutumnForest: {
    imageSet: {
      0: require("@/assets/backgrounds/AutumnForest/0.png"),
      1: require("@/assets/backgrounds/AutumnForest/1.png"),
      2: require("@/assets/backgrounds/AutumnForest/2.png"),
      3: require("@/assets/backgrounds/AutumnForest/3.png"),
      4: require("@/assets/backgrounds/AutumnForest/4.png"),
    },
    size: { width: 960, height: 180 },
    verticalOffset: -0.3,
  },
  Castle_Atrium: {
    imageSet: {
      0: require("@/assets/backgrounds/Castle_Atrium/0.png"),
      1: require("@/assets/backgrounds/Castle_Atrium/1.png"),
      2: require("@/assets/backgrounds/Castle_Atrium/2.png"),
      3: require("@/assets/backgrounds/Castle_Atrium/3.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  Castle_Entrance: {
    imageSet: {
      0: require("@/assets/backgrounds/Castle_Entrance/0.png"),
      1: require("@/assets/backgrounds/Castle_Entrance/1.png"),
      2: require("@/assets/backgrounds/Castle_Entrance/2.png"),
      3: require("@/assets/backgrounds/Castle_Entrance/3.png"),
      4: require("@/assets/backgrounds/Castle_Entrance/4.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  Castle_Hall: {
    imageSet: {
      0: require("@/assets/backgrounds/Castle_Hall/0.png"),
      1: require("@/assets/backgrounds/Castle_Hall/1.png"),
      2: require("@/assets/backgrounds/Castle_Hall/2.png"),
      3: require("@/assets/backgrounds/Castle_Hall/3.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  Castle_Ramparts: {
    imageSet: {
      0: require("@/assets/backgrounds/Castle_Ramparts/0.png"),
      1: require("@/assets/backgrounds/Castle_Ramparts/1.png"),
      2: require("@/assets/backgrounds/Castle_Ramparts/2.png"),
      3: require("@/assets/backgrounds/Castle_Ramparts/3.png"),
      4: require("@/assets/backgrounds/Castle_Ramparts/4.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  Cave: {
    imageSet: {
      0: require("@/assets/backgrounds/Cave/0.png"),
      1: require("@/assets/backgrounds/Cave/1.png"),
      2: require("@/assets/backgrounds/Cave/2.png"),
      3: require("@/assets/backgrounds/Cave/3.png"),
      4: require("@/assets/backgrounds/Cave/4.png"),
      5: require("@/assets/backgrounds/Cave/5.png"),
      6: require("@/assets/backgrounds/Cave/6.png"),
      7: require("@/assets/backgrounds/Cave/7.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.25,
  },
  Cave_2: {
    imageSet: {
      0: require("@/assets/backgrounds/Cave_2/0.png"),
      1: require("@/assets/backgrounds/Cave_2/1.png"),
      2: require("@/assets/backgrounds/Cave_2/2.png"),
      3: require("@/assets/backgrounds/Cave_2/3.png"),
      4: require("@/assets/backgrounds/Cave_2/4.png"),
    },
    size: { width: 320, height: 64 },
    verticalOffset: -0.25,
  },
  Cemetary: {
    imageSet: {
      0: require("@/assets/backgrounds/Cemetary/0.png"),
      1: require("@/assets/backgrounds/Cemetary/1.png"),
      2: require("@/assets/backgrounds/Cemetary/2.png"),
      3: require("@/assets/backgrounds/Cemetary/3.png"),
      4: require("@/assets/backgrounds/Cemetary/4.png"),
    },
    size: { width: 320, height: 64 },
    verticalOffset: 0.45,
  },
  CrystalCave_1: {
    imageSet: {
      0: require("@/assets/backgrounds/CrystalCave_1/0.png"),
      1: require("@/assets/backgrounds/CrystalCave_1/1.png"),
      2: require("@/assets/backgrounds/CrystalCave_1/2.png"),
      3: require("@/assets/backgrounds/CrystalCave_1/3.png"),
      4: require("@/assets/backgrounds/CrystalCave_1/4.png"),
      5: require("@/assets/backgrounds/CrystalCave_1/5.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  CrystalCave_2: {
    imageSet: {
      0: require("@/assets/backgrounds/CrystalCave_2/0.png"),
      1: require("@/assets/backgrounds/CrystalCave_2/1.png"),
      2: require("@/assets/backgrounds/CrystalCave_2/2.png"),
      3: require("@/assets/backgrounds/CrystalCave_2/3.png"),
      4: require("@/assets/backgrounds/CrystalCave_2/4.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  CrystalCave_3: {
    imageSet: {
      0: require("@/assets/backgrounds/CrystalCave_3/0.png"),
      1: require("@/assets/backgrounds/CrystalCave_3/1.png"),
      2: require("@/assets/backgrounds/CrystalCave_3/2.png"),
      3: require("@/assets/backgrounds/CrystalCave_3/3.png"),
      4: require("@/assets/backgrounds/CrystalCave_3/4.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  CrystalCave_4: {
    imageSet: {
      0: require("@/assets/backgrounds/CrystalCave_4/0.png"),
      1: require("@/assets/backgrounds/CrystalCave_4/1.png"),
      2: require("@/assets/backgrounds/CrystalCave_4/2.png"),
      3: require("@/assets/backgrounds/CrystalCave_4/3.png"),
      4: require("@/assets/backgrounds/CrystalCave_4/4.png"),
      5: require("@/assets/backgrounds/CrystalCave_4/5.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  DeadForest: {
    imageSet: {
      0: require("@/assets/backgrounds/DeadForest/0.png"),
      1: require("@/assets/backgrounds/DeadForest/1.png"),
      2: require("@/assets/backgrounds/DeadForest/2.png"),
      3: require("@/assets/backgrounds/DeadForest/3.png"),
      4: require("@/assets/backgrounds/DeadForest/4.png"),
      5: require("@/assets/backgrounds/DeadForest/5.png"),
      6: require("@/assets/backgrounds/DeadForest/6.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.25,
  },
  DemonWoods: {
    imageSet: {
      0: require("@/assets/backgrounds/DemonWoods/0.png"),
      1: require("@/assets/backgrounds/DemonWoods/1.png"),
      2: require("@/assets/backgrounds/DemonWoods/2.png"),
      3: require("@/assets/backgrounds/DemonWoods/3.png"),
      4: require("@/assets/backgrounds/DemonWoods/4.png"),
    },
    size: { width: 480, height: 272 },
    verticalOffset: -0.25,
  },
  Dock: {
    imageSet: {
      0: require("@/assets/backgrounds/Dock/0.png"),
      1: require("@/assets/backgrounds/Dock/1.png"),
      2: require("@/assets/backgrounds/Dock/2.png"),
      3: require("@/assets/backgrounds/Dock/3.png"),
      4: require("@/assets/backgrounds/Dock/4.png"),
      5: require("@/assets/backgrounds/Dock/5.png"),
      6: require("@/assets/backgrounds/Dock/6.png"),
      7: require("@/assets/backgrounds/Dock/7.png"),
      8: require("@/assets/backgrounds/Dock/8.png"),
      9: require("@/assets/backgrounds/Dock/9.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.25,
  },
  Dungeon: {
    imageSet: {
      0: require("@/assets/backgrounds/Dungeon/0.png"),
      1: require("@/assets/backgrounds/Dungeon/1.png"),
      2: require("@/assets/backgrounds/Dungeon/2.png"),
      3: require("@/assets/backgrounds/Dungeon/3.png"),
      4: require("@/assets/backgrounds/Dungeon/4.png"),
    },
    size: { width: 320, height: 64 },
    verticalOffset: 0.45,
  },
  FallenKingdom: {
    imageSet: {
      0: require("@/assets/backgrounds/FallenKingdom/0.png"),
      1: require("@/assets/backgrounds/FallenKingdom/1.png"),
      2: require("@/assets/backgrounds/FallenKingdom/2.png"),
      3: require("@/assets/backgrounds/FallenKingdom/3.png"),
      4: require("@/assets/backgrounds/FallenKingdom/4.png"),
      5: require("@/assets/backgrounds/FallenKingdom/5.png"),
      6: require("@/assets/backgrounds/FallenKingdom/6.png"),
    },
    size: { width: 1280, height: 720 },
    verticalOffset: -0.05,
  },
  Forest: {
    imageSet: {
      0: require("@/assets/backgrounds/Forest/0.png"),
      1: require("@/assets/backgrounds/Forest/1.png"),
      2: require("@/assets/backgrounds/Forest/2.png"),
      3: require("@/assets/backgrounds/Forest/3.png"),
      4: require("@/assets/backgrounds/Forest/4.png"),
      5: require("@/assets/backgrounds/Forest/5.png"),
      6: require("@/assets/backgrounds/Forest/6.png"),
      7: require("@/assets/backgrounds/Forest/7.png"),
    },
    size: { width: 285, height: 131 },
    verticalOffset: -0.35,
  },
  Medieval: {
    imageSet: {
      0: require("@/assets/backgrounds/Medieval/0.png"),
      1: require("@/assets/backgrounds/Medieval/1.png"),
      2: require("@/assets/backgrounds/Medieval/2.png"),
      3: require("@/assets/backgrounds/Medieval/3.png"),
      4: require("@/assets/backgrounds/Medieval/4.png"),
    },
    size: { width: 320, height: 64 },
    verticalOffset: -0.45,
  },
  PineForest: {
    imageSet: {
      0: require("@/assets/backgrounds/PineForest/0.png"),
      1: require("@/assets/backgrounds/PineForest/1.png"),
      2: require("@/assets/backgrounds/PineForest/2.png"),
      3: require("@/assets/backgrounds/PineForest/3.png"),
      4: require("@/assets/backgrounds/PineForest/4.png"),
      5: require("@/assets/backgrounds/PineForest/5.png"),
      6: require("@/assets/backgrounds/PineForest/6.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.25,
  },
  Plains: {
    imageSet: {
      0: require("@/assets/backgrounds/Plains/0.png"),
      1: require("@/assets/backgrounds/Plains/1.png"),
      2: require("@/assets/backgrounds/Plains/2.png"),
      3: require("@/assets/backgrounds/Plains/3.png"),
      4: require("@/assets/backgrounds/Plains/4.png"),
      5: require("@/assets/backgrounds/Plains/5.png"),
      6: require("@/assets/backgrounds/Plains/6.png"),
      7: require("@/assets/backgrounds/Plains/7.png"),
      8: require("@/assets/backgrounds/Plains/8.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.4,
  },
  SnowyMountain: {
    imageSet: {
      0: require("@/assets/backgrounds/SnowyMountain/0.png"),
      1: require("@/assets/backgrounds/SnowyMountain/1.png"),
      2: require("@/assets/backgrounds/SnowyMountain/2.png"),
      3: require("@/assets/backgrounds/SnowyMountain/3.png"),
      4: require("@/assets/backgrounds/SnowyMountain/4.png"),
      5: require("@/assets/backgrounds/SnowyMountain/5.png"),
    },
    size: { width: 1920, height: 1080 },
    verticalOffset: 0.1,
  },
  SpiderLair: {
    imageSet: {
      0: require("@/assets/backgrounds/SpiderLair/0.png"),
      1: require("@/assets/backgrounds/SpiderLair/1.png"),
      2: require("@/assets/backgrounds/SpiderLair/2.png"),
      3: require("@/assets/backgrounds/SpiderLair/3.png"),
      4: require("@/assets/backgrounds/SpiderLair/4.png"),
      5: require("@/assets/backgrounds/SpiderLair/5.png"),
      6: require("@/assets/backgrounds/SpiderLair/6.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.25,
  },
  StormyMountain: {
    imageSet: {
      0: require("@/assets/backgrounds/StormyMountain/0.png"),
      1: require("@/assets/backgrounds/StormyMountain/1.png"),
      2: require("@/assets/backgrounds/StormyMountain/2.png"),
      3: require("@/assets/backgrounds/StormyMountain/3.png"),
      4: require("@/assets/backgrounds/StormyMountain/4.png"),
      5: require("@/assets/backgrounds/StormyMountain/5.png"),
      6: require("@/assets/backgrounds/StormyMountain/6.png"),
      7: require("@/assets/backgrounds/StormyMountain/7.png"),
      8: require("@/assets/backgrounds/StormyMountain/8.png"),
      9: require("@/assets/backgrounds/StormyMountain/9.png"),
      10: require("@/assets/backgrounds/StormyMountain/10.png"),
      11: require("@/assets/backgrounds/StormyMountain/11.png"),
    },
    size: { width: 1920, height: 1080 },
    verticalOffset: 0.15,
    effects: {
      rain: require("@/assets/backgrounds/StormyMountain/Stormy_Mountains_Rain.gif"),
    },
  },
};
export type ParallaxOptions = keyof typeof backgroundImages;

const NORMATIVE_WIDTH = 2160;

interface ParallaxEffectProps {
  effect: any;
  size: {
    width: number;
    height: number;
  };
  style?: StyleProp<ImageStyle>;
}
const ParallaxEffect = React.memo(
  ({ effect, size, style }: ParallaxEffectProps) => {
    return (
      <Image
        source={effect}
        style={[
          {
            position: "absolute",
            width: size.width,
            height: size.height,
          },
          style,
        ]}
        contentFit="cover"
      />
    );
  },
);

interface ParallaxLayerProps {
  imageSource: any;
  size: {
    width: number;
    height: number;
  };
  imagesNeeded: number;
  moveRate: number;
  scrollX: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  inCombat: boolean;
  scale: number;
  screenWidth: number;
  screenHeight: number;
  scaledWidth: number;
}

const ParallaxLayer = React.memo(
  ({
    imageSource,
    size,
    imagesNeeded,
    moveRate,
    scrollX,
    translateX,
    translateY,
    inCombat,
    scale,
    screenWidth,
    screenHeight,
    scaledWidth,
  }: ParallaxLayerProps) => {
    const animatedStyle = useAnimatedStyle(
      () => ({
        transform: [
          {
            translateX: inCombat
              ? scrollX.value * moveRate
              : translateX.value * moveRate,
          },
          {
            translateY: inCombat
              ? 0
              : (translateY.value / 2) * moveRate +
                (size.height * scale - screenHeight),
          },
          { scale },
        ],
      }),
      [moveRate, inCombat, scale],
    );

    const tileGroups = useMemo(
      () => [
        { offset: -size.width * imagesNeeded },
        { offset: 0 },
        { offset: size.width * imagesNeeded },
      ],
      [size.width, imagesNeeded],
    );

    return (
      <Animated.View
        style={[
          {
            width: size.width * imagesNeeded * 3,
            height: size.height,
            left: (screenWidth - scaledWidth) / 2,
            position: "absolute",
            backfaceVisibility: "hidden",
            ...Platform.select({
              android: { renderToHardwareTextureAndroid: true },
              ios: { shouldRasterizeIOS: true },
              web: { willChange: "transform" },
            }),
          },
          animatedStyle,
        ]}
      >
        {tileGroups.map((group, groupIndex) => (
          <View
            key={groupIndex}
            style={{
              position: "absolute",
              left: group.offset,
              width: size.width * imagesNeeded,
              height: size.height,
            }}
          >
            {Array.from({ length: imagesNeeded }).map((_, index) => (
              <Image
                key={index}
                source={imageSource}
                style={{
                  width: size.width,
                  height: size.height,
                  left: index * size.width,
                  position: "absolute",
                }}
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={`layer-${index}`}
              />
            ))}
          </View>
        ))}
      </Animated.View>
    );
  },
);

export const Parallax = observer(
  ({
    backgroundName,
    inCombat = false,
    reduceMotion = false,
    playerPosition,
    boundingBox,
    style,
    children,
  }: {
    backgroundName: ParallaxOptions;
    inCombat: boolean;
    reduceMotion: boolean;
    playerPosition: { x: number; y: number };
    boundingBox: {
      width: number;
      height: number;
      offsetX: number;
      offsetY: number;
    };
    style?: StyleProp<ViewStyle>;
    children: ReactNode;
  }) => {
    const { uiStore } = useRootStore();
    const scrollX = useSharedValue(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const lastMoveDirection = useSharedValue(1);

    const plainPlayerPosition = useMemo(
      () => toJS(playerPosition),
      [playerPosition],
    );
    const plainBoundingBox = useMemo(() => toJS(boundingBox), [boundingBox]);
    const plainInCombat = useMemo(() => toJS(inCombat), [inCombat]);
    const plainReduceMotion = useMemo(() => toJS(reduceMotion), [reduceMotion]);

    const backgroundData = backgroundImages[backgroundName];
    const { imageSet, size, verticalOffset } = backgroundData;
    const layerCount = Object.keys(imageSet).length - 1;

    const { scale, scaledWidth, scaledHeight, imagesNeeded } = useMemo(() => {
      const targetHeight = uiStore.dimensions.height;
      const scale = targetHeight / size.height;
      const scaledWidth = size.width * scale;
      const scaledHeight = targetHeight;
      const imagesNeeded = Math.max(3, Math.ceil(NORMATIVE_WIDTH / size.width));

      return { scale, scaledWidth, scaledHeight, imagesNeeded };
    }, [
      uiStore.dimensions.height,
      size.height,
      size.width,
      uiStore.isLandscape,
    ]);

    useEffect(() => {
      translateX.value = 0;
      translateY.value = 0;
      scrollX.value = 0;
    }, [
      uiStore.dimensions.width,
      uiStore.dimensions.height,
      uiStore.isLandscape,
    ]);

    useEffect(() => {
      if (plainInCombat) {
        const totalWidth = size.width * imagesNeeded;

        scrollX.value = withRepeat(
          withTiming(
            lastMoveDirection.value *
              -totalWidth *
              (NORMATIVE_WIDTH / size.width / 4),
            {
              duration: 10000 * imagesNeeded,
              easing: Easing.linear,
            },
          ),
          -1,
          true,
        );

        return () => {
          cancelAnimation(scrollX);
          scrollX.value = 0;
        };
      }
    }, [
      plainInCombat,
      imagesNeeded,
      size.width,
      lastMoveDirection,
      uiStore.isLandscape,
    ]);

    useEffect(() => {
      if (!plainInCombat) {
        const relativeX =
          plainPlayerPosition.x -
          plainBoundingBox.offsetX -
          plainBoundingBox.width / 2;

        if (translateX.value !== -relativeX) {
          if (-relativeX > translateX.value) {
            lastMoveDirection.value = -1;
          } else if (-relativeX < translateX.value) {
            lastMoveDirection.value = 1;
          }
        }

        const relativeY = plainPlayerPosition.y - plainBoundingBox.offsetY;
        const boundingBoxVerticalCenter =
          plainBoundingBox.height - TILE_SIZE / 2;
        const verticalOffsetCalc = boundingBoxVerticalCenter - relativeY;

        translateX.value = withSpring(-relativeX, {
          damping: 20,
          stiffness: 90,
          mass: 1,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        });

        translateY.value = withSpring(verticalOffsetCalc, {
          damping: 20,
          stiffness: 90,
          mass: 1,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        });
      }
    }, [
      plainPlayerPosition,
      plainBoundingBox,
      plainInCombat,
      uiStore.isLandscape,
    ]);

    const renderLayers = useCallback(() => {
      const layers = [];
      for (let i = layerCount; i >= 1; i--) {
        const moveRate = 1 - (i - 1) / layerCount;

        layers.push(
          <ParallaxLayer
            key={i}
            imageSource={imageSet[i]}
            size={size}
            imagesNeeded={imagesNeeded}
            moveRate={moveRate}
            scrollX={scrollX}
            translateX={translateX}
            translateY={translateY}
            inCombat={plainInCombat}
            scale={scale}
            screenWidth={uiStore.dimensions.width}
            screenHeight={uiStore.dimensions.height}
            scaledWidth={scaledWidth}
          />,
        );
      }
      return layers;
    }, [
      layerCount,
      imageSet,
      size,
      imagesNeeded,
      scrollX,
      translateX,
      translateY,
      plainInCombat,
      scale,
      uiStore.isLandscape,
      uiStore.dimensions.width,
      uiStore.dimensions.height,
      scaledWidth,
    ]);

    const renderEffects = useCallback(() => {
      const bgSet = backgroundImages[backgroundName];
      if ("effects" in bgSet) {
        const { effects } = bgSet;

        return Object.entries(effects).map(([effectName, effectSource]) => (
          <ParallaxEffect
            key={effectName}
            effect={effectSource}
            size={size}
            style={{
              transform: [{ scale }],
              left: (uiStore.dimensions.width - scaledWidth) / 2,
            }}
          />
        ));
      }
      return null;
    }, [backgroundName, size, scale, uiStore.dimensions.width, scaledWidth]);

    const backgroundContent = useMemo(() => {
      if (plainReduceMotion) {
        return (
          <Image
            source={imageSet[0]}
            style={{
              width: scaledWidth,
              height: scaledHeight,
              top: -(scaledHeight - uiStore.dimensions.height) / 2,
              left: (uiStore.dimensions.width - scaledWidth) / 2,
              position: "absolute",
            }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        );
      } else {
        return renderLayers();
      }
    }, [
      plainReduceMotion,
      imageSet,
      scaledWidth,
      scaledHeight,
      uiStore.dimensions.height,
      uiStore.dimensions.width,
      renderLayers,
    ]);

    const effectsContent = useMemo(() => {
      if (!plainReduceMotion) {
        return renderEffects();
      }
      return null;
    }, [plainReduceMotion, renderEffects]);

    return (
      <View style={[{ flex: 1 }, style]}>
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            height: uiStore.dimensions.height,
            marginTop:
              !plainReduceMotion && !uiStore.isLandscape
                ? -verticalOffset * uiStore.dimensions.height
                : undefined,
            bottom: 0,
          }}
        >
          {backgroundContent}
          {effectsContent}
        </View>
        <View
          style={{
            paddingTop: uiStore.headerHeight,
            flex: 1,
          }}
        >
          {children}
        </View>
      </View>
    );
  },
);
