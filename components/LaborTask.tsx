import React, { useMemo } from "react";
import { View } from "react-native";
import ProgressBar from "@/components/ProgressBar";
import { observer } from "mobx-react-lite";
import { AccelerationCurves, numberToRoman } from "@/utility/functions/misc";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import ThemedCard from "@/components/ThemedCard";
import { Text } from "@/components/Themed";
import { Coins, Energy, HealthIcon, Sanity } from "@/assets/icons/SVGIcons";
import { useRootStore } from "@/hooks/stores";
import { useAcceleratedAction } from "@/hooks/generic";
import { useStyles } from "@/hooks/styles";
import { LaborIcons } from "@/utility/functions/cardIconMappings";

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
    const styles = useStyles();

    const { start: handlePressIn, stop: handlePressOut } = useAcceleratedAction(
      () => null,
      {
        minHoldTime: 350,
        maxSpeed: 5,
        accelerationCurve: AccelerationCurves.linear,
        action: work,
        minActionAmount: 1,
        maxActionAmount: 50,
        debounceTime: 15,
      },
    );

    function work() {
      if (!focused || !playerState) return;

      const laborResult = playerState.performLabor({
        title,
        cost,
        goldReward: playerState.getRewardValue(title, reward) ?? reward,
      });

      if (!laborResult) return;

      if (playerState.getJobExperience(title) === 0) {
        vibration({ style: "success", essential: true });
      }

      root.gameTick();
    }

    const getDisabled = useMemo(() => {
      if (!playerState) {
        return { disabled: true, message: "No player data" };
      }
      if (cost.health && playerState.currentHealth <= cost.health) {
        return { disabled: true, message: "Low Health" };
      }
      if (playerState.currentMana < cost.mana) {
        return { disabled: true, message: "Low Mana" };
      }
      if (cost.sanity && playerState.currentSanity! <= cost.sanity) {
        return { disabled: true, message: "Low Sanity" };
      }
      return { disabled: false, message: "" };
    }, [
      playerState,
      cost.health,
      cost.mana,
      cost.sanity,
      playerState?.currentHealth,
      playerState?.currentMana,
      playerState?.currentSanity,
    ]);

    return (
      <ThemedCard iconSource={LaborIcons[title]} iconDarkening={0.1}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>
            {title}{" "}
            {playerState && numberToRoman(playerState.getJobRank(title))}
          </Text>

          <View style={{ width: "33%", marginTop: 8, marginBottom: -8 }}>
            <View style={styles.costRow}>
              <Text style={{ color: "#fafafa" }}>
                {playerState?.getRewardValue(title, reward)}
              </Text>
              <Coins
                width={uiStore.iconSizeSmall}
                height={uiStore.iconSizeSmall}
                style={{ marginLeft: 6 }}
              />
            </View>
            <View style={styles.costRow}>
              <Text style={{ color: "#fafafa" }}>-{cost.mana}</Text>
              <Energy
                width={uiStore.iconSizeSmall}
                height={uiStore.iconSizeSmall}
                style={{ marginLeft: 6 }}
              />
            </View>
            {!!cost.health && (
              <View style={styles.costRow}>
                <Text style={{ color: "#fafafa" }}>-{cost.health}</Text>
                <HealthIcon
                  width={uiStore.iconSizeSmall}
                  height={uiStore.iconSizeSmall}
                  style={{ marginLeft: 6 }}
                />
              </View>
            )}
            {!!cost.sanity && (
              <View style={styles.costRow}>
                <Text style={{ color: "#fafafa" }}>-{cost.sanity}</Text>
                <Sanity
                  width={uiStore.iconSizeSmall}
                  height={uiStore.iconSizeSmall}
                  style={{ marginLeft: 6 }}
                />
              </View>
            )}
          </View>
        </View>
        {playerState?.job == title ? (
          <>
            <GenericRaisedButton
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={getDisabled.disabled}
              childrenWhenDisabled={getDisabled.message}
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
