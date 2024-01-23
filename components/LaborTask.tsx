import { View, Text } from "react-native";
import Coins from "../assets/icons/CoinsIcon";
import Energy from "../assets/icons/EnergyIcon";
import Sanity from "../assets/icons/SanityIcon";
import HealthIcon from "../assets/icons/HealthIcon";
import ProgressBar from "./ProgressBar";
import { useColorScheme } from "nativewind";
import { useIsFocused } from "@react-navigation/native";
import { useContext, useState } from "react";
import { GameContext, PlayerCharacterContext } from "../app/_layout";
import { observer } from "mobx-react-lite";
import { numberToRoman } from "../utility/functions/misc";
import { useVibration } from "../utility/customHooks";
import GenericRaisedButton from "./GenericRaisedButton";

interface LaborTaskProps {
  reward: number;
  title: string;
  cost: {
    mana: number;
    sanity?: number;
    health?: number;
  };
  experienceToPromote: number;
  applyToJob: (title: string) => void;
}

const LaborTask = observer(
  ({
    title,
    reward,
    cost,
    experienceToPromote,
    applyToJob,
  }: LaborTaskProps) => {
    const playerCharacterData = useContext(PlayerCharacterContext);
    const gameData = useContext(GameContext);
    if (!playerCharacterData || !gameData) throw new Error("missing context");
    const { gameState } = gameData;
    const { playerState } = playerCharacterData;
    const [fullReward, setFullReward] = useState<number | undefined>(
      playerState?.getRewardValue(title, reward),
    );

    const [experience, setExperience] = useState(
      playerState?.getJobExperience(title),
    );
    const vibration = useVibration();

    const isFocused = useIsFocused();

    const { colorScheme } = useColorScheme();

    function work() {
      if (playerState && gameState && isFocused) {
        playerState.performLabor({
          title: title,
          cost: cost,
          goldReward: playerState?.getRewardValue(title, reward) ?? reward,
        });
        const newExp = playerState.getJobExperience(title);
        if (newExp == 0) {
          vibration({ style: "success", essential: true });
        }
        setExperience(newExp);
        gameState.gameTick(playerState);
        setFullReward(playerState.getRewardValue(title, reward));
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
          elevation: 3,
          backgroundColor: colorScheme == "light" ? "#fafafa" : "#27272a",
          shadowOpacity: 0.2,
          shadowRadius: 3,
        }}
      >
        <View className="flex justify-between rounded-xl px-4 py-2 text-zinc-950 dark:border dark:border-zinc-500">
          <View className="flex flex-row justify-between">
            <Text className="bold my-auto w-2/3 text-xl dark:text-zinc-50">
              {title}{" "}
              {playerState && numberToRoman(playerState.getJobRank(title))}
            </Text>
            <View className="my-auto -mb-8 mt-8 w-1/3">
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="dark:text-zinc-50">{fullReward}</Text>
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
              <GenericRaisedButton
                text={"Work"}
                onPressFunction={work}
                disabledCondition={
                  (cost.health && playerState.health <= cost.health) ||
                  playerState.mana < cost.mana
                }
              />
              <ProgressBar
                value={experience ?? 0}
                maxValue={experienceToPromote}
              />
            </>
          ) : (
            <GenericRaisedButton
              text={"Apply"}
              onPressFunction={() => applyToJob(title)}
            />
          )}
        </View>
      </View>
    );
  },
);
export default LaborTask;
