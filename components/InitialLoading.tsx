import { useEffect, useRef } from "react";
import { Easing, StyleSheet, useColorScheme, View } from "react-native";
import { Animated } from "react-native";
import Colors from "../constants/Colors";
import { D20SVG } from "../assets/icons/SVGIcons";

export const InitialLoading = ({ isLoading }: { isLoading: boolean }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);
  const colorScheme = useColorScheme();
  const spinValue = useRef(new Animated.Value(0)).current;

  const roll = () => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 5000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => roll(), 500);
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  const animatedStyle = {
    transform: [{ rotateY: spin }],
    height: 220,
    width: 220,
  };

  useEffect(() => {
    roll();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    Animated.timing(fadeAnim, {
      toValue: isLoading ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
      isInteraction: false,
    }).start();
  }, [fadeAnim]);

  return (
    <View
      style={{
        flex: 1,
        zIndex: 1000,
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: fadeAnim,
          zIndex: isLoading ? 1 : 0,
          backgroundColor: Colors[colorScheme ?? "light"].background,
        }}
        pointerEvents={"none"}
      >
        <View style={styles.container}>
          <View style={styles.contentContainer}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Animated.View
                style={[
                  animatedStyle,
                  { justifyContent: "center", alignItems: "center" },
                ]}
              >
                <D20SVG />
              </Animated.View>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 32,
  },
  tipText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 16,
  },
});
