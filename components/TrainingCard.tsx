import React from "react";
import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { Text } from "@/components/Themed";
import ProgressBar from "@/components/ProgressBar";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import { AccelerationCurves, toTitleCase } from "@/utility/functions/misc";
import { Coins, Sanity } from "@/assets/icons/SVGIcons";
import { useAcceleratedAction } from "@/hooks/generic";
import { useCallback } from "react";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import ThemedCard from "@/components/ThemedCard";

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
    const root = useRootStore();
    const { playerState, uiStore } = root;
    const isDark = uiStore.colorScheme === "dark";
    const styles = useStyles();

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
        <ThemedCard>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{toTitleCase(name)}</Text>
            <View style={{ width: "40%" }}>
              {!isCompleted && (
                <>
                  <View style={styles.costRow}>
                    {goldCostPerTick > 0 ? (
                      <>
                        <Text>{goldCostPerTick}</Text>
                        <Coins
                          width={uiStore.iconSizeSmall}
                          height={uiStore.iconSizeSmall}
                          style={{ marginLeft: 6 }}
                        />
                      </>
                    ) : (
                      <Text style={{ color: isDark ? "#fafafa" : "#09090b" }}>
                        Free
                      </Text>
                    )}
                  </View>
                  <View style={styles.costRow}>
                    <Text>-{sanityCostPerTick}</Text>
                    <Sanity
                      width={uiStore.iconSizeSmall}
                      height={uiStore.iconSizeSmall}
                      style={{ marginLeft: 6 }}
                    />
                  </View>
                </>
              )}
            </View>
          </View>

          {!isCompleted ? (
            <>
              {hasPreReqs ? (
                <>
                  <GenericRaisedButton
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={
                      isDisabled ||
                      playerState.currentSanity - sanityCostPerTick <=
                        -playerState.maxSanity
                    }
                  >
                    Study
                  </GenericRaisedButton>
                  <ProgressBar value={progress ?? 0} maxValue={ticks} />
                </>
              ) : (
                <>
                  <GenericRaisedButton disabled={true}>
                    Locked
                  </GenericRaisedButton>
                  <View style={styles.itemsCenter}>
                    <Text style={styles["text-lg"]}>Missing:</Text>
                    {(playerState?.missingPreReqs(preRequisites) ?? []).map(
                      (item) => (
                        <Text key={item} style={styles.py1}>
                          {toTitleCase(item)}
                        </Text>
                      ),
                    )}
                  </View>
                </>
              )}
            </>
          ) : (
            <Text>Completed!</Text>
          )}
        </ThemedCard>
      );
    }
    return null;
  },
);

export default TrainingCard;
