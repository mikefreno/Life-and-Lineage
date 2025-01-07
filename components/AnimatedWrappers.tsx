import { Animated, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import Colors from "../constants/Colors";
import { useRootStore } from "../hooks/stores";

interface AnimatedWrapperProps {
  children:
    | React.ReactNode
    | (({ showing }: { showing: boolean }) => React.ReactNode);
  show?: boolean;
  duration?: number;
}

export function FadeIn({
  children,
  show = true,
  duration = 500,
}: AnimatedWrapperProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    setShowing(show);
    if (show) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      });
    } else {
      fadeAnim.setValue(0);
    }
  }, [show, duration]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {typeof children === "function" ? children({ showing }) : children}
    </Animated.View>
  );
}

export function FadeSlide({
  children,
  show = true,
  duration = 400,
}: AnimatedWrapperProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    if (show) {
      setShowing(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowing(true);
      });
    } else {
      setShowing(false);
      fadeAnim.setValue(0);
      translateY.setValue(20);
    }
  }, [show, duration]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: translateY }],
      }}
    >
      {typeof children === "function" ? children({ showing }) : children}
    </Animated.View>
  );
}

export function FadeGrow({
  children,
  show = true,
  duration = 400,
}: AnimatedWrapperProps) {
  const topHeight = useRef(new Animated.Value(0)).current;
  const bottomHeight = useRef(new Animated.Value(0)).current;
  const [showing, setShowing] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const { uiStore } = useRootStore();

  useEffect(() => {
    if (contentHeight === 0) return;

    if (show) {
      // Start from fully covered
      topHeight.setValue(contentHeight / 2);
      bottomHeight.setValue(contentHeight / 2);

      // Animate to reveal
      Animated.parallel([
        Animated.timing(topHeight, {
          toValue: 0,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(bottomHeight, {
          toValue: 0,
          duration: duration,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setShowing(true);
      });
    } else {
      setShowing(false);
      topHeight.setValue(contentHeight / 2);
      bottomHeight.setValue(contentHeight / 2);
    }
  }, [show, duration, contentHeight]);

  const renderContent =
    typeof children === "function" ? children({ showing }) : children;

  return (
    <View style={{ position: "relative" }}>
      {/* Content */}
      <View
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setContentHeight(height);
        }}
      >
        {renderContent}
      </View>

      {/* Covers Container */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      >
        {/* Top Cover */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: topHeight,
            backgroundColor: Colors[uiStore.colorScheme].background,
          }}
        />

        {/* Bottom Cover */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: bottomHeight,
            backgroundColor: Colors[uiStore.colorScheme].background,
          }}
        />
      </View>
    </View>
  );
}
