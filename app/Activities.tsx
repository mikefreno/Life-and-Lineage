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
            />
          ),
        }}
      />
      <ThemedView className="flex-1">
        <ScrollView>
          <View
            className="px-4"
            style={{ paddingBottom: 95, paddingTop: useHeaderHeight() }}
          >
            {activities.map((activity) => (
              <ActivityCard activity={activity} key={activity.name} />
            ))}
          </View>
        </ScrollView>
      </ThemedView>
      <View className="absolute z-50 w-full" style={{ bottom: 95 }}>
        <PlayerStatus />
      </View>
    </>
  );
}
