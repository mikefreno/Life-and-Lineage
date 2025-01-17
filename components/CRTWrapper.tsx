import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Easing } from "react-native";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

interface CRTEffectProps {
  children: React.ReactNode;
  effectStrength?: number; // 0 to 1
}

const { width, height } = Dimensions.get("window");

const CRTEffect: React.FC<CRTEffectProps> = ({
  children,
  effectStrength = 0.5,
}) => {
  const scanLineAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: height,
          duration: 1000 / effectStrength,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [effectStrength]);

  const overlayOpacity = effectStrength * 0.2;
  const scanLineOpacity = effectStrength * 0.3;

  return (
    <View style={styles.container}>
      {children}

      {/* CRT Overlay */}
      <BlurView
        intensity={effectStrength * 50}
        style={[styles.overlay, { opacity: overlayOpacity }]}
      />

      {/* Scanlines */}
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)", "transparent"]}
            locations={[0.4, 0.5, 0.6]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        }
      >
        <Animated.View
          style={[
            styles.scanLine,
            {
              opacity: scanLineOpacity,
              transform: [
                {
                  translateY: scanLineAnimation.interpolate({
                    inputRange: [0, height],
                    outputRange: [0, height],
                  }),
                },
              ],
            },
          ]}
        />
      </MaskedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 20, 0, 0.1)",
  },
  scanLine: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
  },
});

export default CRTEffect;
