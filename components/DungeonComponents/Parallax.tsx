import { toJS } from "mobx";
import React, { type ReactNode, useEffect } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { TILE_SIZE } from "../../stores/DungeonStore";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRootStore } from "@/hooks/stores";

const backgroundImages = {
  AbandonedValley: {
    imageSet: {
      0: require("../../assets/backgrounds/AbandonedValley/0.png"),
      1: require("../../assets/backgrounds/AbandonedValley/1.png"),
      2: require("../../assets/backgrounds/AbandonedValley/2.png"),
      3: require("../../assets/backgrounds/AbandonedValley/3.png"),
      4: require("../../assets/backgrounds/AbandonedValley/4.png"),
      5: require("../../assets/backgrounds/AbandonedValley/5.png"),
      6: require("../../assets/backgrounds/AbandonedValley/6.png"),
      7: require("../../assets/backgrounds/AbandonedValley/7.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.25,
  },
  AutumnForest: {
    imageSet: {
      0: require("../../assets/backgrounds/AutumnForest/0.png"),
      1: require("../../assets/backgrounds/AutumnForest/1.png"),
      2: require("../../assets/backgrounds/AutumnForest/2.png"),
      3: require("../../assets/backgrounds/AutumnForest/3.png"),
      4: require("../../assets/backgrounds/AutumnForest/4.png"),
    },
    size: { width: 960, height: 180 },
    verticalOffset: -0.3,
  },
  Castle_Atrium: {
    imageSet: {
      0: require("../../assets/backgrounds/Castle_Atrium/0.png"),
      1: require("../../assets/backgrounds/Castle_Atrium/1.png"),
      2: require("../../assets/backgrounds/Castle_Atrium/2.png"),
      3: require("../../assets/backgrounds/Castle_Atrium/3.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  Castle_Entrance: {
    imageSet: {
      0: require("../../assets/backgrounds/Castle_Entrance/0.png"),
      1: require("../../assets/backgrounds/Castle_Entrance/1.png"),
      2: require("../../assets/backgrounds/Castle_Entrance/2.png"),
      3: require("../../assets/backgrounds/Castle_Entrance/3.png"),
      4: require("../../assets/backgrounds/Castle_Entrance/4.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  Castle_Hall: {
    imageSet: {
      0: require("../../assets/backgrounds/Castle_Hall/0.png"),
      1: require("../../assets/backgrounds/Castle_Hall/1.png"),
      2: require("../../assets/backgrounds/Castle_Hall/2.png"),
      3: require("../../assets/backgrounds/Castle_Hall/3.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  Castle_Ramparts: {
    imageSet: {
      0: require("../../assets/backgrounds/Castle_Ramparts/0.png"),
      1: require("../../assets/backgrounds/Castle_Ramparts/1.png"),
      2: require("../../assets/backgrounds/Castle_Ramparts/2.png"),
      3: require("../../assets/backgrounds/Castle_Ramparts/3.png"),
      4: require("../../assets/backgrounds/Castle_Ramparts/4.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  Cave: {
    imageSet: {
      0: require("../../assets/backgrounds/Cave/0.png"),
      1: require("../../assets/backgrounds/Cave/1.png"),
      2: require("../../assets/backgrounds/Cave/2.png"),
      3: require("../../assets/backgrounds/Cave/3.png"),
      4: require("../../assets/backgrounds/Cave/4.png"),
      5: require("../../assets/backgrounds/Cave/5.png"),
      6: require("../../assets/backgrounds/Cave/6.png"),
      7: require("../../assets/backgrounds/Cave/7.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.25,
  },
  Cave_2: {
    imageSet: {
      0: require("../../assets/backgrounds/Cave_2/0.png"),
      1: require("../../assets/backgrounds/Cave_2/1.png"),
      2: require("../../assets/backgrounds/Cave_2/2.png"),
      3: require("../../assets/backgrounds/Cave_2/3.png"),
      4: require("../../assets/backgrounds/Cave_2/4.png"),
    },
    size: { width: 320, height: 64 },
    verticalOffset: 0.45,
  },
  Cemetary: {
    imageSet: {
      0: require("../../assets/backgrounds/Cemetary/0.png"),
      1: require("../../assets/backgrounds/Cemetary/1.png"),
      2: require("../../assets/backgrounds/Cemetary/2.png"),
      3: require("../../assets/backgrounds/Cemetary/3.png"),
      4: require("../../assets/backgrounds/Cemetary/4.png"),
    },
    size: { width: 320, height: 64 },
    verticalOffset: 0.45,
  },
  CrystalCave_1: {
    imageSet: {
      0: require("../../assets/backgrounds/CrystalCave_1/0.png"),
      1: require("../../assets/backgrounds/CrystalCave_1/1.png"),
      2: require("../../assets/backgrounds/CrystalCave_1/2.png"),
      3: require("../../assets/backgrounds/CrystalCave_1/3.png"),
      4: require("../../assets/backgrounds/CrystalCave_1/4.png"),
      5: require("../../assets/backgrounds/CrystalCave_1/5.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  CrystalCave_2: {
    imageSet: {
      0: require("../../assets/backgrounds/CrystalCave_2/0.png"),
      1: require("../../assets/backgrounds/CrystalCave_2/1.png"),
      2: require("../../assets/backgrounds/CrystalCave_2/2.png"),
      3: require("../../assets/backgrounds/CrystalCave_2/3.png"),
      4: require("../../assets/backgrounds/CrystalCave_2/4.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  CrystalCave_3: {
    imageSet: {
      0: require("../../assets/backgrounds/CrystalCave_3/0.png"),
      1: require("../../assets/backgrounds/CrystalCave_3/1.png"),
      2: require("../../assets/backgrounds/CrystalCave_3/2.png"),
      3: require("../../assets/backgrounds/CrystalCave_3/3.png"),
      4: require("../../assets/backgrounds/CrystalCave_3/4.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  CrystalCave_4: {
    imageSet: {
      0: require("../../assets/backgrounds/CrystalCave_4/0.png"),
      1: require("../../assets/backgrounds/CrystalCave_4/1.png"),
      2: require("../../assets/backgrounds/CrystalCave_4/2.png"),
      3: require("../../assets/backgrounds/CrystalCave_4/3.png"),
      4: require("../../assets/backgrounds/CrystalCave_4/4.png"),
      5: require("../../assets/backgrounds/CrystalCave_4/5.png"),
    },
    size: { width: 576, height: 324 },
    verticalOffset: -0.3,
  },
  DeadForest: {
    imageSet: {
      0: require("../../assets/backgrounds/DeadForest/0.png"),
      1: require("../../assets/backgrounds/DeadForest/1.png"),
      2: require("../../assets/backgrounds/DeadForest/2.png"),
      3: require("../../assets/backgrounds/DeadForest/3.png"),
      4: require("../../assets/backgrounds/DeadForest/4.png"),
      5: require("../../assets/backgrounds/DeadForest/5.png"),
      6: require("../../assets/backgrounds/DeadForest/6.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.25,
  },
  DemonWoods: {
    imageSet: {
      0: require("../../assets/backgrounds/DemonWoods/0.png"),
      1: require("../../assets/backgrounds/DemonWoods/1.png"),
      2: require("../../assets/backgrounds/DemonWoods/2.png"),
      3: require("../../assets/backgrounds/DemonWoods/3.png"),
      4: require("../../assets/backgrounds/DemonWoods/4.png"),
    },
    size: { width: 480, height: 272 },
    verticalOffset: -0.25,
  },
  Dock: {
    imageSet: {
      0: require("../../assets/backgrounds/Dock/0.png"),
      1: require("../../assets/backgrounds/Dock/1.png"),
      2: require("../../assets/backgrounds/Dock/2.png"),
      3: require("../../assets/backgrounds/Dock/3.png"),
      4: require("../../assets/backgrounds/Dock/4.png"),
      5: require("../../assets/backgrounds/Dock/5.png"),
      6: require("../../assets/backgrounds/Dock/6.png"),
      7: require("../../assets/backgrounds/Dock/7.png"),
      8: require("../../assets/backgrounds/Dock/8.png"),
      9: require("../../assets/backgrounds/Dock/9.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.25,
  },
  Dungeon: {
    imageSet: {
      0: require("../../assets/backgrounds/Dungeon/0.png"),
      1: require("../../assets/backgrounds/Dungeon/1.png"),
      2: require("../../assets/backgrounds/Dungeon/2.png"),
      3: require("../../assets/backgrounds/Dungeon/3.png"),
      4: require("../../assets/backgrounds/Dungeon/4.png"),
    },
    size: { width: 320, height: 64 },
    verticalOffset: 0.45,
  },
  FallenKingdom: {
    imageSet: {
      0: require("../../assets/backgrounds/FallenKingdom/0.png"),
      1: require("../../assets/backgrounds/FallenKingdom/1.png"),
      2: require("../../assets/backgrounds/FallenKingdom/2.png"),
      3: require("../../assets/backgrounds/FallenKingdom/3.png"),
      4: require("../../assets/backgrounds/FallenKingdom/4.png"),
      5: require("../../assets/backgrounds/FallenKingdom/5.png"),
      6: require("../../assets/backgrounds/FallenKingdom/6.png"),
    },
    size: { width: 1280, height: 720 },
    verticalOffset: -0.05,
  },
  Forest: {
    imageSet: {
      0: require("../../assets/backgrounds/Forest/0.png"),
      1: require("../../assets/backgrounds/Forest/1.png"),
      2: require("../../assets/backgrounds/Forest/2.png"),
      3: require("../../assets/backgrounds/Forest/3.png"),
      4: require("../../assets/backgrounds/Forest/4.png"),
      5: require("../../assets/backgrounds/Forest/5.png"),
      6: require("../../assets/backgrounds/Forest/6.png"),
      7: require("../../assets/backgrounds/Forest/7.png"),
    },
    size: { width: 285, height: 131 },
    verticalOffset: -0.35,
  },
  Medieval: {
    imageSet: {
      0: require("../../assets/backgrounds/Medieval/0.png"),
      1: require("../../assets/backgrounds/Medieval/1.png"),
      2: require("../../assets/backgrounds/Medieval/2.png"),
      3: require("../../assets/backgrounds/Medieval/3.png"),
      4: require("../../assets/backgrounds/Medieval/4.png"),
    },
    size: { width: 320, height: 64 },
    verticalOffset: -0.45,
  },
  PineForest: {
    imageSet: {
      0: require("../../assets/backgrounds/PineForest/0.png"),
      1: require("../../assets/backgrounds/PineForest/1.png"),
      2: require("../../assets/backgrounds/PineForest/2.png"),
      3: require("../../assets/backgrounds/PineForest/3.png"),
      4: require("../../assets/backgrounds/PineForest/4.png"),
      5: require("../../assets/backgrounds/PineForest/5.png"),
      6: require("../../assets/backgrounds/PineForest/6.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.25,
  },
  Plains: {
    imageSet: {
      0: require("../../assets/backgrounds/Plains/0.png"),
      1: require("../../assets/backgrounds/Plains/1.png"),
      2: require("../../assets/backgrounds/Plains/2.png"),
      3: require("../../assets/backgrounds/Plains/3.png"),
      4: require("../../assets/backgrounds/Plains/4.png"),
      5: require("../../assets/backgrounds/Plains/5.png"),
      6: require("../../assets/backgrounds/Plains/6.png"),
      7: require("../../assets/backgrounds/Plains/7.png"),
      8: require("../../assets/backgrounds/Plains/8.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.25,
  },
  SnowyMountain: {
    imageSet: {
      0: require("../../assets/backgrounds/SnowyMountain/0.png"),
      1: require("../../assets/backgrounds/SnowyMountain/1.png"),
      2: require("../../assets/backgrounds/SnowyMountain/2.png"),
      3: require("../../assets/backgrounds/SnowyMountain/3.png"),
      4: require("../../assets/backgrounds/SnowyMountain/4.png"),
      5: require("../../assets/backgrounds/SnowyMountain/5.png"),
    },
    size: { width: 1920, height: 1080 },
    verticalOffset: 0.1,
  },
  SpiderLair: {
    imageSet: {
      0: require("../../assets/backgrounds/SpiderLair/0.png"),
      1: require("../../assets/backgrounds/SpiderLair/1.png"),
      2: require("../../assets/backgrounds/SpiderLair/2.png"),
      3: require("../../assets/backgrounds/SpiderLair/3.png"),
      4: require("../../assets/backgrounds/SpiderLair/4.png"),
      5: require("../../assets/backgrounds/SpiderLair/5.png"),
      6: require("../../assets/backgrounds/SpiderLair/6.png"),
    },
    size: { width: 384, height: 216 },
    verticalOffset: -0.25,
  },
  StormyMountain: {
    imageSet: {
      0: require("../../assets/backgrounds/StormyMountain/0.png"),
      1: require("../../assets/backgrounds/StormyMountain/1.png"),
      2: require("../../assets/backgrounds/StormyMountain/2.png"),
      3: require("../../assets/backgrounds/StormyMountain/3.png"),
      4: require("../../assets/backgrounds/StormyMountain/4.png"),
      5: require("../../assets/backgrounds/StormyMountain/5.png"),
      6: require("../../assets/backgrounds/StormyMountain/6.png"),
      7: require("../../assets/backgrounds/StormyMountain/7.png"),
      8: require("../../assets/backgrounds/StormyMountain/8.png"),
      9: require("../../assets/backgrounds/StormyMountain/9.png"),
      10: require("../../assets/backgrounds/StormyMountain/10.png"),
      11: require("../../assets/backgrounds/StormyMountain/11.png"),
    },
    size: { width: 1920, height: 1080 },
    verticalOffset: 0.15,
    effects: {
      rain: require("../../assets/backgrounds/StormyMountain/Stormy_Mountains_Rain.gif"),
    },
  },
};
export type ParallaxOptions = keyof typeof backgroundImages;

const NORMATIVE_WIDTH = 2160;

const ParallaxEffect = ({ effect, size, style }) => {
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
};

export const Parallax = ({
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
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const { uiStore } = useRootStore();
  const scrollX = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastMoveDirection = useSharedValue(1);

  const plainPlayerPosition = toJS(playerPosition);
  const plainBoundingBox = toJS(boundingBox);
  const plainInCombat = toJS(inCombat);
  const plainReduceMotion = toJS(reduceMotion);

  const { imageSet, size, verticalOffset } = backgroundImages[backgroundName];
  const layerCount = Object.keys(imageSet).length - 1;
  const header = useHeaderHeight();

  const targetHeight = screenHeight;
  const scale = targetHeight / size.height;

  const scaledWidth = size.width * scale;
  const scaledHeight = targetHeight;

  const imagesNeeded = Math.max(3, Math.ceil(NORMATIVE_WIDTH / size.width));

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
  }, [plainInCombat]);

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
      const boundingBoxVerticalCenter = plainBoundingBox.height - TILE_SIZE / 2;
      const verticalOffset = boundingBoxVerticalCenter - relativeY;

      translateX.value = withSpring(-relativeX, {
        damping: 15,
        stiffness: 50,
      });
      translateY.value = withSpring(verticalOffset, {
        damping: 15,
        stiffness: 50,
      });
    }
  }, [plainPlayerPosition, plainBoundingBox, plainInCombat]);

  const renderLayers = () => {
    const layers = [];
    for (let i = layerCount; i >= 1; i--) {
      const moveRate = 1 - (i - 1) / layerCount;

      const animatedStyle = useAnimatedStyle(() => ({
        transform: [
          {
            translateX: plainInCombat
              ? scrollX.value * moveRate
              : translateX.value * moveRate,
          },
          {
            translateY: plainInCombat
              ? 0
              : (translateY.value / 2) * moveRate +
                (scaledHeight - screenHeight),
          },
          { scale },
        ],
      }));

      const tileGroups = [
        { offset: -size.width * imagesNeeded },
        { offset: 0 },
        { offset: size.width * imagesNeeded },
      ];

      layers.push(
        <Animated.View
          key={i}
          style={[
            {
              width: size.width * imagesNeeded * 3,
              height: size.height,
              left: (screenWidth - scaledWidth) / 2,
              position: "absolute",
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
              {[...Array(imagesNeeded)].map((_, index) => (
                <Image
                  key={index}
                  source={imageSet[i]}
                  style={{
                    width: size.width,
                    height: size.height,
                    left: index * size.width,
                    position: "absolute",
                  }}
                  contentFit="cover"
                />
              ))}
            </View>
          ))}
        </Animated.View>,
      );
    }
    return layers;
  };

  const renderEffects = () => {
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
            left: (screenWidth - scaledWidth) / 2,
          }}
        />
      ));
    }
  };

  const backgroundContent = plainReduceMotion ? (
    <Image
      source={imageSet[0]}
      style={{
        width: scaledWidth,
        height: scaledHeight,
        top: -(scaledHeight - screenHeight) / 2,
        left: (screenWidth - scaledWidth) / 2,
        position: "absolute",
      }}
      contentFit="cover"
    />
  ) : (
    renderLayers()
  );

  return (
    <View style={[{ flex: 1 }, style]}>
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          height: screenHeight,
          marginTop: !plainReduceMotion
            ? -verticalOffset * screenHeight
            : undefined,
          bottom: 0,
        }}
      >
        {backgroundContent}
        {!plainReduceMotion && renderEffects()}
      </View>
      <View
        style={{
          paddingTop: header,
          flex: 1,
          paddingBottom: uiStore.playerStatusHeight + uiStore.expansionPadding,
        }}
      >
        {children}
      </View>
    </View>
  );
};
