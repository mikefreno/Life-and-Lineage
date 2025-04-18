import React, { useEffect, useRef, useState } from "react";
import { TutorialOption } from "@/utility/types";
import InvestmentCard from "@/components/InvestmentCard";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "@/components/TutorialModal";
import { ScrollView, View } from "react-native";
import { observer } from "mobx-react-lite";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { jsonServiceStore } from "@/stores/SingletonSource";
import { useLocalSearchParams } from "expo-router";

const InvestingScreen = observer(() => {
  const { targetName } = useLocalSearchParams();
  const isFocused = useIsFocused();
  const { uiStore } = useRootStore();
  const styles = useStyles();

  const scrollRef = useRef<ScrollView>(null);
  const [offsets, setOffsets] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isFocused || !targetName) return;
    const y = offsets[targetName as string] - uiStore.headerHeight;
    if (typeof y === "number") {
      scrollRef.current?.scrollTo({ y, animated: true });
    }
  }, [isFocused, targetName, offsets, uiStore.headerHeight]);

  const investments = jsonServiceStore.readJsonFileSync("investments");

  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.investing}
        isFocused={useIsFocused()}
        pageOne={{
          title: "Investing",
          body: "Put your gold to work and make time work for you.",
        }}
        pageTwo={{
          body: "Each investment base has a number of upgrades, some with significant consequences on your character.",
        }}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          paddingTop: uiStore.headerHeight,
          paddingBottom: uiStore.playerStatusHeightSecondary,
          ...styles.notchAvoidingLanscapeMargin,
        }}
      >
        {investments.map((inv, idx) => (
          <View
            key={idx}
            onLayout={(e) => {
              const { y } = e.nativeEvent.layout;
              setOffsets((prev) => ({ ...prev, [inv.name]: y }));
            }}
          >
            <InvestmentCard
              investment={inv}
              searchedFor={inv.name == (targetName as string)}
            />
          </View>
        ))}
      </ScrollView>
      <PlayerStatusForSecondary />
    </>
  );
});
export default InvestingScreen;
