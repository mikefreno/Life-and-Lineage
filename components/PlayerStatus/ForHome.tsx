import React, { useRef, useEffect, useState, useCallback } from "react";
import ProgressBar from "@/components/ProgressBar";
import {
  Pressable,
  View,
  Animated,
  Easing,
  findNodeHandle,
  UIManager,
} from "react-native";
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
import { SCREEN_TRANSITION_TIMING } from "@/stores/UIStore";

const PlayerStatusForHome = observer(() => {
  const root = useRootStore();
  const { playerState, uiStore } = root;
  const styles = useStyles();
  const vibration = useVibration();
  const { statChanges, animationCycler } = useStatChanges(playerState!);
  const playerStatusRef = useRef<View>(null);
  const [coinsHidden, setCoinsHidden] = useState(false);

  const expandedSectionHeight = useRef(
    new Animated.Value(
      uiStore.playerStatusIsCompact ? 0 : uiStore.expansionPadding,
    ),
  ).current;

  expandedSectionHeight.addListener(({ value }) => {
    if (value < 4) {
      setCoinsHidden(true);
    } else {
      setCoinsHidden(false);
    }
  });

  useEffect(() => {
    Animated.timing(expandedSectionHeight, {
      toValue: uiStore.playerStatusIsCompact ? 0 : uiStore.expansionPadding,
      duration: SCREEN_TRANSITION_TIMING,
      useNativeDriver: false,
      easing: Easing.cubic,
    }).start();
  }, [uiStore.playerStatusIsCompact]);

  const measureInWindow = useCallback(() => {
    if (!playerStatusRef.current) return;

    const nodeHandle = findNodeHandle(playerStatusRef.current);
    if (nodeHandle) {
      UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
        if (height > 0) {
          uiStore.setPlayerStatusHeight(height);
          uiStore.setPlayerStatusTop(pageY);
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      measureInWindow();
    }, SCREEN_TRANSITION_TIMING);

    return () => clearTimeout(timeoutId);
  }, [uiStore.dimensions, uiStore.orientation, measureInWindow]);

  if (!playerState) {
    return null;
  }

  return (
    <>
      <PlayerStatusModal />
      <Pressable
        ref={playerStatusRef}
        onLayout={onLayoutHandler}
        onPress={() => {
          vibration({ style: "light" });
          uiStore.setDetailedStatusViewShowing(true);
        }}
        style={{
          zIndex: 9999,
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
                marginHorizontal: "auto",
                ...styles.rowCenter,
              }}
            >
              {!coinsHidden && (
                <View
                  style={{
                    alignItems: "center",
                    ...styles.rowCenter,
                  }}
                >
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
              )}
              {playerState.unAllocatedSkillPoints > 0 && (
                <View style={{ paddingHorizontal: 4, marginVertical: "auto" }}>
                  <SquarePlus
                    height={uiStore.iconSizeSmall}
                    width={uiStore.iconSizeSmall}
                  />
                </View>
              )}
              <ConditionRenderer />
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

export default PlayerStatusForHome;
