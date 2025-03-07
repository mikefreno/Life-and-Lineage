import React, { useEffect, useState } from "react";
import { Link, Tabs, useRouter } from "expo-router";
import {
  GestureResponderEvent,
  Platform,
  Pressable,
  Image,
  View,
  LayoutAnimation,
} from "react-native";
import Colors, { elementalColorMap } from "@/constants/Colors";
import { BlurView } from "expo-blur";
import { StyleSheet, Text as RNText } from "react-native";
import PlayerStatusForHome from "@/components/PlayerStatus/ForHome";
import { LinearGradientBlur } from "@/components/LinearGradientBlur";
import {
  BookSparkles,
  BowlingBallAndPin,
  Broom,
  Dungeon,
  Gear,
  GraduationCapIcon,
  HouseHeart,
  Medical,
  NecromancerSkull,
  PaladinHammer,
  Potion,
  RangerIcon,
  Sword,
  Wand,
  WizardHat,
} from "@/assets/icons/SVGIcons";
import { Text, ThemedView } from "@/components/Themed";
import TutorialModal from "@/components/TutorialModal";
import { useIsFocused } from "@react-navigation/native";
import { Element, TutorialOption } from "../../utility/types";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { normalize, shadows, useStyles } from "../../hooks/styles";
import { observer } from "mobx-react-lite";
import { wait } from "@/utility/functions/misc";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GenericModal from "@/components/GenericModal";

export const TAB_SELECTION = 80;

export const SCREEN_TRANSITION_TIMING = 200;

const TabLayout = observer(() => {
  const isFocused = useIsFocused();

  const { playerState, uiStore, dungeonStore } = useRootStore();
  const [showPVPInfoModal, setShowPVPInfoModal] = useState(false);

  const styles = useStyles();
  const router = useRouter();
  const vibration = useVibration();

  const commonOptions = {
    lazy: false,
    headerTransparent: true,
    headerTitleAlign: "center",
    headerTitleStyle: { fontFamily: "PixelifySans", fontSize: normalize(22) },
    headerBackground:
      Platform.OS == "ios"
        ? () => (
            <BlurView
              intensity={100}
              style={[StyleSheet.absoluteFill, styles.diffuse]}
              tint={uiStore.colorScheme}
            />
          )
        : () => <ThemedView style={[StyleSheet.absoluteFill, shadows.soft]} />,
  } as const;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  return (
    <>
      {playerState && playerState.keyItems.length > 0 && (
        <TutorialModal
          isFocused={isFocused}
          tutorial={TutorialOption.keyItem}
          pageOne={{
            body: "You have recieved a key item, swipe left on your inventory to check it out.",
            title: "Key Item Received!",
          }}
        />
      )}
      <GenericModal
        isVisibleCondition={showPVPInfoModal}
        backFunction={() => setShowPVPInfoModal(false)}
      >
        <View>
          <Text style={[styles["text-xl"], { textAlign: "center" }]}>
            PVP is currently locked, progress and complete the{" "}
            <Text style={{ color: Colors[uiStore.colorScheme].health }}>
              Ancient Arena
            </Text>{" "}
            dungeon to unlock!
          </Text>
        </View>
      </GenericModal>
      <Pressable
        onPress={() => {
          vibration({ style: "light" });
          uiStore.setDetailedStatusViewShowing(true);
        }}
        style={[
          uiStore.showDevDebugUI && styles.debugBorder,
          {
            position: "absolute",
            zIndex: 9999,
            top: uiStore.dimensions.height - uiStore.bottomBarHeight,
            height: uiStore.playerStatusHeight,
            width: uiStore.isLandscape
              ? uiStore.dimensions.width * 0.75 - 16
              : uiStore.dimensions.width - 16,
            alignSelf: "center",
          },
        ]}
      />
      {playerState && (
        <Tabs
          screenOptions={{
            tabBarBackground: () => {
              return (
                <>
                  <PlayerStatusForHome />
                  <LinearGradientBlur
                    intensity={100}
                    style={{
                      height:
                        uiStore.tabHeight +
                        (uiStore.playerStatusCompactHeight ?? 0),
                      bottom: 0,
                      position: "absolute",
                    }}
                  />
                </>
              );
            },
            tabBarActiveTintColor: Colors[uiStore.colorScheme].tint,
            tabBarLabel: (props) => {
              return (
                <RNText
                  style={{
                    textAlign: "center",
                    fontFamily: "PixelifySans",
                    ...styles["text-sm"],
                    color: props.color,
                    marginTop: normalize(3),
                  }}
                >
                  {props.children}
                </RNText>
              );
            },
            tabBarStyle: {
              borderTopWidth: 0,
              position: "absolute",
              shadowColor: "transparent",
              paddingHorizontal: 4,
              paddingTop: 8,
              height: uiStore.tabHeight + uiStore.playerStatusHeight,
              ...styles.columnBetween,
              display: "flex",
            },
            tabBarIconStyle: {
              marginHorizontal: "auto",
            },
            animation: uiStore.reduceMotion ? "fade" : "shift",
            tabBarButton: (props) => {
              const onPressWithVibration = (event: GestureResponderEvent) => {
                vibration({ style: "light" });
                if (props.onPress) props.onPress(event);
              };
              return (
                <Pressable
                  onPress={onPressWithVibration}
                  accessibilityLabel={props.accessibilityLabel}
                  accessibilityRole={props.accessibilityRole}
                  accessibilityState={props.accessibilityState}
                  style={{
                    top: uiStore.playerStatusHeight,
                  }}
                >
                  {props.children}
                </Pressable>
              );
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              ...commonOptions,
              title: "Home",
              tabBarIcon: ({ color }) =>
                playerState?.playerClass == "necromancer" ? (
                  <NecromancerSkull
                    width={normalize(28)}
                    height={normalize(26)}
                    color={color}
                  />
                ) : playerState?.playerClass == "paladin" ? (
                  <PaladinHammer
                    width={normalize(28)}
                    height={normalize(26)}
                    color={color}
                    useOpacity={true}
                  />
                ) : playerState?.playerClass == "ranger" ? (
                  <RangerIcon
                    width={normalize(28)}
                    height={normalize(26)}
                    color={color}
                    useOpacity={true}
                  />
                ) : (
                  <WizardHat
                    width={normalize(28)}
                    height={normalize(26)}
                    color={color}
                  />
                ),
              headerLeft: () => (
                <Link href="/Options" asChild>
                  <Pressable onPress={() => vibration({ style: "light" })}>
                    {({ pressed }) => (
                      <Gear
                        width={normalize(30)}
                        height={normalize(26)}
                        color={
                          Colors[uiStore.colorScheme as "light" | "dark"].text
                        }
                        style={{ marginLeft: 15, opacity: pressed ? 0.5 : 1 }}
                      />
                    )}
                  </Pressable>
                </Link>
              ),
              headerRight: __DEV__
                ? () => (
                    <Link href="/Relationships" asChild>
                      <Pressable onPress={() => vibration({ style: "light" })}>
                        {({ pressed }) => (
                          <HouseHeart
                            width={normalize(30)}
                            height={normalize(26)}
                            color={"#f87171"}
                            style={{
                              marginRight: 15,
                              opacity: pressed ? 0.5 : 1,
                            }}
                          />
                        )}
                      </Pressable>
                    </Link>
                  )
                : undefined,
            }}
          />
          <Tabs.Screen
            name="spells"
            options={{
              ...commonOptions,
              title: "Spells",
              tabBarIcon: ({ color }) => (
                <Wand
                  width={normalize(26)}
                  height={normalize(26)}
                  color={color}
                />
              ),
              headerRight: () => (
                <Link href="/Study" asChild>
                  <Pressable onPress={() => vibration({ style: "light" })}>
                    {({ pressed }) => (
                      <BookSparkles
                        width={normalize(26)}
                        height={normalize(28)}
                        color={
                          elementalColorMap[
                            playerState?.blessing ?? Element.fire
                          ].dark
                        }
                        style={{
                          marginRight: 15,
                          marginBottom: 3,
                          opacity: pressed ? 0.5 : 1,
                        }}
                      />
                    )}
                  </Pressable>
                </Link>
              ),
            }}
          />
          <Tabs.Screen
            name="labor"
            options={{
              ...commonOptions,
              title: "Labor",
              tabBarIcon: ({ color }) => (
                <Broom
                  width={normalize(30)}
                  height={normalize(26)}
                  color={color}
                />
              ),
              headerLeft: () => (
                <Link href="/Education" asChild>
                  <Pressable onPress={() => vibration({ style: "light" })}>
                    {({ pressed }) => (
                      <GraduationCapIcon
                        width={normalize(28)}
                        height={normalize(28)}
                        color={
                          uiStore.colorScheme == "light" ? "#3f3f46" : "#e4e4e7"
                        }
                        style={{
                          marginLeft: 15,
                          marginBottom: 3,
                          opacity: pressed ? 0.5 : 1,
                        }}
                      />
                    )}
                  </Pressable>
                </Link>
              ),
              headerRight: () => (
                <Link href="/Investing" asChild>
                  <Pressable onPress={() => vibration({ style: "light" })}>
                    {({ pressed }) => (
                      <Image
                        source={require("../../assets/images/icons/investing.png")}
                        style={{
                          height: normalize(28),
                          width: normalize(28),
                          marginRight: 15,
                          marginBottom: 6,
                          opacity: pressed ? 0.5 : 1,
                        }}
                      />
                    )}
                  </Pressable>
                </Link>
              ),
            }}
          />
          <Tabs.Screen
            name="shops"
            options={{
              ...commonOptions,
              title: "Shops",
              tabBarIcon: ({ color }) => (
                <Potion
                  width={normalize(28)}
                  height={normalize(30)}
                  color={color}
                />
              ),
              headerRight: __DEV__
                ? () => (
                    <Link href="/Activities" asChild>
                      <Pressable onPress={() => vibration({ style: "light" })}>
                        {({ pressed }) => (
                          <BowlingBallAndPin
                            width={normalize(30)}
                            height={normalize(28)}
                            color={"#27272a"}
                            style={{
                              marginRight: 15,
                              opacity: pressed ? 0.5 : 1,
                            }}
                          />
                        )}
                      </Pressable>
                    </Link>
                  )
                : undefined,
            }}
          />
          <Tabs.Screen
            name="medical"
            options={{
              ...commonOptions,
              title: "Medical",
              tabBarIcon: ({ color }) => (
                <Medical
                  width={normalize(30)}
                  height={normalize(28)}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="dungeon"
            options={{
              ...commonOptions,
              title: "Dungeon",
              tabBarIcon: ({ color }) => (
                <Dungeon
                  width={normalize(28)}
                  height={normalize(28)}
                  color={color}
                />
              ),
              headerLeft: __DEV__
                ? () => (
                    <Pressable
                      onPress={() => {
                        if (dungeonStore.pvpUnlocked) {
                          uiStore.setTotalLoadingSteps(3);
                          vibration({ style: "warning" });
                          wait(100).then(() => {
                            router.replace(`/DungeonLevel`);
                            uiStore.incrementLoadingStep();
                          });
                        } else {
                          setShowPVPInfoModal(true);
                        }
                      }}
                    >
                      {({ pressed }) => (
                        <MaterialCommunityIcons
                          name="sword-cross"
                          size={30}
                          color={Colors[uiStore.colorScheme].health}
                          style={{ marginLeft: 15, opacity: pressed ? 0.5 : 1 }}
                        />
                      )}
                    </Pressable>
                  )
                : undefined,
              headerRight: () => (
                <Pressable
                  onPress={() => {
                    uiStore.setTotalLoadingSteps(5);
                    vibration({ style: "warning" });
                    dungeonStore
                      .setUpDungeon("training grounds", "1")
                      .then(() => uiStore.incrementLoadingStep());
                    wait(100).then(() => {
                      router.replace(`/DungeonLevel`);
                      uiStore.incrementLoadingStep();
                    });
                  }}
                >
                  {({ pressed }) => (
                    <Sword
                      width={normalize(30)}
                      height={normalize(30)}
                      color={"#BF9069"}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              ),
            }}
          />
        </Tabs>
      )}
    </>
  );
});
export default TabLayout;
