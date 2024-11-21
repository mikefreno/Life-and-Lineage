import { View } from "react-native";
import ProgressBar from "./ProgressBar";
import { observer } from "mobx-react-lite";
import { AccelerationCurves, numberToRoman } from "../utility/functions/misc";
import GenericRaisedButton from "./GenericRaisedButton";
import ThemedCard from "./ThemedCard";
import { Text } from "./Themed";
import { Coins, Energy, HealthIcon, Sanity } from "../assets/icons/SVGIcons";
import { useRootStore } from "../hooks/stores";
import { useAcceleratedAction } from "../hooks/generic";

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
  vibration: ({
    style,
    essential,
  }: {
    style: "success" | "light" | "medium" | "heavy" | "warning" | "error";
    essential?: boolean | undefined;
  }) => void;
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
    const root = useRootStore();
    const { playerState } = root;

    const { start: handlePressIn, stop: handlePressOut } = useAcceleratedAction(
      () => null, // Return null to indicate unlimited mode
      {
        minHoldTime: 350,
        maxSpeed: 10,
        accelerationCurve: AccelerationCurves.linear,
        action: work,
        minActionAmount: 1,
        maxActionAmount: 50,
        debounceTime: 50,
      },
    );

    function work() {
      if (!focused || !playerState) return;

      const laborResult = playerState.performLabor({
        title,
        cost,
        goldReward: playerState.getRewardValue(title, reward) ?? reward,
      });

      if (!laborResult) return; // Labor couldn't be performed

      if (playerState.getJobExperience(title) === 0) {
        vibration({ style: "success", essential: true });
      }

      root.gameTick();
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
              <Text className="dark:text-zinc-50">
                {playerState?.getRewardValue(title, reward)}
              </Text>
              <Coins width={14} height={14} style={{ marginLeft: 6 }} />
            </View>
            <View className="flex w-full flex-row items-center justify-evenly">
              <Text className="dark:text-zinc-50">-{cost.mana}</Text>
              <Energy width={14} height={14} style={{ marginLeft: 6 }} />
            </View>
            {cost.health ? (
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="dark:text-zinc-50">-{cost.health}</Text>
                <HealthIcon width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
            ) : null}
            {cost.sanity ? (
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="dark:text-zinc-50">-{cost.sanity}</Text>
                <Sanity width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
            ) : null}
          </View>
        </View>
        {playerState?.job == title ? (
          <>
            <GenericRaisedButton
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={
                (cost.health && playerState.currentHealth <= cost.health) ||
                playerState.currentMana < cost.mana
              }
            >
              Work
            </GenericRaisedButton>
            <ProgressBar
              value={playerState?.getJobExperience(title) ?? 0}
              maxValue={experienceToPromote}
            />
          </>
        ) : (
          <GenericRaisedButton onPress={() => applyToJob(title)}>
            Apply
          </GenericRaisedButton>
        )}
      </ThemedCard>
    );
  },
);
export default LaborTask;
