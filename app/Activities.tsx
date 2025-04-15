import React from "react";
import ActivityCard from "@/components/ActivityCard";
import { ScrollView } from "react-native";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { tw_base, useStyles } from "@/hooks/styles";
import { useRootStore } from "@/hooks/stores";
import { jsonServiceStore } from "@/stores/SingletonSource";

export default function Activities() {
  const { uiStore } = useRootStore();
  const styles = useStyles();

  return (
    <>
      <ScrollView
        style={{ paddingHorizontal: tw_base[4] }}
        contentContainerStyle={{
          paddingTop: uiStore.headerHeight + 12,
          paddingBottom: uiStore.playerStatusHeightSecondary + 8,
          ...styles.notchAvoidingLanscapeMargin,
        }}
      >
        {jsonServiceStore.readJsonFileSync("activities").map((activity) => (
          <ActivityCard activity={activity} key={activity.name} />
        ))}
      </ScrollView>
      <PlayerStatusForSecondary />
    </>
  );
}
