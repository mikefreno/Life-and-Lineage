import { View, Text, Pressable } from "react-native";
import Coins from "../assets/icons/CoinsIcon";
import Energy from "../assets/icons/EnergyIcon";
import Sanity from "../assets/icons/SanityIcon";
import HealthIcon from "../assets/icons/HealthIcon";
import ProgressBar from "./ProgressBar";
import { useColorScheme } from "nativewind";
import { useIsFocused } from "@react-navigation/native";
import { useContext, useState } from "react";
import {
  GameContext,
  MonsterContext,
  PlayerCharacterContext,
} from "../app/_layout";
import { observer } from "mobx-react-lite";

interface LaborTaskProps {
  reward: number;
  title: string;
  cost: {
    mana: number;
    sanity?: number;
    health?: number;
  };
  experienceToPromote: number;
}

const LaborTask = observer(
  ({ title, reward, cost, experienceToPromote }: LaborTaskProps) => {
    const playerCharacterData = useContext(PlayerCharacterContext);
    const gameData = useContext(GameContext);
    const monsterData = useContext(MonsterContext);
    if (!playerCharacterData || !gameData || !monsterData)
      throw new Error("missing context");
    const { gameState } = gameData;
    const { playerState } = playerCharacterData;
    const { setMonster } = monsterData;

    const [experience, setExperience] = useState(
      playerState?.getJobExperience(title),
    );

    const isFocused = useIsFocused();

    const { colorScheme } = useColorScheme();

    function setJob() {
      if (playerState && gameState) {
        playerState.setJob(title);
      }
    }

    function work() {
      if (playerState && gameState && isFocused) {
        playerState.performLabor({
          title: title,
          cost: cost,
          goldReward: reward,
        });
        gameState.gameTick();
        setExperience(playerState.getJobExperience(title));
        setMonster(null);
      }
    }

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
              {title}
            </Text>
            <View className="my-auto -mb-8 mt-8 w-1/3">
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="dark:text-zinc-50">{reward}</Text>
                <Coins width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="dark:text-zinc-50">-{cost.mana}</Text>
                <Energy width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
              {cost.health && (
                <View className="flex w-full flex-row items-center justify-evenly">
                  <Text className="dark:text-zinc-50">-{cost.health}</Text>
                  <HealthIcon
                    width={14}
                    height={14}
                    style={{ marginLeft: 6 }}
                  />
                </View>
              )}
              {cost.sanity && (
                <View className="flex w-full flex-row items-center justify-evenly">
                  <Text className="dark:text-zinc-50">-{cost.sanity}</Text>
                  <Sanity width={14} height={14} style={{ marginLeft: 6 }} />
                </View>
              )}
            </View>
          </View>
          {playerState?.job == title ? (
            <>
              <Pressable
                className="mb-2 mt-4 active:scale-95 active:opacity-50"
                onPress={work}
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
                      Work
                    </Text>
                  </View>
                </View>
              </Pressable>
              <ProgressBar
                value={experience ?? 0}
                maxValue={experienceToPromote}
              />
            </>
          ) : (
            <Pressable
              className="mb-2 mt-4 active:scale-95 active:opacity-50"
              onPress={setJob}
            >
              <View
                className="mx-auto rounded-xl"
                style={{
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  backgroundColor: colorScheme == "light" ? "white" : "#71717a",
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                }}
              >
                <View className="px-8 py-4">
                  <Text className="text-center text-zinc-900 dark:text-zinc-50">
                    Apply
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        </View>
      </View>
    );
  },
);
export default LaborTask;
