import { observer } from "mobx-react-lite";
import { ScrollView, View as ThemedView } from "../components/Themed";
import qualifications from "../assets/json/qualifications.json";
import PlayerStatus from "../components/PlayerStatus";
import TrainingCard from "../components/TrainingCard";
import { Stack } from "expo-router";
import TutorialModal from "../components/TutorialModal";
import { useContext } from "react";
import { useIsFocused } from "@react-navigation/native";
import { Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useColorScheme } from "nativewind";
import { useHeaderHeight } from "@react-navigation/elements";
import { AppContext } from "./_layout";
import { TutorialOption } from "../utility/types";

const JobTraining = observer(() => {
  const appData = useContext(AppContext);
  if (!appData) {
    throw new Error("missing context");
  }
  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();

  const header = useHeaderHeight();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Traditional Study",
          headerBackTitleVisible: false,
          headerTransparent: true,
          headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
          headerBackground: () => (
            <BlurView
              blurReductionFactor={4}
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
        isFocused={isFocused}
        tutorial={TutorialOption.training}
        pageOne={{
          title: "Labor Training",
          body: "Here you can gain access to better jobs, just keep a careful eye on your sanity.",
        }}
      />
      <ThemedView className="flex-1">
        <ScrollView
          style={{ paddingTop: header }}
          scrollIndicatorInsets={{ top: 0, right: 0, left: 0, bottom: 48 }}
        >
          <ThemedView className="px-2 pt-4">
            {[
              ...qualifications,
              ...qualifications,
              ...qualifications,
              ...qualifications,
              ...qualifications,
              ...qualifications,
              ...qualifications,
              ...qualifications,
            ].map((qual, index) => {
              return (
                <TrainingCard
                  key={index}
                  name={qual.name}
                  ticks={qual.ticks}
                  sanityCostPerTick={qual.sanityCostPerTick}
                  goldCostPerTick={qual.goldCostPerTick}
                  preRequisites={qual.prerequisites}
                />
              );
            })}
          </ThemedView>
        </ScrollView>
      </ThemedView>
      <PlayerStatus tabScreen />
    </>
  );
});
export default JobTraining;
