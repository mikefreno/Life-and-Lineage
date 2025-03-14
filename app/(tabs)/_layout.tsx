import React, { useEffect, useMemo, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TABS_PADDING } from "@/stores/UIStore";

const TabLayout = observer(() => {
  const isFocused = useIsFocused();
  const { playerState, uiStore, dungeonStore } = useRootStore();
  const [showPVPInfoModal, setShowPVPInfoModal] = useState(false);

  const styles = useStyles();
  const router = useRouter();
  const vibration = useVibration();
  const insets = useSafeAreaInsets();

  const leftoverSize = useMemo(() => {
    if (!uiStore.playerStatusTop || !uiStore.playerStatusCompactHeight)
      return 0;

    return Math.max(
      uiStore.dimensions.height -
        uiStore.playerStatusTop -
        uiStore.playerStatusCompactHeight -
        uiStore.iconSizeXL -
        Math.max(insets.bottom, 8) +
        TABS_PADDING,
      0,
    );
  }, [uiStore.playerStatusCompactHeight, uiStore.playerStatusTop]);

  const commonOptions = {
    lazy: false,
    headerTransparent: true,
    headerTitleAlign: "center",
    headerTitleStyle: { fontFamily: "PixelifySans", fontSize: normalize(24) },
    headerBackground:
      Platform.OS == "ios"
        ? () => (
            <BlurView
              intensity={100}
              style={[StyleSheet.absoluteFill, styles.diffuse]}
              tint={uiStore.colorScheme}
            />
          )
        : () => (
            <ThemedView style={[StyleSheet.absoluteFill, shadows.diffuse]} />
          ),
  } as const;

  useEffect(() => {
    Platform.OS === "ios" &&
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
              height:
                uiStore.tabHeight + (uiStore.playerStatusCompactHeight ?? 0),
              paddingHorizontal: "2%",
            },
            tabBarIconStyle: {
              marginHorizontal: "auto",
              height: uiStore.iconSizeXL,
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
                    top:
                      (uiStore.playerStatusCompactHeight ?? 0) +
                      leftoverSize / 2,
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
                    width={uiStore.iconSizeXL}
                    height={uiStore.iconSizeXL}
                    color={color}
                  />
                ) : playerState?.playerClass == "paladin" ? (
                  <PaladinHammer
                    width={uiStore.iconSizeXL}
                    height={uiStore.iconSizeXL}
                    color={color}
                    useOpacity={true}
                  />
                ) : playerState?.playerClass == "ranger" ? (
                  <RangerIcon
                    width={uiStore.iconSizeXL}
                    height={uiStore.iconSizeXL}
                    color={color}
                    useOpacity={true}
                  />
                ) : (
                  <WizardHat
                    width={uiStore.iconSizeXL}
                    height={uiStore.iconSizeXL}
                    color={color}
                  />
                ),
              headerLeft: () => (
                <Link href="/Options" asChild>
                  <Pressable onPress={() => vibration({ style: "light" })}>
                    {({ pressed }) => (
                      <Gear
                        width={uiStore.iconSizeXL}
                        height={uiStore.iconSizeXL}
                        color={
                          Colors[uiStore.colorScheme as "light" | "dark"].text
                        }
                        style={{ marginLeft: 15, ropacity: pressed ? 0.5 : 1 }}
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
                            width={uiStore.iconSizeXL}
                            height={uiStore.iconSizeXL}
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
                  width={uiStore.iconSizeXL}
                  height={uiStore.iconSizeXL}
                  color={color}
                />
              ),
              headerRight: () => (
                <Link href="/Study" asChild>
                  <Pressable onPress={() => vibration({ style: "light" })}>
                    {({ pressed }) => (
                      <BookSparkles
                        width={uiStore.iconSizeXL}
                        height={uiStore.iconSizeXL}
                        color={
                          elementalColorMap[
                            playerState?.blessing ?? Element.fire
                          ][uiStore.colorScheme == "dark" ? "light" : "dark"]
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
                  width={uiStore.iconSizeXL * 1.15} // sizing corrective
                  height={uiStore.iconSizeXL}
                  color={color}
                />
              ),
              headerLeft: () => (
                <Link href="/Education" asChild>
                  <Pressable onPress={() => vibration({ style: "light" })}>
                    {({ pressed }) => (
                      <GraduationCapIcon
                        width={uiStore.iconSizeXL}
                        height={uiStore.iconSizeXL}
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
                          height: uiStore.iconSizeXL,
                          width: uiStore.iconSizeXL,
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
                  width={uiStore.iconSizeXL}
                  height={uiStore.iconSizeXL}
                  color={color}
                />
              ),
              headerRight: __DEV__
                ? () => (
                    <Link href="/Activities" asChild>
                      <Pressable onPress={() => vibration({ style: "light" })}>
                        {({ pressed }) => (
                          <BowlingBallAndPin
                            width={uiStore.iconSizeXL}
                            height={uiStore.iconSizeXL}
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
                  width={uiStore.iconSizeXL}
                  height={uiStore.iconSizeXL}
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
                  width={uiStore.iconSizeXL}
                  height={uiStore.iconSizeXL}
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
                          size={uiStore.iconSizeXL}
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
                      width={uiStore.iconSizeXL}
                      height={uiStore.iconSizeXL}
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
