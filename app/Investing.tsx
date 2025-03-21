import React from "react";
import investments from "@/assets/json/investments.json";
import { InvestmentType, TutorialOption } from "@/utility/types";
import InvestmentCard from "@/components/InvestmentCard";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "@/components/TutorialModal";
import { ScrollView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { observer } from "mobx-react-lite";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { useRootStore } from "@/hooks/stores";

const InvestingScreen = observer(() => {
  const header = useHeaderHeight();
  const { uiStore } = useRootStore();

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
        contentContainerStyle={{
          paddingTop: header,
          paddingBottom: uiStore.playerStatusHeightSecondary,
        }}
      >
        {investments.map((investment: InvestmentType, idx) => (
          <InvestmentCard key={idx} investment={investment} />
        ))}
      </ScrollView>
      <PlayerStatusForSecondary />
    </>
  );
});
export default InvestingScreen;
