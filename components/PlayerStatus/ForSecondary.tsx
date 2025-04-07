import React, { useCallback, useEffect, useRef } from "react";
import ProgressBar from "@/components/ProgressBar";
import { findNodeHandle, Pressable, UIManager, View } from "react-native";
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
  const { playerState, uiStore } = root;
  const styles = useStyles();
  const playerStatusRef = useRef<View>(null);

  const vibration = useVibration();

  const { statChanges, animationCycler } = useStatChanges(playerState!);

  const measureInWindow = useCallback(() => {
    if (!playerStatusRef.current) return;

    const nodeHandle = findNodeHandle(playerStatusRef.current);
    if (nodeHandle) {
      UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
        if (height > 0) {
          uiStore.setPlayerStatusHeight(height, true);
          uiStore.setPlayerStatusTop(pageY, true);
        }
      });
    }
  }, [uiStore.isLandscape]);

  const onLayoutHandler = () => {
    setTimeout(
      () =>
        requestAnimationFrame(() => {
          measureInWindow();
        }),
      0,
    );
  };

  if (!playerState) {
    return null;
  }

  return (
    <>
      <PlayerStatusModal />
      <ColorAndPlatformDependantBlur home={false}>
        <Pressable
          ref={playerStatusRef}
          onLayout={onLayoutHandler}
          onPress={() => {
            vibration({ style: "light" });
            uiStore.setDetailedStatusViewShowing(true);
          }}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              paddingHorizontal: 8,
            }}
          >
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
                <View style={{ paddingHorizontal: 4, marginVertical: "auto" }}>
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
        </Pressable>
      </ColorAndPlatformDependantBlur>
    </>
  );
});

export default PlayerStatusForSecondary;
