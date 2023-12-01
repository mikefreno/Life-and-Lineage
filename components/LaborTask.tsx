import { View, Text, Pressable } from "react-native";
import Coins from "../assets/icons/CoinsIcon";
import Energy from "../assets/icons/EnergyIcon";
import Sanity from "../assets/icons/SanityIcon";
import HealthIcon from "../assets/icons/HealthIcon";
import { useDispatch, useSelector } from "react-redux";
import { selectGame, selectPlayerCharacter } from "../redux/selectors";
import { AppDispatch } from "../redux/store";
import { setGameData } from "../redux/slice/game";
import ProgressBar from "./ProgressBar";
import { useColorScheme } from "nativewind";
import { setPlayerCharacter } from "../redux/slice/player";
import { useIsFocused } from "@react-navigation/native";

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

export default function LaborTask({
  title,
  reward,
  cost,
  experienceToPromote,
}: LaborTaskProps) {
  const playerCharacter = useSelector(selectPlayerCharacter);
  const gameData = useSelector(selectGame);
  const dispatch: AppDispatch = useDispatch();
  const isFocused = useIsFocused();

  const { colorScheme } = useColorScheme();

  if (!playerCharacter) {
    throw Error("No Player Character on Labor Task");
  }

  function setJob() {
    if (playerCharacter && gameData) {
      playerCharacter.setJobTitle(title);
      gameData.gameTick();
      dispatch(setGameData(gameData));
      dispatch(setPlayerCharacter(playerCharacter.toJSON()));
    }
  }

  function work() {
    if (playerCharacter && gameData && isFocused) {
      playerCharacter.performLabor({
        title: title,
        cost: cost,
        goldReward: reward,
      });
      dispatch(setPlayerCharacter(playerCharacter.toJSON()));
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
      <View className="flex justify-between rounded-xl px-4 py-2 text-zinc-950  dark:border dark:border-zinc-500">
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
                <HealthIcon width={14} height={14} style={{ marginLeft: 6 }} />
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
        {playerCharacter.getJobTitle() == title ? (
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
                  backgroundColor: colorScheme == "light" ? "white" : "#71717a",
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
              value={playerCharacter.getJobExperience(title)}
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
}
