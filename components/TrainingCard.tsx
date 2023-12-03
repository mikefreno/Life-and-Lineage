import { observer } from "mobx-react-lite";
import { useColorScheme } from "nativewind";
import { useContext, useEffect, useState } from "react";
import { GameContext, PlayerCharacterContext } from "../app/_layout";
import Coins from "../assets/icons/CoinsIcon";
import Sanity from "../assets/icons/SanityIcon";
import { Pressable, View, Text } from "react-native";
import ProgressBar from "./ProgressBar";
import { fullSave, toTitleCase } from "../utility/functions";

interface TrainingCardProps {
  name: string;
  ticks: number;
  goldCostPerTick: number;
  sanityCostPerTick: number;
}

const TrainingCard = observer(
  ({ name, ticks, goldCostPerTick, sanityCostPerTick }: TrainingCardProps) => {
    const { colorScheme } = useColorScheme();
    const playerCharacterData = useContext(PlayerCharacterContext);
    const gameData = useContext(GameContext);
    if (!playerCharacterData || !gameData) throw new Error("missing context");
    const { playerState } = playerCharacterData;
    const { gameState } = gameData;
    const [experience, setExperience] = useState<number | undefined>(
      playerState?.getSpecifiedQualificationProgress(name),
    );

    if (!playerState || !gameState) throw new Error("missing data providers");

    useEffect(() => {
      setExperience(playerState.getSpecifiedQualificationProgress(name));
    }, [playerState?.sanity]);

    const progressQualification = () => {
      playerState.incrementQualificationProgress(
        name,
        ticks,
        sanityCostPerTick,
        goldCostPerTick,
      );
      gameState.gameTick();
      fullSave(gameState, playerState);
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
              <Pressable
                disabled={playerState.gold < goldCostPerTick}
                className="mb-2 mt-4 active:scale-95 active:opacity-50"
                onPress={progressQualification}
              >
                <View
                  className="mx-auto rounded-xl"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    backgroundColor:
                      colorScheme == "light" ? "white" : "#71717a",
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                  }}
                >
                  <View className="px-8 py-4">
                    <Text className="text-center text-zinc-900 dark:text-zinc-50">
                      Study
                    </Text>
                  </View>
                </View>
              </Pressable>
              <ProgressBar value={experience ?? 0} maxValue={ticks} />
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
