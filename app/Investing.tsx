import investments from "../assets/json/investments.json";
import "../assets/styles/globals.css";
import { InvestmentType, TutorialOption } from "../utility/types";
import InvestmentCard from "../components/InvestmentCard";
import PlayerStatus from "../components/PlayerStatus";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../components/TutorialModal";
import { ScrollView, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { observer } from "mobx-react-lite";

const InvestingScreen = observer(() => {
  const header = useHeaderHeight();

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
      <View className="flex-1">
        <ScrollView
          scrollIndicatorInsets={{ top: 0, right: 0, left: 0, bottom: 48 }}
        >
          <View style={{ paddingTop: header, paddingBottom: 96 }}>
            {investments.map((investment: InvestmentType, idx) => (
              <InvestmentCard key={idx} investment={investment} />
            ))}
          </View>
        </ScrollView>
      </View>
      <PlayerStatus tabScreen />
    </>
  );
});
export default InvestingScreen;
