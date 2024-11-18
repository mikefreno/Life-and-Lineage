import { Link, Tabs, useNavigation } from "expo-router";
import {
  GestureResponderEvent,
  Platform,
  Pressable,
  Image,
  View,
} from "react-native";
import Colors, { elementalColorMap } from "../../constants/Colors";
import { useColorScheme } from "nativewind";
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
import { TutorialOption } from "../../utility/types";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";

const PLAYERSTATUS_SPACER = 64;
const TABSELECTOR_HEIGHT = 64;

export default function TabLayout() {
  const isFocused = useIsFocused();

  const { colorScheme } = useColorScheme();
  const { playerState, uiStore } = useRootStore();

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
      <Tabs
        screenOptions={{
          tabBarBackground: () => {
            return (
              <View className="-mx-2">
                <PlayerStatus home hideGold />
                <LinearGradientBlur />
              </View>
            );
          },
          tabBarActiveTintColor: Colors[colorScheme].tint,
          tabBarLabelStyle: {
            fontFamily: "PixelifySans",
            marginBottom: 0,
            marginLeft: 0,
          },
          tabBarStyle: {
            position: "absolute",
            borderTopWidth: 0,
            shadowColor: "transparent",
            height: TABSELECTOR_HEIGHT + PLAYERSTATUS_SPACER,
          },
          tabBarButton: (props) => {
            const onPressWithVibration = (event: GestureResponderEvent) => {
              vibration({ style: "light" });
              if (props.onPress) props.onPress(event);
            };
            const isHome = props.accessibilityLabel?.includes("Home");
            const isMedical = props.accessibilityLabel?.includes("Medical");
            return (
              <View className="flex flex-col w-1/6">
                <Pressable
                  onPress={() => {
                    vibration({ style: "light" });
                    uiStore.setDetailedStatusViewShowing(true);
                  }}
                  style={[
                    {
                      height: uiStore.playerStatusIsCompact
                        ? 40
                        : 40 + EXPANDED_PAD,
                      marginLeft: isHome ? 12 : 0,
                      borderTopLeftRadius: isHome ? 12 : 0,
                      borderBottomLeftRadius: isHome ? 12 : 0,
                      marginRight: isMedical ? 12 : 0,
                      borderBottomRightRadius: isMedical ? 12 : 0,
                      borderTopRightRadius: isMedical ? 12 : 0,
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
                    <BlurView intensity={100} style={StyleSheet.absoluteFill} />
                  )
                : () => (
                    <ThemedView
                      style={StyleSheet.absoluteFill}
                      className="shadow-soft"
                    />
                  ),
            title: "Home",
            tabBarIcon: ({ color }) =>
              playerState?.playerClass == "necromancer" ? (
                <NecromancerSkull
                  width={28}
                  height={26}
                  color={color}
                  style={{ marginBottom: -3 }}
                />
              ) : playerState?.playerClass == "paladin" ? (
                <PaladinHammer
                  width={28}
                  height={26}
                  color={color}
                  useOpacity={true}
                  style={{ marginBottom: -3 }}
                />
              ) : playerState?.playerClass == "ranger" ? (
                <RangerIcon
                  width={28}
                  height={26}
                  color={color}
                  useOpacity={true}
                  style={{ marginBottom: -3 }}
                />
              ) : (
                <WizardHat
                  width={28}
                  height={26}
                  color={color}
                  style={{ marginBottom: -3 }}
                />
              ),
            headerLeft: () => (
              <Link href="/Options" asChild>
                <Pressable onPress={() => vibration({ style: "light" })}>
                  {({ pressed }) => (
                    <Gear
                      width={30}
                      height={26}
                      color={Colors[colorScheme as "light" | "dark"].text}
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
                    <BlurView intensity={100} style={StyleSheet.absoluteFill} />
                  )
                : () => (
                    <ThemedView
                      style={StyleSheet.absoluteFill}
                      className="shadow-soft"
                    />
                  ),
            title: "Spells",
            tabBarIcon: ({ color }) => (
              <Wand
                width={26}
                height={26}
                color={color}
                style={{ marginBottom: -3 }}
              />
            ),
            headerRight: () => (
              <Link href="/Study" asChild>
                <Pressable onPress={() => vibration({ style: "light" })}>
                  {({ pressed }) => (
                    <BookSparkles
                      width={26}
                      height={28}
                      color={elementalColorMap[playerState!.blessing].dark}
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
                    <BlurView intensity={100} style={StyleSheet.absoluteFill} />
                  )
                : () => (
                    <ThemedView
                      style={StyleSheet.absoluteFill}
                      className="shadow-soft"
                    />
                  ),
            title: "Labor",
            tabBarIcon: ({ color }) => (
              <Broom
                width={30}
                height={26}
                color={color}
                style={{ marginBottom: -3 }}
              />
            ),
            headerLeft: () => (
              <Link href="/Education" asChild>
                <Pressable onPress={() => vibration({ style: "light" })}>
                  {({ pressed }) => (
                    <GraduationCapIcon
                      width={28}
                      height={28}
                      color={colorScheme == "light" ? "#3f3f46" : "#e4e4e7"}
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
                ? () => (
                    <BlurView
                      intensity={100}
                      style={StyleSheet.absoluteFill}
                      experimentalBlurMethod={"dimezisBlurView"}
                    />
                  )
                : () => (
                    <ThemedView
                      style={StyleSheet.absoluteFill}
                      className="shadow-soft"
                    />
                  ),
            title: "Dungeon",
            tabBarIcon: ({ color }) => (
              <Dungeon
                width={28}
                height={28}
                color={color}
                style={{ marginBottom: -3 }}
              />
            ),
            headerRight: () => (
              <Link href="/DungeonLevel/training grounds/0" asChild>
                <Pressable onPress={() => vibration({ style: "light" })}>
                  {({ pressed }) => (
                    <Sword
                      width={30}
                      height={30}
                      color={"#BF9069"}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
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
            lazy: false,
            headerTransparent: true,
            headerTitleAlign: "center",
            headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
            headerBackground:
              Platform.OS == "ios"
                ? () => (
                    <BlurView intensity={100} style={StyleSheet.absoluteFill} />
                  )
                : () => (
                    <ThemedView
                      style={StyleSheet.absoluteFill}
                      className="shadow-soft"
                    />
                  ),
            title: "Shops",
            tabBarIcon: ({ color }) => (
              <Potion
                width={28}
                height={30}
                color={color}
                style={{ marginBottom: -3 }}
              />
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
                    <BlurView intensity={100} style={StyleSheet.absoluteFill} />
                  )
                : () => (
                    <ThemedView
                      style={StyleSheet.absoluteFill}
                      className="shadow-soft"
                    />
                  ),
            title: "Medical",
            tabBarIcon: ({ color }) => (
              <Medical
                width={30}
                height={28}
                color={color}
                style={{ marginBottom: -3 }}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
