import React, { useLayoutEffect } from "react";
import { ThemedView, Text } from "@/components/Themed";
import {
  type LayoutChangeEvent,
  View,
  Animated,
  ScrollView,
} from "react-native";
import { useRef, useEffect, useState, useCallback } from "react";
import { Pressable } from "react-native";
import BattleTab from "@/components/DungeonComponents/BattleTab";
import { toTitleCase, wait } from "@/utility/functions/misc";
import ProgressBar from "@/components/ProgressBar";
import { observer } from "mobx-react-lite";
import TutorialModal from "@/components/TutorialModal";
import GenericModal from "@/components/GenericModal";
import BattleTabControls from "@/components/DungeonComponents/BattleTabControls";
import TargetSelection from "@/components/DungeonComponents/TargetSelection";
import DroppedItemsModal from "@/components/DungeonComponents/DroppedItemsModal";
import LeftBehindItemsModal from "@/components/DungeonComponents/LeftBehindItemsModal";
import { SackIcon } from "@/assets/icons/SVGIcons";
import { TutorialOption } from "@/utility/types";
import { useIsFocused } from "@react-navigation/native";
import { useCombatState, useLootState } from "@/providers/DungeonData";
import DungeonEnemyDisplay from "@/components/DungeonComponents/DungeonEnemyDisplay";
import { DungeonMapRender } from "@/components/DungeonComponents/DungeonMap";
import { StatsDisplay } from "@/components/StatsDisplay";
import { useDraggableStore, useRootStore } from "@/hooks/stores";
import { usePouch, useVibration } from "@/hooks/generic";
import D20DieAnimation from "@/components/DieRollAnim";
import { useHeaderHeight } from "@react-navigation/elements";
import { LinearGradientBlur } from "@/components/LinearGradientBlur";
import { Parallax } from "@/components/DungeonComponents/Parallax";
import { Image } from "expo-image";
import { normalize, normalizeForText, useStyles } from "@/hooks/styles";
import { reaction } from "mobx";
import { ScreenShaker } from "@/components/ScreenShaker";
import { VFXWrapper } from "@/components/VFXWrapper";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { PLAYER_TEXT_STRING_DURATION } from "@/stores/PlayerAnimationStore";
import Colors from "@/constants/Colors";

const DungeonLevelScreen = observer(() => {
  const { dungeonStore, uiStore, audioStore, playerAnimationStore } =
    useRootStore();
  const { currentLevel, inCombat } = dungeonStore;
  const { draggableClassStore } = useDraggableStore();

  const { setInventoryFullNotifier, displayItem, setDisplayItem } =
    useLootState();
  const { showTargetSelection, setShowTargetSelection } = useCombatState();
  const { addItemToPouch } = usePouch();
  const colorScheme = uiStore.colorScheme;

  const [battleTab, setBattleTab] = useState<
    "attacksOrNavigation" | "equipment" | "log"
  >("attacksOrNavigation");
  const [showLeftBehindItemsScreen, setShowLeftBehindItemsScreen] =
    useState<boolean>(false);
  const isFocused = useIsFocused();
  const header = useHeaderHeight();
  const styles = useStyles();

  const pouchRef = useRef<View>(null);
  const mainBodyRef = useRef<View>(null);
  const [mainHeight, setMainHeight] = useState<number>(
    uiStore.playerStatusHeight,
  );

  const setPouchBoundsOnLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;

      setTimeout(() => {
        if (pouchRef.current) {
          pouchRef.current.measure((x, y, w, h, pageX, pageY) => {
            draggableClassStore.setAncillaryBounds("pouch", {
              x: pageX,
              y: pageY,
              width,
              height,
            });
          });
        }
      }, 100);
    },
    [uiStore.dimensions],
  );

  useEffect(() => {
    if (colorScheme != "dark") {
      uiStore.dungeonSetter();
    }
    if (
      dungeonStore.currentInstance?.name.toLowerCase() == "training grounds"
    ) {
      dungeonStore.setEncounter(false);
      dungeonStore.setInCombat(true);
      uiStore.incrementLoadingStep();
    }

    new Promise<void>((resolve) => {
      if (dungeonStore.currentMap && dungeonStore.currentPosition) {
        resolve();
      } else {
        const disposer = reaction(
          () => ({
            map: dungeonStore.currentMap,
            position: dungeonStore.currentPosition,
          }),
          ({ map, position }) => {
            if (map && position) {
              disposer();
              resolve();
            }
          },
        );
      }
    })
      .then(() => {
        uiStore.incrementLoadingStep();
        return new Promise<void>((resolve) => {
          if (audioStore.isAmbientLoaded && audioStore.isSoundEffectsLoaded) {
            resolve();
          } else {
            const disposer = reaction(
              () => ({
                ambient: audioStore.isAmbientLoaded,
                combat: audioStore.isCombatLoaded,
                sfx: audioStore.isSoundEffectsLoaded,
              }),
              ({ ambient, combat, sfx }) => {
                if (ambient && combat && sfx) {
                  disposer();
                  resolve();
                }
              },
            );
          }
        });
      })
      .then(() => {
        uiStore.incrementLoadingStep();
        wait(500).then(() => {
          uiStore.incrementLoadingStep();
        });
      })
      .catch((error) => {
        uiStore.completeLoading();
      });
    return () => draggableClassStore.removeAncillaryBounds("pouch");
  }, []);

  useEffect(() => {
    setInventoryFullNotifier(false);
  }, [showLeftBehindItemsScreen]);

  const textOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (playerAnimationStore.textString) {
      textOpacity.setValue(1);

      Animated.timing(textOpacity, {
        toValue: 0,
        duration: PLAYER_TEXT_STRING_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [playerAnimationStore.textString]);

  useLayoutEffect(() => {
    mainBodyRef.current?.measure((x, y, width, height) => {
      setMainHeight(height);
    });
  }, [mainBodyRef]);

  if (currentLevel) {
    return (
      <ScreenShaker>
        <TutorialModal
          tutorial={TutorialOption.dungeonInterior}
          isFocused={
            isFocused &&
            dungeonStore.currentInstance?.name.toLowerCase() !==
              "training grounds"
          }
          pageOne={{
            title: "Watch Your Health",
            body: "Your situation can change rapidly.",
          }}
          pageTwo={{
            title: "Advance by killing the boss.",
            body: "Navigate the dungeon until you find them.",
          }}
          pageThree={{
            title: "Good Luck.",
            body: "And remember fleeing (top left) can save you.",
          }}
        />
        <DroppedItemsModal />
        <LeftBehindItemsModal
          showLeftBehindItemsScreen={showLeftBehindItemsScreen}
          setShowLeftBehindItemsScreen={setShowLeftBehindItemsScreen}
        />
        <GenericModal
          isVisibleCondition={showTargetSelection.showing}
          size={100}
          backFunction={() => {
            setShowTargetSelection({
              showing: false,
              chosenAttack: null,
            });
          }}
        >
          <ThemedView>
            <Text style={{ width: "100%" }}>Choose Your Target</Text>
            <TargetSelection />
          </ThemedView>
        </GenericModal>
        <View
          style={{
            marginTop: header + 16,
            position: "absolute",
            marginLeft: 16,
            zIndex: 9999,
          }}
        >
          <Pressable
            ref={pouchRef}
            onLayout={(e) => setPouchBoundsOnLayout(e)}
            onPress={() => setShowLeftBehindItemsScreen(true)}
          >
            <SackIcon height={normalize(32)} width={normalize(32)} />
          </Pressable>
        </View>
        <Parallax
          backgroundName={
            currentLevel.parallaxOverride ?? currentLevel.parent.bgName
          }
          inCombat={inCombat}
          playerPosition={{
            x: dungeonStore.currentPosition?.x ?? 0,
            y: dungeonStore.currentPosition?.y ?? 0,
          }}
          boundingBox={dungeonStore.currentMapDimensions!}
          reduceMotion={uiStore.reduceMotion}
        >
          {dungeonStore.currentSpecialEncounter ? (
            <View style={styles.dungeonSpecialEncounter}>
              <Image
                source={dungeonStore.currentSpecialEncounter.imageSource}
                style={{
                  width: uiStore.dimensions.lesser * 0.5,
                  height: uiStore.dimensions.lesser * 0.5,
                  marginVertical: "auto",
                }}
                contentFit="contain"
              />
            </View>
          ) : inCombat ? (
            <>
              <VFXWrapper>
                <DungeonEnemyDisplay />
              </VFXWrapper>
            </>
          ) : (
            <DungeonMapRender />
          )}
          <LinearGradientBlur style={styles.dungeonBlur} />
          <View ref={mainBodyRef} style={{ flex: 1, maxHeight: "45%" }}>
            <View
              style={{
                position: "absolute",
                width: uiStore.dimensions.width,
                marginTop: -normalizeForText(30),
              }}
            >
              <Animated.Text
                style={{
                  textAlign: "center",
                  ...styles["text-2xl"],
                  color: Colors.dark.text,
                  opacity: textOpacity,
                  fontFamily: "PixelifySans",
                }}
              >
                {playerAnimationStore.textString}
              </Animated.Text>
            </View>
            <BattleTab battleTab={battleTab} />
            <BattleTabControls
              battleTab={battleTab}
              setBattleTab={setBattleTab}
            />
            <PlayerMinionSection />
          </View>
        </Parallax>
        <PlayerStatusForSecondary />
        {displayItem && (
          <View
            style={{
              position: "absolute",
              zIndex: 10,
            }}
            pointerEvents="box-none"
          >
            <StatsDisplay
              displayItem={displayItem}
              clearItem={() => setDisplayItem(null)}
              addItemToPouch={(items) => addItemToPouch({ items })}
              topOffset={-96}
            />
          </View>
        )}
      </ScreenShaker>
    );
  } else {
    return (
      <View style={styles.loadingContainer}>
        <D20DieAnimation keepRolling={true} />
      </View>
    );
  }
});

export default DungeonLevelScreen;

const PlayerMinionSection = observer(() => {
  const { playerState, uiStore } = useRootStore();
  const vibration = useVibration();

  const [currentMinionPage, setCurrentMinionPage] = useState(0);
  const minionScrollViewRef = useRef<ScrollView>(null);
  if (!playerState || playerState.minionsAndPets.length == 0) {
    return null;
  }

  return (
    <View>
      <ScrollView
        ref={minionScrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{
          width: "100%",
          marginBottom: normalize(5),
        }}
        contentContainerStyle={{
          alignItems: "center",
        }}
        onScroll={(event) => {
          const contentOffsetX = event.nativeEvent.contentOffset.x;
          const pageIndex = Math.round(
            contentOffsetX / uiStore.dimensions.width,
          );
          setCurrentMinionPage(pageIndex);
        }}
        scrollEventThrottle={16}
      >
        {Array.from({
          length: Math.ceil(playerState.minionsAndPets.length / 2),
        }).map((_, pageIndex) => (
          <View
            key={`page-${pageIndex}`}
            style={{
              width: uiStore.dimensions.width,
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: normalize(10),
            }}
          >
            {playerState.minionsAndPets[pageIndex * 2] && (
              <View
                style={{
                  width: "48%",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: normalizeForText(14) }}>
                  {toTitleCase(
                    playerState.minionsAndPets[pageIndex * 2].creatureSpecies,
                  )}
                </Text>
                <ProgressBar
                  filledColor="#ef4444"
                  unfilledColor="#fee2e2"
                  value={
                    playerState.minionsAndPets[pageIndex * 2].currentHealth
                  }
                  maxValue={playerState.minionsAndPets[pageIndex * 2].maxHealth}
                />
              </View>
            )}
            {playerState.minionsAndPets[pageIndex * 2 + 1] && (
              <View
                style={{
                  width: "48%",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: normalizeForText(14) }}>
                  {toTitleCase(
                    playerState.minionsAndPets[pageIndex * 2 + 1]
                      .creatureSpecies,
                  )}
                </Text>
                <ProgressBar
                  filledColor="#ef4444"
                  unfilledColor="#fee2e2"
                  value={
                    playerState.minionsAndPets[pageIndex * 2 + 1].currentHealth
                  }
                  maxValue={
                    playerState.minionsAndPets[pageIndex * 2 + 1].maxHealth
                  }
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      {playerState.minionsAndPets.length > 2 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            paddingBottom: normalize(8),
          }}
        >
          {Array.from({
            length: Math.ceil(playerState.minionsAndPets.length / 2),
          }).map((_, index) => (
            <Pressable
              onPress={() => {
                vibration({ style: "light" });
                minionScrollViewRef.current?.scrollTo({
                  x: index * uiStore.dimensions.width,
                  animated: true,
                });
              }}
              key={`indicator-${index}`}
              style={{
                width: normalize(14),
                height: normalize(14),
                borderRadius: 9999,
                backgroundColor:
                  currentMinionPage === index
                    ? "#ffffff"
                    : "rgba(255,255,255,0.3)",
                marginHorizontal: normalize(12),
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
});
