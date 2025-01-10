import React from "react";
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
import { useStyles } from "../hooks/styles";

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
    const { playerState, uiStore } = root;
    const isDark = uiStore.colorScheme === "dark";
    const styles = useStyles();

    const { start: handlePressIn, stop: handlePressOut } = useAcceleratedAction(
      () => null,
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
        <View style={styles.rowBetween}>
          <Text style={styles.laborTaskTitle}>
            {title}{" "}
            {playerState && numberToRoman(playerState.getJobRank(title))}
          </Text>
          <View style={styles.costContainer}>
            <View style={styles.costRow}>
              <Text style={{ color: isDark ? "#fafafa" : "#09090b" }}>
                {playerState?.getRewardValue(title, reward)}
              </Text>
              <Coins width={14} height={14} style={{ marginLeft: 6 }} />
            </View>
            <View style={styles.costRow}>
              <Text style={{ color: isDark ? "#fafafa" : "#09090b" }}>
                -{cost.mana}
              </Text>
              <Energy width={14} height={14} style={{ marginLeft: 6 }} />
            </View>
            {!!cost.health && (
              <View style={styles.costRow}>
                <Text style={{ color: isDark ? "#fafafa" : "#09090b" }}>
                  -{cost.health}
                </Text>
                <HealthIcon width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
            )}
            {!!cost.sanity && (
              <View style={styles.costRow}>
                <Text style={{ color: isDark ? "#fafafa" : "#09090b" }}>
                  -{cost.sanity}
                </Text>
                <Sanity width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
            )}
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
