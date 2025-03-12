import React from "react";
import activities from "@/assets/json/activities.json";
import ActivityCard from "@/components/ActivityCard";
import { ScrollView, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { tw_base } from "@/hooks/styles";

export default function Activities() {
  const headerHeight = useHeaderHeight();
  return (
    <>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <ScrollView
          contentContainerStyle={{
            marginTop: headerHeight + 12,
            paddingHorizontal: tw_base[4],
          }}
        >
          {activities.map((activity) => (
            <ActivityCard activity={activity} key={activity.name} />
          ))}
        </ScrollView>
      </View>
      <PlayerStatusForSecondary />
    </>
  );
}
