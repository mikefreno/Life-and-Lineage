import Colors from "@/constants/Colors";
import { useRootStore } from "@/hooks/stores";
import { observer } from "mobx-react-lite";
import { Animated, Pressable, ScrollView, TextInput, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useRef, useState, useEffect } from "react";
import GenericModal from "@/components/GenericModal";
import { useVibration } from "@/hooks/generic";
import {
  HandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  State,
} from "react-native-gesture-handler";
import { Text } from "@/components/Themed";
import ThemedCard from "@/components/ThemedCard";
import GenericRaisedButton from "./GenericRaisedButton";
import Slider from "@react-native-community/slider";
import { flex, useStyles } from "@/hooks/styles";
import { Entypo } from "@expo/vector-icons";
import { enemyOptions } from "@/utility/enemyHelpers";
import { Orientation } from "expo-screen-orientation";
import { useScaling } from "@/hooks/scaling";

export const DevControls = observer(() => {
  const rootStore = useRootStore();
  const { uiStore } = rootStore;
  const [showingDevControls, setShowingDevControls] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [onRight, setOnRight] = useState(true);
  const vibration = useVibration();
  const { getNormalizedSize } = useScaling();

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

  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);

  return (
    <>
      <GenericModal
        isVisibleCondition={showingDevControls}
        scrollEnabled={scrollEnabled}
        size={100}
        style={{ maxHeight: "70%", marginVertical: "auto" }}
        backFunction={() => setShowingDevControls(false)}
      >
        <ActionSliders
          actions={rootStore.devActions}
          setScrollEnabled={setScrollEnabled}
        />
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
            width: getNormalizedSize(60),
            height: getNormalizedSize(60),
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
            style={[
              {
                backgroundColor:
                  Colors[rootStore.uiStore.colorScheme].background,
                borderRadius: 20,
                padding: 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              },
              uiStore.hasNotch &&
              uiStore.orientation === Orientation.LANDSCAPE_RIGHT &&
              !onRight &&
              uiStore.insets
                ? { marginRight: -uiStore.insets.left }
                : uiStore.hasNotch &&
                  uiStore.orientation === Orientation.LANDSCAPE_LEFT &&
                  onRight &&
                  uiStore.insets
                ? { marginLeft: -uiStore.insets.right }
                : {},
            ]}
          >
            <Pressable
              onPress={() => {
                vibration({ style: "light" });
                setShowingDevControls(true);
              }}
            >
              <MaterialIcons
                name="pest-control"
                size={getNormalizedSize(32)}
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
                width: getNormalizedSize(8),
                height: getNormalizedSize(20),
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
  setScrollEnabled,
}: {
  actions: {
    action: (value: number | string) => void | undefined;
    name: string;
    min?: number;
    max?: number;
    step?: number;
    initVal?: number;
    stringInput?: boolean;
    autocompleteType?: "enemyOptions";
  }[];
  setScrollEnabled: React.Dispatch<React.SetStateAction<boolean>>;
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
        const [textValue, setTextValue] = useState("");
        const [expanded, setExpanded] = useState(false);
        const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
        const [showDropdown, setShowDropdown] = useState(false);

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

        const filterOptions = (text: string) => {
          setTextValue(text);
          if (action.autocompleteType === "enemyOptions") {
            const filtered = enemyOptions.filter((option) =>
              option.toLowerCase().includes(text.toLowerCase()),
            );
            setFilteredOptions(filtered);
            setShowDropdown(text.length > 0 && filtered.length > 0);
          }
        };

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
                    {action.stringInput ? (
                      <View style={{ position: "relative" }}>
                        <TextInput
                          style={[
                            styles.nameInput,
                            {
                              borderColor: Colors[uiStore.colorScheme].border,
                              color: Colors[uiStore.colorScheme].text,
                            },
                          ]}
                          placeholder="Enter value..."
                          placeholderTextColor={`${
                            Colors[uiStore.colorScheme].text
                          }`}
                          value={textValue}
                          onChangeText={(text) => {
                            setTextValue(text);
                            if (text && action.autocompleteType) {
                              filterOptions(text);
                            }
                          }}
                          onFocus={() => {
                            setScrollEnabled(false);
                            if (textValue && action.autocompleteType) {
                              filterOptions(textValue);
                            }
                          }}
                          onBlur={() => setScrollEnabled(true)}
                        />

                        {showDropdown && (
                          <ScrollView
                            style={{
                              maxHeight: 200,
                              backgroundColor: Colors[uiStore.colorScheme].card,
                              borderWidth: 1,
                              borderColor: Colors[uiStore.colorScheme].border,
                              borderRadius: 5,
                              zIndex: 1000,
                            }}
                          >
                            {filteredOptions.map((option, optionIdx) => (
                              <Pressable
                                key={optionIdx}
                                style={{
                                  padding: 10,
                                  borderBottomWidth:
                                    optionIdx < filteredOptions.length - 1
                                      ? 1
                                      : 0,
                                  borderBottomColor:
                                    Colors[uiStore.colorScheme].border,
                                }}
                                onPress={() => {
                                  setTextValue(option);
                                  setShowDropdown(false);
                                }}
                              >
                                <Text
                                  style={{
                                    color: Colors[uiStore.colorScheme].text,
                                  }}
                                >
                                  {option}
                                </Text>
                              </Pressable>
                            ))}
                          </ScrollView>
                        )}
                      </View>
                    ) : action.min || action.max ? (
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
                            step={action.step}
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
                      onPress={() =>
                        action.action(
                          action.stringInput ? textValue : sliderValue,
                        )
                      }
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
