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
import { flex, normalize, useStyles } from "@/hooks/styles";
import { Entypo } from "@expo/vector-icons";

export const DevControls = observer(() => {
  const rootStore = useRootStore();
  const [showingDevControls, setShowingDevControls] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [onRight, setOnRight] = useState(true);
  const vibration = useVibration();

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

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
      const isVerticalGesture =
        Math.abs(translationY) > Math.abs(translationX) * 1.5;

      if (isVerticalGesture) {
        setVerticalPosition((prev) => {
          const newPosition = prev + translationY;
          return Math.max(
            60,
            Math.min(rootStore.uiStore.dimensions.height - 120, newPosition),
          );
        });

        Animated.spring(translateX, {
          toValue: isVisible ? 0 : onRight ? HIDDEN_OFFSET : -HIDDEN_OFFSET,
          useNativeDriver: true,
        }).start();

        translateX.setValue(0);
        translateY.setValue(0);

        return;
      }

      if (isVisible) {
        if (onRight && translationX < -SIDE_SWITCH_THRESHOLD) {
          setOnRight(false);
          return;
        } else if (!onRight && translationX > SIDE_SWITCH_THRESHOLD) {
          setOnRight(true);
          return;
        }
      }

      if (onRight) {
        if (translationX > HIDE_THRESHOLD && isVisible) {
          animateControl(false);
          vibration({ style: "light" });
        } else if (translationX < -SHOW_THRESHOLD && !isVisible) {
          animateControl(true);
          vibration({ style: "light" });
        } else {
          Animated.spring(translateX, {
            toValue: isVisible ? 0 : HIDDEN_OFFSET,
            useNativeDriver: true,
          }).start();
        }
      } else {
        if (translationX < -HIDE_THRESHOLD && isVisible) {
          animateControl(false);
          vibration({ style: "light" });
        } else if (translationX > SHOW_THRESHOLD && !isVisible) {
          animateControl(true);
          vibration({ style: "light" });
        } else {
          Animated.spring(translateX, {
            toValue: isVisible ? 0 : -HIDDEN_OFFSET,
            useNativeDriver: true,
          }).start();
        }
      }

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
        style={{ maxHeight: "50%", marginVertical: "auto" }}
        backFunction={() => setShowingDevControls(false)}
      >
        <ActionSliders actions={rootStore.devActions} />
      </GenericModal>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={isVisible}
      >
        <Animated.View
          style={{
            position: "absolute",
            top: verticalPosition,
            width: normalize(60),
            height: normalize(60),
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
                size={normalize(32)}
                color={Colors[rootStore.uiStore.colorScheme].border}
              />
            </Pressable>
          </View>
        </Animated.View>
      </PanGestureHandler>

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
                width: normalize(8),
                height: normalize(20),
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
    action: (value?: number) => void | undefined;
    name: string;
    min?: number;
    max?: number;
    step?: number;
    initVal?: number;
  }[];
}) => {
  const { uiStore } = useRootStore();
  const styles = useStyles();
  const vibration = useVibration();
  return (
    <>
      {actions.map((action, idx) => {
        const stepSize = (action.max ?? 100 - (action.min ?? 0)) / 5;
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
                  <Text style={styles["text-md"]}>{action.name}</Text>
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
                    {action.min || action.max ? (
                      <>
                        <Text
                          style={{
                            textAlign: "center",
                            marginVertical: 8,
                            ...styles["text-md"],
                          }}
                        >
                          Value: {sliderValue.toFixed(1)} / {action.max}
                        </Text>

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

                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              marginTop: 5,
                              paddingHorizontal: 10,
                            }}
                          >
                            {steps.map((step, stepIdx) => (
                              <View
                                key={stepIdx}
                                style={{ alignItems: "center" }}
                              >
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
                      </>
                    ) : null}

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
