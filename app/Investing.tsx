import React from "react";
import { InvestmentType, TutorialOption } from "@/utility/types";
import InvestmentCard from "@/components/InvestmentCard";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "@/components/TutorialModal";
import { ScrollView } from "react-native";
import { observer } from "mobx-react-lite";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { jsonServiceStore } from "@/stores/SingletonSource";

const InvestingScreen = observer(() => {
  const { uiStore } = useRootStore();
  const styles = useStyles();

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
          paddingTop: uiStore.headerHeight,
          paddingBottom: uiStore.playerStatusHeightSecondary,
          ...styles.notchAvoidingLanscapeMargin,
        }}
      >
        {jsonServiceStore
          .readJsonFileSync("investments")
          .map((investment: InvestmentType, idx) => (
            <InvestmentCard key={idx} investment={investment} />
          ))}
      </ScrollView>
      <PlayerStatusForSecondary />
    </>
  );
});
export default InvestingScreen;
