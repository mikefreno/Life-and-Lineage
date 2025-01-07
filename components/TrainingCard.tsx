import React from "react";
import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { Text } from "../components/Themed";
import ProgressBar from "./ProgressBar";
import GenericRaisedButton from "./GenericRaisedButton";
import { AccelerationCurves, toTitleCase } from "../utility/functions/misc";
import { Coins, Sanity } from "../assets/icons/SVGIcons";
import { useAcceleratedAction } from "../hooks/generic";
import { useCallback, useMemo } from "react";
import { useRootStore } from "../hooks/stores";

interface TrainingCardProps {
  name: string;
  ticks: number;
  goldCostPerTick: number;
  sanityCostPerTick: number;
  preRequisites: string[] | null;
}

const CostDisplay = ({
  goldCost,
  sanityCost,
}: {
  goldCost: number;
  sanityCost: number;
}) => (
  <View className="my-auto -mb-8 mt-8 w-1/3">
    {goldCost === 0 ? (
      <Text className="mx-auto dark:text-zinc-50">Free</Text>
    ) : (
      <View className="flex w-full flex-row items-center justify-evenly">
        <Text className="dark:text-zinc-50">{goldCost}</Text>
        <Coins width={14} height={14} style={{ marginLeft: 6 }} />
      </View>
    )}
    <View className="flex w-full flex-row items-center justify-evenly">
      <Text className="dark:text-zinc-50">-{sanityCost}</Text>
      <Sanity width={14} height={14} style={{ marginLeft: 6 }} />
    </View>
  </View>
);

const MissingPreReqs = ({ missing }: { missing: string[] }) => (
  <View className="flex items-center">
    <Text className="text-lg">Missing:</Text>
    {missing.map((item) => (
      <Text key={item} className="py-1">
        {toTitleCase(item)}
      </Text>
    ))}
  </View>
);

const TrainingCard = observer(
  ({
    name,
    ticks,
    goldCostPerTick,
    sanityCostPerTick,
    preRequisites,
  }: TrainingCardProps) => {
    const root = useRootStore();
    const { playerState, uiStore } = root;

    const cardStyle = useMemo(
      () => ({
        shadowColor: "#000",
        shadowOffset: { width: 3, height: 1 },
        elevation: 1,
        backgroundColor:
          uiStore.colorScheme === "light" ? "#fafafa" : "#27272a",
        shadowOpacity: 0.2,
        shadowRadius: 3,
      }),
      [uiStore.colorScheme],
    );

    const progressQualification = useCallback(() => {
      playerState?.incrementQualificationProgress(
        name,
        ticks,
        sanityCostPerTick,
        goldCostPerTick,
      );
    }, [playerState, name, ticks, sanityCostPerTick, goldCostPerTick, root]);

    const { start: handlePressIn, stop: handlePressOut } = useAcceleratedAction(
      () => null,
      {
        minHoldTime: 350,
        maxSpeed: 10,
        accelerationCurve: AccelerationCurves.linear,
        action: progressQualification,
        minActionAmount: 1,
        maxActionAmount: 50,
        debounceTime: 50,
      },
    );

    const isCompleted = playerState?.qualifications.includes(name);
    const hasPreReqs = playerState?.hasAllPreReqs(preRequisites);
    const isDisabled =
      (playerState?.gold ?? 0) < goldCostPerTick || !hasPreReqs;
    const progress = playerState?.qualificationProgress.find(
      (qual) => qual.name == name,
    )?.progress;

    if (playerState) {
      return (
        <View className="m-2 rounded-xl" style={cardStyle}>
          <View className="flex justify-between rounded-xl px-4 py-2 text-zinc-950 dark:border dark:border-zinc-500">
            <View className="flex flex-row justify-between">
              <Text className="bold my-auto w-2/3 text-xl dark:text-zinc-50">
                {toTitleCase(name)}
              </Text>
              {!isCompleted && (
                <CostDisplay
                  goldCost={goldCostPerTick}
                  sanityCost={sanityCostPerTick}
                />
              )}
            </View>

            {!isCompleted ? (
              <>
                {hasPreReqs && (
                  <GenericRaisedButton
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={
                      isDisabled ||
                      playerState.currentSanity - sanityCostPerTick <=
                        -playerState.maxSanity
                    }
                  >
                    {hasPreReqs ? "Study" : "Locked"}
                  </GenericRaisedButton>
                )}

                {hasPreReqs ? (
                  <ProgressBar value={progress ?? 0} maxValue={ticks} />
                ) : (
                  <MissingPreReqs
                    missing={playerState?.missingPreReqs(preRequisites) ?? []}
                  />
                )}
              </>
            ) : (
              <Text>Completed!</Text>
            )}
          </View>
        </View>
      );
    }
  },
);

export default TrainingCard;
