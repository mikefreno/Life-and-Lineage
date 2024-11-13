import { observer } from "mobx-react-lite";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Text } from "../components/Themed";
import ProgressBar from "./ProgressBar";
import GenericRaisedButton from "./GenericRaisedButton";
import { toTitleCase } from "../utility/functions/misc";
import { Coins, Sanity } from "../assets/icons/SVGIcons";
import { useRootStore } from "../hooks/stores";

interface TrainingCardProps {
  name: string;
  ticks: number;
  goldCostPerTick: number;
  sanityCostPerTick: number;
  preRequisites: string[] | null;
}

const TrainingCard = observer(
  ({
    name,
    ticks,
    goldCostPerTick,
    sanityCostPerTick,
    preRequisites,
  }: TrainingCardProps) => {
    const { colorScheme } = useColorScheme();
    const { playerState, gameState } = useRootStore();
    const [experience, setExperience] = useState<number | undefined>(
      playerState?.getSpecifiedQualificationProgress(name),
    );

    if (!playerState || !gameState) throw new Error("missing data providers");

    useEffect(() => {
      setExperience(playerState.getSpecifiedQualificationProgress(name));
    }, [playerState?.currentSanity]);

    const progressQualification = () => {
      playerState.incrementQualificationProgress(
        name,
        ticks,
        sanityCostPerTick,
        goldCostPerTick,
      );
      gameState.gameTick();
    };

    return (
      <View
        className="m-2 rounded-xl"
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 3,
            height: 1,
          },
          elevation: 1,
          backgroundColor: colorScheme == "light" ? "#fafafa" : "#27272a",
          shadowOpacity: 0.2,
          shadowRadius: 3,
        }}
      >
        <View className="flex justify-between rounded-xl px-4 py-2 text-zinc-950 dark:border dark:border-zinc-500">
          <View className="flex flex-row justify-between">
            <Text className="bold my-auto w-2/3 text-xl dark:text-zinc-50">
              {toTitleCase(name)}
            </Text>
            {!playerState?.qualifications.includes(name) ? (
              <View className="my-auto -mb-8 mt-8 w-1/3">
                {goldCostPerTick == 0 ? (
                  <Text className="mx-auto dark:text-zinc-50">Free</Text>
                ) : (
                  <View className="flex w-full flex-row items-center justify-evenly">
                    <Text className="dark:text-zinc-50">{goldCostPerTick}</Text>
                    <Coins width={14} height={14} style={{ marginLeft: 6 }} />
                  </View>
                )}
                <View className="flex w-full flex-row items-center justify-evenly">
                  <Text className="dark:text-zinc-50">
                    -{sanityCostPerTick}
                  </Text>
                  <Sanity width={14} height={14} style={{ marginLeft: 6 }} />
                </View>
              </View>
            ) : null}
          </View>
          {!playerState?.qualifications.includes(name) ? (
            <>
              {playerState.hasAllPreReqs(preRequisites) ? (
                <GenericRaisedButton
                  onPress={progressQualification}
                  disabled={
                    playerState.gold < goldCostPerTick ||
                    !playerState.hasAllPreReqs(preRequisites)
                  }
                >
                  {playerState.hasAllPreReqs(preRequisites)
                    ? "Study"
                    : "Locked"}
                </GenericRaisedButton>
              ) : null}
              {playerState.hasAllPreReqs(preRequisites) ? (
                <ProgressBar value={experience ?? 0} maxValue={ticks} />
              ) : (
                <View className="flex items-center">
                  <Text className="text-lg">Missing:</Text>
                  {playerState.missingPreReqs(preRequisites)?.map((missing) => (
                    <Text key={missing} className="py-1">
                      {toTitleCase(missing)}
                    </Text>
                  ))}
                </View>
              )}
            </>
          ) : (
            <Text>Completed!</Text>
          )}
        </View>
      </View>
    );
  },
);
export default TrainingCard;
