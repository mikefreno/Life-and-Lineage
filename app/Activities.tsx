import React from "react";
import activities from "@/assets/json/activities.json";
import ActivityCard from "@/components/ActivityCard";
import { ScrollView, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { tw_base } from "@/hooks/styles";
import { useRootStore } from "@/hooks/stores";

export default function Activities() {
  const headerHeight = useHeaderHeight();
  const { uiStore } = useRootStore();

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + 12,
          paddingHorizontal: tw_base[4],
          paddingBottom: uiStore.playerStatusHeightSecondary,
        }}
      >
        {activities.map((activity) => (
          <ActivityCard activity={activity} key={activity.name} />
        ))}
      </ScrollView>
      <PlayerStatusForSecondary />
    </View>
  );
}
