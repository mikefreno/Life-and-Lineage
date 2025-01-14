import React from "react";
import { ThemedView, Text } from "../components/Themed";
import { type LayoutChangeEvent, View } from "react-native";
import { useRef, useEffect, useState, useCallback } from "react";
import { Pressable } from "react-native";
import BattleTab from "../components/DungeonComponents/BattleTab";
import { toTitleCase, wait } from "../utility/functions/misc";
import PlayerStatus from "../components/PlayerStatus";
import ProgressBar from "../components/ProgressBar";
import { observer } from "mobx-react-lite";
import TutorialModal from "../components/TutorialModal";
import GenericModal from "../components/GenericModal";
import BattleTabControls from "../components/DungeonComponents/BattleTabControls";
import TargetSelection from "../components/DungeonComponents/TargetSelection";
import DroppedItemsModal from "../components/DungeonComponents/DroppedItemsModal";
import LeftBehindItemsModal from "../components/DungeonComponents/LeftBehindItemsModal";
import { SackIcon } from "../assets/icons/SVGIcons";
import { TutorialOption } from "../utility/types";
import { useIsFocused } from "@react-navigation/native";
import { useCombatState, useLootState } from "../providers/DungeonData";
import DungeonEnemyDisplay from "../components/DungeonComponents/DungeonEnemyDisplay";
import { DungeonMapRender } from "../components/DungeonComponents/DungeonMap";
import { StatsDisplay } from "../components/StatsDisplay";
import {
  useDraggableStore,
  usePlayerStore,
  useRootStore,
} from "../hooks/stores";
import { usePouch } from "../hooks/generic";
import D20DieAnimation from "../components/DieRollAnim";
import { useHeaderHeight } from "@react-navigation/elements";
import { LinearGradientBlur } from "../components/LinearGradientBlur";
import { Parallax } from "../components/DungeonComponents/Parallax";
import { Image } from "expo-image";
import { useStyles } from "../hooks/styles";
import { reaction, runInAction } from "mobx";

const DungeonLevelScreen = observer(() => {
  const { enemyStore, dungeonStore, uiStore, audioStore } = useRootStore();
  const { currentLevel, inCombat } = dungeonStore;
  const playerState = usePlayerStore();
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

  const setPouchBoundsOnLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;

      setTimeout(() => {
        if (pouchRef.current) {
          pouchRef.current.measure((x, y, w, h, pageX, pageY) => {
            draggableClassStore.setAncillaryBounds("pouch", {
              x: pageX,
              y: pageY - header,
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
    const initializeDungeon = async () => {
      try {
        if (colorScheme != "dark") {
          uiStore.dungeonSetter();
        }

        await Promise.all([
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
          }),

          new Promise<void>((resolve) => {
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
          }),
        ]);

        await wait(200);

        runInAction(() => {
          uiStore.setIsLoading(false);
        });
      } catch (error) {
        console.error("Failed to initialize dungeon:", error);
        // Fallback loading removal after timeout
        wait(2000).then(() => uiStore.setIsLoading(false));
      }
    };

    initializeDungeon();

    return () => {
      uiStore.setIsLoading(true); // Reset loading state
    };
  }, []);

  useEffect(() => {
    setInventoryFullNotifier(false);
  }, [showLeftBehindItemsScreen]);

  if (currentLevel) {
    return (
      <>
        <TutorialModal
          tutorial={TutorialOption.dungeonInterior}
          isFocused={isFocused}
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
            enemyStore.setAttackAnimationOngoing(false);
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
            <SackIcon height={32} width={32} />
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
                source={dungeonStore.currentSpecialEncounter.imageToShow}
                style={{
                  width: 200,
                  height: 200,
                  marginVertical: "auto",
                }}
                contentFit="contain"
              />
            </View>
          ) : inCombat ? (
            <DungeonEnemyDisplay />
          ) : (
            <DungeonMapRender />
          )}
          <View style={{ flex: 1 }}>
            <LinearGradientBlur style={{ position: "absolute" }} />
            <BattleTab battleTab={battleTab} />
            <BattleTabControls
              battleTab={battleTab}
              setBattleTab={setBattleTab}
            />
            {playerState.minionsAndPets.length > 0 ? (
              <View style={styles.minionContainer}>
                {playerState.minionsAndPets.map((minion, index) => (
                  <View
                    key={minion.id}
                    style={{
                      ...styles.py1,
                      width:
                        index === playerState.minionsAndPets.length - 1 &&
                        playerState.minionsAndPets.length % 2 !== 0
                          ? "100%"
                          : "40%",
                    }}
                  >
                    <Text>{toTitleCase(minion.creatureSpecies)}</Text>
                    <ProgressBar
                      filledColor="#ef4444"
                      unfilledColor="#fee2e2"
                      value={minion.currentHealth}
                      maxValue={minion.baseHealth}
                    />
                  </View>
                ))}
              </View>
            ) : null}
          </View>
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
        </Parallax>
        <PlayerStatus positioning="absolute" style={{ bottom: 0 }} />
      </>
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
