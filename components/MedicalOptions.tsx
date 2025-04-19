import React, { useMemo } from "react";
import { View } from "react-native";
import { Text } from "@/components/Themed";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import ThemedCard from "@/components/ThemedCard";
import { Coins, Energy, HealthIcon, Sanity } from "@/assets/icons/SVGIcons";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@/hooks/stores";
import { AccelerationCurves } from "@/utility/functions/misc";
import { useAcceleratedAction } from "@/hooks/generic";
import { useStyles } from "@/hooks/styles";
import { MedicalIcons } from "@/utility/functions/cardIconMappings";

interface MedicalOptionProps {
  title: string;
  cost: number;
  healthRestore?: number | "fill";
  sanityRestore?: number | "fill";
  manaRestore?: number | "fill";
  removeDebuffs?: number | "all";
  focused: boolean;
}

const MedicalOption = observer(
  ({
    title,
    cost,
    healthRestore,
    sanityRestore,
    manaRestore,
    removeDebuffs,
    focused,
  }: MedicalOptionProps) => {
    const root = useRootStore();
    const { playerState, uiStore } = root;
    const styles = useStyles();

    const isFill = useMemo(() => {
      if (
        healthRestore == "fill" ||
        sanityRestore == "fill" ||
        manaRestore == "fill" ||
        removeDebuffs == "all"
      ) {
        return true;
      }
      return false;
    }, [healthRestore, sanityRestore, manaRestore, removeDebuffs]);

    const { start, stop } = useAcceleratedAction(() => null, {
      minHoldTime: 350,
      maxSpeed: 5,
      accelerationCurve: AccelerationCurves.linear,
      action: visit,
      minActionAmount: 1,
      maxActionAmount: 50,
      debounceTime: 15,
    });

    function visit() {
      if (!focused || getDisabled.disabled) return;

      playerState?.getMedicalService(
        cost,
        healthRestore == "fill" ? playerState.maxHealth : healthRestore,
        sanityRestore == "fill" ? playerState.maxSanity! : sanityRestore,
        manaRestore == "fill" ? playerState.maxMana : manaRestore,
        removeDebuffs == "all" ? playerState.conditions.length : removeDebuffs,
      );
    }

    const getDisabled = useMemo(() => {
      if (playerState) {
        if (cost > playerState.gold) {
          return { disabled: true, message: "Not enough gold" };
        }
        if (healthRestore) {
          if (playerState.maxHealth - playerState.currentHealth == 0) {
            return { disabled: true, message: "Health at max" };
          }
        }
        if (manaRestore) {
          if (playerState.maxMana - playerState.currentMana == 0) {
            return { disabled: true, message: "Mana at max" };
          }
        }
        if (sanityRestore) {
          if (playerState.maxSanity! - playerState.currentSanity! == 0) {
            return { disabled: true, message: "Sanity at max" };
          }
        }
        if (removeDebuffs) {
          if (playerState.conditions.length == 0) {
            return { disabled: true, message: "No conditions" };
          }
        }
      }
      return { disabled: false, message: "" };
    }, [
      playerState,
      cost,
      healthRestore,
      manaRestore,
      sanityRestore,
      removeDebuffs,
      playerState?.gold,
      playerState?.maxHealth,
      playerState?.currentHealth,
      playerState?.maxMana,
      playerState?.currentMana,
      playerState?.maxSanity,
      playerState?.currentSanity,
      playerState?.conditions.length,
    ]);

    return (
      <ThemedCard iconSource={MedicalIcons[title]}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={{ width: "33%", marginTop: 8, marginBottom: -8 }}>
            <View style={styles.costRow}>
              {cost > 0 ? (
                <>
                  <Text style={{ color: "#fafafa" }}>{cost}</Text>
                  <Coins
                    width={uiStore.iconSizeSmall}
                    height={uiStore.iconSizeSmall}
                    style={{ marginLeft: 6 }}
                  />
                </>
              ) : (
                <Text style={{ color: "#fafafa" }}>Free</Text>
              )}
            </View>
            {healthRestore ? (
              <View style={styles.costRow}>
                <Text style={{ color: "#fafafa" }}>
                  {healthRestore == "fill"
                    ? playerState?.maxHealth
                    : healthRestore}
                </Text>
                <HealthIcon
                  width={uiStore.iconSizeSmall}
                  height={uiStore.iconSizeSmall}
                  style={{ marginLeft: 6 }}
                />
              </View>
            ) : null}
            {manaRestore ? (
              <View style={styles.costRow}>
                <Text style={{ color: "#fafafa" }}>
                  {manaRestore == "fill" ? playerState?.maxMana : manaRestore}
                </Text>
                <Energy
                  width={uiStore.iconSizeSmall}
                  height={uiStore.iconSizeSmall}
                  style={{ marginLeft: 6 }}
                />
              </View>
            ) : null}
            {sanityRestore ? (
              <View style={styles.costRow}>
                <Text style={{ color: "#fafafa" }}>
                  {sanityRestore == "fill"
                    ? (playerState?.maxSanity ?? 50) * 2
                    : sanityRestore}
                </Text>
                <Sanity
                  width={uiStore.iconSizeSmall}
                  height={uiStore.iconSizeSmall}
                  style={{ marginLeft: 6 }}
                />
              </View>
            ) : null}
            {removeDebuffs ? (
              <View style={styles.costRow}>
                <Text style={{ textAlign: "center", color: "#fafafa" }}>
                  {`Remove ${removeDebuffs} ${
                    removeDebuffs !== 1 ? "debuffs" : "debuff"
                  }`}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <GenericRaisedButton
          onPressIn={isFill ? undefined : start}
          onPressOut={isFill ? undefined : stop}
          onPress={isFill ? visit : undefined}
          disabled={getDisabled.disabled}
          childrenWhenDisabled={getDisabled.message}
        >
          Visit
        </GenericRaisedButton>
      </ThemedCard>
    );
  },
);
export default MedicalOption;
