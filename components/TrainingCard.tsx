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
import { useStyles, radius } from "../hooks/styles";

interface TrainingCardProps {
  name: string;
  ticks: number;
  goldCostPerTick: number;
  sanityCostPerTick: number;
  preRequisites: string[] | null;
}

const CostDisplay = ({
  styles,
  goldCost,
  sanityCost,
  colorScheme,
}: {
  styles: ReturnType<typeof useStyles>;
  goldCost: number;
  sanityCost: number;
  colorScheme: "light" | "dark";
}) => (
  <View
    style={{
      ...styles.myAuto,
      marginBottom: -32,
      marginTop: 32,
      width: "33%",
    }}
  >
    {goldCost === 0 ? (
      <Text
        style={{
          ...styles.mxAuto,
          color: colorScheme === "dark" ? "#fafafa" : undefined,
        }}
      >
        Free
      </Text>
    ) : (
      <View
        style={{
          ...styles.rowEvenly,
          width: "100%",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colorScheme === "dark" ? "#fafafa" : undefined }}>
          {goldCost}
        </Text>
        <Coins width={14} height={14} style={{ marginLeft: 6 }} />
      </View>
    )}
    <View
      style={{
        ...styles.rowEvenly,
        width: "100%",
        alignItems: "center",
      }}
    >
      <Text style={{ color: colorScheme === "dark" ? "#fafafa" : undefined }}>
        -{sanityCost}
      </Text>
      <Sanity width={14} height={14} style={{ marginLeft: 6 }} />
    </View>
  </View>
);

const MissingPreReqs = ({
  styles,
  missing,
}: {
  styles: ReturnType<typeof useStyles>;
  missing: string[];
}) => (
  <View style={styles.itemsCenter}>
    <Text style={styles.lg}>Missing:</Text>
    {missing.map((item) => (
      <Text key={item} style={styles.py1}>
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
    const styles = useStyles();

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
        <View
          style={{
            ...styles.m2,
            ...radius.xl,
            ...cardStyle,
          }}
        >
          <View
            style={{
              ...styles.columnBetween,
              ...radius.xl,
              ...styles.px4,
              ...styles.py2,
              borderWidth: uiStore.colorScheme === "dark" ? 1 : 0,
              borderColor:
                uiStore.colorScheme === "dark" ? "#71717a" : undefined,
            }}
          >
            <View style={styles.rowBetween}>
              <Text
                style={{
                  ...styles.xl,
                  ...styles.bold,
                  ...styles.myAuto,
                  width: "66%",
                  color: uiStore.colorScheme === "dark" ? "#fafafa" : "#18181b",
                }}
              >
                {toTitleCase(name)}
              </Text>
              {!isCompleted && (
                <CostDisplay
                  goldCost={goldCostPerTick}
                  sanityCost={sanityCostPerTick}
                  styles={styles}
                  colorScheme={uiStore.colorScheme}
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
                    styles={styles}
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
