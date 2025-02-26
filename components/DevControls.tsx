import Colors from "@/constants/Colors";
import { useRootStore } from "@/hooks/stores";
import { observer } from "mobx-react-lite";
import { Animated, Pressable, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useRef, useState, useEffect } from "react";
import GenericModal from "./GenericModal";
import { useVibration } from "@/hooks/generic";
import {
  HandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  State,
} from "react-native-gesture-handler";
import { Text } from "./Themed";
import ThemedCard from "./ThemedCard";
import GenericRaisedButton from "./GenericRaisedButton";
import Slider from "@react-native-community/slider";
import { flex } from "@/hooks/styles";
import { Entypo } from "@expo/vector-icons";

export const DevControls = observer(() => {
  const rootStore = useRootStore();
  const [showingDevControls, setShowingDevControls] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [onRight, setOnRight] = useState(true);
  const vibration = useVibration();

  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Position state
  const [verticalPosition, setVerticalPosition] = useState(
    rootStore.uiStore.dimensions.height / 4,
  );

  const HIDE_THRESHOLD = 10;
  const SHOW_THRESHOLD = 2;
  const SIDE_SWITCH_THRESHOLD = rootStore.uiStore.dimensions.width / 4;
  const HIDDEN_OFFSET = 40;

  const animateControl = (show: boolean) => {
    Animated.spring(translateX, {
      toValue: show ? 0 : onRight ? HIDDEN_OFFSET : -HIDDEN_OFFSET,
      useNativeDriver: true,
      friction: 20,
    }).start();
    setIsVisible(show);
  };

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true },
  );

  const onHandlerStateChange = (
    event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>,
  ) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, translationY } = event.nativeEvent;

      // Determine if this is primarily a vertical or horizontal gesture
      const isVerticalGesture =
        Math.abs(translationY) > Math.abs(translationX) * 1.5;

      if (isVerticalGesture) {
        // Handle vertical movement
        setVerticalPosition((prev) => {
          const newPosition = prev + translationY;
          // Constrain to screen bounds with padding
          return Math.max(
            60,
            Math.min(rootStore.uiStore.dimensions.height - 120, newPosition),
          );
        });

        // Reset X translation
        Animated.spring(translateX, {
          toValue: isVisible ? 0 : onRight ? HIDDEN_OFFSET : -HIDDEN_OFFSET,
          useNativeDriver: true,
        }).start();

        // Reset Y translation
        //Animated.spring(translateY, {
        //toValue: 0,
        //useNativeDriver: true,
        //}).start();
        translateX.setValue(0);
        translateY.setValue(0);

        return;
      }

      // Handle horizontal gestures
      if (isVisible) {
        if (onRight && translationX < -SIDE_SWITCH_THRESHOLD) {
          setOnRight(false);
          return;
        } else if (!onRight && translationX > SIDE_SWITCH_THRESHOLD) {
          setOnRight(true);
          return;
        }
      }

      // Handle showing/hiding based on current side
      if (onRight) {
        if (translationX > HIDE_THRESHOLD && isVisible) {
          // Swipe right to hide when on right side
          animateControl(false);
          vibration({ style: "light" });
        } else if (translationX < -SHOW_THRESHOLD && !isVisible) {
          // Swipe left to show when on right side
          animateControl(true);
          vibration({ style: "light" });
        } else {
          // Reset position if not swiped enough
          Animated.spring(translateX, {
            toValue: isVisible ? 0 : HIDDEN_OFFSET,
            useNativeDriver: true,
          }).start();
        }
      } else {
        if (translationX < -HIDE_THRESHOLD && isVisible) {
          // Swipe left to hide when on left side
          animateControl(false);
          vibration({ style: "light" });
        } else if (translationX > SHOW_THRESHOLD && !isVisible) {
          // Swipe right to show when on left side
          animateControl(true);
          vibration({ style: "light" });
        } else {
          // Reset position if not swiped enough
          Animated.spring(translateX, {
            toValue: isVisible ? 0 : -HIDDEN_OFFSET,
            useNativeDriver: true,
          }).start();
        }
      }

      // Always reset Y translation after horizontal gestures
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const onRevealHandlerStateChange = (
    event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>,
  ) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;

      if (!isVisible) {
        if (
          (onRight && translationX < -SHOW_THRESHOLD) ||
          (!onRight && translationX > SHOW_THRESHOLD)
        ) {
          // Show the button
          animateControl(true);
          vibration({ style: "light" });
        }
      }
    }
  };

  const actions = [
    {
      action: (value: number) =>
        rootStore.playerState?.addSkillPoint({ amount: value }),
      name: "Add skill points",
      max: 25,
      step: 1,
    },
    {
      action: (value: number) => rootStore.playerState?.addGold(value),
      name: "Add gold",
      max: 10_000,
      step: 100,
    },
    {
      action: (value: number) => rootStore.time.devSetter("year", value),
      name: "Set Game Year",
      min: 1_300,
      max: 2_000,
      step: 1,
      initVal: rootStore.time.year,
    },
    {
      action: (value: number) => rootStore.time.devSetter("week", value),
      name: "Set Game Week",
      max: 51,
      step: 1,
      initVal: rootStore.time.week,
    },
  ];

  useEffect(() => {
    translateX.setValue(0);
    translateY.setValue(0);
  }, [isVisible, onRight]);

  return (
    <>
      <GenericModal
        isVisibleCondition={showingDevControls}
        scrollEnabled={true}
        size={100}
        backFunction={() => setShowingDevControls(false)}
        noPad
        innerStyle={{ paddingHorizontal: "3%" }}
      >
        <ActionSliders actions={actions} />
      </GenericModal>

      {/* Main button with gesture handler */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={isVisible}
      >
        <Animated.View
          style={{
            position: "absolute",
            top: verticalPosition,
            width: 60,
            height: 60,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            ...(onRight ? { right: 0 } : { left: 0 }),
            transform: [{ translateX }, { translateY }],
            opacity: isVisible ? 1 : 0,
            pointerEvents: isVisible ? "auto" : "none",
          }}
        >
          <View
            style={{
              backgroundColor: Colors[rootStore.uiStore.colorScheme].background,
              borderRadius: 20,
              padding: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Pressable
              onPress={() => {
                vibration({ style: "light" });
                setShowingDevControls(true);
              }}
            >
              <MaterialIcons
                name="pest-control"
                size={32}
                color={Colors[rootStore.uiStore.colorScheme].border}
              />
            </Pressable>
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* Reveal area - always present but only active when button is hidden */}
      {!isVisible && (
        <PanGestureHandler onHandlerStateChange={onRevealHandlerStateChange}>
          <View
            style={{
              position: "absolute",
              top: verticalPosition,
              width: 40,
              height: 60,
              zIndex: 9998,
              ...(onRight ? { right: 0 } : { left: 0 }),
            }}
          >
            {/* Visual indicator */}
            <View
              style={{
                position: "absolute",
                top: 20,
                width: 8,
                height: 20,
                backgroundColor: Colors[rootStore.uiStore.colorScheme].border,
                opacity: 0.3,
                ...(onRight
                  ? {
                      right: 0,
                      borderTopLeftRadius: 4,
                      borderBottomLeftRadius: 4,
                    }
                  : {
                      left: 0,
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4,
                    }),
              }}
            />
          </View>
        </PanGestureHandler>
      )}
    </>
  );
});

const ActionSliders = ({
  actions,
}: {
  actions: {
    action: (value: number) => void | undefined;
    name: string;
    min?: number;
    max: number;
    step: number;
    initVal?: number;
  }[];
}) => {
  const { uiStore } = useRootStore();
  const vibration = useVibration();
  return (
    <>
      {actions.map((action, idx) => {
        // Calculate step size for the indicator
        const stepSize = (action.max - (action.min ?? 0)) / 5; // Divide into 5 steps (adjust as needed)
        const steps = Array.from(
          { length: 6 },
          (_, i) => i * stepSize + (action.min ?? 0),
        );
        const [sliderValue, setSliderValue] = useState(action.initVal ?? 0);
        const [expanded, setExpanded] = useState(false);

        const rotation = useRef(new Animated.Value(0)).current;

        useEffect(() => {
          Animated.timing(rotation, {
            toValue: expanded ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }, [expanded]);

        const rotationInterpolate = rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        });

        return (
          <Pressable
            key={idx}
            onPress={() => {
              vibration({ style: "light" });
              setExpanded(!expanded);
            }}
          >
            <ThemedCard>
              <>
                <View style={flex.rowBetween}>
                  <Text>{action.name}</Text>
                  <Animated.View
                    style={{
                      transform: [{ rotate: rotationInterpolate }],
                    }}
                  >
                    <Entypo
                      name="chevron-small-down"
                      size={24}
                      color={Colors[uiStore.colorScheme].border}
                    />
                  </Animated.View>
                </View>
                {expanded && (
                  <>
                    <Text style={{ textAlign: "center", marginVertical: 8 }}>
                      Value: {sliderValue.toFixed(1)} / {action.max}
                    </Text>

                    {/* Slider with step markers */}
                    <View style={{ marginHorizontal: 10 }}>
                      <Slider
                        minimumValue={action.min ?? 0}
                        maximumValue={action.max}
                        value={sliderValue}
                        onValueChange={(val) => {
                          setSliderValue(val);
                        }}
                        step={action.step} // Add step prop if your actions have defined steps
                      />

                      {/* Step markers */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginTop: 5,
                          paddingHorizontal: 10,
                        }}
                      >
                        {steps.map((step, stepIdx) => (
                          <View key={stepIdx} style={{ alignItems: "center" }}>
                            <View
                              style={{
                                width: 2,
                                height: 8,
                                backgroundColor: "#888",
                              }}
                            />
                            <Text style={{ fontSize: 10 }}>
                              {step.toFixed(0)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <GenericRaisedButton
                      onPress={() => action.action(sliderValue)}
                      style={{ marginTop: 10 }}
                    >
                      Activate
                    </GenericRaisedButton>
                  </>
                )}
              </>
            </ThemedCard>
          </Pressable>
        );
      })}
    </>
  );
};
