import { Link, Tabs } from "expo-router";
import { GestureResponderEvent, Platform, Pressable } from "react-native";
import Colors from "../../constants/Colors";
import Wand from "../../assets/icons/WandIcon";
import BookSparkles from "../../assets/icons/BookSparklesIcon";
import Gear from "../../assets/icons/GearIcon";
import Broom from "../../assets/icons/BroomIcon";
import Dungeon from "../../assets/icons/DungeonIcon";
import Potion from "../../assets/icons/PotionIcon";
import Medical from "../../assets/icons/MedicalIcon";
import WizardHat from "../../assets/icons/WizardHatIcon";
import HouseHeart from "../../assets/icons/RelationshipsIcon";
import Sword from "../../assets/icons/SwordIcon";
import { elementalColorMap } from "../../utility/elementColors";
import PaladinHammer from "../../assets/icons/PaladinHammer";
import Necromancer from "../../assets/icons/NecromancerSkull";
import { useColorScheme } from "nativewind";
import { useContext } from "react";
import { PlayerCharacterContext } from "../_layout";
import GraduationCapIcon from "../../assets/icons/GraduationCap";
import { useVibration } from "../../utility/customHooks";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const playerCharacter = useContext(PlayerCharacterContext)?.playerState;
  const vibration = useVibration();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme as "light" | "dark"].tint,
          tabBarStyle:
            Platform.OS === "android" ? { paddingHorizontal: 16 } : {},
          tabBarButton: (props) => {
            const onPressWithVibration = (event: GestureResponderEvent) => {
              vibration({ style: "light" });
              if (props.onPress) props.onPress(event);
            };
            return <Pressable {...props} onPress={onPressWithVibration} />;
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) =>
              playerCharacter?.playerClass == "necromancer" ? (
                <Necromancer
                  width={28}
                  height={26}
                  color={color}
                  style={{ marginBottom: -3 }}
                />
              ) : playerCharacter?.playerClass == "paladin" ? (
                <PaladinHammer
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
                <Pressable>
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
                <Pressable>
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
                      color={elementalColorMap[playerCharacter!.blessing].dark}
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
            title: "Labor",
            tabBarIcon: ({ color }) => (
              <Broom
                width={30}
                height={26}
                color={color}
                style={{ marginBottom: -3 }}
              />
            ),
            headerRight: () => (
              <Link href="/Training" asChild>
                <Pressable onPress={() => vibration({ style: "light" })}>
                  {({ pressed }) => (
                    <GraduationCapIcon
                      width={28}
                      height={28}
                      color={colorScheme == "dark" ? "#f4f4f5" : "#27272a"}
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
          name="dungeon"
          options={{
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
            title: "Shops",
            tabBarIcon: ({ color }) => (
              <Potion
                width={26}
                height={28}
                color={color}
                style={{ marginBottom: -3 }}
              />
            ),
            headerRight: () => (
              <Link href="/Investing" asChild>
                <Pressable onPress={() => vibration({ style: "light" })}>
                  {({ pressed }) => (
                    <MaterialCommunityIcons
                      name="trending-up"
                      size={30}
                      color={Colors[colorScheme as "light" | "dark"].text}
                      style={{
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
          name="medical"
          options={{
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
