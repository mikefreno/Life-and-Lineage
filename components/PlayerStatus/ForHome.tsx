import React, { useLayoutEffect, useRef, useEffect } from "react";
import ProgressBar from "@/components/ProgressBar";
import { Pressable, View, Animated, Easing } from "react-native";
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
import { SCREEN_TRANSITION_TIMING } from "@/app/(tabs)/_layout";

const PlayerStatusForHome = observer(() => {
  const root = useRootStore();
  const { playerState, uiStore } = root;
  const styles = useStyles();
  const vibration = useVibration();
  const { statChanges, animationCycler } = useStatChanges(playerState!);
  const playerStatusRef = useRef<View>(null);

  const expandedSectionHeight = useRef(
    new Animated.Value(
      uiStore.playerStatusIsCompact ? 0 : uiStore.expansionPadding,
    ),
  ).current;

  useEffect(() => {
    Animated.timing(expandedSectionHeight, {
      toValue: uiStore.playerStatusIsCompact ? 0 : uiStore.expansionPadding,
      duration: SCREEN_TRANSITION_TIMING,
      useNativeDriver: false,
      easing: Easing.cubic,
    }).start();
  }, [uiStore.playerStatusIsCompact]);

  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      if (playerStatusRef.current) {
        playerStatusRef.current?.measure((x, y, width, height) => {
          uiStore.setPlayerStatusHeight(height);
        });
      }
    }, 250);

    if (uiStore.playerStatusCompactHeight) {
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [
    uiStore.dimensions,
    uiStore.playerStatusIsCompact,
    uiStore.isLandscape,
    uiStore.root.dungeonStore.isInDungeon,
  ]);

  if (!playerState) {
    return null;
  }

  return (
    <>
      <PlayerStatusModal />
      <Pressable
        ref={playerStatusRef}
        onPress={() => {
          vibration({ style: "light" });
          uiStore.setDetailedStatusViewShowing(true);
        }}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          uiStore.setPlayerStatusHeight(height);
        }}
        style={{
          zIndex: 10,
          position: "absolute",
          bottom: uiStore.tabHeight,
          width: uiStore.isLandscape ? "75%" : "100%",
          alignSelf: "center",
        }}
      >
        <ColorAndPlatformDependantBlur>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 8,
            }}
          >
            <Animated.View
              style={{
                height: expandedSectionHeight,
                overflow: "hidden",
                marginHorizontal: "auto",
                paddingVertical: 2,
                ...styles.rowCenter,
              }}
            >
              <View style={[styles.rowCenter, { marginVertical: "auto" }]}>
                <Text>{playerState.readableGold}</Text>
                <ChangePopUp
                  popUp={"gold"}
                  change={statChanges.gold}
                  animationCycler={animationCycler}
                  colorScheme={uiStore.colorScheme}
                />
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
              </View>
              {playerState.unAllocatedSkillPoints > 0 && (
                <View style={{ paddingHorizontal: 4, marginVertical: "auto" }}>
                  <SquarePlus height={16} width={16} />
                </View>
              )}
              <View>
                <ConditionRenderer />
              </View>
            </Animated.View>
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
                  value={playerState.currentSanity}
                  minValue={-playerState.maxSanity}
                  maxValue={playerState.maxSanity}
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

export default PlayerStatusForHome;
