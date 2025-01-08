import React from "react";
import { Link, Tabs, useRouter } from "expo-router";
import {
  GestureResponderEvent,
  Platform,
  Pressable,
  Image,
  View,
} from "react-native";
import Colors, { elementalColorMap } from "../../constants/Colors";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import PlayerStatus, { EXPANDED_PAD } from "../../components/PlayerStatus";
import { LinearGradientBlur } from "../../components/LinearGradientBlur";
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
} from "../../assets/icons/SVGIcons";
import { ThemedView } from "../../components/Themed";
import TutorialModal from "../../components/TutorialModal";
import { useIsFocused } from "@react-navigation/native";
import { Element, TutorialOption } from "../../utility/types";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import { shadows } from "../../hooks/styles";

const PLAYERSTATUS_SPACER = 64;
const TABSELECTOR_HEIGHT = 52;

export default function TabLayout() {
  const isFocused = useIsFocused();

  const { playerState, uiStore, dungeonStore } = useRootStore();

  const router = useRouter();
  const vibration = useVibration();

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
      {playerState && (
        <Tabs
          screenOptions={{
            tabBarBackground: () => {
              return (
                <View style={{ marginHorizontal: -8 }}>
                  <PlayerStatus home hideGold />
                  <LinearGradientBlur intensity={100} />
                </View>
              );
            },
            tabBarActiveTintColor: Colors[uiStore.colorScheme].tint,
            tabBarLabelStyle: {
              fontFamily: "PixelifySans",
              marginHorizontal: "auto",
              marginTop: 4,
            },
            tabBarStyle: {
              position: "absolute",
              borderTopWidth: 0,
              shadowColor: "transparent",
              paddingHorizontal: 4,
              height: PLAYERSTATUS_SPACER + TABSELECTOR_HEIGHT,
            },
            tabBarIconStyle: {
              marginHorizontal: "auto",
            },
            tabBarButton: (props) => {
              const onPressWithVibration = (event: GestureResponderEvent) => {
                vibration({ style: "light" });
                if (props.onPress) props.onPress(event);
              };
              return (
                <View>
                  <Pressable
                    onPress={() => {
                      vibration({ style: "light" });
                      uiStore.setDetailedStatusViewShowing(true);
                    }}
                    style={[
                      {
                        height: uiStore.playerStatusIsCompact
                          ? TABSELECTOR_HEIGHT
                          : TABSELECTOR_HEIGHT + EXPANDED_PAD,
                        marginTop: uiStore.playerStatusIsCompact
                          ? 0
                          : -EXPANDED_PAD,
                      },
                    ]}
                  />
                  {/* ^ The above is to trigger the player status ^ */}
                  <Pressable
                    onPress={onPressWithVibration}
                    accessibilityLabel={props.accessibilityLabel}
                    accessibilityRole={props.accessibilityRole}
                    accessibilityState={props.accessibilityState}
                    style={{
                      height: TABSELECTOR_HEIGHT,
                    }}
                  >
                    {props.children}
                  </Pressable>
                </View>
              );
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              lazy: false,
              headerTransparent: true,
              headerTitleAlign: "center",
              headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
              headerBackground:
                Platform.OS == "ios"
                  ? () => (
                      <BlurView
                        intensity={100}
                        style={StyleSheet.absoluteFill}
                      />
                    )
                  : () => (
                      <ThemedView
                        style={[StyleSheet.absoluteFill, shadows.soft]}
                      />
                    ),
              title: "Home",
              tabBarIcon: ({ color }) =>
                playerState?.playerClass == "necromancer" ? (
                  <NecromancerSkull width={28} height={26} color={color} />
                ) : playerState?.playerClass == "paladin" ? (
                  <PaladinHammer
                    width={28}
                    height={26}
                    color={color}
                    useOpacity={true}
                  />
                ) : playerState?.playerClass == "ranger" ? (
                  <RangerIcon
                    width={28}
                    height={26}
                    color={color}
                    useOpacity={true}
                  />
                ) : (
                  <WizardHat width={28} height={26} color={color} />
                ),
              headerLeft: () => (
                <Link href="/Options" asChild>
                  <Pressable onPress={() => vibration({ style: "light" })}>
                    {({ pressed }) => (
                      <Gear
                        width={30}
                        height={26}
                        color={
                          Colors[uiStore.colorScheme as "light" | "dark"].text
                        }
                        style={{ marginLeft: 15, opacity: pressed ? 0.5 : 1 }}
                      />
                    )}
                  </Pressable>
                </Link>
              ),
              headerRight: () => (
                <Link href="/Relationships" asChild>
                  <Pressable onPress={() => vibration({ style: "light" })}>
                    {({ pressed }) => (
                      <HouseHeart
                        width={30}
                        height={26}
                        color={"#f87171"}
                        style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                      />
                    )}
                  </Pressable>
                </Link>
              ),
            }}
          />
          <Tabs.Screen
            name="spells"
            options={{
              lazy: false,
              headerTransparent: true,
              headerTitleAlign: "center",
              headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
              headerBackground:
                Platform.OS == "ios"
                  ? () => (
                      <BlurView
                        intensity={100}
                        style={StyleSheet.absoluteFill}
                      />
                    )
                  : () => (
                      <ThemedView
                        style={[StyleSheet.absoluteFill, shadows.soft]}
                      />
                    ),
              title: "Spells",
              tabBarIcon: ({ color }) => (
                <Wand width={26} height={26} color={color} />
              ),
              headerRight: () => (
                <Link href="/Study" asChild>
                  <Pressable onPress={() => vibration({ style: "light" })}>
                    {({ pressed }) => (
                      <BookSparkles
                        width={26}
                        height={28}
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
              lazy: false,
              headerTransparent: true,
              headerTitleAlign: "center",
              headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
              headerBackground:
                Platform.OS == "ios"
                  ? () => (
                      <BlurView
                        intensity={100}
                        style={StyleSheet.absoluteFill}
                      />
                    )
                  : () => (
                      <ThemedView
                        style={[StyleSheet.absoluteFill, shadows.soft]}
                      />
                    ),
              title: "Labor",
              tabBarIcon: ({ color }) => (
                <Broom width={30} height={26} color={color} />
              ),
              headerLeft: () => (
                <Link href="/Education" asChild>
                  <Pressable onPress={() => vibration({ style: "light" })}>
                    {({ pressed }) => (
                      <GraduationCapIcon
                        width={28}
                        height={28}
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
                          height: 28,
                          width: 28,
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
            name="dungeon"
            options={{
              lazy: false,
              headerTransparent: true,
              headerTitleAlign: "center",
              headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
              headerBackground:
                Platform.OS == "ios"
                  ? () => <BlurView style={StyleSheet.absoluteFill} />
                  : () => (
                      <ThemedView
                        style={[StyleSheet.absoluteFill, shadows.soft]}
                      />
                    ),
              title: "Dungeon",
              tabBarIcon: ({ color }) => (
                <Dungeon width={28} height={28} color={color} />
              ),
              headerRight: () => (
                <Pressable
                  onPress={async () => {
                    await uiStore.setIsLoading(true);
                    vibration({ style: "warning" });
                    dungeonStore.setUpDungeon("training grounds", "1");
                    router.replace(`/DungeonLevel`);
                  }}
                >
                  {({ pressed }) => (
                    <Sword
                      width={30}
                      height={30}
                      color={"#BF9069"}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              ),
            }}
          />
          <Tabs.Screen
            name="shops"
            options={{
              lazy: false,
              headerTransparent: true,
              headerTitleAlign: "center",
              headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
              headerBackground:
                Platform.OS == "ios"
                  ? () => (
                      <BlurView
                        intensity={100}
                        style={StyleSheet.absoluteFill}
                      />
                    )
                  : () => (
                      <ThemedView
                        style={[StyleSheet.absoluteFill, shadows.soft]}
                      />
                    ),
              title: "Shops",
              tabBarIcon: ({ color }) => (
                <Potion width={28} height={30} color={color} />
              ),
              headerRight: () => (
                <Link href="/Activities" asChild>
                  <Pressable onPress={() => vibration({ style: "light" })}>
                    {({ pressed }) => (
                      <BowlingBallAndPin
                        width={30}
                        height={28}
                        color={"#27272a"}
                        style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                      />
                    )}
                  </Pressable>
                </Link>
              ),
            }}
          />
          <Tabs.Screen
            name="medical"
            options={{
              lazy: false,
              headerTransparent: true,
              headerTitleAlign: "center",
              headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
              headerBackground:
                Platform.OS == "ios"
                  ? () => (
                      <BlurView
                        intensity={100}
                        style={StyleSheet.absoluteFill}
                      />
                    )
                  : () => (
                      <ThemedView
                        style={[StyleSheet.absoluteFill, shadows.soft]}
                      />
                    ),
              title: "Medical",
              tabBarIcon: ({ color }) => (
                <Medical width={30} height={28} color={color} />
              ),
            }}
          />
        </Tabs>
      )}
    </>
  );
}
