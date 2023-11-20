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
import WizardHat from "../../assets/icons/WizardHatIcon";
import HouseHeart from "../../assets/icons/RelationshipsIcon";
import { useSelector } from "react-redux";
import { selectPlayerCharacter } from "../../redux/selectors";
import Sword from "../../assets/icons/SwordIcon";
import { elementalColorMap } from "../../utility/elementColors";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const playerCharacter = useSelector(selectPlayerCharacter);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: Platform.OS === "android" ? { paddingHorizontal: 16 } : {},
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) =>
            playerCharacter?.sex == "male" ? (
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
          headerLeft: () => (
            <Link href="/Settings" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Gear
                    width={30}
                    height={26}
                    color={Colors[colorScheme ?? "light"].text}
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
              <Pressable>
                {({ pressed }) => (
                  <BookSparkles
                    width={26}
                    height={28}
                    color={
                      elementalColorMap[
                        playerCharacter!.element.toLowerCase() as
                          | "fire"
                          | "water"
                          | "air"
                          | "earth"
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
          headerRight: () => (
            <Link href="/DungeonLevel/training grounds/0" asChild>
              <Pressable>
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
            <Link href="/Crafting" asChild>
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
