import investments from "../assets/json/investments.json";
import { ScrollView, View as ThemedView } from "../components/Themed";
import "../assets/styles/globals.css";
import { InvestmentType, TutorialOption } from "../utility/types";
import InvestmentCard from "../components/InvestmentCard";
import PlayerStatus from "../components/PlayerStatus";
import { useContext } from "react";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../components/TutorialModal";
import { Platform, StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { BlurView } from "expo-blur";
import { useColorScheme } from "nativewind";
import { AppContext } from "./_layout";
import { useHeaderHeight } from "@react-navigation/elements";
import { observer } from "mobx-react-lite";

const InvestingScreen = observer(() => {
  const appData = useContext(AppContext);
  if (!appData) {
    throw new Error("missing context");
  }
  const { gameState } = appData;
  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();

  return (
    <>
      <Stack.Screen
        options={{
          headerBackTitleVisible: false,
          headerTransparent: true,
          headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
          headerBackground: () => (
            <BlurView
              blurReductionFactor={12}
              tint={
                Platform.OS == "android"
                  ? colorScheme == "light"
                    ? "light"
                    : "dark"
                  : "default"
              }
              intensity={100}
              style={StyleSheet.absoluteFill}
              experimentalBlurMethod={"dimezisBlurView"}
            />
          ),
        }}
      />
      <TutorialModal
        isVisibleCondition={
          (!gameState?.tutorialsShown[TutorialOption.investing] &&
            gameState?.tutorialsEnabled &&
            isFocused) ??
          false
        }
        tutorial={TutorialOption.investing}
        pageOne={{
          title: "Investing",
          body: "Put your gold to work and make time work for you.",
        }}
        pageTwo={{
          title: "Note:",
          body: "You will need to clear out dungeons to unlock the purchasing of these investments.",
        }}
        pageThree={{
          body: "Each investment base has a number of upgrades, some with significant consequences on your character.",
        }}
      />
      <ThemedView className="flex-1 pb-24">
        <ScrollView>
          <View style={{ paddingTop: useHeaderHeight() }}>
            {investments.map((investment: InvestmentType, idx) => (
              <InvestmentCard key={idx} investment={investment} />
            ))}
          </View>
        </ScrollView>
      </ThemedView>
      <PlayerStatus tabScreen />
    </>
  );
});
export default InvestingScreen;
