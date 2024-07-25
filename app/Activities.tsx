import { View as ThemedView } from "../components/Themed";
import activities from "../assets/json/activities.json";
import ActivityCard from "../components/ActivityCard";
import { ScrollView, View, StyleSheet, Platform } from "react-native";
import PlayerStatus from "../components/PlayerStatus";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { BlurView } from "expo-blur";
import { useHeaderHeight } from "@react-navigation/elements";

export default function Activities() {
  const { colorScheme } = useColorScheme();
  return (
    <>
      <Stack.Screen
        options={{
          title: "Activities",
          headerBackTitleVisible: false,
          headerTransparent: true,
          headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
          headerBackground: () => (
            <BlurView
              blurReductionFactor={8}
              tint={
                Platform.OS == "android"
                  ? colorScheme == "light"
                    ? "systemMaterialLight"
                    : "systemMaterialDark"
                  : "default"
              }
              intensity={100}
              style={StyleSheet.absoluteFill}
              experimentalBlurMethod={"dimezisBlurView"}
              className="shadow-diffuse"
            />
          ),
        }}
      />
      <ThemedView className="flex justify-between h-full">
        <ScrollView>
          <View className="px-4" style={{ paddingTop: useHeaderHeight() }}>
            {activities.map((activity) => (
              <ActivityCard activity={activity} key={activity.name} />
            ))}
          </View>
        </ScrollView>
        <View className="pb-6">
          <PlayerStatus positioning={"relative"} hideGold={false} />
        </View>
      </ThemedView>
    </>
  );
}
