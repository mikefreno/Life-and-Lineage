import { Pressable, View } from "react-native";
import { View as ThemedView, Text } from "../components/Themed";
import { Activity } from "../utility/types";
import { useColorScheme } from "nativewind";
import { flipCoin } from "../utility/functions/roll";
import { generateNewCharacter } from "../utility/functions/characterAid";
import { useContext, useState } from "react";
import { PlayerCharacterContext } from "../app/_layout";
import Coins from "../assets/icons/CoinsIcon";
import { toTitleCase } from "../utility/functions/misc";
import GenericModal from "./GenericModal";

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const playerContext = useContext(PlayerCharacterContext);
  if (!playerContext) {
    throw new Error("missing context");
  }
  const { playerState } = playerContext;
  const { colorScheme } = useColorScheme();

  const [showDatePartnerSelection, setShowDatePartnerSelection] =
    useState<boolean>(false);

  function visit() {
    const r = Math.random();
    let cumProb = 0;
    let chosenOutcome;
    for (const outcome in activity.alone) {
      cumProb +=
        activity.alone[
          outcome as
            | "meetingSomeone"
            | "nothingHappens"
            | "randomGood"
            | "randomBad"
        ];
      if (r <= cumProb) {
        chosenOutcome = outcome;
      }
    }
    switch (chosenOutcome) {
      case "meetingSomeone":
        const flipRes = flipCoin();
        if (flipRes == "Heads") {
          const res = generateNewCharacter();
        } else {
        }
      case "randomGood":

      case "randomBad":

      default:
    }
  }

  function date() {
    setShowDatePartnerSelection(true);
  }

  return (
    <>
      <GenericModal
        isVisibleCondition={showDatePartnerSelection}
        backFunction={() => setShowDatePartnerSelection(false)}
      >
        <View></View>
      </GenericModal>
      <ThemedView
        className="m-2 rounded-xl"
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 3,
            height: 1,
          },
          elevation: 3,
          shadowOpacity: 0.2,
          backgroundColor: colorScheme == "light" ? "#fafafa" : "#27272a",
          shadowRadius: 3,
        }}
      >
        <View className="flex justify-between rounded-xl px-4 py-2 text-zinc-950 dark:border dark:border-zinc-500">
          <View className="flex flex-row justify-between">
            <Text className="bold w-1/2 text-xl dark:text-zinc-50">
              {toTitleCase(activity.name)}
            </Text>
            <View className="flex flex-row items-center">
              <Text className="bold text-xl dark:text-zinc-50">
                {activity.cost == 0 ? "free" : activity.cost}{" "}
              </Text>
              {activity.cost !== 0 && <Coins height={14} width={14} />}
            </View>
          </View>
          <View className="flex flex-row ">
            {activity.alone && (
              <Pressable className="mx-auto mb-2 mt-4" onPress={visit}>
                {({ pressed }) => (
                  <View
                    className={`rounded-xl px-8 py-4 ${
                      pressed ? "scale-95 opacity-50" : ""
                    }`}
                    style={{
                      shadowColor: "#000",
                      elevation: 2,
                      backgroundColor:
                        colorScheme == "light" ? "white" : "#71717a",
                      shadowOpacity: 0.1,
                      shadowRadius: 5,
                    }}
                  >
                    <Text className="text-center text-zinc-900 dark:text-zinc-50">
                      Visit Alone
                    </Text>
                  </View>
                )}
              </Pressable>
            )}
            {activity.date && (
              <Pressable
                disabled={playerState?.relationships.length == 0}
                className="mx-auto mb-2 mt-4"
                onPress={date}
              >
                {({ pressed }) => (
                  <View
                    className={`rounded-xl px-8 py-4 ${
                      pressed ? "scale-95 opacity-50" : ""
                    }`}
                    style={
                      playerState?.relationships.length == 0
                        ? {
                            backgroundColor:
                              colorScheme == "light" ? "#ccc" : "#4b4b4b",
                            opacity: 0.5,
                          }
                        : {
                            shadowColor: "#000",
                            elevation: 2,
                            backgroundColor:
                              colorScheme == "light" ? "white" : "#71717a",
                            shadowOpacity: 0.1,
                            shadowRadius: 5,
                          }
                    }
                  >
                    <Text className="text-center text-zinc-900 dark:text-zinc-50">
                      Go on Date
                    </Text>
                  </View>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </ThemedView>
    </>
  );
}
