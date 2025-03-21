import React from "react";
import ProgressBar from "@/components/ProgressBar";
import { Pressable, View } from "react-native";
import { observer } from "mobx-react-lite";
import { Coins, SquarePlus } from "@/assets/icons/SVGIcons";
import { Text } from "@/components/Themed";
import { useRootStore } from "@/hooks/stores";
import { useStatChanges, useVibration } from "@/hooks/generic";
import { useStyles } from "@/hooks/styles";
import {
  ChangePopUp,
  ColorAndPlatformDependantBlur,
  ConditionRenderer,
} from "./Components";
import { PlayerStatusModal } from "./Modal";

const PlayerStatusForSecondary = observer(() => {
  const root = useRootStore();
  const { playerState, uiStore, dungeonStore } = root;
  const styles = useStyles();

  const vibration = useVibration();

  const { statChanges, animationCycler } = useStatChanges(playerState!);

  if (!playerState) {
    return null;
  }

  return (
    <>
      <PlayerStatusModal />
      <Pressable
        onPress={() => {
          vibration({ style: "light" });
          uiStore.setDetailedStatusViewShowing(true);
        }}
        style={{ position: "absolute", bottom: 0, width: "100%" }}
      >
        <ColorAndPlatformDependantBlur home={false}>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 8,
            }}
          >
            {!(
              uiStore.dimensions.height < 500 &&
              uiStore.isLandscape &&
              dungeonStore.isInDungeon
            ) && (
              <View
                style={{
                  height: uiStore.expansionPadding,
                  ...styles.rowCenter,
                }}
              >
                <View style={[styles.rowCenter, { alignItems: "center" }]}>
                  <Text>{playerState.readableGold}</Text>
                  <ChangePopUp
                    popUp={"gold"}
                    change={statChanges.gold}
                    animationCycler={animationCycler}
                    colorScheme={uiStore.colorScheme}
                  />
                  <Coins
                    width={uiStore.iconSizeSmall}
                    height={uiStore.iconSizeSmall}
                    style={{ marginLeft: 6 }}
                  />
                </View>
                {playerState.unAllocatedSkillPoints > 0 && (
                  <View
                    style={{ paddingHorizontal: 4, marginVertical: "auto" }}
                  >
                    <SquarePlus
                      height={uiStore.iconSizeSmall}
                      width={uiStore.iconSizeSmall}
                    />
                  </View>
                )}
                <View>
                  <ConditionRenderer />
                </View>
              </View>
            )}
            <View style={styles.statsRow}>
              <View
                style={{
                  width: "31%",
                }}
              >
                <View style={styles.rowBetween}>
                  <Text style={{ paddingLeft: 4, color: "#ef4444" }}>
                    Health
                  </Text>
                  <ChangePopUp
                    popUp={"health"}
                    change={statChanges.health}
                    animationCycler={animationCycler}
                    colorScheme={uiStore.colorScheme}
                  />
                </View>
                <ProgressBar
                  value={playerState.currentHealth}
                  maxValue={playerState.maxHealth}
                  filledColor="#ef4444"
                  unfilledColor="#fca5a5"
                />
              </View>
              <View
                style={{
                  width: "31%",
                }}
              >
                <View style={styles.rowBetween}>
                  <Text style={{ paddingLeft: 4, color: "#60a5fa" }}>Mana</Text>
                  <ChangePopUp
                    popUp={"mana"}
                    change={statChanges.mana}
                    animationCycler={animationCycler}
                    colorScheme={uiStore.colorScheme}
                  />
                </View>
                <ProgressBar
                  value={playerState.currentMana}
                  maxValue={playerState.maxMana}
                  filledColor="#60a5fa"
                  unfilledColor="#bfdbfe"
                />
              </View>
              <View
                style={{
                  width: "31%",
                }}
              >
                <View style={styles.rowBetween}>
                  <Text style={{ paddingLeft: 4, color: "#c084fc" }}>
                    Sanity
                  </Text>
                  <ChangePopUp
                    popUp={"sanity"}
                    change={statChanges.sanity}
                    animationCycler={animationCycler}
                    colorScheme={uiStore.colorScheme}
                  />
                </View>
                <ProgressBar
                  value={playerState.currentSanity!}
                  minValue={-playerState.maxSanity!}
                  maxValue={playerState.maxSanity!}
                  filledColor="#c084fc"
                  unfilledColor="#e9d5ff"
                />
              </View>
            </View>
          </View>
        </ColorAndPlatformDependantBlur>
      </Pressable>
    </>
  );
});

export default PlayerStatusForSecondary;
