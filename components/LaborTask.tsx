import { View } from "react-native";
import ProgressBar from "./ProgressBar";
import { useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { numberToRoman } from "../utility/functions/misc/numbers";
import type { VibrateProps } from "../utility/customHooks";
import GenericRaisedButton from "./GenericRaisedButton";
import { Text } from "./Themed";
import ThemedCard from "./ThemedCard";
import { AppContext } from "../app/_layout";
import { Coins, Energy, HealthIcon, Sanity } from "../assets/icons/SVGIcons";
import { fullSave } from "../utility/functions/save_load";

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
  focused: boolean;
  vibration: ({ style, essential }: VibrateProps) => void;
}

const LaborTask = observer(
  ({
    title,
    reward,
    cost,
    experienceToPromote,
    applyToJob,
    focused,
    vibration,
  }: LaborTaskProps) => {
    const appData = useContext(AppContext);
    if (!appData) throw new Error("missing context");
    const { gameState, playerState } = appData;
    const [fullReward, setFullReward] = useState<number | undefined>(
      playerState?.getRewardValue(title, reward),
    );

    const [experience, setExperience] = useState(
      playerState?.getJobExperience(title),
    );

    function work() {
      if (playerState && gameState && focused) {
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
        gameState.gameTick({ playerState, fullSave });
        setFullReward(playerState.getRewardValue(title, reward));
      }
    }

    return (
      <ThemedCard>
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
        {playerState?.job == title ? (
          <>
            <GenericRaisedButton
              onPressFunction={work}
              disabledCondition={
                (cost.health && playerState.currentHealth <= cost.health) ||
                playerState.currentMana < cost.mana
              }
            >
              Work
            </GenericRaisedButton>
            <ProgressBar
              value={experience ?? 0}
              maxValue={experienceToPromote}
            />
          </>
        ) : (
          <GenericRaisedButton onPressFunction={() => applyToJob(title)}>
            Apply
          </GenericRaisedButton>
        )}
      </ThemedCard>
    );
  },
);
export default LaborTask;
