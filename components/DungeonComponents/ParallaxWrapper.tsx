import { toJS } from "mobx";
import React, { type ReactNode, useEffect } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  Image,
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
    size: { width: 384, height: 216 },
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
    size: { width: 384, height: 216 },
  },
  Village: {
    imageSet: {
      0: require("../../assets/backgrounds/Village/0.png"),
      1: require("../../assets/backgrounds/Village/1.png"),
      2: require("../../assets/backgrounds/Village/2.png"),
      3: require("../../assets/backgrounds/Village/3.png"),
      4: require("../../assets/backgrounds/Village/4.png"),
      5: require("../../assets/backgrounds/Village/5.png"),
      6: require("../../assets/backgrounds/Village/6.png"),
      7: require("../../assets/backgrounds/Village/7.png"),
    },
    size: { width: 768, height: 216 },
  },
};

export const ParallaxAsWrapper = ({
  backgroundName,
  inCombat = false,
  reduceMotion = false,
  playerPosition,
  boundingBox,
  style,
  children,
}: {
  backgroundName: keyof typeof backgroundImages;
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
  const scrollX = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const plainPlayerPosition = toJS(playerPosition);
  const plainBoundingBox = toJS(boundingBox);
  const plainInCombat = toJS(inCombat);
  const plainReduceMotion = toJS(reduceMotion);

  const { imageSet, size } = backgroundImages[backgroundName];
  const layerCount = Object.keys(imageSet).length - 1;

  const screenRatio = screenWidth / screenHeight;
  const imageRatio = size.width / size.height;

  const baseScale = screenHeight / size.height;

  const finalScale =
    screenRatio > imageRatio
      ? Math.max(baseScale, screenWidth / size.width)
      : baseScale;

  const scaledWidth = size.width * finalScale;
  const scaledHeight = size.height * finalScale;

  const imagesNeeded = Math.ceil((screenWidth / (size.width * finalScale)) * 3);

  useEffect(() => {
    if (plainInCombat) {
      const totalWidth = size.width * imagesNeeded;

      scrollX.value = withRepeat(
        withTiming(-totalWidth, {
          duration: 10000 * imagesNeeded,
          easing: Easing.linear,
        }),
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
      // Calculate relative position within bounding box
      const relativeX =
        plainPlayerPosition.x -
        plainBoundingBox.offsetX -
        plainBoundingBox.width / 2;

      // Calculate vertical position relative to bounding box
      const relativeY = plainPlayerPosition.y - plainBoundingBox.offsetY;
      const boundingBoxVerticalCenter = plainBoundingBox.height / 2;
      const verticalOffset = relativeY - boundingBoxVerticalCenter;

      // Limit vertical movement
      const maxVerticalMove = scaledHeight * 0.3; // Adjust this value as needed
      const constrainedVerticalOffset = Math.max(
        Math.min(verticalOffset, maxVerticalMove),
        -maxVerticalMove,
      );

      translateX.value = withSpring(-relativeX, {
        damping: 15,
        stiffness: 50,
      });
      translateY.value = withSpring(-constrainedVerticalOffset, {
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
          { translateY: !plainInCombat ? translateY.value * moveRate : 0 },
          { scale: finalScale },
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
            styles.layerContainer,
            {
              width: size.width * imagesNeeded * 3,
              height: size.height,
              left: (screenWidth - scaledWidth) / 2,
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
                  style={[
                    styles.backgroundImage,
                    {
                      width: size.width,
                      height: size.height,
                      left: index * size.width,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </Animated.View>,
      );
    }
    return layers;
  };

  const backgroundContent = plainReduceMotion ? (
    <Image
      source={imageSet[0]}
      style={[
        styles.backgroundImage,
        {
          width: scaledWidth,
          height: scaledHeight,
          left: (screenWidth - scaledWidth) / 4,
        },
      ]}
    />
  ) : (
    renderLayers()
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.backgroundContainer}>{backgroundContent}</View>
      <View style={styles.childrenContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    bottom: 0,
  },
  childrenContainer: {
    flex: 1,
  },
  layerContainer: {
    position: "absolute",
  },
  backgroundImage: {
    position: "absolute",
  },
});
