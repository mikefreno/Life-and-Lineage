import React, { useEffect } from "react";
import { View, Dimensions, StyleSheet, Image } from "react-native";
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
    // broken
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
    // zoomed in too far
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
    // zoomed in too far
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
    //broken
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
    // zoomed in too far
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
    // zoomed in too far
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
    // ok
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
    // broken
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

export const ParallaxBackground = ({
  backgroundName,
  inCombat = false,
  reduceMotion = false,
  playerPosition,
  boundingBox,
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
}) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const scrollX = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const { imageSet, size } = backgroundImages[backgroundName];
  const layerCount = Object.keys(imageSet).length - 1;

  // Calculate scaling to cover screen while maintaining aspect ratio
  const screenRatio = screenWidth / screenHeight;
  const imageRatio = size.width / size.height;

  const scale =
    screenRatio > imageRatio
      ? screenWidth / size.width
      : screenHeight / size.height;

  const scaledWidth = size.width * scale;
  const scaledHeight = size.height * scale;

  const imagesNeeded = Math.ceil(screenWidth / size.width) * 10;

  useEffect(() => {
    if (inCombat) {
      const totalWidth = size.width * imagesNeeded;

      scrollX.value = withRepeat(
        withTiming(-totalWidth, {
          duration: 30000 * imagesNeeded, // will take 5 minutes before snapping back
          easing: Easing.linear,
        }),
        -1,
        false,
      );

      return () => {
        cancelAnimation(scrollX);
        scrollX.value = 0;
      };
    }
  }, [inCombat]);

  useEffect(() => {
    if (!inCombat) {
      const relativeX =
        playerPosition.x - boundingBox.offsetX - boundingBox.width / 2;
      const relativeY =
        playerPosition.y - boundingBox.offsetY - boundingBox.height / 2;

      translateX.value = withSpring(-relativeX, {
        damping: 15,
        stiffness: 50,
      });
      translateY.value = withSpring(-relativeY, {
        damping: 15,
        stiffness: 50,
      });
    }
  }, [playerPosition, boundingBox, inCombat]);

  if (reduceMotion) {
    return (
      <Image
        source={imageSet[0]}
        style={[
          styles.backgroundImage,
          {
            width: scaledWidth,
            height: scaledHeight,
            transform: [{ scale }],
          },
        ]}
      />
    );
  }

  const renderLayers = () => {
    const layers = [];
    // Start from layerCount (7) down to 1 (not 0)
    for (let i = layerCount; i >= 1; i--) {
      const moveRate = 1 - (i - 1) / layerCount;
      const isBackingLayer = i === layerCount;

      const animatedStyle = useAnimatedStyle(() => {
        const xOffset = inCombat
          ? scrollX.value * moveRate
          : translateX.value * moveRate;

        const yOffset =
          !inCombat && !isBackingLayer ? translateY.value * moveRate : 0;

        return {
          transform: [
            { translateX: xOffset },
            { translateY: yOffset },
            { scale },
          ],
        };
      });

      layers.push(
        <Animated.View
          key={i}
          style={[
            styles.layerContainer,
            {
              width: size.width * imagesNeeded,
              height: size.height,
              left: (screenWidth - scaledWidth) / 2 - size.width * 2,
              top: (screenHeight - scaledHeight) / 2,
            },
            animatedStyle,
          ]}
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
        </Animated.View>,
      );
    }
    return layers;
  };

  return <View style={styles.container}>{renderLayers()}</View>;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  layerContainer: {
    position: "absolute",
  },
  backgroundImage: {
    position: "absolute",
  },
});

export default ParallaxBackground;
