import React from "react";
import activities from "@/assets/json/activities.json";
import ActivityCard from "@/components/ActivityCard";
import { ScrollView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { tw_base, useStyles } from "@/hooks/styles";
import { useRootStore } from "@/hooks/stores";

export default function Activities() {
  const headerHeight = useHeaderHeight();
  const { uiStore } = useRootStore();
  const styles = useStyles();

  return (
    <>
      <ScrollView
        style={{ paddingHorizontal: tw_base[4] }}
        contentContainerStyle={{
          paddingTop: headerHeight + 12,
          paddingBottom: uiStore.playerStatusHeightSecondary + 8,
          ...styles.notchAvoidingLanscapeMargin,
        }}
      >
        {activities.map((activity) => (
          <ActivityCard activity={activity} key={activity.name} />
        ))}
      </ScrollView>
      <PlayerStatusForSecondary />
    </>
  );
}
