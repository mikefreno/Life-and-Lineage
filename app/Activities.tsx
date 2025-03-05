import React from "react";
import activities from "@/assets/json/activities.json";
import ActivityCard from "@/components/ActivityCard";
import { ScrollView, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { tw } from "../hooks/styles";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";

export default function Activities() {
  return (
    <>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <ScrollView>
          <View style={{ ...tw.px1, paddingTop: useHeaderHeight() }}>
            {activities.map((activity) => (
              <ActivityCard activity={activity} key={activity.name} />
            ))}
          </View>
        </ScrollView>
      </View>
      <PlayerStatusForSecondary />
    </>
  );
}
