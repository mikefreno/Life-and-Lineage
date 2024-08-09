import { View as ThemedView, Text } from "../../components/Themed";
import { View, Platform } from "react-native";
import { useContext, useRef, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Stack } from "expo-router";
import BattleTab from "../../components/DungeonComponents/BattleTab";
import { toTitleCase } from "../../utility/functions/misc/words";
import PlayerStatus from "../../components/PlayerStatus";
import ProgressBar from "../../components/ProgressBar";
import { observer } from "mobx-react-lite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import SackIcon from "../../assets/icons/SackIcon";
import TutorialModal from "../../components/TutorialModal";
import GenericModal from "../../components/GenericModal";
import BattleTabControls from "../../components/DungeonComponents/BattleTabControls";
import DungeonEnemyDisplay from "../../components/DungeonComponents/DungeonEnemyDisplay";
import FleeModal from "../../components/DungeonComponents/FleeModal";
import TargetSelection from "../../components/DungeonComponents/TargetSelection";
import DroppedItemsModal from "../../components/DungeonComponents/DroppedItemsModal";
import LeftBehindItemsModal from "../../components/DungeonComponents/LeftBehindItemsModal";
import GenericFlatButton from "../../components/GenericFlatButton";
import { dungeonSave } from "../../utility/functions/save_load";
import { throttle } from "lodash";
import D20Die from "../../components/DieRollAnim";
import { AppContext } from "../../app/_layout";
import { DungeonContext, TILE_SIZE } from "./DungeonContext";
import { DungeonMapRender } from "./DungeonMap";
import { playerMinionsTurn } from "./DungeonInteriorFunctions";

const DungeonLevelScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const appData = useContext(AppContext);
  const dungeonData = useContext(DungeonContext);
  if (!appData || !dungeonData) throw new Error("missing context");
  const { playerState, gameState, enemyState, setShowDetailedStatusView } =
    appData;

  const {
    slug,
    tiles,
    currentPosition,
    setInventoryFullNotifier,
    thisInstance,
    thisDungeon,
    level,
    inCombat,
    mapDimensions,
    setShowFirstBossKillTutorial,
    showFirstBossKillTutorial,
    droppedItems,
    showTargetSelection,
    setShowTargetSelection,
  } = dungeonData;

  const [battleTab, setBattleTab] = useState<
    "attacksOrNavigation" | "equipment" | "log"
  >("attacksOrNavigation");
  const [showLeftBehindItemsScreen, setShowLeftBehindItemsScreen] =
    useState<boolean>(false);

  const [fleeModalShowing, setFleeModalShowing] = useState<boolean>(false);

  const pouchRef = useRef<View>(null);

  if (!playerState || !gameState) {
    throw new Error("No player character or game data on dungeon level");
  }

  useEffect(() => {
    setInventoryFullNotifier(false);
  }, [showLeftBehindItemsScreen]);

  const throttledDungeonSave = throttle((state) => {
    dungeonSave({ enemy: state, dungeonData, appData });
  }, 250);

  useEffect(() => {
    throttledDungeonSave(enemyState);
  }, [enemyState?.health, playerState.health]);

  //-----------tutorial---------//
  const [showDungeonInteriorTutorial, setShowDungeonInteriorTutorial] =
    useState<boolean>(
      (gameState && !gameState.getTutorialState("dungeonInterior")) ?? false,
    );

  useEffect(() => {
    if (!showDungeonInteriorTutorial && gameState) {
      gameState.updateTutorialState("dungeonInterior", true);
    }
  }, [showDungeonInteriorTutorial]);

  if (thisDungeon && playerState) {
    return (
      <>
        <Stack.Screen
          options={{
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  setFleeModalShowing(true);
                }}
              >
                {({ pressed }) => (
                  <MaterialCommunityIcons
                    name="run-fast"
                    size={28}
                    color={colorScheme == "light" ? "#18181b" : "#fafafa"}
                    style={{
                      opacity: pressed ? 0.5 : 1,
                      marginRight: Platform.OS == "android" ? 8 : 0,
                    }}
                  />
                )}
              </Pressable>
            ),
            title:
              level == 0 || slug[0] == "Activities"
                ? slug[0] == "Activities"
                  ? slug[1]
                  : "Training Grounds"
                : `${toTitleCase(thisInstance?.name as string)} Level ${level}`,
          }}
        />
        <TutorialModal
          isVisibleCondition={
            (showDungeonInteriorTutorial && gameState?.tutorialsEnabled) ??
            false
          }
          backFunction={() => setShowDungeonInteriorTutorial(false)}
          onCloseFunction={() => setShowDungeonInteriorTutorial(false)}
          pageOne={{
            title: "Watch Your Health",
            body: "Your situation can change rapidly.",
          }}
          pageTwo={{
            title: "Advance by killing the boss.",
            body: "The first boss becomes available after 10 Enemys defeated for the first dungeon.",
          }}
          pageThree={{
            title: "Good Luck.",
            body: "And remember fleeing (top left) can save you.",
          }}
        />
        <GenericModal
          isVisibleCondition={showFirstBossKillTutorial && !droppedItems}
          backFunction={() => setShowFirstBossKillTutorial(false)}
        >
          <View>
            <Text className="text-3xl text-center">Well Fought!</Text>
            <Text className="text-center">
              You have defeated the first boss! Every boss will reward you with
              stats points to distribute as you wish.
            </Text>
            <GenericFlatButton
              onPressFunction={() => {
                setShowFirstBossKillTutorial(false);
                setTimeout(() => setShowDetailedStatusView(true), 500);
              }}
              className="py-2"
            >
              <Text>Show Me</Text>
            </GenericFlatButton>
            <Text className="text-center">
              <Text className="text-xl">Note:</Text> Bosses do not respawn.
            </Text>
          </View>
        </GenericModal>
        <FleeModal
          fleeModalShowing={fleeModalShowing}
          setFleeModalShowing={setFleeModalShowing}
          playerMinionsTurn={playerMinionsTurn}
        />
        <DroppedItemsModal />
        <LeftBehindItemsModal
          showLeftBehindItemsScreen={showLeftBehindItemsScreen}
          setShowLeftBehindItemsScreen={setShowLeftBehindItemsScreen}
        />
        <GenericModal
          isVisibleCondition={showTargetSelection.showing}
          backFunction={() =>
            setShowTargetSelection({
              showing: false,
              chosenAttack: null,
            })
          }
        >
          <>
            <Text className="text-center text-2xl">Choose Your Target</Text>
            <TargetSelection />
          </>
        </GenericModal>
        <ThemedView className="flex-1" style={{ paddingBottom: 100 }}>
          {!inCombat ? (
            <DungeonMapRender
              tiles={tiles}
              mapDimensions={mapDimensions}
              currentPosition={currentPosition}
              tileSize={TILE_SIZE}
            />
          ) : enemyState ? (
            <DungeonEnemyDisplay />
          ) : (
            <View className="flex h-[40%] pt-8">
              <D20Die />
            </View>
          )}
          <Pressable
            ref={pouchRef}
            className="absolute ml-4 mt-4"
            onPress={() => setShowLeftBehindItemsScreen(true)}
          >
            <SackIcon height={32} width={32} />
          </Pressable>
          <View className="flex-1 justify-between">
            <View className="flex-1 px-2">
              <BattleTab battleTab={battleTab} pouchRef={pouchRef} />
            </View>
          </View>
          <BattleTabControls
            battleTab={battleTab}
            setBattleTab={setBattleTab}
          />
          {playerState.minions.length > 0 ? (
            <ThemedView className="flex flex-row flex-wrap justify-evenly">
              {playerState.minions.map((minion, index) => (
                <ThemedView
                  key={minion.id}
                  className={`${
                    index == playerState.minions.length - 1 &&
                    playerState.minions.length % 2 !== 0
                      ? "w-full"
                      : "w-2/5"
                  } py-1`}
                >
                  <Text>{toTitleCase(minion.creatureSpecies)}</Text>
                  <ProgressBar
                    filledColor="#ef4444"
                    unfilledColor="#fee2e2"
                    value={minion.health}
                    maxValue={minion.healthMax}
                  />
                </ThemedView>
              ))}
            </ThemedView>
          ) : null}
        </ThemedView>
        <PlayerStatus positioning={"absolute"} classname="bottom-0" />
      </>
    );
  }
});

export default DungeonLevelScreen;
