import { View as ThemedView } from "../components/Themed";
import activities from "../assets/json/activities.json";
import ActivityCard from "../components/ActivityCard";
import { ScrollView, View, StyleSheet, Platform } from "react-native";
import PlayerStatus from "../components/PlayerStatus";
import { Stack } from "expo-router";
import { BlurView } from "expo-blur";
import { useHeaderHeight } from "@react-navigation/elements";

export default function Activities() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Activities",
          headerBackTitleVisible: false,
          headerTransparent: true,
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
        }}
      />
      <ThemedView className="flex-1 justify-between">
        <ScrollView>
          <View className="px-4" style={{ paddingTop: useHeaderHeight() }}>
            {activities.map((activity) => (
              <ActivityCard activity={activity} key={activity.name} />
            ))}
          </View>
        </ScrollView>
      </ThemedView>
      <PlayerStatus tabScreen />
    </>
  );
}
