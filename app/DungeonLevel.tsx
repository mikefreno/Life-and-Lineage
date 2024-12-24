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
import { useColorScheme } from "nativewind";
import { Parallax } from "../components/DungeonComponents/Parallax";
import { Image } from "expo-image";

const DungeonLevelScreen = observer(() => {
  const { enemyStore, dungeonStore, uiStore } = useRootStore();
  const { currentLevel, inCombat } = dungeonStore;
  const playerState = usePlayerStore();
  const { draggableClassStore } = useDraggableStore();

  const { setInventoryFullNotifier, displayItem, setDisplayItem } =
    useLootState();
  const { showTargetSelection, setShowTargetSelection } = useCombatState();
  const { addItemToPouch } = usePouch();
  const { colorScheme } = useColorScheme();

  const [battleTab, setBattleTab] = useState<
    "attacksOrNavigation" | "equipment" | "log"
  >("attacksOrNavigation");
  const [showLeftBehindItemsScreen, setShowLeftBehindItemsScreen] =
    useState<boolean>(false);
  const isFocused = useIsFocused();
  const header = useHeaderHeight();

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
    if (colorScheme != "dark") {
      uiStore.dungeonSetter();
    }
    wait(200).then(() => uiStore.setIsLoading(false));
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
            <Text className="text-center text-2xl">Choose Your Target</Text>
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
            <View className="flex-1 items-end px-6">
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
          <View className="flex-1">
            <LinearGradientBlur className="absolute" />
            {inCombat && <View></View>}
            <View className="flex-1 justify-between">
              <BattleTab battleTab={battleTab} />
            </View>
            <BattleTabControls
              battleTab={battleTab}
              setBattleTab={setBattleTab}
            />
            {playerState.minionsAndPets.length > 0 ? (
              <View className="flex flex-row flex-wrap justify-evenly px-4">
                {playerState.minionsAndPets.map((minion, index) => (
                  <View
                    key={minion.id}
                    className={`${
                      index == playerState.minionsAndPets.length - 1 &&
                      playerState.minionsAndPets.length % 2 !== 0
                        ? "w-full"
                        : "w-2/5"
                    } py-1`}
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
            <View className="absolute z-10" pointerEvents="box-none">
              <StatsDisplay
                displayItem={displayItem}
                clearItem={() => setDisplayItem(null)}
                addItemToPouch={(items) => addItemToPouch({ items })}
                topOffset={-96}
              />
            </View>
          )}
        </Parallax>
        <PlayerStatus positioning={"absolute"} classname="bottom-0" />
      </>
    );
  } else {
    return (
      <View className="flex-1 justify-center align-middle">
        <D20DieAnimation keepRolling={true} />
      </View>
    );
  }
});

export default DungeonLevelScreen;
