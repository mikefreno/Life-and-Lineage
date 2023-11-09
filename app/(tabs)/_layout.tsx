import { Link, Tabs } from "expo-router";
import { Platform, Pressable, useColorScheme } from "react-native";
import Colors from "../../constants/Colors";
import Cauldron from "../../assets/icons/CauldronIcon";
import Wand from "../../assets/icons/WandIcon";
import BookSparkles from "../../assets/icons/BookSparklesIcon";
import Gear from "../../assets/icons/GearIcon";
import WitchHat from "../../assets/icons/WitchHatIcon";
import Broom from "../../assets/icons/BroomIcon";
import Dungeon from "../../assets/icons/DungeonIcon";
import Potion from "../../assets/icons/PotionIcon";
import Medical from "../../assets/icons/MedicalIcon";
import { useContext } from "react";
import { PlayerCharacterContext } from "../_layout";
import WizardHat from "../../assets/icons/WizardHatIcon";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const playerContext = useContext(PlayerCharacterContext);

  if (!playerContext) {
    throw new Error(
      "NewGameScreen must be used within a PlayerCharacterContext provider",
    );
  }

  const { playerCharacter } = playerContext;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: Platform.OS === "android" ? { paddingHorizontal: 16 } : {},
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) =>
            playerCharacter?.getSex() == "male" ? (
              <WizardHat
                width={28}
                height={26}
                color={color}
                style={{ marginBottom: -3 }}
              />
            ) : (
              <WitchHat
                width={28}
                height={26}
                color={color}
                style={{ marginBottom: -3 }}
              />
            ),
          headerRight: () => (
            <Link href="/Settings" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Gear
                    width={30}
                    height={26}
                    color={Colors[colorScheme ?? "light"].text}
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
              <Pressable>
                {({ pressed }) => (
                  <BookSparkles
                    width={26}
                    height={28}
                    color={Colors[colorScheme ?? "light"].text}
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
        }}
      />
      <Tabs.Screen
        name="potions"
        options={{
          title: "Potions",
          tabBarIcon: ({ color }) => (
            <Potion
              width={26}
              height={28}
              color={color}
              style={{ marginBottom: -3 }}
            />
          ),
          headerRight: () => (
            <Link href="/Brew" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Cauldron
                    width={26}
                    height={30}
                    color={Colors[colorScheme ?? "light"].text}
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
  );
}
