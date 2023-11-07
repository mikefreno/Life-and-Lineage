import { Link, Tabs } from "expo-router";
import { Pressable, View, useColorScheme } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import Cauldron from "../../assets/icons/CauldronIcon";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome5>["name"];
  color: string;
}) {
  return <FontAwesome5 size={28} style={{ marginBottom: -4 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="hat-wizard" color={color} />
          ),
          headerRight: () => (
            <Link href="/Settings" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome5
                    name="hamburger"
                    size={25}
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
        name="items"
        options={{
          title: "Items",
          tabBarIcon: ({ color }) => (
            <Cauldron
              width={28}
              height={32}
              colorPrimary={color}
              colorSecondary={"#a1a1aa"}
              style={{ marginBottom: 2, marginRight: 1 }}
            />
          ),
          headerRight: () => (
            <Link href="/Craft" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome5
                    name="hammer"
                    size={25}
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
        name="study"
        options={{
          title: "Study",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="book-open" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="labor"
        options={{
          title: "Labor",
          tabBarIcon: ({ color }) => <TabBarIcon name="broom" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dungeon"
        options={{
          title: "Dungeon",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="dungeon" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medical"
        options={{
          title: "Medical",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="book-medical" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
